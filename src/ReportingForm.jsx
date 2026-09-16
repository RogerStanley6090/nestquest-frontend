import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const DEFAULT_CENTER = [-36.8485, 174.7633]

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

  const [position, setPosition] = useState(null)
  const [locating, setLocating] = useState(true)
  const [locationSource, setLocationSource] = useState(null)

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
    if (!navigator.geolocation) {
      setPosition(DEFAULT_CENTER)
      setLocationSource('manual')
      setLocating(false)
      return
    }
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
    if (!file.type.startsWith('image/')) {
      setPhotoWarning('Please choose an image file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoWarning('Image is larger than 8MB — please choose a smaller photo.')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
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

  return (
    <div>
      <h2>Report a Nest</h2>

      {!cameFromGuide && (
        <p style={{ fontSize: 13, color: 'grey' }}>
          Not sure what species this is?{' '}
          <Link to="/guide">Try the identification guide</Link> instead — or fill in what you
          know below and a researcher will confirm the rest.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Species (if known)</label>
          <br />
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value ? Number(e.target.value) : '')}
            disabled={!speciesLoaded}
          >
            <option value="">Not sure / let a researcher decide</option>
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Nest shape</label>
          <br />
          <select value={shape} onChange={(e) => setShape(e.target.value)}>
            <option value="">Not specified</option>
            {SHAPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Where is it positioned?</label>
          <br />
          <select value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="">Not specified</option>
            {PLACEMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Habitat (optional)</label>
          <br />
          <input
            type="text"
            value={habitat}
            onChange={(e) => setHabitat(e.target.value)}
            placeholder="e.g. Native bush, urban garden, residential garden"
          />
        </div>

        <div>
          <label>Materials (optional)</label>
          <br />
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="e.g. Moss, twigs, grass, spider silk"
          />
        </div>

        <div>
          <label>When did you see this?</label>
          <br />
          <input
            type="date"
            value={observedDate}
            onChange={(e) => setObservedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label>Nest Location</label>
          <br />
          {locating && <p>Getting your location...</p>}
          {!locating && (
            <>
              <p style={{ fontSize: 12, color: 'grey' }}>
                {locationSource === 'gps'
                  ? 'Using your device location. Click the map to adjust if needed.'
                  : 'Click on the map to set the nest location.'}
              </p>
              <MapContainer center={position || DEFAULT_CENTER} zoom={15} style={{ height: 250, width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationPicker position={position} onPick={handleMapClick} />
              </MapContainer>
              {position && (
                <p style={{ fontSize: 12 }}>
                  Selected: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label>Photo (optional)</label>
          <br />
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoWarning && <p style={{ color: 'red', fontSize: 12 }}>{photoWarning}</p>}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Nest preview"
              style={{ maxWidth: 240, display: 'block', marginTop: 8, borderRadius: 4 }}
            />
          )}
        </div>

        <div>
          <label>Notes (optional)</label>
          <br />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <label>Contact email (optional)</label>
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={submitting || locating}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default ReportingForm