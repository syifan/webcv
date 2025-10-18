import React from 'react';
import CvTableEntry from './CvTableEntry';
import './CvTable.css';

const CvTable = ({ entries = [], condensed = false }) => {
    if (!entries || entries.length === 0) {
        return null;
    }

    return (
        <table className="cv-table">
            <tbody>
                {entries.map((entry, index) => (
                    <CvTableEntry
                        key={index}
                        condensed={condensed}
                        hanging={entry.hanging ?? null}
                        left={entry.left}
                        right={entry.right}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default CvTable;
