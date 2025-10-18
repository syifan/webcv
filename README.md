# WebCV

WebCV is a CV template that builds CV on a website using React. Your CV can still be easily exported as a PDF by printing the website.

## Features

- **React-based**: Built with React for a modern, component-based architecture
- **Data-driven**: Separate content (cv_data.yml) from presentation
- **PDF Export**: Print directly from browser to PDF
- **Responsive**: Mobile-friendly design
- **GitHub Pages Ready**: Configured for easy deployment to GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm start
```

Open [http://localhost:3000/webcv](http://localhost:3000/webcv) to view it in the browser.

### Building for Production

Create a production build:

```bash
npm run build
```

### Deployment to GitHub Pages

Deploy to GitHub Pages:

```bash
npm run deploy
```

This will build the project and publish it to the `gh-pages` branch.

## Customizing Your CV

Edit `public/cv_data.yml` to customize your CV content. The file follows this structure:

```yaml
version: 1

header:
  name: "Your Name"
  tags:
    - "Your Title"
    - "Your Address"
  contact:
    phone: "Your Phone"
    email: "your.email@example.com"
    website: "yourwebsite.com"

sections:
  - id: sectionId
    title: "Section Title"
    entries:
      - left:
          - "Entry Title"
          - "Details"
        right:
          - "Date Range"
```

## Project Structure

- `src/App.js` - Main CV component
- `src/CvTable.js` - Table component for CV entries
- `src/CvTableEntry.js` - Individual table entry component
- `public/cv_data.yml` - Your CV data
- `public/*.svg` - Icons for contact information

## License

See LICENSE file for details.
