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

function CvTableEntry({ left = [], right = [], hanging = null, condensed = false }) {
  const hasHangingColumn = hasContent(hanging)
  const hasRightColumn = right.some(hasContent)
  const rowCount = Math.max(
    left.length,
    hasRightColumn ? right.length : 0,
    hasHangingColumn ? 1 : 0
  )
  const rows = Array.from({ length: rowCount }, (_, index) => index)

  if (rows.length === 0) {
    return null
  }

  return (
    <>
      {rows.map((index) => {
        const rowClassNames = [
          index === 0 ? 'entry-start' : '',
          condensed ? 'condensed-row' : '',
        ]
          .join(' ')
          .trim()

        const leftValue = left[index]
        const leftHasContent = hasContent(leftValue)

        return (
          <tr className={rowClassNames || undefined} key={index}>
            {hasHangingColumn ? (
              <td className="hanging-cell">
                {index === 0 ? renderValue(hanging) : null}
              </td>
            ) : null}

            {hasRightColumn ? (
              <td className="right-cell">
                {hasContent(right[index]) ? renderValue(right[index]) : null}
              </td>
            ) : null}

            {condensed ? (
              index === 0 ? (
                <td className="left-cell" rowSpan={rowCount}>
                  {left.map((value, leftIndex) =>
                    hasContent(value) ? (
                      <span
                        key={leftIndex}
                        className={
                          leftIndex === 0 ? 'left-header-span' : 'left-entry-span'
                        }
                      >
                        {renderValue(value, { strong: leftIndex === 0 })}
                      </span>
                    ) : null
                  )}
                </td>
              ) : null
            ) : (
              <td className={index === 0 && leftHasContent ? 'left-header' : undefined}>
                {renderValue(leftValue, { strong: index === 0 })}
              </td>
            )}
          </tr>
        )
      })}
    </>
  )
}

export default CvTableEntry
