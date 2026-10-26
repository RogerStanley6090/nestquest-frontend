import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const DEFAULT_CENTER = [-36.8485, 174.7633]
const GEOLOCATION_SUPPORTED = typeof navigator !== 'undefined' && !!navigator.geolocation
const IS_TOUCH_DEVICE =
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches

const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 8 * 1024 * 1024

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
  blackbird: ['blackbird'],
  fantail: ['fantail'],
  silvereye: ['silvereye'],
  greywarbler: ['grey warbler'],
  songthrush: ['song thrush'],
  tui: ['tūī', 'tui'],
  magpie: ['magpie'],
  chaffinch: ['chaffinch'],
  goldfinch: ['goldfinch'],
  greenfinch: ['greenfinch'],
  housesparrow: ['house sparrow', 'sparrow'],
  welcomeswallow: ['swallow'],
  myna: ['myna'],
  starling: ['starling'],
  dunnock: ['dunnock'],
  yellowhammer: ['yellowhammer'],
}

// The guide's wording for this answer differs slightly from the form's option
const GUIDE_PLACEMENT_MAP = {
  'In a hedge/shrub/tree but attachment unclear': 'In a hedge, shrub, or tree',
}

const SHAPE_OPTIONS = [
  'Open cup or bowl',
  'Broad, flat platform-like nest',
  'Enclosed dome / hanging pouch',
  'Messy cavity / enclosed space',
  'Not sure',
]

const PLACEMENT_OPTIONS = [
  'In a fork',
  'Supported from below',
  'Hanging / suspended',
  'High up in a tree',
  'Close to the ground / in long grass',
  'Fixed to a ledge, wall, bridge or building',
  'Inside a hole, roof gap or nest box',
  'In a hedge, shrub, or tree',
  'Not sure',
]

function isHeicFile(file) {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/i.test(file.name)
}

