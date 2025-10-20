# WebCV

WebCV is a React-powered CV template that lets you maintain a single source of truth for your résumé, publish it on the web, and produce a polished PDF using the browser’s native print dialog. The project is bootstrapped with [Create React App](https://github.com/facebook/create-react-app) for a familiar developer experience.

## Example

Example website: [https://webcv-exp.netlify.app/](https://webcv-exp.netlify.app/)

## Why WebCV

- Word processors and LaTeX are powerful, but precise layout tweaks can be tedious and brittle.
- Maintaining separate web and PDF résumés doubles the upkeep; WebCV keeps everything in sync.
- CSS delivers rich, responsive layouts, and modern browsers turn those layouts into high-quality PDFs via Print to PDF.

## Structure

WebCV reads all résumé content from `public/cv_data.yml`, a streamlined YAML file with three top-level keys:

- `meta`: global metadata such as your name, contact info, and theme overrides.
- `content`: the actual CV body, organized as sections → subsections → tables → entries for predictable rendering.
- `index`: the section order, so you can rearrange major sections without editing the content blocks themselves.

Components under `src/components/` (`CvTable`, `CvTableEntry`, and friends) map directly to this structure, keeping the data model and UI in sync.

## How to Use

### 1. Fork and customize the data

- Fork the repository, then update `public/cv_data.yml` with your own details. The layout is intentionally minimal so you can focus on the words.
- Need visual tweaks? Edit `src/App.css` or extend the component styles to adjust typography, spacing, and colors.

### 2. Deploy to GitHub Pages

1. Create an optimized bundle with `npm run build`.
2. Commit the `build/` directory to a `gh-pages` branch (or publish it via GitHub Actions).
3. In your repository settings, enable GitHub Pages and point it at the `gh-pages` branch (folder `root`).
4. Future updates are as simple as rebuilding and force-pushing the refreshed `build/` contents.

### 3. Embed it in an existing site

- Treat `src/components/App.js` as a reusable widget: import it into your project, feed it the parsed YAML data (via `js-yaml` or your own loader), and render it wherever you need the résumé.
- If you already have a data layer, skip the built-in fetch and pass the structured data directly into the components (e.g., wire `CvTable` and `CvTableEntry` into your own layout).

### 4. Local development

- Prerequisites: Node.js 18+ and npm 9+ (bundled with Node.js).
- Install dependencies once with `npm install`, then launch the dev server:

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000) and reloads automatically as you edit files in `src/`.

## Acknowledgment

If WebCV helps your project, please credit Yifan Sun and link back to this repository. A simple note such as “CV powered by [WebCV](https://github.com/syifan/webcv) by [Yifan Sun](https://github.com/syifan)” in your README or site footer is perfect.

## License

See `LICENSE` for details.
