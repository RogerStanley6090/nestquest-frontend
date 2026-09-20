import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const DEFAULT_CENTER = [-36.8485, 174.7633]
const GEOLOCATION_SUPPORTED = typeof navigator !== 'undefined' && !!navigator.geolocation

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#8A9483',
  accent: '#93BB4A',
  inputBg: '#0F2818',
}

// Maps the identification guide's internal key to a hint used to find the
// matching species from the real API list (not a hardcoded ID, since IDs
// can differ between environments/databases).
const GUIDE_KEY_TO_NAME_HINT = {
  blackbird: 'blackbird',
  fantail: 'fantail',
  silvereye: 'silvereye',
  greywarbler: 'grey warbler',
  songthrush: 'song thrush',
}

const SHAPE_OPTIONS = [
  'Open cup or bowl',
  'Enclosed dome / hanging pouch',
  'Messy cavity / enclosed space',
  'Not sure',
]

const PLACEMENT_OPTIONS = [
  'In a fork',
  'Supported from below',
  'Hanging / suspended',
  'In a hedge, shrub, or tree',
  'Not sure',
]

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

function ReportingForm() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const guideAnswers = state?.guideAnswers || {}
  const cameFromGuide = Boolean(state?.guideAnswers)

  const [speciesList, setSpeciesList] = useState([])
  const [speciesLoaded, setSpeciesLoaded] = useState(false)

  const [species, setSpecies] = useState('')
  const [shape, setShape] = useState(guideAnswers.nest_shape || '')
  const [placement, setPlacement] = useState(guideAnswers.position_type || '')
  const [habitat, setHabitat] = useState('')
  const [materials, setMaterials] = useState('')
  const [observedDate, setObservedDate] = useState(new Date().toISOString().split('T')[0])

  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [position, setPosition] = useState(GEOLOCATION_SUPPORTED ? null : DEFAULT_CENTER)
  const [locating, setLocating] = useState(GEOLOCATION_SUPPORTED)
  const [locationSource, setLocationSource] = useState(GEOLOCATION_SUPPORTED ? null : 'manual')

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoWarning, setPhotoWarning] = useState(null)

  useEffect(() => {
    publicApi
      .getSpecies()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || []
        setSpeciesList(list)

        const hint = GUIDE_KEY_TO_NAME_HINT[guideAnswers.key_result]
        if (hint) {
          const match = list.find((s) => s.name.toLowerCase().includes(hint))
          if (match) setSpecies(match.id)
        }
      })
      .catch((err) => {
        console.error('Could not load species list:', err.message)
      })
      .finally(() => setSpeciesLoaded(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!GEOLOCATION_SUPPORTED) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude])
        setLocationSource('gps')
        setLocating(false)
      },
      (err) => {
        console.log('Geolocation failed:', err.code, err.message)
        setPosition(DEFAULT_CENTER)
        setLocationSource('manual')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  function handleMapClick(newPos) {
    setPosition(newPos)
    setLocationSource('manual')
  }

  function handlePhotoChange(e) {
  const file = e.target.files[0]
  setPhotoWarning(null)
  if (!file) {
    setPhotoFile(null)
    setPhotoPreview(null)
    return
  }
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/i.test(file.name)
  if (!file.type.startsWith('image/') && !isHeic) {
    setPhotoWarning('Please choose an image file.')
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    setPhotoWarning('Image is larger than 8MB — please choose a smaller photo.')
    return
  }
  setPhotoFile(file)
  setPhotoPreview(isHeic ? null : URL.createObjectURL(file))
  if (isHeic) {
    setPhotoWarning('Preview isn\u2019t available for this file type, but it will still upload correctly.')
  }
}

  async function handleSubmit(e) {
    e.preventDefault()

    if (!position) {
      setError('Please set the nest location on the map before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = {
      species: species || null,
      shape: shape || '',
      placement: placement || '',
      habitat: habitat || '',
      materials: materials || '',
      observed_date: observedDate || null,
      description: notes || '',
      contact_email: email || '',
      location: {
        exact_latitude: Number(position[0].toFixed(6)),
        exact_longitude: Number(position[1].toFixed(6)),
      },
    }

    console.log('Submitting report:', payload)

    try {
      const response = await publicApi.submitReport(payload)
      console.log('Report submit response:', response)

      if (photoFile && response.id) {
        try {
          const photoResponse = await publicApi.uploadPhoto(response.id, photoFile)
          console.log('Photo upload response:', photoResponse)
        } catch (photoErr) {
          console.error('Photo upload failed:', photoErr)
          setError(`Report saved, but the photo could not be uploaded: ${photoErr.message}`)
          setSubmitting(false)
          return
        }
      }

      navigate('/confirmation')
    } catch (err) {
      console.error('Submit failed:', err)
      setError(`Could not submit report: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle = { fontSize: 12, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', display: 'block' }
  const fieldStyle = { width: '100%', background: BRAND.inputBg, border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, padding: 10, fontSize: 14 }
  const fieldGroup = { marginBottom: 20 }

  return (
    <div>
      <h1 style={{ color: BRAND.accent, fontSize: 28, margin: '0 0 6px' }}>Report a nest</h1>

      {!cameFromGuide && (
        <p style={{ fontSize: 13, color: BRAND.textMuted, marginBottom: 24 }}>
          Not sure what species this is?{' '}
          <Link to="/guide" style={{ color: BRAND.accent }}>Try the identification guide</Link> instead — or fill in what you
          know below and a researcher will confirm the rest.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Species (if known)</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value ? Number(e.target.value) : '')}
                  disabled={!speciesLoaded}
                  style={fieldStyle}
                >
                  <option value="">Not sure / let a researcher decide</option>
                  {speciesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Nest shape</label>
                <select value={shape} onChange={(e) => setShape(e.target.value)} style={fieldStyle}>
                  <option value="">Not specified</option>
                  {SHAPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Where is it positioned?</label>
                <select value={placement} onChange={(e) => setPlacement(e.target.value)} style={fieldStyle}>
                  <option value="">Not specified</option>
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Habitat (optional)</label>
                <input
                  type="text"
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  placeholder="e.g. Native bush, urban garden, residential garden"
                  style={fieldStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Materials (optional)</label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. Moss, twigs, grass, spider silk"
                  style={fieldStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>When did you see this?</label>
                <input
                  type="date"
                  value={observedDate}
                  onChange={(e) => setObservedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={fieldStyle}
                />
              </div>
            </div>

            <div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Nest location</label>
                {locating && <p style={{ fontSize: 13, color: BRAND.textMuted }}>Getting your location...</p>}
                {!locating && (
                  <>
                    <p style={{ fontSize: 12, color: BRAND.textMuted, marginBottom: 8 }}>
                      {locationSource === 'gps'
                        ? 'Using your device location. Click the map to adjust if needed.'
                        : 'Click on the map to set the nest location.'}
                    </p>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BRAND.border}` }}>
                      <MapContainer center={position || DEFAULT_CENTER} zoom={15} style={{ height: 220, width: '100%' }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        <LocationPicker position={position} onPick={handleMapClick} />
                      </MapContainer>
                    </div>
                    {position && (
                      <p style={{ fontSize: 12, color: BRAND.textMuted, marginTop: 8 }}>
                        Selected: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ color: BRAND.text, fontSize: 13 }} />
                {photoWarning && <p style={{ color: '#E4685A', fontSize: 12, marginTop: 6 }}>{photoWarning}</p>}
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Nest preview"
                    style={{ maxWidth: '100%', height: 140, objectFit: 'cover', display: 'block', marginTop: 10, borderRadius: 8, border: `1px solid ${BRAND.border}` }}
                  />
                )}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ ...fieldStyle, minHeight: 80 }}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Contact email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#E4685A', fontSize: 13, marginTop: 4, marginBottom: 16 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting || locating}
            className="nq-button"
            style={{
              background: submitting || locating ? '#6E8A5E' : BRAND.accent,
              color: '#0F2818',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '12px 28px',
              borderRadius: 8,
              cursor: submitting || locating ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.01em',
            }}
          >
            {submitting ? (
              <>
                <i className="ti ti-loader-2" style={{ fontSize: 16 }} aria-hidden="true"></i>
                Submitting
              </>
            ) : (
              <>
                <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true"></i>
                Submit report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportingForm