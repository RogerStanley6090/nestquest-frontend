import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { researcherApi } from './api/client.js'

function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('unverified')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Placeholder until connected to GET /api/researcher/reports/{id}/
  const exactLat = -36.8523
  const exactLng = 174.7642

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await researcherApi.updateStatus(id, status)
      await researcherApi.addReview(id, { notes })
      navigate('/dashboard')
    } catch (err) {
      setError(`Could not save (backend not connected yet): ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Submissions</Link>
      <h2>Report #{id}</h2>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <p><strong>Photo(s)</strong></p>
          <div style={{ height: 120, border: '1px solid #999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [img]
          </div>
          <p><strong>Submitted:</strong> 12 Aug 2026 · Blackbird (system-suggested)</p>
          <p><strong>Contact email (researcher-only):</strong> user@example.com</p>
          <label>Notes</label>
          <br />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ flex: 1 }}>
          <p>
            <strong>Exact Nest Location</strong>{' '}
            <span style={{ color: 'red', fontSize: 12 }}>(researcher/admin only — never shown publicly)</span>
          </p>
          <MapContainer center={[exactLat, exactLng]} zoom={15} style={{ height: 170, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[exactLat, exactLng]}>
              <Popup>Exact location</Popup>
            </Marker>
          </MapContainer>
          <p style={{ fontSize: 11 }}>Exact coordinates: {exactLat}, {exactLng}</p>

          <label>Verification Status</label>
          <br />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="needsinfo">Needs Info</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}

export default ReportDetail