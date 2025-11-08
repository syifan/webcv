import { useEffect, useMemo, useState } from "react";
import { load as loadYaml } from "js-yaml";
import CvHeader from "./CvHeader";
import CvSection from "./CvSection";

const CONTACT_ORDER = ["phone", "email", "website"];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const iconLooksLikeFontAwesome = (value) => /\bfa-[\w-]+/i.test(value);

const resolveIconPath = (iconPath, baseUrl = "") => {
  if (!isNonEmptyString(iconPath)) {
    return "";
  }

  const trimmed = iconPath.trim();

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${baseUrl}${trimmed}`;
  }

  const normalized = trimmed.replace(/^\.?\//, "");
  return `${baseUrl}/${normalized}`;
};

const getIconDescriptor = (iconValue, baseUrl) => {
  if (isNonEmptyString(iconValue)) {
    const trimmed = iconValue.trim();

    if (iconLooksLikeFontAwesome(trimmed)) {
      return { type: "fontawesome", value: trimmed };
    }

    return { type: "image", value: resolveIconPath(trimmed, baseUrl) };
  }

  return null;
};

const formatWebsite = (value) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const createContactEntry = (key, rawValue, baseUrl) => {
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
        ? getIconDescriptor(rawValue.icon, baseUrl)
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

function Cv({ dataUrl, assetBase = process.env.PUBLIC_URL || "" }) {
  const [cvData, setCvData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!isNonEmptyString(dataUrl)) {
        setStatus("error");
        setError(new Error("CV data URL is not defined"));
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(dataUrl);
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
  }, [dataUrl]);

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
      const entry = createContactEntry(key, contact[key], assetBase);
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
  }, [header?.contact, assetBase]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="cv-container">
      <CvHeader header={header} contactEntries={contactEntries} />

      <main>
        {sections.map((section) => (
          <CvSection key={section.id ?? section.title} section={section} />
        ))}
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

export default Cv;
