# EasyCV 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)](https://reactjs.org/)

EasyCV is a React-powered CV template that lets you maintain a single source of truth for your CV, publish it on the web, and produce a polished PDF using the browser's native print dialog.

## Live Demo

**[View Example Website →](https://webcv-exp.netlify.app/)**

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
npm start
# Edit public/cv_data.yml to customize your CV
```

The generator pulls the latest `main` branch from this repository, strips build artifacts, and updates `package.json` with your project name. Because it shells out to `git`, make sure Git ≥2.0 is installed locally. Use `npx create-easycv --help` to see extra flags such as `--ref <tag>` (pin to a release), `--repo <owner/name>` (use your own fork), or `--force` (allow writing into a non-empty directory).

### Method 2: As a Component in Your Existing Site

If you already have a React project and want to embed EasyCV as a component, follow these steps:

1. **Install Dependencies**

   ```bash
   npm install easycv react-yaml
   ```

2. **Add CV Data**

    Create a `cv_data.yml` file in your `public/` directory with your CV content.

3. **Import and Use the Component** 

Below is an example of how to integrate EasyCV into your existing React application:

    
```javascript
import { useEffect, useState } from "react";
import { load as loadYaml } from "js-yaml";
import { Cv } from "easycv";

function MyCvPage() {
  const publicUrl = process.env.PUBLIC_URL || "";
  const dataUrl = `${publicUrl}/cv_data.yml`;
  const [cvData, setCvData] = useState(null);

  useEffect(() => {
    fetch(dataUrl)
      .then((response) => response.text())
      .then((yamlText) => setCvData(loadYaml(yamlText)))
      .catch((err) => console.error("Failed to load CV data:", err));
  }, [dataUrl]);

  if (!cvData) {
    return null;
  }

  return <Cv data={cvData} />;
}

export default App;
```

## Structure

EasyCV renders your CV by walking a consistent hierarchy:
- `title`: comes from `header.name` plus `header.contact`, giving the page banner and quick ways to reach you.
- `section`: each item in `sections` defines a top-level block such as Education or Publications.
- `subsection`: optional grouping inside a section; useful when you need multiple tables under a single heading. For example, Publications can have Conference Papers and Journal Articles as subsections.
- `table`: every section or subsection is rendered as a table so content and metadata stay aligned, even in condensed layouts.
- `table entry`: the smallest unit that describes one item in your CV, such as a job, degree, or publication. An entry have 3 parts: index, meta, and content. Index and meta are optional, but content is required. The content field supports multiple lines for rich descriptions. The first row of the content is the entry title (bold text), and subsequent rows are additional details or bullet points.

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

### GitHub Pages (Automated)

This repository includes a GitHub Actions workflow that automatically builds and deploys your CV when you push to the `main` branch.

**Setup Steps:**

1. **Fork the repository** on GitHub

2. **Update the homepage URL** in `package.json`:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/webcv"
   ```

3. **Enable GitHub Pages** in your repository:
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Push your changes** to the `main` branch:
   ```bash
   git add .
   git commit -m "Update CV data"
   git push origin main
   ```

5. **Access your CV** at `https://YOUR_USERNAME.github.io/webcv`

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your site on every push to `main`.

### Manual Deployment

If you prefer manual deployment to GitHub Pages:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the build folder**
   ```bash
   # Install gh-pages if you haven't already
   npm install -g gh-pages

   # Deploy to gh-pages branch
   gh-pages -d build
   ```

3. **Enable GitHub Pages** pointing to the `gh-pages` branch

### Other Hosting Platforms

WebCV can be deployed to any static hosting service:

- **Netlify**: Connect your GitHub repository and set build command to `npm run build`
- **Vercel**: Import your GitHub repository for automatic deployments
- **AWS S3**: Upload the contents of the `build/` folder to an S3 bucket with static hosting enabled
- **Firebase Hosting**: Use `firebase deploy` after building

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

**Embed in an Existing Site:**

Treat `src/components/App.js` as a reusable widget:

```javascript
import CvApp from './components/App';
import cvData from './cv_data.yml';

function MyPage() {
  return (
    <div>
      <CvApp data={cvData} />
    </div>
  );
}
```

**Custom Data Source:**

Skip the built-in YAML fetch and pass structured data directly to components:

```javascript
import { CvTable, CvTableEntry } from './components';

function CustomCV({ data }) {
  return (
    <CvTable entries={data.entries} />
  );
}
```

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

### GitHub Pages Not Updating

**Issue**: Changes don't appear on the deployed site

**Solutions**:
- Check the **Actions** tab in GitHub to see if the workflow succeeded
- Verify the `homepage` field in `package.json` matches your repository
- Clear your browser cache or try incognito mode
- Wait a few minutes for GitHub's CDN to update

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
   npm start  # Test locally
   npm run build  # Ensure build succeeds
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

If WebCV helps your project, please credit Yifan Sun and link back to this repository. A simple note such as “CV powered by [WebCV](https://github.com/syifan/webcv) by [Yifan Sun](https://github.com/syifan)” in your README or site footer is perfect.

## License

See `LICENSE` for details.
