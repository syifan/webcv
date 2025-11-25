# EasyCV in Plain HTML

This folder shows the minimal vanilla setup: a single `#cv-root` element in `index.html`, plus a tiny script that loads `public/cv_data.yml` and renders with EasyCV.

## Run the example

1. Install deps and start the dev server:
   ```bash
   cd example/vanilla
   npm install
   npm run dev
   ```
   Vite serves the static files at http://localhost:4173 by default (it auto-picks the next open port if 4173 is busy).
2. Edit `public/cv_data.yml` to try your own details. The browser reloads the YAML on refresh.

Key files:
- `index.html` only contains `<div id="cv-root">` and loads `src/main.js`.
- `src/main.js` imports `easycv`, `easycv/easycv.css`, and `js-yaml`, then mounts the CV into `#cv-root`.
