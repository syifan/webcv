import { useEffect, useMemo, useState } from 'react'
import { load as loadYaml } from 'js-yaml'
import CvTable from './components/CvTable'
import './App.css'

const CONTACT_ORDER = ['phone', 'email', 'website']
const CONTACT_ICONS = {
  phone: '/phone-solid-full.svg',
  email: '/envelope-solid-full.svg',
  website: '/globe-solid-full.svg',
}

const formatWebsite = (value) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`

const isHtmlMetaLine = (metaLine) =>
  metaLine &&
  typeof metaLine === 'object' &&
  'html' in metaLine &&
  typeof metaLine.html === 'string'

const normalizeArray = (value) => (Array.isArray(value) ? value : [])

function App() {
  const [cvData, setCvData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL || ''}/cv/cv_data.yml`)
        if (!response.ok) {
          throw new Error(`Failed to fetch CV data (status ${response.status})`)
        }
        const yamlText = await response.text()
        const parsed = loadYaml(yamlText)

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('CV data is not a valid YAML object')
        }

        if (!cancelled) {
          setCvData(parsed)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const header = cvData?.header ?? { name: '' }
  const sections = normalizeArray(cvData?.sections)

  useEffect(() => {
    if (header?.name) {
      document.title = `${header.name} - Curriculum Vitae`
    }
  }, [header?.name])

  const contactEntries = useMemo(() => {
    const contact = header?.contact ?? {}
    const entries = []

    for (const key of CONTACT_ORDER) {
      const value = contact[key]
      if (typeof value === 'string' && value.trim().length > 0) {
        entries.push({ key, value })
      }
    }

    for (const [key, value] of Object.entries(contact)) {
      if (
        !CONTACT_ORDER.includes(key) &&
        typeof value === 'string' &&
        value.trim().length > 0
      ) {
        entries.push({ key, value })
      }
    }

    return entries
  }, [header?.contact])

  if (status === 'loading') {
    return (
      <div className="cv-loading" role="status" aria-live="polite">
        Loading CV…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="cv-error" role="alert">
        <p>We were unable to load the CV.</p>
        {error?.message ? <p className="cv-error-message">{error.message}</p> : null}
      </div>
    )
  }

  const renderMetaLine = (metaLine, index) => {
    if (isHtmlMetaLine(metaLine)) {
      return (
        <p
          key={`meta-${index}`}
          className="list-heading"
          dangerouslySetInnerHTML={{ __html: metaLine.html }}
        />
      )
    }

    if (metaLine == null) {
      return null
    }

    return (
      <p key={`meta-${index}`} className="list-heading">
        {metaLine}
      </p>
    )
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const triggerPrint = () => {
    window.print()
  }

  return (
    <div className="cv-container">
      <header className="cv-header">
        <div>
          <h1>{header?.name ?? ''}</h1>
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
            {contactEntries.map((entry) => (
              <div className="contact-item" key={entry.key}>
                {CONTACT_ICONS[entry.key] ? (
                  <img
                    className="contact-icon"
                    src={CONTACT_ICONS[entry.key]}
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                  />
                ) : null}
                {entry.key === 'email' ? (
                  <a href={`mailto:${entry.value}`}>{entry.value}</a>
                ) : entry.key === 'website' ? (
                  <a href={formatWebsite(entry.value)} target="_blank" rel="noreferrer">
                    {entry.value}
                  </a>
                ) : (
                  <span>{entry.value}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </header>

      <main>
        {sections.map((section) => {
          const sectionMeta = normalizeArray(section.meta)
          const sectionEntries = normalizeArray(section.entries)
          const sectionSubsections = normalizeArray(section.subsections)

          return (
            <section className="cv-section" id={section.id} key={section.id ?? section.title}>
            <header className="section-header">
              <h2>{section.title}</h2>
            </header>

              {sectionMeta.map((metaLine, index) => renderMetaLine(metaLine, index))}

              {sectionEntries.length > 0 ? (
                <CvTable entries={sectionEntries} condensed={Boolean(section.condensed)} />
              ) : null}

              {sectionSubsections.map((subsection) => {
                const subsectionMeta = normalizeArray(subsection.meta)
                const subsectionEntries = normalizeArray(subsection.entries)

                return (
                  <div className="subsection" key={subsection.id ?? subsection.title}>
                    <h3>{subsection.title}</h3>

                    {subsectionMeta.map((metaLine, index) =>
                      renderMetaLine(metaLine, index)
                    )}

                    <CvTable
                      entries={subsectionEntries}
                      condensed={Boolean(subsection.condensed)}
                    />
                  </div>
                )
              })}
            </section>
          )
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
  )
}

export default App
