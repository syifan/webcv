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

const isHtmlMetaLine = (metaLine) =>
  metaLine &&
  typeof metaLine === "object" &&
  !Array.isArray(metaLine) &&
  typeof metaLine.html === "string";

const isHtmlValue = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  typeof value.html === "string";

const hasContent = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  if (isHtmlValue(value)) {
    return value.html.trim().length > 0;
  }
  if (typeof value === "boolean") {
    return true;
  }
  return String(value).trim().length > 0;
};

const resolveTrimmedValue = (value) =>
  isNonEmptyString(value) ? value.trim() : "";

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
    const value = resolveTrimmedValue(rawValue.value);
    if (!value) {
      return null;
    }

    const entry = {
      key,
      value,
      displayValue: resolveTrimmedValue(rawValue.display) || value,
      href: resolveTrimmedValue(rawValue.href) || undefined,
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

const buildContactEntries = (contact) => {
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) {
    return [];
  }

  const entries = [];
  const processedKeys = new Set();

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
  Object.keys(contact).forEach((key) => {
    if (!processedKeys.has(key)) {
      tryAddEntry(key);
    }
  });

  return entries;
};

const createElement = (tagName, { className, attrs } = {}) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (attrs) {
    Object.entries(attrs).forEach(([attr, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      element.setAttribute(attr, value);
    });
  }
  return element;
};

const renderContactIcon = (descriptor) => {
  if (!descriptor || descriptor.type !== "fontawesome") {
    return null;
  }
  const icon = createElement("span", {
    className: `contact-icon fa-fw ${descriptor.value}`,
    attrs: { "aria-hidden": "true" },
  });
  return icon;
};

const renderContactEntry = (entry) => {
  const wrapper = createElement("div", {
    className: "contact-item",
  });
  const icon = renderContactIcon(entry.icon);
  if (icon) {
    wrapper.appendChild(icon);
  }

  const displayValue = entry.displayValue ?? entry.value ?? "";
  if (entry.href) {
    const anchor = createElement("a", {
      attrs: {
        href: entry.href,
        target: entry.openInNewTab ? "_blank" : undefined,
        rel: entry.openInNewTab ? "noreferrer" : undefined,
      },
    });
    anchor.textContent = displayValue;
    wrapper.appendChild(anchor);
  } else {
    const span = document.createElement("span");
    span.textContent = displayValue;
    wrapper.appendChild(span);
  }
  return wrapper;
};

const renderTagline = (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  const tagline = createElement("p", { className: "tagline" });
  tags.forEach((tag, index) => {
    const span = document.createElement("span");
    span.textContent = String(tag);
    tagline.appendChild(span);
    if (index < tags.length - 1) {
      tagline.appendChild(document.createElement("br"));
    }
  });
  return tagline;
};

const renderHeader = (header, contactEntries) => {
  const headerElement = createElement("header", { className: "easycv-header" });
  const nameWrapper = document.createElement("div");
  const heading = document.createElement("h1");
  heading.textContent = header.name ?? "";
  nameWrapper.appendChild(heading);

  const tagline = renderTagline(Array.isArray(header.tags) ? header.tags : []);
  if (tagline) {
    nameWrapper.appendChild(tagline);
  }

  headerElement.appendChild(nameWrapper);

  if (contactEntries.length > 0) {
    const contact = createElement("div", { className: "contact" });
    contactEntries.forEach((entry) =>
      contact.appendChild(renderContactEntry(entry))
    );
    headerElement.appendChild(contact);
  }

  return headerElement;
};

const renderMetaLine = (metaLine) => {
  if (metaLine == null) {
    return null;
  }

  if (isHtmlMetaLine(metaLine)) {
    const paragraph = createElement("p", { className: "list-heading" });
    paragraph.innerHTML = metaLine.html;
    return paragraph;
  }

  const paragraph = createElement("p", { className: "list-heading" });
  paragraph.textContent = String(metaLine);
  return paragraph;
};

const renderValueNode = (value, { strong = false } = {}) => {
  if (!hasContent(value)) {
    return null;
  }

  if (isHtmlValue(value)) {
    const span = document.createElement("span");
    span.innerHTML = value.html;
    return span;
  }

  const text = document.createTextNode(String(value));
  if (!strong) {
    const span = document.createElement("span");
    span.appendChild(text);
    return span;
  }

  const strongEl = document.createElement("strong");
  strongEl.appendChild(text);
  return strongEl;
};

