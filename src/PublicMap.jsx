import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const MOCK_REPORTS = [
  { id: 1, species: 'Fantail', latitude: -36.8523, longitude: 174.7642 },
]

function getMaskedPosition(report) {
  const lat = report.latitude ?? report.location?.masked_latitude
  const lng = report.longitude ?? report.location?.masked_longitude
  if (lat == null || lng == null) return null
  return [lat, lng]
}

function PublicMap() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.getVerifiedReports()
      .then((data) => {
        setReports(data)
        setUsingMockData(false)
      })
      .catch((err) => {
        console.log('Could not reach real API, using mock data:', err.message)
        setUsingMockData(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const plottableReports = reports.filter((r) => getMaskedPosition(r) !== null)

  return (
    <div>
      <h2>Nest Map</h2>
      {loading && <p>Loading...</p>}
      {usingMockData && !loading && (
        <p style={{ color: 'grey', fontSize: 12 }}>
          Showing placeholder data — not yet connected to the live API.
        </p>
      )}
      {!loading && !usingMockData && plottableReports.length < reports.length && (
        <p style={{ color: 'grey', fontSize: 12 }}>
          {reports.length - plottableReports.length} report(s) hidden — missing location data.
        </p>
      )}

      <MapContainer center={[-36.8523, 174.7642]} zoom={12} style={{ height: 400, width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {plottableReports.map((r) => (
          <Marker key={r.id} position={getMaskedPosition(r)}>
            <Popup>{r.species || 'Unknown species'} — approximate location</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default PublicMap