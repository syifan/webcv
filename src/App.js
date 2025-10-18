import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import CvTable from './CvTable';
import './App.css';

const contactOrder = ['phone', 'email', 'website'];
const contactIcons = {
    phone: `${process.env.PUBLIC_URL}/phone-solid-full.svg`,
    email: `${process.env.PUBLIC_URL}/envelope-solid-full.svg`,
    website: `${process.env.PUBLIC_URL}/globe-solid-full.svg`,
};

function App() {
    const [cvData, setCvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCvData = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/cv_data.yml`);
                if (!response.ok) {
                    throw new Error(`Failed to load CV data: ${response.status}`);
                }
                const cvText = await response.text();
                const data = yaml.load(cvText);
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid CV data format');
                }
                setCvData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        loadCvData();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const triggerPrint = () => {
        window.print();
    };

    const formatWebsite = (value) =>
        /^https?:\/\//i.test(value) ? value : `https://${value}`;

    const isHtmlMetaLine = (metaLine) =>
        typeof metaLine === 'object' &&
        metaLine !== null &&
        'html' in metaLine &&
        typeof metaLine.html === 'string';

    if (loading) {
        return <div className="cv-container">Loading...</div>;
    }

    if (error) {
        return <div className="cv-container">Error: {error}</div>;
    }

    const header = cvData?.header || { name: '' };
    const sections = cvData?.sections || [];
    const contact = header?.contact || {};

    const contactEntries = (() => {
        const entries = [];

        for (const key of contactOrder) {
            const value = contact[key];
            if (typeof value === 'string' && value.trim().length > 0) {
                entries.push({ key, value });
            }
        }

        for (const [key, value] of Object.entries(contact)) {
            if (
                !contactOrder.includes(key) &&
                typeof value === 'string' &&
                value.trim().length > 0
            ) {
                entries.push({ key, value });
            }
        }

        return entries;
    })();

    return (
        <div className="cv-container">
            <header className="cv-header">
                <div>
                    <h1>{header.name}</h1>
                    {header.tags && header.tags.length > 0 && (
                        <p className="tagline">
                            {header.tags.map((tag, index) => (
                                <React.Fragment key={index}>
                                    {tag}
                                    {index < header.tags.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </p>
                    )}
                </div>
                {contactEntries.length > 0 && (
                    <div className="contact">
                        {contactEntries.map((entry) => (
                            <div key={entry.key} className="contact-item">
                                {contactIcons[entry.key] && (
                                    <img
                                        className="contact-icon"
                                        src={contactIcons[entry.key]}
                                        alt=""
                                        aria-hidden="true"
                                        width="16"
                                        height="16"
                                    />
                                )}
                                {entry.key === 'email' ? (
                                    <a href={`mailto:${entry.value}`}>{entry.value}</a>
                                ) : entry.key === 'website' ? (
                                    <a
                                        href={formatWebsite(entry.value)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {entry.value}
                                    </a>
                                ) : (
                                    <span>{entry.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            <main>
                {sections.map((section) => (
                    <section key={section.id} className="cv-section" id={section.id}>
                        <header className="section-header">
                            <h2>{section.title}</h2>
                        </header>

                        {section.meta && section.meta.length > 0 && (
                            <>
                                {section.meta.map((metaLine, index) => (
                                    <p key={index} className="list-heading">
                                        {isHtmlMetaLine(metaLine) ? (
                                            <span dangerouslySetInnerHTML={{ __html: metaLine.html }} />
                                        ) : (
                                            metaLine
                                        )}
                                    </p>
                                ))}
                            </>
                        )}

                        {section.entries && section.entries.length > 0 && (
                            <CvTable
                                entries={section.entries}
                                condensed={section.condensed || false}
                            />
                        )}

                        {section.subsections && section.subsections.length > 0 && (
                            <>
                                {section.subsections.map((subsection) => (
                                    <div key={subsection.id} className="subsection">
                                        <h3>{subsection.title}</h3>

                                        {subsection.meta && subsection.meta.length > 0 && (
                                            <>
                                                {subsection.meta.map((metaLine, index) => (
                                                    <p key={index} className="list-heading">
                                                        {isHtmlMetaLine(metaLine) ? (
                                                            <span dangerouslySetInnerHTML={{ __html: metaLine.html }} />
                                                        ) : (
                                                            metaLine
                                                        )}
                                                    </p>
                                                ))}
                                            </>
                                        )}

                                        <CvTable
                                            entries={subsection.entries || []}
                                            condensed={subsection.condensed || false}
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    </section>
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

export default App;
