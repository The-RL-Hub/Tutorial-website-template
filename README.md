# Tutorial Site Template

A clean, static template for publishing tutorials. Content is written in Markdown, rendered on the fly, and styled for math and code without any build step.

## Highlights

- **Markdown driven:** point `tutorial.html` at any `.md` file via the `md` query string.
- **Ready for STEM:** MathJax for formulas and Highlight.js for code snippets.
- **Responsive layout:** landing page grid plus a tutorial view with a generated sidebar.

## Quick start

1. Serve the folder (run `start_server.ps1` or any static server).
2. Add a Markdown file under `content/tutorials/` (for example, `content/tutorials/example/lesson.md`).
3. Open `tutorial.html?title=Example&md=content/tutorials/example/lesson.md` to see it rendered.
4. Duplicate a card in `index.html` to link to your new tutorial.

## Key files

- `index.html` - landing page cards.
- `tutorial.html` - loads Markdown via `?md=...` and builds the sidebar from headings.
- `css/tutorial.css` and `styles.css` - styling for the tutorial page and landing page.
- `js/markdown-callback-loader.js` - Markdown rendering pipeline with callouts and math support.

## Documentation

See `docs/USAGE.md` for step-by-step instructions, Markdown patterns for callouts, and theming tips. 
