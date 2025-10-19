# WebCV

WebCV is a CV template built with React so you can present your résumé on the web and still export it to PDF with a browser print.  
The project has been bootstrapped with [Create React App](https://github.com/facebook/create-react-app) to provide a familiar development experience.

## Prerequisites

- Node.js 18+
- npm 9+ (bundled with Node.js)

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000) and automatically reloads as you edit files in `src/`.

## Production Build

Create an optimized build:

```bash
npm run build
```

The build output will be generated in `build/`. You can deploy that folder with any static site host (GitHub Pages, Netlify, etc.).

## Testing

Run tests in watch mode:

```bash
npm test
```

## Customization

- Edit `public/cv/cv_data.yml` to change the CV content. The React app parses this YAML file at runtime, so updates show up without a rebuild.
- Component structure lives in `src/components/`. `CvTable` and `CvTableEntry` control table layout while `App.js` handles data loading and section rendering.
- Static icons (phone/email/website) reside under `public/`. Replace them if you want different contact glyphs.

Additional automation (deployment scripts, GitHub Pages workflows, data-driven content) can be layered on once the CV components are in place.

## License

See `LICENSE` for details.
