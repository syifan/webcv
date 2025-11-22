# EasyCV React Example

Minimal Vite + React app that loads the shared `public/cv_data.yml`, parses it with `js-yaml`, and renders it with EasyCV.

## Local dev

```bash
# from repo root
npm run build              # build EasyCV library (dist/)
cd example/react
npm install                # installs, uses easycv via file:../../
npm run dev                # http://localhost:4174/
```

## Build

```bash
# from repo root
cd example/react
npm install
npm run build              # outputs to example/react/dist
```

The public assets (cv_data.yml, manifest, robots.txt) are shared via the symlink/relocated files in `example/react/public/`.
