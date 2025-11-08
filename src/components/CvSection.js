import CvTable from "./CvTable";

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const isHtmlMetaLine = (metaLine) =>
  metaLine &&
  typeof metaLine === "object" &&
  "html" in metaLine &&
  typeof metaLine.html === "string";

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

function CvSection({ section }) {
  if (!section) {
    return null;
  }

  const sectionMeta = normalizeArray(section.meta);
  const sectionEntries = normalizeArray(section.entries);
  const sectionSubsections = normalizeArray(section.subsections);

  return (
    <section
      className="cv-section"
      id={section.id || undefined}
      aria-label={section.title || undefined}
    >
      <header className="section-header">
        <h2>{section.title}</h2>
      </header>

      {sectionMeta.map((metaLine, index) => renderMetaLine(metaLine, index))}

      {sectionEntries.length > 0 ? (
        <CvTable entries={sectionEntries} condensed={Boolean(section.condensed)} />
      ) : null}

      {sectionSubsections.map((subsection, index) => {
        const subsectionMeta = normalizeArray(subsection.meta);
        const subsectionEntries = normalizeArray(subsection.entries);

        return (
          <div
            className="subsection"
            key={subsection.id ?? subsection.title ?? index}
          >
            <h3>{subsection.title}</h3>

            {subsectionMeta.map((metaLine, metaIndex) =>
              renderMetaLine(metaLine, metaIndex)
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
}

export default CvSection;