// Translates a raw API error into plain language a nest-reporting user can
// actually act on. Falls back to a generic message for anything unexpected,
// but logs the real technical detail to the console for debugging.
function getFriendlyErrorMessage(err, context) {
  console.error(`${context} failed:`, err)

  if (err.isNetworkError) {
    return "Couldn't reach the server. Please check your internet connection and try again."
  }

  if (err.status === 400 && err.body?.photo) {
    return 'That photo couldn\u2019t be uploaded \u2014 please make sure it\u2019s a JPG, PNG, or HEIC image under 8MB.'
  }

  if (err.status === 400 && err.body?.report) {
    return `A report can have at most ${MAX_PHOTOS} photos.`
  }

  if (err.status === 400 && err.body?.location) {
    return 'There was a problem with the nest location. Please try setting it on the map again.'
  }

  if (err.status === 400) {
    return 'Some information couldn\u2019t be saved \u2014 please check the form and try again.'
  }

  if (err.status === 401 || err.status === 403) {
    return "You don't have permission to do that. Please try refreshing the page."
  }

  if (err.status >= 500) {
    return 'Something went wrong on our end. Please try again in a moment.'
  }

  return `${context} didn\u2019t work. Please try again.`
}

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

  const [step, setStep] = useState('form') // 'form' | 'review'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [speciesList, setSpeciesList] = useState([])
  const [speciesLoaded, setSpeciesLoaded] = useState(false)

  const [species, setSpecies] = useState('')
  const [shape, setShape] = useState(guideAnswers.nest_shape || '')
  const [placement, setPlacement] = useState(
    GUIDE_PLACEMENT_MAP[guideAnswers.position_type] || guideAnswers.position_type || ''
  )
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

  // Each photo: { id, file, preview, status } where status is
  // 'pending' | 'uploaded' | 'failed'. preview is null for HEIC files.
  const [photos, setPhotos] = useState([])
  const [photoWarnings, setPhotoWarnings] = useState([])
  const [savedReportId, setSavedReportId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)

  const cameraInputRef = useRef(null)
  const libraryInputRef = useRef(null)
  const photosRef = useRef(photos)

  useEffect(() => {
    publicApi
      .getSpecies()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || []
        setSpeciesList(list)

        const hints = GUIDE_KEY_TO_NAME_HINT[guideAnswers.key_result]
        if (hints) {
          const match = list.find((s) =>
            hints.some((h) => s.name.toLowerCase().includes(h))
          )
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

  // Warn before the user closes the tab, refreshes, or navigates to a
  // different website while they have unsaved report data — this is the
  // standard browser-native "leave site?" prompt, and only browsers can
  // supply the actual wording shown, not our own custom text.
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Keep a copy of the latest photos so the preview URLs can be released
  // when the user leaves the page.
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview)
      })
    }
  }, [])

  function markDirty() {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true)
  }

  function handleMapClick(newPos) {
    setPosition(newPos)
    setLocationSource('manual')
    markDirty()
  }

  function handlePhotosSelected(e) {
    const files = Array.from(e.target.files || [])
    // Reset so choosing the same file again still triggers a change event.
    e.target.value = ''
    if (files.length === 0) return

    const warnings = []
    const accepted = []
    let slotsLeft = MAX_PHOTOS - photos.length

    for (const file of files) {
      const heic = isHeicFile(file)
      if (!file.type.startsWith('image/') && !heic) {
        warnings.push(`${file.name} isn\u2019t an image, so it was skipped.`)
        continue
      }
      if (file.size > MAX_PHOTO_BYTES) {
        warnings.push(`${file.name} is larger than 8MB, so it was skipped.`)
        continue
      }
      if (slotsLeft <= 0) {
        warnings.push(`You can add up to ${MAX_PHOTOS} photos. Extra photos were skipped.`)
        break
      }
      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: heic ? null : URL.createObjectURL(file),
        status: 'pending',
      })
      slotsLeft -= 1
    }

    setPhotoWarnings(warnings)
    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted])
      markDirty()
    }
  }

  function removePhoto(id) {
    const target = photos.find((p) => p.id === id)
    if (target?.preview) URL.revokeObjectURL(target.preview)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setPhotoWarnings([])
  }

  function handleContinueToReview(e) {
    e.preventDefault()
    if (!shape) {
      setError('Please select the nest shape.')
      return
    }
    if (!placement) {
      setError('Please select where the nest is positioned.')
      return
    }
    if (!observedDate) {
      setError('Please enter the observation date.')
      return
    }
    if (!position) {
      setError('Please set the nest location on the map.')
      return
    }
    setError(null)
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBackToForm() {
    setStep('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleFinishWithoutPhotos() {
    setHasUnsavedChanges(false)
    navigate('/confirmation')
  }

  async function handleConfirmSubmit() {
    setSubmitting(true)
    setError(null)

    let reportId = savedReportId

    // Only create the report once. If photos fail and the user retries,
    // we reuse the saved report instead of creating a duplicate.
    if (!reportId) {
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

      try {
        const response = await publicApi.submitReport(payload)
        console.log('Report submit response:', response)
        reportId = response.id
        setSavedReportId(reportId)
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'Submitting your report'))
        setSubmitting(false)
        return
      }
    }

    // Upload photos one at a time, skipping any that already went through.
    const toUpload = photos.filter((p) => p.status !== 'uploaded')
    let failedCount = 0
    let lastError = null

    for (let i = 0; i < toUpload.length; i++) {
      const photo = toUpload[i]
      setUploadProgress({ current: i + 1, total: toUpload.length })
      try {
        await publicApi.uploadPhoto(reportId, photo.file)
        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, status: 'uploaded' } : p)))
      } catch (err) {
        failedCount += 1
        lastError = err
        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, status: 'failed' } : p)))
      }
    }

    setUploadProgress(null)

    if (failedCount > 0) {
      setError(
        `Your report was saved, but ${failedCount} of ${photos.length} photo${photos.length === 1 ? '' : 's'} couldn\u2019t be uploaded. ${getFriendlyErrorMessage(lastError, 'Uploading the photo')}`
      )
      setSubmitting(false)
      return
    }

    // Everything is safely saved now — clear the unsaved-changes flag so no
    // browser warning appears on the way to the confirmation page.
    setHasUnsavedChanges(false)
    navigate('/confirmation')
  }

  const labelStyle = { fontSize: 12, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', display: 'block' }
  const fieldStyle = { width: '100%', background: BRAND.inputBg, border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, padding: 10, fontSize: 14 }
  const fieldGroup = { marginBottom: 20 }

  const thumbBox = { position: 'relative', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: BRAND.inputBg, border: `1px solid ${BRAND.border}` }
  const thumbImg = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  const heicTile = { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6, textAlign: 'center', color: BRAND.textMuted, fontSize: 10, wordBreak: 'break-all' }
  const thumbGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }

  const photoButtonStyle = (disabled) => ({
    background: 'transparent',
    color: disabled ? BRAND.textMuted : BRAND.text,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 14,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  })

  const selectedSpeciesName = speciesList.find((s) => s.id === species)?.name || 'Not sure / let a researcher decide'
  const photosFull = photos.length >= MAX_PHOTOS
  const hasHeicPhoto = photos.some((p) => !p.preview)

  // ============================================================
  // REVIEW STEP
  // ============================================================
  if (step === 'review') {
    const reviewRow = (label, value) => (
      <div style={{ display: 'flex', padding: '10px 0', borderBottom: `1px solid ${BRAND.border}` }}>
        <div style={{ width: 180, flexShrink: 0, fontSize: 12, color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: 14, color: BRAND.text }}>{value || '—'}</div>
      </div>
    )

    const statusLabel = { uploaded: 'Uploaded', failed: 'Failed', pending: 'Waiting' }
    const statusColor = { uploaded: BRAND.accent, failed: '#E4685A', pending: BRAND.textMuted }

    return (
      <div>
        <h1 style={{ color: BRAND.accent, fontSize: 28, margin: '0 0 6px' }}>Review your report</h1>
        <p style={{ fontSize: 13, color: BRAND.textMuted, marginBottom: 24 }}>
          Please check everything below before submitting. You can go back to make changes.
        </p>

        <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
          <div className="nq-two-col">
            <div>
              {reviewRow('Species', selectedSpeciesName)}
              {reviewRow('Nest shape', shape)}
              {reviewRow('Placement', placement)}
              {reviewRow('Habitat', habitat)}
              {reviewRow('Materials', materials)}
              {reviewRow('Date observed', observedDate)}
              {reviewRow('Notes', notes)}
              {reviewRow('Contact email', email)}
            </div>

            <div>
              <p style={labelStyle}>Location</p>
              <p style={{ fontSize: 14, color: BRAND.text, marginBottom: 16 }}>
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </p>

              <p style={labelStyle}>Photos ({photos.length})</p>
              {photos.length > 0 ? (
                <div style={thumbGrid}>
                  {photos.map((p, index) => (
                    <div key={p.id}>
                      <div style={thumbBox}>
                        {p.preview ? (
                          <img src={p.preview} alt={`Nest photo ${index + 1} of ${photos.length}`} style={thumbImg} />
                        ) : (
                          <div style={heicTile}>
                            <i className="ti ti-photo" style={{ fontSize: 20 }} aria-hidden="true"></i>
                            {p.file.name}
                          </div>
                        )}
                      </div>
                      {savedReportId && (
                        <p style={{ fontSize: 11, margin: '4px 0 0', color: statusColor[p.status] }}>{statusLabel[p.status]}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: BRAND.textMuted }}>No photos attached</p>
              )}
            </div>
          </div>

          {error && <p style={{ color: '#E4685A', fontSize: 13, marginTop: 20, marginBottom: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {!savedReportId && (
              <button
                type="button"
                onClick={handleBackToForm}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  color: BRAND.textMuted,
                  border: `1px solid ${BRAND.border}`,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: submitting ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true"></i>
                Back to edit
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="nq-button"
              style={{
                background: submitting ? '#6E8A5E' : BRAND.accent,
                color: '#0F2818',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                padding: '12px 28px',
                borderRadius: 8,
                cursor: submitting ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <i className="ti ti-loader-2" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  {uploadProgress ? `Uploading photo ${uploadProgress.current} of ${uploadProgress.total}` : 'Submitting'}
                </>
              ) : savedReportId ? (
                <>
                  <i className="ti ti-refresh" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  Retry failed photos
                </>
              ) : (
                <>
                  <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  Confirm and submit
                </>
              )}
            </button>

            {savedReportId && !submitting && (
              <button
                type="button"
                onClick={handleFinishWithoutPhotos}
                style={{
                  background: 'transparent',
                  color: BRAND.textMuted,
                  border: `1px solid ${BRAND.border}`,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Finish without these photos
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // FORM STEP
  // ============================================================
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

      <form onSubmit={handleContinueToReview}>
        <div style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
          <div className="nq-two-col">
            <div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Species (if known)</label>
                <select
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value ? Number(e.target.value) : '')
                    markDirty()
                  }}
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
                <select
                  value={shape}
                  onChange={(e) => {
                    setShape(e.target.value)
                    markDirty()
                  }}
                  style={fieldStyle}
                >
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
                <select
                  value={placement}
                  onChange={(e) => {
                    setPlacement(e.target.value)
                    markDirty()
                  }}
                  style={fieldStyle}
                >
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
                  onChange={(e) => {
                    setHabitat(e.target.value)
                    markDirty()
                  }}
                  placeholder="e.g. Native bush, urban garden, residential garden"
                  style={fieldStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Materials (optional)</label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => {
                    setMaterials(e.target.value)
                    markDirty()
                  }}
                  placeholder="e.g. Moss, twigs, grass, spider silk"
                  style={fieldStyle}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>When did you see this?</label>
                <input
                  type="date"
                  value={observedDate}
                  onChange={(e) => {
                    setObservedDate(e.target.value)
                    markDirty()
                  }}
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
                <label style={labelStyle}>Photos (optional)</label>
                <p style={{ fontSize: 12, color: BRAND.textMuted, margin: '0 0 10px' }}>
                  Add up to {MAX_PHOTOS} photos, 8MB each. {photos.length} of {MAX_PHOTOS} added.
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {IS_TOUCH_DEVICE && (
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={photosFull}
                      style={photoButtonStyle(photosFull)}
                    >
                      <i className="ti ti-camera" style={{ fontSize: 16 }} aria-hidden="true"></i>
                      Take photo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => libraryInputRef.current?.click()}
                    disabled={photosFull}
                    style={photoButtonStyle(photosFull)}
                  >
                    <i className="ti ti-photo-plus" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    {IS_TOUCH_DEVICE ? 'Choose from library' : 'Choose photos'}
                  </button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotosSelected}
                  hidden
                />
                <input
                  ref={libraryInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  onChange={handlePhotosSelected}
                  hidden
                />

                {photoWarnings.map((warning) => (
                  <p key={warning} style={{ color: '#E4685A', fontSize: 12, marginTop: 8, marginBottom: 0 }}>{warning}</p>
                ))}
                {hasHeicPhoto && (
                  <p style={{ color: BRAND.textMuted, fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                    Previews aren{'\u2019'}t available for HEIC photos, but they will still upload correctly.
                  </p>
                )}

                {photos.length > 0 && (
                  <div style={{ ...thumbGrid, marginTop: 12 }}>
                    {photos.map((p, index) => (
                      <div key={p.id} style={thumbBox}>
                        {p.preview ? (
                          <img src={p.preview} alt={`Nest photo ${index + 1} of ${photos.length}`} style={thumbImg} />
                        ) : (
                          <div style={heicTile}>
                            <i className="ti ti-photo" style={{ fontSize: 20 }} aria-hidden="true"></i>
                            {p.file.name}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(p.id)}
                          aria-label={`Remove photo ${index + 1}`}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(15,40,24,0.85)',
                            color: BRAND.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    markDirty()
                  }}
                  style={{ ...fieldStyle, minHeight: 80 }}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelStyle}>Contact email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    markDirty()
                  }}
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#E4685A', fontSize: 13, marginTop: 4, marginBottom: 16 }}>{error}</p>}

          <button
            type="submit"
            disabled={locating}
            className="nq-button"
            style={{
              background: locating ? '#6E8A5E' : BRAND.accent,
              color: '#0F2818',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '12px 28px',
              borderRadius: 8,
              cursor: locating ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.01em',
            }}
          >
            <i className="ti ti-eye" style={{ fontSize: 16 }} aria-hidden="true"></i>
            Review report
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportingForm