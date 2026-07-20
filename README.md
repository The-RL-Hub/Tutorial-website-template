# Tutorial site template

A small static template for publishing Markdown tutorials with math, code highlighting, callouts, responsive layout, and a generated sidebar.

## Quick start

Run:

    ./start_server.ps1

Open the included sample:

    http://127.0.0.1:8090/tutorial.html?title=Example%20lesson&md=content/tutorials/example/lesson.md

The Markdown path is intentionally restricted to files under content/tutorials.

## Key files

- **index.html**: landing-page cards
- **tutorial.html**: universal tutorial shell and safe query-parameter handling
- **content/tutorials/example/lesson.md**: executable rendering example
- **js/markdown-callback-loader.js**: Markdown, callout, heading, code, and math pipeline
- **js/tutorial.js**: navigation and responsive interactions
- **css/tutorial.css** and **styles.css**: tutorial and landing-page themes

## Verification

    node --check js/markdown-callback-loader.js
    node --check js/tutorial.js
    node --check js/mathjax-config.js
    node --check script.js
    node tests/check-inline-scripts.js
    node tests/loader.test.js
    python tests/check_template.py

Marked and MathJax are pinned to exact versions so a new CDN release cannot silently change the renderer API.

See docs/USAGE.md for content patterns and deployment guidance.
