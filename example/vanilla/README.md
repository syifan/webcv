# EasyCV in Plain HTML

This folder shows how to embed EasyCV with plain HTML and YAML. Assets come from the installed `easycv` + `js-yaml` packages (no framework code), and the CV data lives in `public/cv_data.yml`.

## Run the example

1. Install deps and start the dev server:
   ```bash
   cd example/vanilla
   npm install
   npm run dev
   ```
   Vite serves the static files at http://localhost:4173 by default (it auto-picks the next open port if 4173 is busy).
2. Edit `public/cv_data.yml` to try your own details. The browser reloads the YAML on refresh.

Key bits in `index.html`:
- `<link rel="stylesheet" href="./easycv.css">` pulls in the bundled EasyCV styles (including Font Awesome) from `node_modules`.
- The inline module imports `renderCv` from `./easycv.mjs` and `load` from `./js-yaml.mjs`, then calls `renderCv("#cv-root", data)`.

You can copy these files into any static site, adjust the package version as needed, and EasyCV will render without a framework or bundler.
