# EasyCV React Example

Uses the local `easycv` package (`file:../..`) so you can test unpublished changes.

## Local dev

```bash
cd example/react
# ensure the root package is built so the local tarball exists
npm --prefix ../.. run build  # builds easycv into ../../dist for the local install
npm install                   # pulls easycv from ../..
npm run dev                   # http://localhost:4174/ (will pick next port if busy)
```

## Build

```bash
npm install                # only needed the first time or after changes
npm run build              # outputs to example/react/dist
```

Key files:
- `index.html` only includes `<div id="cv-root">` and the Vite entry script.
- `src/App.jsx` fetches the YAML, imports `easycv/easycv.css`, and calls `renderCv` on the `#cv-root` element.

If you update the root `easycv` package, rerun `npm --prefix ../.. run build` followed by `npm install` here to refresh the locally linked dependency.
