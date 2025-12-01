# Tutorial Template Usage

This repository is a blank, Markdown-first tutorial site. Drop in your lessons, link them to the template page, and ship a static site without a build step.

## Quick start

1. Serve the folder (for example, run `start_server.ps1` or use any static server).
2. Open `index.html` to see the landing page or `tutorial.html` to load a Markdown file.

## Add a tutorial

1. Create a folder under `content/tutorials/` (for example, `content/tutorials/getting-started/`).
2. Add your Markdown file inside that folder (for example, `lesson.md`). Keep images next to it and reference them with relative paths like `![Alt text](image.png)`.
3. Load it with a query string:  
   `tutorial.html?title=Getting%20Started&md=content/tutorials/getting-started/lesson.md`
4. Use `#`, `##`, and `###` headings in your Markdown - the sidebar is generated from those headings.

## Markdown helpers

- Callouts: start a blockquote with `> **Question:**`, `> **Tip:**`, or `> **Warning:**` to get the built-in boxes.
- Math: inline math with `$...$`; block math with `$$...$$` (MathJax is already wired up).
- Code: fenced code blocks with a language hint (for example, ```python) trigger Highlight.js.

## Landing page

- Duplicate a card block in `index.html` for each tutorial you want to feature.
- Point each card to the correct URL, e.g. `tutorial.html?md=content/tutorials/topic/lesson.md&title=Topic`.
- Adjust colors and spacing quickly via the CSS variables at the top of `styles.css`.

## Tutorial page styling

- Global tutorial layout and sidebar styles live in `css/tutorial.css`.
- To change the accent color, tweak `--primary-color`, `--primary-dark`, and `--primary-light`.
- The header shows the `title` query string; if none is provided it falls back to "New tutorial."

## Deploy

The site is pure HTML, CSS, and JavaScript - no build step. Host the folder on any static hosting provider (GitHub Pages, Netlify, Vercel, S3, etc.).
