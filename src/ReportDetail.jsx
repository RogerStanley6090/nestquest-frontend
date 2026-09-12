import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { researcherApi } from './api/client.js'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#8A9483',
  accent: '#93BB4A',
}

const STATUS_META = {
  unverified: { label: 'Unverified', bg: '#E5A83A', text: '#3D2A05' },
  verified: { label: 'Verified', bg: '#93BB4A', text: '#1B2E08' },
  rejected: { label: 'Rejected', bg: '#9A9A92', text: '#232320' },
  needs_info: { label: 'Needs info', bg: '#E4685A', text: '#3D0F0A' },
}

function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [status, setStatus] = useState('unverified')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    researcherApi.getReport(id)
      .then((data) => {
        setReport(data)
        setStatus(data.status || 'unverified')
      })
      .catch((err) => {
        console.error('Could not load report:', err.message)
        setLoadError(err.message)
      })
      .finally(() => setLoading(false))

    researcherApi.getPhotosForReport(id)
      .then((data) => {
        setPhotos(Array.isArray(data) ? data : data.results || [])
      })
      .catch((err) => {
        console.log('Could not load photos:', err.message)
      })
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await researcherApi.updateStatus(id, status)
      await researcherApi.addReview(id, { notes })
      navigate('/dashboard')
    } catch (err) {
      setError(`Could not save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading report...</p>

  const loc = report?.location
  const exactLat = loc?.exact_latitude ?? loc?.masked_latitude ?? -36.8523
  const exactLng = loc?.exact_longitude ?? loc?.masked_longitude ?? 174.7642
  const species = report?.species || 'Unknown'
  const submittedDate = report?.created_at || report?.date || '—'
  const contactEmail = report?.contact_email || '—'
  const firstPhotoUrl = photos[0]?.image_url || null
  const statusMeta = STATUS_META[status] || STATUS_META.unverified

  const labelStyle = { fontSize: 12, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }
  const fieldStyle = { width: '100%', background: '#0F2818', border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, padding: 10, fontSize: 13 }

  return (
    <div>
      <Link to="/dashboard" className="nq-link" style={{ fontSize: 13, color: BRAND.accent, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, width: 'fit-content' }}>
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true"></i>
        Back to submissions
      </Link>

      {loadError && (
        <p style={{ color: BRAND.textMuted, fontSize: 12, marginBottom: 12 }}>
          Could not load live report data ({loadError}) — showing placeholder values below.
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ color: BRAND.accent, fontSize: 28, margin: 0 }}>Report #{id}</h1>
        <span style={{ background: statusMeta.bg, color: statusMeta.text, fontSize: 12, padding: '4px 14px', borderRadius: 20, fontWeight: 500 }}>
          {statusMeta.label}
        </span>
      </div>

      <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <p style={labelStyle}>Photo</p>
            {firstPhotoUrl ? (
              <img
                src={firstPhotoUrl}
                alt="Submitted nest"
                style={{width: '100%', height: 170, objectFit: 'contain', background: '#0F2818',borderRadius: 10, marginBottom: 18}}
              />
            ) : (
              <div style={{ background: '#0F2818', border: `1px solid ${BRAND.border}`, borderRadius: 10, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <i className="ti ti-photo" style={{ fontSize: 32, color: '#4D6B48' }} aria-hidden="true"></i>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: BRAND.textMuted }}>Submitted</span> &middot; {submittedDate}</p>
              <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: BRAND.textMuted }}>Species</span> &middot; {species}</p>
              <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: BRAND.textMuted }}>Contact</span> &middot; {contactEmail}</p>
            </div>

            <p style={labelStyle}>Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note"
              style={{ ...fieldStyle, minHeight: 70 }}
            />
          </div>

          <div>
            <p style={labelStyle}>
              Exact nest location <span style={{ color: '#E4685A', textTransform: 'none' }}>&middot; researcher only</span>
            </p>
            <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 10, border: `1px solid ${BRAND.border}` }}>
              <MapContainer center={[exactLat, exactLng]} zoom={15} style={{ height: 170, width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[exactLat, exactLng]}>
                  <Popup>Exact location</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p style={{ fontSize: 12, color: BRAND.textMuted, margin: '0 0 20px' }}>
              {Number(exactLat).toFixed(6)}, {Number(exactLng).toFixed(6)}
            </p>

            <p style={labelStyle}>Verification status</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ ...fieldStyle, marginBottom: 18 }}
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="needs_info">Needs info</option>
              <option value="rejected">Rejected</option>
            </select>

            {error && <p style={{ color: '#E4685A', fontSize: 13, marginBottom: 10 }}>{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="nq-button"
              style={{
                background: saving ? '#6E8A5E' : BRAND.accent,
                color: '#0F2818',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                padding: '12px 20px',
                width: '100%',
                borderRadius: 8,
                cursor: saving ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '0.01em',
              }}
            >
              {saving ? (
                <>
                  <i className="ti ti-loader-2" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  Saving
                </>
              ) : (
                <>
                  <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail