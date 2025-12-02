# GitHub Copilot Instructions for EasyCV

## Project Overview

EasyCV is a framework-free CV/resume library that allows users to maintain a single source of truth (YAML file) for their resume and publish it on the web while producing polished PDFs using the browser's native print dialog.

**Key Features:**
- Single YAML file as the source of truth
- Web-first design with clean URLs
- Browser-based PDF generation via print dialog
- Framework-agnostic library (can be used with vanilla JS, React, Vue, etc.)
- Published as an npm package

## Technology Stack

- **Build Tool:** Vite
- **Package Format:** Dual ESM/CJS output
- **Language:** Vanilla JavaScript (ES6+)
- **Styling:** CSS (included in package)
- **Icons:** Font Awesome
- **YAML Parsing:** js-yaml (bundled dependency)
- **Node Version:** >=18.0.0

## Repository Structure

```
easycv/
├── .github/
│   └── workflows/         # CI/CD workflows (deploy, publish)
├── src/
│   ├── App.css           # Main styles for CV rendering
│   ├── library.js        # Entry point, exports renderCv and createCvElement
│   └── renderCv.js       # Core rendering logic
├── example/
│   ├── react/            # React example implementation
│   └── vanilla/          # Vanilla JS example implementation
├── create-easycv/        # NPX scaffolder CLI tool
├── dist/                 # Build output (generated)
├── package.json          # Library package definition
└── vite.config.js        # Vite library build configuration
```

## Build and Development Commands

### Main Library
- `npm install` - Install dependencies
- `npm run build` - Build the library to `dist/` folder
- `npm test` - Currently no automated tests (outputs placeholder message)

### Examples
The examples demonstrate how to use the library:

**Vanilla JS Example:**
```bash
npm run build                # Build library first
cd example/vanilla
npm install
npm run dev                  # Start dev server
npm run build                # Build for production
```

**React Example:**
```bash
npm run build                # Build library first
cd example/react
npm install
npm run dev                  # Start dev server
npm run build                # Build for production
```

## Architecture and Code Conventions

### Core Design Principles

1. **Pure DOM Manipulation**: The library uses native DOM APIs (createElement, appendChild, etc.) without any framework dependency
2. **Functional Approach**: Functions are pure where possible, with clear input/output contracts
3. **No External Build Dependencies**: The package bundles all dependencies (Font Awesome, CSS)

### Code Structure

The main rendering logic in `src/renderCv.js` follows a hierarchical pattern:

1. **Data Processing Layer**: Functions like `buildContactEntries`, `normalizeArray` sanitize and normalize input
2. **Rendering Layer**: Functions like `renderHeader`, `renderSection`, `renderTable` create DOM elements
3. **Public API**: `createCvElement` and `renderCv` are the exported functions

### Key Patterns

**Element Creation:**
```javascript
const createElement = (tagName, { className, attrs } = {}) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (attrs) {
    Object.entries(attrs).forEach(([attr, value]) => {
      if (value !== undefined && value !== null) {
        element.setAttribute(attr, value);
      }
    });
  }
  return element;
};
```

**HTML Content Handling:**
- Content can be plain strings or objects with `{ html: "..." }` for rich formatting
- Always check `isHtmlValue` or `isHtmlMetaLine` before using `innerHTML`
- Use `hasContent` to validate non-empty values

**Array Normalization:**
- Use `normalizeArray` to ensure values are always arrays
- Prevents crashes when data structure is inconsistent

### CV Data Schema

The library expects data in this structure:

```yaml
version: 1
header:
  name: "Name"
  tags: ["Tag1", "Tag2"]
  contact:
    email: "email@example.com"
    website: "example.com"
    phone: "+1234567890"
sections:
  - id: "section-id"
    title: "Section Title"
    condensed: false  # Optional, compact layout
    entries:
      - index: "1."   # Optional
        meta:         # Optional, right-aligned column
          - "Date"
          - "Location"
        content:      # Required, main content
          - "Title (first line is bold)"
          - "Additional details"
    subsections:      # Optional nested sections
      - title: "Subsection"
        entries: [...]
```

