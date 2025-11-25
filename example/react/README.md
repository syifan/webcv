# EasyCV React Example

Minimal Vite + React app that loads `public/cv_data.yml`, parses it with `js-yaml`, and renders it with EasyCV inside `#cv-root`.

## Local dev

```bash
cd example/react
npm install
npm run dev                # http://localhost:4174/ (will pick next port if busy)
```

## Build

```bash
cd example/react
npm install
npm run build              # outputs to example/react/dist
```

Key files:
- `index.html` only includes `<div id="cv-root">` and the Vite entry script.
- `src/App.jsx` fetches the YAML, imports `easycv/easycv.css`, and calls `renderCv` on the `#cv-root` element.
