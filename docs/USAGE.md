# Tutorial template usage

## Serve the site

Run the PowerShell helper or any static HTTP server:

    ./start_server.ps1

The Markdown loader uses XHR, so file URLs are not supported.

## Add a tutorial

1. Create a folder under **content/tutorials/**.
2. Add a Markdown file with a .md extension.
3. Add images beside that Markdown file or in another intentional site path.
4. Link the lesson with a URL like:

       tutorial.html?title=Getting%20Started&md=content/tutorials/getting-started/lesson.md

The md parameter cannot leave content/tutorials and cannot load a non-Markdown file.

## Markdown helpers

- A blockquote beginning with **Question:**, **Quiz:**, or **Check-in:** becomes a question box.
- A blockquote beginning with **Tip:**, **Note:**, or **Idea:** becomes a tip box.
- A blockquote beginning with **Warning:**, **Alert:**, or **Caution:** becomes a warning box.
- Dollar delimiters render inline and block MathJax equations.
- Fenced code with a language hint is highlighted.
- H1-H3 headings appear in the sidebar; repeated headings receive unique IDs.

## Landing page

Duplicate a card in index.html and point it at the universal tutorial page. Keep the title and Markdown parameters URL-encoded.

## Theme

The tutorial layout lives in css/tutorial.css. Landing-page styles live in styles.css. Change the primary CSS variables rather than scattering new colors across rules.

## Deploy

The folder is a static site and can be hosted by GitHub Pages or another static host. Preserve the directory structure, serve Markdown with UTF-8, and run the repository checks before deployment.
