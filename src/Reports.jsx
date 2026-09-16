import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from './api/client.js'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#8A9483',
}

function formatLocation(location) {
  const lat = location?.masked_latitude
  const lng = location?.masked_longitude
  if (lat == null || lng == null) return 'Approximate location unavailable'
  return `${Number(lat).toFixed(3)}, ${Number(lng).toFixed(3)} (approximate)`
}

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    publicApi
      .getVerifiedReports()
      .then((data) => {
        setReports(Array.isArray(data) ? data : data.results || [])
      })
      .catch((err) => {
        console.error('Could not load reports:', err.message)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '32px 0' }}>
      <h1 style={{ fontSize: 28, color: BRAND.text, margin: '0 0 8px' }}>Verified Reports</h1>
      <p style={{ fontSize: 14, color: BRAND.textMuted, margin: '0 0 32px' }}>
        Nest sightings confirmed by our researchers. Exact locations are always kept private —
        only an approximate area is shown here.
      </p>

      {loading && <p style={{ color: BRAND.textMuted }}>Loading reports...</p>}

      {error && (
        <p style={{ color: BRAND.textMuted, fontSize: 13 }}>
          Could not load reports right now ({error}).
        </p>
      )}

      {!loading && !error && reports.length === 0 && (
        <p style={{ color: BRAND.textMuted }}>No verified reports yet — check back soon.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                background: BRAND.card,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, color: BRAND.text, margin: '0 0 4px' }}>
                  {report.species_name || 'Unidentified species'}
                </h3>
                <p style={{ fontSize: 13, color: BRAND.textMuted, margin: '0 0 4px' }}>
                  {report.habitat || 'Habitat not specified'}
                </p>
                <p style={{ fontSize: 12, color: BRAND.textMuted, margin: 0 }}>
                  Reported {report.date} &middot; {formatLocation(report.location)}
                </p>
              </div>
              <Link
                to="/map"
                style={{
                  color: BRAND.accent,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                View on map &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reports