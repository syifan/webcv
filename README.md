# EasyCV 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/easycv.svg)](https://www.npmjs.com/package/easycv)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

EasyCV is a framework-free CV library that lets you maintain a single source of truth for your resume, publish it on the web, and produce a polished PDF using the browser's native print dialog.

## Live Demo

**[View Example Website →](https://yifancv.netlify.app)**

## Why EasyCV

- **Single Source of Truth**: Maintain one YAML file for both web and PDF versions—no more duplicate effort.
- **Web-First**: Publish your CV online with a clean URL, making it easy to share and update.
- **Easier Than Word/LaTeX**: Skip the tedious layout tweaks of word processors and LaTeX while still achieving professional results.
- **Print-Ready Design**: Browsers can convert web-based CV to high-quality PDFs by printing.

## Getting Started

### Method 1: As a Dedicated Website

If you just want a fresh copy of EasyCV, the fastest path is the scaffolder:

```bash
npx create-easycv my-cv
cd my-cv
npm install
# Edit public/cv_data.yml to customize your CV
```

The generator pulls the latest `main` branch from this repository, strips build artifacts, and updates `package.json` with your project name. Because it shells out to `git`, make sure Git ≥2.0 is installed locally. Use `npx create-easycv --help` to see extra flags such as `--ref <tag>` (pin to a release), `--repo <owner/name>` (use your own fork), or `--force` (allow writing into a non-empty directory).

### Method 2: Drop EasyCV Into Any Site

Already have a site (React, Vue, Astro, vanilla HTML, etc.)? Import the renderer, load your YAML, and mount it wherever you want.

1. **Install dependencies**

   ```bash
   npm install easycv js-yaml
   ```

   `js-yaml` is only needed if you load YAML in the browser (as shown below). Because your app imports it directly, keep it as a top-level dependency—package managers like pnpm will otherwise block access to transitive deps. If you provide the data as JSON or pre-parse it on the server, you can skip `js-yaml`.

2. **Add your data**

   Place `cv_data.yml` in whatever folder your bundler copies to the web root (for example, `public/`).

3. **Render the CV**

   ```js
   import { load as loadYaml } from "js-yaml";
   import { renderCv } from "easycv";

   async function mountCv() {
     const response = await fetch("/cv_data.yml");
     const yaml = await response.text();
     const data = loadYaml(yaml);

     // Accepts an element or any CSS selector
     renderCv("#cv-root", data, {
       titleTemplate: "%s — My CV", // optional
       actions: true, // show Back to Top + Download buttons
     });
   }

   mountCv().catch((error) => {
     console.error("Failed to load CV data", error);
   });
   ```

The CSS and Font Awesome icons ship with the package, so importing `renderCv` automatically applies the correct styles.

Want to see this running without any bundler? Check `example/vanilla/` for a plain HTML + YAML demo that pulls EasyCV from the installed package and runs with `npm run dev`.

### Method 3: Fork this repository

If heavy customization is needed, you can fork this repository and modify the source code directly. After forking and cloning, run the following commands to build the library:

```bash
npm install
npm run build
```

The actual website is in the `example/react/` folder. You can run it locally with:

```bash
cd example/react
npm install
npm run dev
```

## CV Structure

EasyCV renders your CV by walking a consistent hierarchy:
- `title`: comes from `header.name` plus `header.contact`, giving the page banner and quick ways to reach you.
- `section`: each item in `sections` defines a top-level block such as Education or Publications.
- `subsection`: optional grouping inside a section; useful when you need multiple tables under a single heading. For example, Publications can have Conference Papers and Journal Articles as subsections.
- `table`: every section or subsection is rendered as a table so content and metadata stay aligned, even in condensed layouts.
- `table entry`: the smallest unit that describes one item in your CV, such as a job, degree, or publication. An entry has 3 parts: index, meta, and content. Index and meta are optional, but content is required. The content field supports multiple lines for rich descriptions. The first row of the content is the entry title (bold text), and subsequent rows are additional details or bullet points.

The `public/cv_data.yml` file stitches these pieces together. It starts with global metadata and then lists sections in the order they should appear:

```yaml
version: 1
header:
  name: "Ada Lovelace"
  contact:
    email: "ada@example.com"
    website: "ada.dev"
sections:
  - id: experience
    title: "Experience"
    entries:
      - content:
          - "Analyst Programmer"
          - "Analytical Engines Inc."
        meta:
          - "1843 - Present"
  - id: publications
    title: "Publications"
    subsections:
      - title: "Conference Papers"
        entries:
          - index: "1."
            content:
              - "On the Analytical Engine"
            meta:
              - "1843"
```

## Deployment

EasyCV ships as a library. Use the vanilla example (`example/vanilla/`) or `create-easycv` to scaffold a site, then host it wherever you like.

## Customization

### Updating Your CV Data

All CV content is stored in `public/cv_data.yml`. Here's a detailed example:

```yaml
version: 1
header:
  name: "Ada Lovelace"
  tags:
    - "Software Engineer"
    - "London, UK"
  contact:
    phone:
      value: "+44 20 1234 5678"
      icon: "fa-solid fa-phone"
      href: "tel:+442012345678"
      display: true
    email:
      value: "ada@example.com"
      icon: "fa-solid fa-envelope"
      href: "mailto:ada@example.com"
      display: true
    website:
      value: "ada.dev"
      icon: "fa-solid fa-globe"
      href: "https://ada.dev"
      display: true
      newTab: true

sections:
  - id: experience
    title: "Professional Experience"
    entries:
      - content:
          - "**Senior Software Engineer**"
          - "Analytical Engines Inc."
          - "Led development of innovative computing solutions"
        meta:
          - "2020 - Present"
          - "London, UK"

  - id: education
    title: "Education"
    entries:
      - content:
          - "**BSc Computer Science**"
          - "University of London"
        meta:
          - "2016 - 2020"

  - id: publications
    title: "Publications"
    subsections:
      - title: "Conference Papers"
        entries:
          - index: "1."
            content:
              - "Lovelace, A. (1843). *Notes on the Analytical Engine*. Scientific Memoirs."
            meta:
              - "1843"
```

**Key Features:**

- **HTML Support**: Use `{html: "<strong>text</strong>"}` for rich formatting
- **Icons**: Use FontAwesome classes (e.g., `fa-solid fa-phone`) or image URLs
- **Links**: Set `newTab: true` to open links in a new window
- **Condensed Layout**: Add `condensed: true` to sections for compact display
- **Subsections**: Group related entries under a common heading

### Styling

Customize the visual appearance by editing `src/App.css`:

- **Colors**: Modify the color scheme (currently dark blue `#1d2f4b`)
- **Typography**: Adjust font families, sizes, and weights
- **Spacing**: Change margins, padding, and layout dimensions
- **Print Styles**: Customize the PDF output in the `@media print` section

Example color customization:

```css
/* Change primary color from blue to green */
.header-title {
  color: #2d5016; /* Was #1d2f4b */
}
```

### Advanced Usage

- **Manual DOM control**: `createCvElement(data, { actions: false })` returns the fully rendered `.cv-container` node so you can insert it into a shadow-root, virtual scroller, etc.
- **Custom document titles**: `renderCv(container, data, { titleTemplate: "Résumé – %s" })` changes how the `<title>` tag is generated. Pass `setDocumentTitle: false` to opt out entirely.
- **Bring your own data**: You are not limited to YAML. The renderer only cares about plain JavaScript objects that follow the schema shown above, so you can fetch JSON from an API, hydrate from CMS data, or generate it at build time.

## npx Scaffolder (create-easycv)

The `create-easycv/` directory contains the code that powers `npx create-easycv`. To publish a new version:

1. Update `create-easycv/package.json` with the desired version
2. From the repository root, run:
   ```bash
   cd create-easycv
   npm publish
   ```
3. Verify with `npx create-easycv --help`

The CLI relies on `git` to download this repository, strips build artifacts (`build/`, `dist/`, `node_modules/`, etc.), and writes your chosen project name into `package.json`.

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with errors

**Solutions**:
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for YAML syntax errors in `public/cv_data.yml` using a YAML validator

### YAML Parsing Errors

**Issue**: CV doesn't load, or content appears broken

**Solutions**:
- Validate your YAML syntax at [yamllint.com](http://www.yamllint.com/)
- Ensure proper indentation (use spaces, not tabs)
- Check that all quotes are properly closed
- Verify array syntax uses hyphens for list items

### PDF Export Issues

**Issue**: PDF doesn't look right when printing

**Solutions**:
- Use Chrome or Edge for best PDF export results
- In the print dialog, ensure:
  - "Background graphics" is enabled
  - Margins are set to "None" or "Minimum"
  - Scale is set to 100%
- Customize print styles in `src/App.css` under `@media print`

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/my-improvement
   ```

2. **Make your changes** and test thoroughly
   ```bash
   npm run build      # Library bundle
   ```

3. **Commit your changes** with clear messages
   ```bash
   git commit -m "Add feature: improved table layout"
   ```

4. **Push to your fork** and submit a pull request
   ```bash
   git push origin feature/my-improvement
   ```

**Ideas for Contributions:**
- Additional YAML examples or templates
- Improved styling or layout options
- Better print/PDF optimization
- Documentation improvements
- Bug fixes or performance enhancements

## Acknowledgment

If EasyCV helps your project, please credit Yifan Sun and link back to this repository. A simple note such as "CV powered by [EasyCV](https://github.com/syifan/easycv) by [Yifan Sun](https://github.com/syifan)" in your README or site footer is perfect.

## License

See `LICENSE` for details.