const renderTableEntry = (entry, condensed, metaOnRight = false) => {
  const content = normalizeArray(entry?.content ?? []);
  const meta = normalizeArray(entry?.meta ?? []);
  const hasIndexColumn = hasContent(entry?.index);
  const hasMetaColumn = meta.some(hasContent);
  const rowCount = Math.max(
    content.length,
    hasMetaColumn ? meta.length : 0,
    hasIndexColumn ? 1 : 0
  );

  if (rowCount === 0) {
    return null;
  }

  const fragment = document.createDocumentFragment();
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const tr = document.createElement("tr");
    const rowClassNames = [];
    if (rowIndex === 0) {
      rowClassNames.push("entry-start");
    }
    if (condensed) {
      rowClassNames.push("condensed-row");
    }
    tr.className = rowClassNames.filter(Boolean).join(" ");

    if (hasIndexColumn) {
      const td = createElement("td", { className: "index-cell" });
      if (rowIndex === 0) {
        const valueNode = renderValueNode(entry.index);
        if (valueNode) {
          td.appendChild(valueNode);
        }
      }
      tr.appendChild(td);
    }

    // Render meta column on left (default) if metaOnRight is false
    if (hasMetaColumn && !metaOnRight) {
      const td = createElement("td", { className: "meta-cell" });
      const metaValue = meta[rowIndex];
      if (hasContent(metaValue)) {
        const valueNode = renderValueNode(metaValue);
        if (valueNode) {
          td.appendChild(valueNode);
        }
      }
      tr.appendChild(td);
    }

    if (condensed) {
      if (rowIndex === 0) {
        const td = createElement("td", { className: "content-cell" });
        td.setAttribute("rowspan", String(rowCount));
        content.forEach((value, contentIndex) => {
          if (!hasContent(value)) {
            return;
          }
          const span = createElement("span", {
            className:
              contentIndex === 0 ? "content-header-span" : "content-entry-span",
          });
          const valueNode = renderValueNode(value, {
            strong: contentIndex === 0,
          });
          if (valueNode) {
            span.appendChild(valueNode);
            td.appendChild(span);
          }
        });
        tr.appendChild(td);
      }
    } else {
      const contentValue = content[rowIndex];
      const td = document.createElement("td");
      if (rowIndex === 0 && hasContent(contentValue)) {
        td.className = "content-header";
      }
      const valueNode = renderValueNode(contentValue, {
        strong: rowIndex === 0,
      });
      if (valueNode) {
        td.appendChild(valueNode);
      }
      tr.appendChild(td);
    }

    // Render meta column on right if metaOnRight is true
    if (hasMetaColumn && metaOnRight) {
      const td = createElement("td", { className: "meta-cell meta-cell-right" });
      const metaValue = meta[rowIndex];
      if (hasContent(metaValue)) {
        const valueNode = renderValueNode(metaValue);
        if (valueNode) {
          td.appendChild(valueNode);
        }
      }
      tr.appendChild(td);
    }

    fragment.appendChild(tr);
  }

  return fragment;
};

const renderTable = (entries, condensed, metaOnRight = false) => {
  const table = createElement("table", { className: "easycv-table" });
  const tbody = document.createElement("tbody");

  entries.forEach((entry) => {
    const rowFragment = renderTableEntry(entry, condensed, metaOnRight);
    if (rowFragment) {
      tbody.appendChild(rowFragment);
    }
  });

  table.appendChild(tbody);
  return table;
};

const renderSubsection = (subsection, inheritedMetaOnRight = false) => {
  const wrapper = createElement("div", { className: "easycv-subsection" });
  if (subsection.id) {
    wrapper.id = subsection.id;
  }

  const heading = document.createElement("h3");
  heading.textContent = subsection.title ?? "";
  wrapper.appendChild(heading);

  const metaLines = normalizeArray(subsection.meta);
  metaLines.forEach((metaLine) => {
    const metaNode = renderMetaLine(metaLine);
    if (metaNode) {
      wrapper.appendChild(metaNode);
    }
  });

  // Determine meta position for this subsection
  // subsection.meta-on-right overrides inherited value
  const metaOnRight = subsection["meta-on-right"] !== undefined 
    ? Boolean(subsection["meta-on-right"]) 
    : inheritedMetaOnRight;

  const entries = normalizeArray(subsection.entries);
  if (entries.length > 0) {
    wrapper.appendChild(renderTable(entries, Boolean(subsection.condensed), metaOnRight));
  }

  return wrapper;
};

