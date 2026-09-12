import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const DEFAULT_CENTER = [-36.8485, 174.7633] // Auckland — only used if geolocation fails/denied

const SPECIES_ID_MAP = {
  blackbird: 1,
  fantail: 2,
  silvereye: 3,
  greywarbler: 4,
  songthrush: 5,
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

  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [position, setPosition] = useState(null)
  const [locating, setLocating] = useState(true)
  const [locationSource, setLocationSource] = useState(null) // 'gps' | 'manual'

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoWarning, setPhotoWarning] = useState(null)

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
      ...guideAnswers,
      species: SPECIES_ID_MAP[guideAnswers.key_result] || null,
      notes,
      contact_email: email || null,
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
      <p>Shape: {guideAnswers.nest_shape}</p>
      <p>Position: {guideAnswers.position_type}</p>

      <form onSubmit={handleSubmit}>
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
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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