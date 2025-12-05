# EasyCV 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/easycv.svg)](https://www.npmjs.com/package/easycv)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

EasyCV is a framework-free CV library that lets you maintain a single source of truth for your resume, publish it on the web, and produce a polished PDF using the browser's native print dialog.

## Live Demo

**[View Example Website (React-based) →](https://yifancv.netlify.app)**

**[View Example Website (Vanilla JS) →](https://syifan.github.io/easycv/)**


If you use Academic Pages, using EasyCV is simply replacing the `cv.md` file and provide a `cv_data.yml` file. You can see the example here. 

**[cv.md](https://github.com/syifan/easycv_academicpages_example/blob/master/_pages/cv.md)**
**[cv_data.yml](https://github.com/syifan/easycv_academicpages_example/blob/master/files/cv_data.yml)**
**[View Academic Pages Example →](https://syifan.github.io/easycv_academicpages_example/cv/)**



## Key Features

1. **Single Source of Truth** — All CV data lives in one YAML file, used for both web and PDF output.
2. **Web-First, PDF-Exportable** — Publish your CV online and generate polished PDFs via the browser's print dialog.
3. **High-Level Style Configuration** — Control layout options like meta column position (left or right) directly in the YAML file. See [Meta Column Position](#meta-column-position).
4. **Low-Level Entry Styling** — Use `{html: "<strong>text</strong>"}` in YAML entries for rich inline formatting.
5. **Dark Mode** — Built-in Light/Auto/Dark theme toggle with persistent preferences. See [Dark Mode](#dark-mode).
6. **Advanced: Dynamic Data** — Pre-process your YAML before rendering (e.g., fetch GitHub star counts automatically).
7. **Advanced: Custom CSS** — Layer your own stylesheets on top of the built-in styles for fine-tuned control. See [Styling](#styling).

## Getting Started

### Method 1: As a Dedicated Website

If you just want a fresh copy of EasyCV, the fastest path is the scaffolder:

```bash
npx create-easycv my-cv
cd my-cv
npm install
npm run dev
# Edit public/cv_data.yml to customize your CV
```

When the tool runs, pick either the Vanilla JS or React template. It pulls the latest `main` branch from this repository, copies the matching `example/` project, and updates `package.json` with your project name. Because it shells out to `git`, make sure Git ≥2.0 is installed locally. Use `npx create-easycv --help` to see extra flags such as `--ref <tag>` (pin to a release), `--repo <owner/name>` (use your own fork), or `--force` (allow writing into a non-empty directory).

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

Want to see this running without any bundler? Check `example/vanilla/` for a plain HTML + YAML demo. In this repo it pulls EasyCV from the local workspace, so run `npm run build` at the root first, then `npm install` and `npm run dev` inside the example.

### Method 3: Fork this repository

If heavy customization is needed, you can fork this repository and modify the source code directly. After forking and cloning, run the following commands to build the library:

```bash
npm install
npm run build
```

The actual website is in the `example/react/` folder. You can run it locally with:

```bash
npm install
npm run build               # builds the local easycv package used by the example
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



### Styling

You can layer custom styles on top of the built-in CSS by importing your own file after `easycv/easycv.css`. Both example projects load `src/customize_easycv.css` this way:

```js
import "easycv/easycv.css";
import "./customize_easycv.css"; // override or add styles here
```

For instance, the demo uses that file to style tagged names:

```css
.self-name {
  text-decoration: underline;
  text-decoration-thickness: 0.125rem;
  text-decoration-color: #1d2f4b;
}

.wm-advisee {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: #1d2f4b;
}
```

### Advanced Usage

- **Manual DOM control**: `createCvElement(data, { actions: false })` returns the fully rendered `.easycv-container` node so you can insert it into a shadow-root, virtual scroller, etc.
- **Custom document titles**: `renderCv(container, data, { titleTemplate: "Résumé – %s" })` changes how the `<title>` tag is generated. Pass `setDocumentTitle: false` to opt out entirely.
- **Bring your own data**: You are not limited to YAML. The renderer only cares about plain JavaScript objects that follow the schema shown above, so you can fetch JSON from an API, hydrate from CMS data, or generate it at build time.

### Dark Mode

EasyCV supports dark mode with a configurable theme toggle. By default, dark mode is enabled and users can switch between Light, Auto (system preference), and Dark themes using the floating action buttons.

```yaml
version: 1

# Dark mode configuration
enable-dark-mode: true   # Enable dark mode feature (default: true)
print-as-screen: false   # Print using current theme instead of light mode (default: false)

header:
  name: "Ada Lovelace"
  # ... rest of your CV
```

**Configuration Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `enable-dark-mode` | `true` | When `true`, displays a theme toggle (Light/Auto/Dark) in the floating actions. When `false`, the CV is always displayed in light mode. |
| `print-as-screen` | `false` | When `false`, PDFs are always printed in light mode for better readability. When `true`, the PDF matches the current screen theme. |

The theme preference is stored in the browser's localStorage, so users' choices persist across visits.

### Meta Column Position

By default, meta information (dates, locations, etc.) appears on the left side of entries. You can move it to the right side using `meta-on-right`. This setting supports inheritance: it can be set at the CV level, overridden at the section level, and further overridden at the subsection level.

```yaml
version: 1

# CV-level: meta on right for all sections by default
meta-on-right: true

header:
  name: "Ada Lovelace"

sections:
  - id: experience
    title: "Experience"
    # Inherits meta-on-right: true from CV level
    entries:
      - content:
          - "Software Engineer"
          - "Tech Company"
        meta:
          - "2020 - Present"    # Appears on the right

  - id: education
    title: "Education"
    meta-on-right: false        # Override: meta on left for this section
    entries:
      - content:
          - "BSc Computer Science"
        meta:
          - "2016 - 2020"       # Appears on the left

  - id: publications
    title: "Publications"
    meta-on-right: false        # Section level: meta on left
    subsections:
      - title: "Conference Papers"
        meta-on-right: true     # Subsection override: meta on right
        entries:
          - content:
              - "Paper Title"
            meta:
              - "2023"          # Appears on the right
```

**Inheritance Rules:**
1. If `meta-on-right` is not specified, it defaults to `false` (left side)
2. Sections inherit from the CV-level setting
3. Subsections inherit from their parent section
4. Any level can override the inherited value by explicitly setting `meta-on-right`

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
