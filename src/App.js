import { useEffect, useMemo, useState } from "react";
import { load as loadYaml } from "js-yaml";
import CvTable from "./components/CvTable";
import "./App.css";

const CONTACT_ORDER = ["phone", "email", "website"];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const iconLooksLikeFontAwesome = (value) => /\bfa-[\w-]+/i.test(value);

const resolveIconPath = (iconPath) => {
  if (!isNonEmptyString(iconPath)) {
    return "";
  }

  const trimmed = iconPath.trim();

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = process.env.PUBLIC_URL || "";
  if (trimmed.startsWith("/")) {
    return `${base}${trimmed}`;
  }

  const normalized = trimmed.replace(/^\.?\//, "");
  return `${base}/${normalized}`;
};

const getIconDescriptor = (iconValue) => {
  if (isNonEmptyString(iconValue)) {
    const trimmed = iconValue.trim();

    if (iconLooksLikeFontAwesome(trimmed)) {
      return { type: "fontawesome", value: trimmed };
    }

    return { type: "image", value: resolveIconPath(trimmed) };
  }

  return null;
};

const formatWebsite = (value) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const isHtmlMetaLine = (metaLine) =>
  metaLine &&
  typeof metaLine === "object" &&
  "html" in metaLine &&
  typeof metaLine.html === "string";

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

  if (
    rawValue &&
    typeof rawValue === "object" &&
    !Array.isArray(rawValue)
  ) {
    const value = isNonEmptyString(rawValue.value)
      ? rawValue.value.trim()
      : "";

    if (!value) {
      return null;
    }

    const entry = {
      key,
      value,
      displayValue: isNonEmptyString(rawValue.display)
        ? rawValue.display.trim()
        : value,
      href: isNonEmptyString(rawValue.href)
        ? rawValue.href.trim()
        : undefined,
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

const isExternalHref = (href) => /^https?:\/\//i.test(href);

function App() {
  const [cvData, setCvData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL || ""}/cv_data.yml`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch CV data (status ${response.status})`
          );
        }
        const yamlText = await response.text();
        const parsed = loadYaml(yamlText);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("CV data is not a valid YAML object");
        }

        if (!cancelled) {
          setCvData(parsed);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const header = cvData?.header ?? { name: "" };
  const sections = normalizeArray(cvData?.sections);

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

  const renderContactIcon = (iconDescriptor) => {
    if (!iconDescriptor) {
      return null;
    }

    if (iconDescriptor.type === "image") {
      return (
        <img
          className="contact-icon"
          src={iconDescriptor.value}
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          loading="lazy"
        />
      );
    }

    return (
      <span
        className={`contact-icon fa-fw ${iconDescriptor.value}`}
        aria-hidden="true"
      />
    );
  };

  if (status === "loading") {
    return (
      <div className="cv-loading" role="status" aria-live="polite">
        Loading CV…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="cv-error" role="alert">
        <p>We were unable to load the CV.</p>
        {error?.message ? (
          <p className="cv-error-message">{error.message}</p>
        ) : null}
      </div>
    );
  }

  const renderMetaLine = (metaLine, index) => {
    if (isHtmlMetaLine(metaLine)) {
      return (
        <p
          key={`meta-${index}`}
          className="list-heading"
          dangerouslySetInnerHTML={{ __html: metaLine.html }}
        />
      );
    }

    if (metaLine == null) {
      return null;
    }

    return (
      <p key={`meta-${index}`} className="list-heading">
        {metaLine}
      </p>
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="cv-container">
      <header className="cv-header">
        <div>
          <h1>{header?.name ?? ""}</h1>
          {Array.isArray(header?.tags) && header.tags.length > 0 ? (
            <p className="tagline">
              {header.tags.map((tag, index) => (
                <span key={tag}>
                  {tag}
                  {index < header.tags.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          ) : null}
        </div>

        {contactEntries.length > 0 ? (
          <div className="contact">
            {contactEntries.map((entry) => {
              const displayValue = entry.displayValue ?? entry.value;
              const href = entry.href;
              const openInNewTab =
                typeof entry.openInNewTab === "boolean"
                  ? entry.openInNewTab
                  : href
                  ? isExternalHref(href)
                  : false;

              return (
                <div
                  className="contact-item"
                  key={`${entry.key}-${displayValue}`}
                >
                  {renderContactIcon(entry.icon)}
                  {href ? (
                    <a
                      href={href}
                      target={openInNewTab ? "_blank" : undefined}
                      rel={openInNewTab ? "noreferrer" : undefined}
                    >
                      {displayValue}
                    </a>
                  ) : (
                    <span>{displayValue}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </header>

      <main>
        {sections.map((section) => {
          const sectionMeta = normalizeArray(section.meta);
          const sectionEntries = normalizeArray(section.entries);
          const sectionSubsections = normalizeArray(section.subsections);

          return (
            <section
              className="cv-section"
              id={section.id}
              key={section.id ?? section.title}
            >
              <header className="section-header">
                <h2>{section.title}</h2>
              </header>

              {sectionMeta.map((metaLine, index) =>
                renderMetaLine(metaLine, index)
              )}

              {sectionEntries.length > 0 ? (
                <CvTable
                  entries={sectionEntries}
                  condensed={Boolean(section.condensed)}
                />
              ) : null}

              {sectionSubsections.map((subsection) => {
                const subsectionMeta = normalizeArray(subsection.meta);
                const subsectionEntries = normalizeArray(subsection.entries);

                return (
                  <div
                    className="subsection"
                    key={subsection.id ?? subsection.title}
                  >
                    <h3>{subsection.title}</h3>

                    {subsectionMeta.map((metaLine, index) =>
                      renderMetaLine(metaLine, index)
                    )}

                    <CvTable
                      entries={subsectionEntries}
                      condensed={Boolean(subsection.condensed)}
                    />
                  </div>
                );
              })}
            </section>
          );
        })}
      </main>

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

export default App;