const renderSection = (section, inheritedMetaOnRight = false) => {
  if (!section) {
    return null;
  }
  const sectionElement = createElement("section", {
    className: "easycv-section",
    attrs: {
      id: section.id || undefined,
      "aria-label": section.title || undefined,
    },
  });

  const header = createElement("header", { className: "section-header" });
  const heading = document.createElement("h2");
  heading.textContent = section.title ?? "";
  header.appendChild(heading);
  sectionElement.appendChild(header);

  const metaLines = normalizeArray(section.meta);
  metaLines.forEach((metaLine) => {
    const metaNode = renderMetaLine(metaLine);
    if (metaNode) {
      sectionElement.appendChild(metaNode);
    }
  });

  // Determine meta position for this section
  // section.meta-on-right overrides inherited value
  const metaOnRight = section["meta-on-right"] !== undefined 
    ? Boolean(section["meta-on-right"]) 
    : inheritedMetaOnRight;

  const entries = normalizeArray(section.entries);
  if (entries.length > 0) {
    sectionElement.appendChild(
      renderTable(entries, Boolean(section.condensed), metaOnRight)
    );
  }

  const subsections = normalizeArray(section.subsections);
  subsections.forEach((subsection) => {
    const subsectionNode = renderSubsection(subsection, metaOnRight);
    sectionElement.appendChild(subsectionNode);
  });

  return sectionElement;
};

const createAttribution = () => {
  const footer = createElement("footer", { className: "template-attribution" });
  footer.innerHTML =
    'CV template provided by <a href="https://sarchlab.org/syifan" target="_blank" rel="noreferrer">Yifan Sun</a>. Template can be found at <a href="https://github.com/syifan/easycv" target="_blank" rel="noreferrer">https://github.com/syifan/easycv</a>.';
  return footer;
};

let printInstanceCounter = 0;
const createPrintId = () => {
  printInstanceCounter += 1;
  return `easycv-${Date.now().toString(36)}-${printInstanceCounter.toString(
    36
  )}`;
};

const THEME_KEY = "easycv-theme";

const createThemeToggleButton = (container) => {
  const wrapper = createElement("div", {
    className: "theme-toggle-wrapper",
  });

  const getStoredTheme = () => {
    if (typeof localStorage === "undefined") return "system";
    return localStorage.getItem(THEME_KEY) || "system";
  };

  const setStoredTheme = (theme) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, theme);
    }
  };

  const applyTheme = (theme) => {
    if (theme === "system") {
      container.removeAttribute("data-theme");
    } else {
      container.setAttribute("data-theme", theme);
    }
  };

  const themes = ["light", "system", "dark"];
  const themeLabels = {
    light: "☀️",
    system: "AUTO",
    dark: "🌙"
  };

  let currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  const toggleContainer = createElement("button", {
    className: "theme-toggle-container",
    attrs: {
      type: "button",
      "aria-label": `Theme: ${currentTheme}. Click to cycle through themes.`,
    },
  });

  const slider = createElement("div", {
    className: "theme-toggle-slider",
  });

  const updateSlider = () => {
    const index = themes.indexOf(currentTheme);
    slider.style.transform = `translateX(${index * 100}%)`;
  };

  const labels = themes.map((theme) => {
    const label = createElement("span", {
      className: `theme-toggle-option${currentTheme === theme ? " active" : ""}`,
    });
    label.textContent = themeLabels[theme];
    return label;
  });

  labels.forEach(label => toggleContainer.appendChild(label));
  toggleContainer.appendChild(slider);

  toggleContainer.addEventListener("click", () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    setStoredTheme(currentTheme);
    applyTheme(currentTheme);
    
    // Update active states
    labels.forEach((label, index) => {
      if (index === nextIndex) {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    });
    
    // Update aria-label
    toggleContainer.setAttribute("aria-label", `Theme: ${currentTheme}. Click to cycle through themes.`);
    
    updateSlider();
  });

  wrapper.appendChild(toggleContainer);
  updateSlider();

  return wrapper;
};

