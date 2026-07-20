// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const scrollTopButton = document.getElementById('scrollTop');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const contentSection = document.querySelector('.content');
    
    // Add sidebar overlay for mobile
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    // Improved sidebar toggle for mobile/portrait mode
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('visible');
            sidebarOverlay.classList.toggle('visible');
            document.body.style.overflow = sidebar.classList.contains('visible') ? 'hidden' : '';
        });
        
        // Close sidebar when clicking on the overlay
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('visible');
            sidebarOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        });
        
        // Close sidebar when clicking a link in the sidebar (on mobile)
        sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && window.innerWidth <= 768) {
                sidebar.classList.remove('visible');
                sidebarOverlay.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    }

    // Function to add 'active' class to the current section's link
    function activateLink() {
        const navLinks = Array.from(document.querySelectorAll(".sidebar ul li a"));
        const linkedSections = navLinks
            .map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))))
            .filter(Boolean);
        if (!linkedSections.length || !navLinks.length) return;

        let index = 0;
        linkedSections.forEach((section, candidateIndex) => {
            if (window.scrollY + 100 >= section.offsetTop) {
                index = candidateIndex;
            }
        });

        navLinks.forEach((link) => link.classList.remove("active"));
        if (navLinks[index]) {
            navLinks[index].classList.add("active");
        }
    }

    // Debounced scroll event listener for activating the correct link
    const debouncedActivateLink = debounce(activateLink, 100);
    window.addEventListener("scroll", debouncedActivateLink);
    
    // Debounced scroll handling for scroll-to-top button
    const handleScroll = debounce(() => {
        if (!scrollTopButton) return;
        if (window.scrollY > 300) {
            scrollTopButton.classList.add('visible');
        } else {
            scrollTopButton.classList.remove('visible');
        }
    }, 100);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to top when button is clicked
    if (scrollTopButton) {
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
        scrollTopButton.addEventListener('click', scrollToTop);
        scrollTopButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                scrollToTop();
            }
        });
    }
    
    // Add active state to navigation links in header
    const headerNavLinks = document.querySelectorAll('header nav a');
    const currentLocation = window.location.href;
    
    headerNavLinks.forEach(link => {
        if (link.href === currentLocation) {
            link.classList.add('active');
        }
    });

    // Handle smooth scrolling for anchor links
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            const id = target.getAttribute('href').slice(1);
            const element = document.getElementById(id);
            
            if (element) {
                e.preventDefault();
                const headerOffset = 60; // Adjust for fixed header
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Make tables responsive
    function makeTablesResponsive() {
        if (!contentSection) return;
        const tables = contentSection.querySelectorAll('table');
        tables.forEach(table => {
            // Only wrap if not already wrapped
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    const handleRenderedContent = () => {
        makeTablesResponsive();
        activateLink();

        if (window.location.hash) {
            const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
            if (target) {
                requestAnimationFrame(() => target.scrollIntoView());
            }
        }
    };

    document.addEventListener('tutorial:content-rendered', handleRenderedContent);
    document.addEventListener('tutorial:sidebar-rendered', handleRenderedContent);
    
    // Check for orientation changes to handle sidebar visibility
    window.addEventListener('orientationchange', () => {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('visible');
            sidebarOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    });
    
    // Add touch event listeners for better mobile experience
    if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
    }
});

// Helper function to load markdown content
function loadMarkdownContent(contentElement, sidebarElement, markdownPaths) {
    console.log('Attempting to load Markdown content');
    
    // Try loading paths sequentially until one works
    function tryLoadPath(index) {
        if (index >= markdownPaths.length) {
            contentElement.innerHTML = `
                <div class="error">
                    <h2>Couldn't load the Markdown file</h2>
                    <p>Check that the <code>md</code> query string points to a real file and that the site is served over HTTP (not just the file system).</p>
                    <p>Tried the following paths:</p>
                    <ul>${markdownPaths.map(path => `<li>${path}</li>`).join('')}</ul>
                </div>
            `;
            return;
        }
        
        const path = markdownPaths[index];
        console.log(`Trying path: ${path}`);
        
        // Use our callback loader
        MarkdownCallbackLoader.loadMarkdown(
            path, 
            contentElement, 
            sidebarElement,
            (error, markdown) => {
                if (error) {
                    console.error(`Failed to load from ${path}:`, error);
                    tryLoadPath(index + 1);
                } else {
                    console.log(`Successfully loaded from ${path}`);
                }
            }
        );
    }
    
    // Start trying paths
    tryLoadPath(0);
} 
