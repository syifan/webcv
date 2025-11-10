const isExternalHref = (href) => /^https?:\/\//i.test(href);

const renderContactIcon = (iconDescriptor) => {
  if (!iconDescriptor) {
    return null;
  }

  if (iconDescriptor.type !== "fontawesome") {
    return null;
  }

  return (
    <span
      className={`contact-icon fa-fw ${iconDescriptor.value}`}
      aria-hidden="true"
    />
  );
};

function CvHeader({ header, contactEntries = [] }) {
  const safeHeader = header ?? {};
  const tags = Array.isArray(safeHeader.tags) ? safeHeader.tags : [];

  return (
    <header className="cv-header">
      <div>
        <h1>{safeHeader.name ?? ""}</h1>
        {tags.length > 0 ? (
          <p className="tagline">
            {tags.map((tag, index) => (
              <span key={tag}>
                {tag}
                {index < tags.length - 1 ? <br /> : null}
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
  );
}

export default CvHeader;
