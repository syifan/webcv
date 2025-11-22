# EasyCV in Plain HTML

This folder shows how to embed EasyCV with no frameworks or build tools. Everything is loaded from CDNs in `index.html` and the CV data lives in `cv_data.yml`.

## Run the example

1. From the repo root, start a tiny static server in this folder:
   ```bash
   cd example/vanilla
   python3 -m http.server 4173
   ```
2. Open http://localhost:4173 to see the CV render inside the page.
3. Edit `../../public/cv_data.yml` to try your own details (the example symlinks to this shared file). The browser reloads the YAML on refresh.

Key bits in `index.html`:
- `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easycv@0.2.2/dist/easycv.css">` pulls in the EasyCV styles (including Font Awesome).
- The script module imports `renderCv` from the same CDN plus `js-yaml` to parse the YAML, then calls `renderCv("#cv-root", data)`.

You can copy these two files into any static site, adjust the CDN version numbers, and EasyCV will render without a bundler.
