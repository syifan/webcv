import { useEffect, useMemo } from "react";
import CvHeader from "./CvHeader";
import CvSection from "./CvSection";

const CONTACT_ORDER = ["phone", "email", "website"];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const iconLooksLikeFontAwesome = (value) => /\bfa-[\w-]+/i.test(value);

const getIconDescriptor = (iconValue) => {
  if (isNonEmptyString(iconValue)) {
    const trimmed = iconValue.trim();

    if (iconLooksLikeFontAwesome(trimmed)) {
      return { type: "fontawesome", value: trimmed };
    }
  }

  return null;
};

const formatWebsite = (value) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const createContactEntry = (key, rawValue) => {
  if (isNonEmptyString(rawValue)) {
    const value = rawValue.trim();
    return {
      key,
      value,
      displayValue: value,
      icon: null,
      href:
        key === "email"
          ? `mailto:${value}`
          : key === "website"
          ? formatWebsite(value)
          : undefined,
    };
  }

  if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
    const value = isNonEmptyString(rawValue.value) ? rawValue.value.trim() : "";

    if (!value) {
      return null;
    }

    const entry = {
      key,
      value,
      displayValue: isNonEmptyString(rawValue.display)
        ? rawValue.display.trim()
        : value,
      href: isNonEmptyString(rawValue.href) ? rawValue.href.trim() : undefined,
      icon: isNonEmptyString(rawValue.icon)
        ? getIconDescriptor(rawValue.icon)
        : null,
    };

    if (!entry.href) {
      if (key === "email") {
        entry.href = `mailto:${value}`;
      } else if (key === "website") {
        entry.href = formatWebsite(value);
      }
    }

    if (typeof rawValue.newTab === "boolean") {
      entry.openInNewTab = rawValue.newTab;
    }

    if (isNonEmptyString(rawValue.label)) {
      entry.label = rawValue.label.trim();
    }

    return entry;
  }

  return null;
};

function Cv({ data }) {
  const header = data?.header ?? { name: "" };
  const sections = normalizeArray(data?.sections);

  useEffect(() => {
    if (header?.name) {
      document.title = `${header.name} - Curriculum Vitae`;
    }
  }, [header?.name]);

  const contactEntries = useMemo(() => {
    if (!header?.contact || typeof header.contact !== "object") {
      return [];
    }

    const entries = [];
    const processedKeys = new Set();
    const contact = header.contact;

    const tryAddEntry = (key) => {
      if (processedKeys.has(key)) {
        return;
      }

      processedKeys.add(key);
      const entry = createContactEntry(key, contact[key]);
      if (entry) {
        entries.push(entry);
      }
    };

    CONTACT_ORDER.forEach(tryAddEntry);

    for (const key of Object.keys(contact)) {
      if (!processedKeys.has(key)) {
        tryAddEntry(key);
      }
    }

    return entries;
  }, [header?.contact]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="cv-container">
      <div className="cv-page">
        <CvHeader header={header} contactEntries={contactEntries} />

        <main>
          {sections.map((section) => (
            <CvSection key={section.id ?? section.title} section={section} />
          ))}
        </main>
      </div>

      <footer className="template-attribution">
        CV template provided by{" "}
        <a href="https://sarchlab.org/syifan" target="_blank" rel="noreferrer">
          Yifan Sun
        </a>
        . Template can be found at{" "}
        <a
          href="https://github.com/syifan/webcv"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/syifan/webcv
        </a>
        .
      </footer>

      <div className="floating-actions" aria-label="page controls">
        <button type="button" className="action-button" onClick={scrollToTop}>
          Back to Top
        </button>
        <button type="button" className="action-button" onClick={triggerPrint}>
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Cv;