const createFloatingActions = (printTargetId, container, enableDarkMode) => {
  const actions = createElement("div", {
    className: "floating-actions",
    attrs: { "aria-label": "page controls" },
  });

  const topButton = createElement("button", {
    className: "action-button",
    attrs: { type: "button" },
  });
  topButton.textContent = "Back to Top";
  topButton.addEventListener("click", () => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  const downloadButton = createElement("button", {
    className: "action-button",
    attrs: { type: "button" },
  });
  downloadButton.textContent = "Download PDF";
  downloadButton.addEventListener("click", () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const body = document.body;
    const enableCvOnlyPrint = () => {
      body.classList.add("easycv-print-cv-only");
      if (printTargetId) {
        body.setAttribute("data-easycv-print-id", printTargetId);
      }
    };

    const disableCvOnlyPrint = () => {
      body.classList.remove("easycv-print-cv-only");
      if (
        printTargetId &&
        body.getAttribute("data-easycv-print-id") === printTargetId
      ) {
        body.removeAttribute("data-easycv-print-id");
      }
    };

    enableCvOnlyPrint();

    const mediaQuery = window.matchMedia ? window.matchMedia("print") : null;
    const handleChange = (event) => {
      if (!event.matches) {
        disableCvOnlyPrint();
      }
    };

    if (mediaQuery) {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
    }

    if (typeof window.print === "function") {
      window.print();
    }

    setTimeout(disableCvOnlyPrint, 1500);
  });

  actions.appendChild(topButton);
  
  if (enableDarkMode) {
    const themeToggle = createThemeToggleButton(container);
    actions.appendChild(themeToggle);
  }
  
  actions.appendChild(downloadButton);
  
  return actions;
};

const createCvDom = (data, { includeActions = true } = {}) => {
  const container = createElement("div", { className: "easycv-container" });
  const page = createElement("div", { className: "easycv-page" });
  const printId = createPrintId();
  container.dataset.easycvPrintId = printId;
  const headerData = data?.header ?? { name: "" };
  const sections = normalizeArray(data?.sections);
  const contactEntries = buildContactEntries(headerData.contact);

  // Get CV-level configuration
  const cvMetaOnRight = Boolean(data?.["meta-on-right"]);
  const enableDarkMode = Boolean(data?.["enable-dark-mode"] ?? true); // default: true
  const printAsScreen = Boolean(data?.["print-as-screen"] ?? false); // default: false

  // Set print-as-screen attribute
  if (printAsScreen) {
    container.setAttribute("data-print-as-screen", "true");
  }

  page.appendChild(renderHeader(headerData, contactEntries));

  const main = document.createElement("main");
  sections.forEach((section) => {
    const sectionNode = renderSection(section, cvMetaOnRight);
    if (sectionNode) {
      main.appendChild(sectionNode);
    }
  });
  page.appendChild(main);

  container.appendChild(page);
  container.appendChild(createAttribution());

  if (includeActions) {
    container.appendChild(createFloatingActions(printId, container, enableDarkMode));
  }

  return {
    element: container,
    headerName: resolveTrimmedValue(headerData?.name),
  };
};

const resolveContainer = (target) => {
  if (typeof document === "undefined") {
    throw new Error("renderCv requires a DOM-like environment");
  }

  if (typeof target === "string") {
    const element = document.querySelector(target);
    if (!element) {
      throw new Error(`No element matches selector: ${target}`);
    }
    return element;
  }

  if (target && typeof target.appendChild === "function") {
    return target;
  }

  throw new TypeError("renderCv expects a DOM element or selector string");
};

const updateDocumentTitle = (name, template = "%s - Curriculum Vitae") => {
  if (!name || typeof document === "undefined") {
    return;
  }

  if (template && template.includes("%s")) {
    document.title = template.replace("%s", name);
    return;
  }

  if (template) {
    document.title = template;
    return;
  }

  document.title = name;
};

export const createCvElement = (data, options = {}) =>
  createCvDom(data, { includeActions: options.actions !== false }).element;

export const renderCv = (target, data, options = {}) => {
  const container = resolveContainer(target);
  const { element, headerName } = createCvDom(data, {
    includeActions: options.actions !== false,
  });

  container.innerHTML = "";
  container.appendChild(element);

  if (options.setDocumentTitle !== false) {
    updateDocumentTitle(headerName, options.titleTemplate);
  }

  return element;
};
