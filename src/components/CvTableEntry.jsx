const isHtmlValue = (value) =>
  value && typeof value === 'object' && 'html' in value && typeof value.html === 'string'

const hasContent = (value) => {
  if (value === null || value === undefined) {
    return false
  }

  if (isHtmlValue(value)) {
    return value.html.trim().length > 0
  }

  if (typeof value === 'boolean') {
    return true
  }

  return String(value).trim().length > 0
}

const renderValue = (value, { strong = false } = {}) => {
  if (!hasContent(value)) {
    return null
  }

  if (isHtmlValue(value)) {
    return <span dangerouslySetInnerHTML={{ __html: value.html }} />
  }

  const content = String(value)
  return strong ? <strong>{content}</strong> : content
}

function CvTableEntry({ content = [], meta = [], index = null, condensed = false }) {
  const hasIndexColumn = hasContent(index)
  const hasMetaColumn = meta.some(hasContent)
  const rowCount = Math.max(
    content.length,
    hasMetaColumn ? meta.length : 0,
    hasIndexColumn ? 1 : 0
  )
  const rows = Array.from({ length: rowCount }, (_, index) => index)

  if (rows.length === 0) {
    return null
  }

  return (
    <>
      {rows.map((rowIndex) => {
        const rowClassNames = [
          rowIndex === 0 ? 'entry-start' : '',
          condensed ? 'condensed-row' : '',
        ]
          .join(' ')
          .trim()

        const contentValue = content[rowIndex]
        const contentHasContent = hasContent(contentValue)

        return (
          <tr className={rowClassNames || undefined} key={rowIndex}>
            {hasIndexColumn ? (
              <td className="hanging-cell">
                {rowIndex === 0 ? renderValue(index) : null}
              </td>
            ) : null}

            {hasMetaColumn ? (
              <td className="right-cell">
                {hasContent(meta[rowIndex]) ? renderValue(meta[rowIndex]) : null}
              </td>
            ) : null}

            {condensed ? (
              rowIndex === 0 ? (
                <td className="left-cell" rowSpan={rowCount}>
                  {content.map((value, contentIndex) =>
                    hasContent(value) ? (
                      <span
                        key={contentIndex}
                        className={
                          contentIndex === 0 ? 'left-header-span' : 'left-entry-span'
                        }
                      >
                        {renderValue(value, { strong: contentIndex === 0 })}
                      </span>
                    ) : null
                  )}
                </td>
              ) : null
            ) : (
              <td className={rowIndex === 0 && contentHasContent ? 'left-header' : undefined}>
                {renderValue(contentValue, { strong: rowIndex === 0 })}
              </td>
            )}
          </tr>
        )
      })}
    </>
  )
}

export default CvTableEntry
