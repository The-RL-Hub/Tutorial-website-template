/**
 * MarkdownCallbackLoader.js
 * A modern, callback-based Markdown loader and renderer for The RL Hub
 * 
 * This module handles:
 * - Loading Markdown content via XHR (more compatible than fetch)
 * - Parsing Markdown to HTML using marked.js
 * - Rendering special content boxes (questions, tips, warnings)
 * - Generating a sidebar navigation from content headings
 * - Managing content caching
 * - Properly formatting math equations (block and inline)
 */

const MarkdownCallbackLoader = (function() {
    // Private variables
    const VERSION = '2.0.0';
    let contentCache = {};
    let markedInitialized = false;
    
    /**
     * Initialize marked.js with custom renderers and options
     */
    function initMarked() {
        if (!window.marked) {
            console.error('Marked.js library not loaded');
            return false;
        }
        
        if (markedInitialized) {
            return true;
        }
        
        console.log(`Initializing MarkdownCallbackLoader v${VERSION}`);
        
        // Configure marked options
        marked.setOptions({
            gfm: true,
            breaks: true,
            pedantic: false
        });
        
        // Set up custom renderers
        const renderer = configureCustomRenderers();
        
        // Use our custom renderer
        marked.use({ renderer });
        
        markedInitialized = true;
        return true;
    }
    
    /**
     * Configure custom renderers for marked.js
     */
    function configureCustomRenderers() {
        const renderer = new marked.Renderer();
        
        // Marked v13+ passes token objects to renderer methods. Keep the
        // implementation on that documented API and pin Marked in the page.
        const originalImageRenderer = renderer.image;
        renderer.image = function(token) {
            const img = originalImageRenderer.call(this, token);
            return `<div class="image-container">${img}</div>`;
        };
        
        // Custom blockquote renderer to support special boxes
        const originalBlockquoteRenderer = renderer.blockquote;
        renderer.blockquote = function(token) {
            try {
                const boxType = classifyCallout(token.text || '');
                if (boxType) {
                    const quoteHtml = this.parser.parse(token.tokens);
                    return `<div class="box box-${boxType}" role="note">${quoteHtml}</div>\n`;
                }
                return originalBlockquoteRenderer.call(this, token);
            } catch (error) {
                console.error('Error in blockquote renderer:', error);
                return originalBlockquoteRenderer.call(this, token);
            }
        };

        return renderer;
    }

    function classifyCallout(text) {
        const normalized = text
            .replace(/[*_:]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        const types = {
            question: ['question', 'quiz', 'check-in'],
            tip: ['tip', 'note', 'idea'],
            warning: ['warning', 'alert', 'caution']
        };

        for (const [type, labels] of Object.entries(types)) {
            if (labels.some(label => normalized.startsWith(label))) {
                return type;
            }
        }
        return null;
    }
    
    /**
     * Pre-process the markdown content before parsing
     * This handles math expressions that shouldn't be processed by marked
     */
    function preprocessMarkdown(markdown) {
        // Create temporary placeholders for math expressions
        let blockMathPlaceholders = [];
        let inlineMathPlaceholders = [];
        
        // Replace block math expressions ($$...$$) with placeholders
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, function(match, content) {
            const placeholder = `BLOCK_MATH_PLACEHOLDER_${blockMathPlaceholders.length}`;
            blockMathPlaceholders.push(content);
            return placeholder;
        });
        
        // Replace inline math expressions ($...$) with placeholders
        // This regex avoids matching currency symbols by checking for space after the first $
        markdown = markdown.replace(/\$([^\$\n]+?)\$/g, function(match, content) {
            // Skip if it looks like a currency amount (e.g., $50)
            if (/^\s*\d+([,.]\d+)?\s*$/.test(content)) {
                return match;
            }
            const placeholder = `INLINE_MATH_PLACEHOLDER_${inlineMathPlaceholders.length}`;
            inlineMathPlaceholders.push(content);
            return placeholder;
        });
        
        return {
            processedMarkdown: markdown,
            blockMathPlaceholders,
            inlineMathPlaceholders
        };
    }
    
    /**
     * Post-process the HTML content after parsing
     * This replaces math placeholders with proper math tags
     */
    function postprocessHTML(html, blockMathPlaceholders, inlineMathPlaceholders) {
        // Replace block math placeholders with actual math
        blockMathPlaceholders.forEach((content, index) => {
            const placeholder = `BLOCK_MATH_PLACEHOLDER_${index}`;
            html = html.replace(placeholder, `<div class="math-block">$$${content}$$</div>`);
        });
        
        // Replace inline math placeholders with actual math
        inlineMathPlaceholders.forEach((content, index) => {
            const placeholder = `INLINE_MATH_PLACEHOLDER_${index}`;
            html = html.replace(placeholder, `\\(${content}\\)`);
        });
        
        return html;
    }
    
    /**
     * Generate an ID from a heading text for use in navigation
     */
    function generateIdFromHeading(text) {
        const id = text
            .toLowerCase()
            .replace(/[^\w\u0600-\u06FF\s]/g, '') // Keep Persian characters
            .trim()
            .replace(/\s+/g, '-');
        return id || 'section';
    }

    function createHeadingIdAllocator() {
        const counts = new Map();
        return function allocateHeadingId(text) {
            const baseId = generateIdFromHeading(text);
            const count = counts.get(baseId) || 0;
            counts.set(baseId, count + 1);
            return count === 0 ? baseId : `${baseId}-${count + 1}`;
        };
    }
    
    /**
     * Show loading indicator in the content element
     */
    function showLoading(contentElement) {
        if (contentElement) {
            contentElement.innerHTML = '<div class="loading">Loading tutorial content...</div>';
        }
    }
    
    /**
     * Show error message in the content element
     */
    function showError(contentElement, message) {
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="error">
                    <h3>Content could not be loaded</h3>
                    <p>${message}</p>
                </div>`;
        }
    }
    
    /**
     * Load a markdown file with XMLHttpRequest
     * More compatible than fetch API across browsers
     */
    function loadMarkdownWithXHR(markdownPath, contentElement, sidebarElement, callback) {
        console.log(`Loading markdown from: ${markdownPath}`);
        showLoading(contentElement);
        
        // Check if we have this content cached
        if (contentCache[markdownPath]) {
            console.log('Using cached content');
            renderContent(contentCache[markdownPath], contentElement);
            if (sidebarElement) {
                generateSidebar(contentCache[markdownPath], sidebarElement);
            }
            if (callback) callback(null, contentCache[markdownPath]);
            return;
        }
        
        // Try to load the markdown file
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const markdown = xhr.responseText;
                    console.log(`Content loaded successfully, length: ${markdown.length} characters`);
                    
                    // Cache the content
                    contentCache[markdownPath] = markdown;
                    
                    // Render the content
                    renderContent(markdown, contentElement);
                    
                    // Generate sidebar if element provided
                    if (sidebarElement) {
                        generateSidebar(markdown, sidebarElement);
                    }
                    
                    // Call the callback if provided
                    if (callback) callback(null, markdown);
                } else {
                    const errorMsg = `Failed to load Markdown file: ${xhr.status} ${xhr.statusText}`;
                    console.error(errorMsg);
                    showError(contentElement, errorMsg);
                    if (callback) callback(new Error(errorMsg), null);
                }
            }
        };
        
        xhr.open('GET', markdownPath, true);
        xhr.send();
    }
    
    /**
     * Render the markdown content as HTML
     */
    function renderContent(markdown, contentElement) {
        if (!contentElement) {
            console.error('Content element not provided');
            return;
        }
        
        if (!initMarked()) {
            showError(contentElement, 'Marked.js library not loaded');
            return;
        }
        
        try {
            // Pre-process markdown to handle math expressions
            const {
                processedMarkdown,
                blockMathPlaceholders,
                inlineMathPlaceholders
            } = preprocessMarkdown(markdown);
            
            // Convert processed Markdown to HTML
            let html = marked.parse(processedMarkdown);
            
            // Post-process to replace math placeholders
            html = postprocessHTML(html, blockMathPlaceholders, inlineMathPlaceholders);
            
            // Insert the HTML into the content area
            contentElement.innerHTML = html;
            
            // Apply post-processing
            applyPostProcessing(contentElement);

            document.dispatchEvent(new CustomEvent('tutorial:content-rendered', {
                detail: { contentElement }
            }));
            
        } catch (error) {
            showError(contentElement, 'Error rendering Markdown: ' + error.message);
            console.error('Error rendering Markdown:', error);
        }
    }
    
    /**
     * Apply post-processing to the rendered content
     */
    function applyPostProcessing(contentElement) {
        // Apply syntax highlighting to code blocks
        if (window.hljs) {
            contentElement.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
        
        // Ensure math is always typeset once content is ready. We rely on
        // MathJax.typesetPromise (non-blocking, returns a promise). If MathJax
        // hasn't finished loading yet, wait for the custom 'mathjax-ready'
        // event emitted in mathjax-config.js.

        const typeset = () => {
            if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise([contentElement]).catch(err => console.error('MathJax typeset error:', err));
            }
        };

        if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
            typeset();
        } else {
            // Wait until MathJax signals it is ready
            document.addEventListener('mathjax-ready', typeset, { once: true });
        }
        
        // Add IDs to headings for navigation (if they don't already have one)
        const allocateHeadingId = createHeadingIdAllocator();
        contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            heading.id = allocateHeadingId(heading.textContent);
        });
        
        // Handle images - ensure they have loading="lazy"
        contentElement.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    /**
     * Generate sidebar from markdown content
     */
    function generateSidebar(markdown, sidebarElement) {
        if (!sidebarElement) {
            console.error('Sidebar element not provided');
            return;
        }
        
        const headingRegex = /^(#{1,6})\s+(.+?)(?:\n|\r|$)/gm;
        const headings = [];
        const allocateHeadingId = createHeadingIdAllocator();
        let match;
        
        while ((match = headingRegex.exec(markdown)) !== null) {
            const level = match[1].length; // Number of # characters
            const text = match[2].trim();
            const id = allocateHeadingId(text);
            
            headings.push({ level, text, id });
        }
        
        if (headings.length === 0) {
            sidebarElement.innerHTML = '<div>No headings found yet.</div>';
            return;
        }
        
        // Create the sidebar list
        const ul = document.createElement('ul');
        
        headings.forEach(heading => {
            if (heading.level <= 3) { // Only include h1, h2, h3
                const li = document.createElement('li');
                li.classList.add(`level-${heading.level}`);
                
                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.textContent = heading.text;
                
                li.appendChild(a);
                ul.appendChild(li);
            }
        });
        
        sidebarElement.innerHTML = '';
        sidebarElement.appendChild(ul);
        
        // Add click handlers for navigation
        sidebarElement.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Smooth scroll to the target
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update URL without refreshing page
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });

        document.dispatchEvent(new CustomEvent('tutorial:sidebar-rendered', {
            detail: { sidebarElement }
        }));
    }
    
    /**
     * Clear the content cache
     */
    function clearCache() {
        contentCache = {};
        console.log('Content cache cleared');
    }
    
    // Public API
    return {
        version: VERSION,
        loadMarkdown: function(markdownPath, contentElement, sidebarElement, callback) {
            loadMarkdownWithXHR(markdownPath, contentElement, sidebarElement, callback);
        },
        renderContent: function(markdown, contentElement) {
            renderContent(markdown, contentElement);
        },
        generateSidebar: function(markdown, sidebarElement) {
            generateSidebar(markdown, sidebarElement);
        },
        clearCache: clearCache,
        testing: {
            classifyCallout,
            createHeadingIdAllocator
        }
    };
})();

// Auto-initialize when the DOM is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, Markdown Callback Loader ready');
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownCallbackLoader;
}
