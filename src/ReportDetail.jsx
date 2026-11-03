import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { researcherApi, publicApi } from './api/client.js'
import './reportdetail.css'

const BRAND = {
  accent: '#93BB4A',
}

const STATUS_META = {
  unverified: { label: 'Unverified', bg: '#E5A83A', text: '#3D2A05', icon: 'ti-clock' },
  verified: { label: 'Verified', bg: '#93BB4A', text: '#1B2E08', icon: 'ti-check' },
  rejected: { label: 'Rejected', bg: '#9A9A92', text: '#232320', icon: 'ti-x' },
  needs_info: { label: 'Needs info', bg: '#E4685A', text: '#3D0F0A', icon: 'ti-help' },
}

// "2026-10-14" -> "14 Oct 2026". Falls back to the raw text if it isn't a date.
function formatDate(value) {
  if (!value || value === '—') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [photos, setPhotos] = useState([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [status, setStatus] = useState('unverified')
  const [notes, setNotes] = useState('')
  const [speciesList, setSpeciesList] = useState([])
  const [finalSpecies, setFinalSpecies] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  useEffect(() => {
    researcherApi.getReport(id)
      .then((data) => {
        setReport(data)
        setStatus(data.status || 'unverified')
        setFinalSpecies(data.final_species?.id ?? data.final_species ?? data.species?.id ?? data.species ?? '')
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

    publicApi.getSpecies()
      .then((data) => {
        setSpeciesList(Array.isArray(data) ? data : data.results || [])
      })
      .catch((err) => {
        console.log('Could not load species:', err.message)
      })
  }, [id])

  // Only photos whose link could be generated can be shown.
  const photoItems = photos.filter((p) => p.photo_url)
  const activeIndex = Math.min(activePhoto, Math.max(photoItems.length - 1, 0))
  const activePhotoUrl = photoItems[activeIndex]?.photo_url || null

  // Keyboard controls for the photo viewer and the delete dialog
  useEffect(() => {
    if (!viewerOpen && !confirmingDelete) return
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setViewerOpen(false)
        setConfirmingDelete(false)
      } else if (viewerOpen && e.key === 'ArrowRight') {
        setActivePhoto((i) => Math.min(i + 1, photoItems.length - 1))
      } else if (viewerOpen && e.key === 'ArrowLeft') {
        setActivePhoto((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewerOpen, confirmingDelete, photoItems.length])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await researcherApi.updateStatus(id, status)
      await researcherApi.addReview(id, {
        notes,
        final_species: finalSpecies || null,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(`Could not save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false)
    setDeleting(true)
    setError(null)
    try {
      await researcherApi.deleteReport(id)
      navigate('/dashboard')
    } catch (err) {
      console.error('Could not delete report:', err)
      setError(`Could not delete report: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  async function handleExportPdf() {
    try {
      setError(null)
      const blob = await researcherApi.exportPdf(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `nestquest-report-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Could not export PDF:', err)
      setError(`Could not export PDF: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '16px 0' }} role="status" aria-label="Loading report">
        <div className="nq-rd-skel" style={{ height: 38, width: 180, marginBottom: 22 }} />
        <div className="nq-rd-skel" style={{ height: 48, width: 280, marginBottom: 22 }} />
        <div className="nq-rd-skel" style={{ height: 420 }} />
      </div>
    )
  }

  const loc = report?.location
  const exactLat = loc?.exact_latitude ?? loc?.masked_latitude ?? -36.8523
  const exactLng = loc?.exact_longitude ?? loc?.masked_longitude ?? 174.7642
  const speciesName = report?.final_species_name || report?.species_name || 'Unknown'
  const submittedDate = formatDate(report?.created_at || report?.date || '—')
  const contactEmail = report?.contact_email || '—'
  const statusMeta = STATUS_META[status] || STATUS_META.unverified

  return (
    <div style={{ padding: '16px 0' }}>
      <Link to="/dashboard" className="nq-rd-back">
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true"></i>
        Back to submissions
      </Link>

      {loadError && (
        <p className="nq-rd-note" role="alert">
          Could not load live report data ({loadError}). Showing placeholder values below.
        </p>
      )}

      <div className="nq-rd-head">
        <div>
          <p className="nq-eyebrow">Researcher review</p>
          <h1 style={{ color: '#F5EFD9', fontSize: 'clamp(28px, 4vw, 38px)', margin: 0 }}>Report #{id}</h1>
        </div>
        <span className="nq-rd-badge" style={{ background: statusMeta.bg, color: statusMeta.text }}>
          <i className={`ti ${statusMeta.icon}`} aria-hidden="true"></i>
          {statusMeta.label}
        </span>
      </div>

      <div className="nq-rd-card">
        <div className="nq-two-col">
          <div>
            <span className="nq-rd-label">
              {photoItems.length > 1 ? `Photos (${photoItems.length})` : 'Photo'}
            </span>
            {activePhotoUrl ? (
              <>
                <button
                  type="button"
                  className="nq-rd-hero"
                  onClick={() => setViewerOpen(true)}
                  aria-label="View photo full screen"
                >
                  <img
                    src={activePhotoUrl}
                    alt={`Submitted nest, photo ${activeIndex + 1} of ${photoItems.length}`}
                  />
                  <span className="nq-rd-zoom" aria-hidden="true">
                    <i className="ti ti-arrows-maximize"></i> Full screen
                  </span>
                </button>

                {photoItems.length > 1 && (
                  <div className="nq-rd-thumbs">
                    {photoItems.map((p, index) => (
                      <button
                        key={p.id}
                        type="button"
                        className="nq-rd-thumb"
                        onClick={() => setActivePhoto(index)}
                        aria-label={`Show photo ${index + 1} of ${photoItems.length}`}
                        aria-current={index === activeIndex}
                      >
                        <img src={p.photo_url} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="nq-rd-empty">
                <i className="ti ti-photo-off" aria-hidden="true"></i>
                No photos for this report
              </div>
            )}

            <ul className="nq-rd-facts">
              <li>
                <i className="ti ti-calendar" aria-hidden="true"></i>
                <span><small>Submitted</small>{submittedDate}</span>
              </li>
              <li>
                <i className="ti ti-feather" aria-hidden="true"></i>
                <span><small>Suggested species</small>{speciesName}</span>
              </li>
              <li>
                <i className="ti ti-mail" aria-hidden="true"></i>
                <span><small>Contact</small>{contactEmail}</span>
              </li>
            </ul>

            <label className="nq-rd-label" htmlFor="rd-notes">Notes</label>
            <textarea
              id="rd-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note"
              className="nq-rd-field"
              style={{ minHeight: 96 }}
            />
          </div>

          <div>
            <span className="nq-rd-label">
              Exact nest location <em>&middot; researcher only</em>
            </span>
            <div className="nq-rd-map nq-map">
              <MapContainer center={[exactLat, exactLng]} zoom={15} style={{ height: 220, width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[exactLat, exactLng]}>
                  <Popup>Exact location</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="nq-rd-coords">
              {Number(exactLat).toFixed(6)}, {Number(exactLng).toFixed(6)}
            </p>

            <label className="nq-rd-label" htmlFor="rd-species">Final species</label>
            <select
              id="rd-species"
              value={finalSpecies}
              onChange={(e) => setFinalSpecies(e.target.value)}
              className="nq-rd-field"
              style={{ marginBottom: 20 }}
            >
              <option value="">Select species</option>
              {speciesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="nq-rd-label" htmlFor="rd-status">Verification status</label>
            <select
              id="rd-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="nq-rd-field"
              style={{ marginBottom: 22 }}
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="needs_info">Needs info</option>
              <option value="rejected">Rejected</option>
            </select>

            {error && <p className="nq-rd-error" role="alert">{error}</p>}

            <div className="nq-rd-actions">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="nq-btn nq-btn-primary"
                style={{ background: saving ? '#6E8A5E' : BRAND.accent, color: '#0F2818', border: 'none' }}
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

              <button
                type="button"
                onClick={handleExportPdf}
                className="nq-btn nq-btn-secondary"
                style={{ color: '#F5EFD9', border: '1px solid #234A2E' }}
              >
                <i className="ti ti-file-type-pdf" style={{ fontSize: 16 }} aria-hidden="true"></i>
                Export PDF
              </button>

              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={deleting}
                className="nq-btn nq-rd-danger"
              >
                {deleting ? (
                  <>
                    <i className="ti ti-loader-2" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    Deleting
                  </>
                ) : (
                  <>
                    <i className="ti ti-trash" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    Delete report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen photo viewer */}
      {viewerOpen && activePhotoUrl && (
        <div className="nq-rd-overlay" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setViewerOpen(false)}>
          <img
            src={activePhotoUrl}
            alt={`Submitted nest, photo ${activeIndex + 1} of ${photoItems.length}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="nq-rd-iconbtn"
            style={{ top: 18, right: 18 }}
            onClick={() => setViewerOpen(false)}
            aria-label="Close photo viewer"
          >
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
          {photoItems.length > 1 && (
            <>
              <button
                type="button"
                className="nq-rd-iconbtn"
                style={{ left: 18, top: '50%', transform: 'translateY(-50%)' }}
                onClick={(e) => { e.stopPropagation(); setActivePhoto(Math.max(activeIndex - 1, 0)) }}
                disabled={activeIndex === 0}
                aria-label="Previous photo"
              >
                <i className="ti ti-chevron-left" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                className="nq-rd-iconbtn"
                style={{ right: 18, top: '50%', transform: 'translateY(-50%)' }}
                onClick={(e) => { e.stopPropagation(); setActivePhoto(Math.min(activeIndex + 1, photoItems.length - 1)) }}
                disabled={activeIndex === photoItems.length - 1}
                aria-label="Next photo"
              >
                <i className="ti ti-chevron-right" aria-hidden="true"></i>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmingDelete && (
        <div className="nq-rd-overlay" onClick={() => setConfirmingDelete(false)}>
          <div
            className="nq-rd-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rd-del-title"
            aria-describedby="rd-del-text"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="rd-del-title">Delete report #{id}?</h2>
            <p id="rd-del-text">
              This permanently deletes the report. This action cannot be undone.
            </p>
            <div className="nq-rd-dialog-actions">
              <button
                type="button"
                className="nq-btn nq-btn-secondary"
                style={{ color: '#F5EFD9', border: '1px solid #234A2E', padding: '12px 22px', borderRadius: 999 }}
                onClick={() => setConfirmingDelete(false)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="nq-btn nq-rd-danger"
                style={{ padding: '12px 22px', borderRadius: 999 }}
                onClick={handleDelete}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportDetail