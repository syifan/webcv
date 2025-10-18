import React from 'react';
import './CvTableEntry.css';

const CvTableEntry = ({ left = [], right = [], hanging = null, condensed = false }) => {
    const isHtmlValue = (value) =>
        typeof value === 'object' && value !== null && 'html' in value;

    const hasContent = (value) => {
        if (value === null || value === undefined) {
            return false;
        }

        if (isHtmlValue(value)) {
            return value.html.trim().length > 0;
        }

        if (typeof value === 'boolean') {
            return true;
        }

        return String(value).trim().length > 0;
    };

    const hasHangingColumn = hasContent(hanging);
    const hasRightColumn = right.some(hasContent);
    const rowCount = Math.max(
        left.length,
        hasRightColumn ? right.length : 0,
        hasHangingColumn ? 1 : 0
    );
    const rows = Array.from({ length: rowCount }, (_, index) => index);

    return (
        <>
            {rows.map((index) => (
                <tr
                    key={index}
                    className={`${index === 0 ? 'entry-start' : ''} ${condensed ? 'condensed-row' : ''}`}
                >
                    {hasHangingColumn && (
                        <td className="hanging-cell">
                            {index === 0 && (
                                isHtmlValue(hanging) ? (
                                    <span dangerouslySetInnerHTML={{ __html: hanging.html }} />
                                ) : (
                                    hanging
                                )
                            )}
                        </td>
                    )}
                    {hasRightColumn && (
                        <td className="right-cell">
                            {right[index] != null && (
                                isHtmlValue(right[index]) ? (
                                    <span dangerouslySetInnerHTML={{ __html: right[index].html }} />
                                ) : (
                                    right[index]
                                )
                            )}
                        </td>
                    )}
                    {condensed ? (
                        index === 0 && (
                            <td className="left-cell" rowSpan={rowCount}>
                                {left.map((value, leftIndex) =>
                                    value != null && (
                                        <span
                                            key={leftIndex}
                                            className={`${leftIndex === 0 ? 'left-header-span' : 'left-entry-span'}`}
                                        >
                                            {isHtmlValue(value) ? (
                                                <span dangerouslySetInnerHTML={{ __html: value.html }} />
                                            ) : leftIndex === 0 ? (
                                                <strong>{value}</strong>
                                            ) : (
                                                value
                                            )}
                                        </span>
                                    )
                                )}
                            </td>
                        )
                    ) : (
                        <td className={index === 0 && left[index] != null ? 'left-header' : ''}>
                            {left[index] != null && (
                                isHtmlValue(left[index]) ? (
                                    <span dangerouslySetInnerHTML={{ __html: left[index].html }} />
                                ) : index === 0 ? (
                                    <strong>{left[index]}</strong>
                                ) : (
                                    left[index]
                                )
                            )}
                        </td>
                    )}
                </tr>
            ))}
        </>
    );
};

export default CvTableEntry;