### Styling Conventions

- **Class Naming**: Use kebab-case (e.g., `easycv-container`, `contact-item`)
- **Namespace**: All CSS classes are prefixed with `easycv-` or component-specific names
- **Print Styles**: Use `@media print` for PDF-specific styling
- **Font Awesome**: Icons use FA classes (e.g., `fa-solid fa-phone`)

## Common Workflows

### Adding New Features

1. Modify `src/renderCv.js` for core rendering logic
2. Update `src/App.css` for styling
3. Test with both `example/vanilla` and `example/react`
4. Update documentation in README.md if adding public API

### Publishing

The library is published to npm via GitHub Actions:

1. Update version in `package.json`
2. Create a git tag matching the version (e.g., `v0.3.2`)
3. Push tag to trigger publish workflow
4. Workflow verifies version matches tag before publishing

### Deployment

- **GitHub Pages**: Auto-deploys vanilla example from `main` branch
- **Netlify**: React example is deployed separately
- Both use the locally built library (not npm package)

## Testing

⚠️ **No automated tests currently exist**. Manual testing involves:

1. Build the library: `npm run build`
2. Test in vanilla example: `cd example/vanilla && npm install && npm run dev`
3. Test in React example: `cd example/react && npm install && npm run dev`
4. Verify PDF export using browser print dialog
5. Test with different CV data structures

## Important Notes

### For Contributors

- **Minimal Dependencies**: Avoid adding new dependencies unless absolutely necessary
- **Browser Compatibility**: Code should work in modern browsers (see browserslist in package.json)
- **No Framework Lock-in**: Keep the library framework-agnostic
- **Accessibility**: Use semantic HTML and ARIA labels where appropriate
- **Print Optimization**: Consider PDF output when making style changes

### Common Pitfalls

1. **HTML Injection**: Always use `isHtmlValue` check before setting `innerHTML`
2. **Null/Undefined**: Use `hasContent` to validate data before rendering
3. **Array Assumptions**: Use `normalizeArray` rather than assuming `Array.isArray`
4. **Font Awesome Icons**: Icons are bundled, but only Font Awesome classes are supported - custom icons require URLs

### Build Output

The build produces:
- `dist/index.mjs` - ES module
- `dist/index.cjs` - CommonJS module
- `dist/easycv.css` - Bundled styles
- Source maps for debugging

### Package Exports

The package.json defines specific exports:
- Main entry: `import { renderCv } from 'easycv'`
- CSS: `import 'easycv/easycv.css'`

## Example Usage Patterns

### Basic Integration

```javascript
import { renderCv } from 'easycv';
import { load as loadYaml } from 'js-yaml';

async function mountCv() {
  const response = await fetch('/cv_data.yml');
  const yaml = await response.text();
  const data = loadYaml(yaml);
  
  renderCv('#cv-root', data, {
    titleTemplate: '%s — My CV',
    actions: true  // Show Back to Top + Download buttons
  });
}
```

### Advanced: Manual DOM Control

```javascript
import { createCvElement } from 'easycv';

const cvElement = createCvElement(data, { actions: false });
// Insert cvElement wherever needed (shadow DOM, custom container, etc.)
```

## CLI Scaffolder (create-easycv)

The `create-easycv` directory contains an npx tool that:
- Clones this repository using git
- Copies either vanilla or react example
- Updates package.json with user's project name
- Supports flags: `--ref <tag>`, `--repo <owner/name>`, `--force`

Published separately to npm as `create-easycv`.

## Resources

- **Live Demo (Vanilla)**: https://syifan.github.io/easycv/
- **Live Demo (React)**: https://yifancv.netlify.app
- **npm Package**: https://www.npmjs.com/package/easycv
- **License**: MIT
