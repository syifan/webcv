import CvTableEntry from './CvTableEntry'

function CvTable({ entries = [], condensed = false }) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null
  }

  return (
    <table className="cv-table">
      <tbody>
        {entries.map((entry, index) => (
          <CvTableEntry key={index} condensed={condensed} {...entry} />
        ))}
      </tbody>
    </table>
  )
}

export default CvTable
