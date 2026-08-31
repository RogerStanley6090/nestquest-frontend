import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function PublicMap() {
  return (
    <div>
      <h2>Nest Map</h2>
      <MapContainer center={[-36.8523, 174.7642]} zoom={12} style={{ height: 400, width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[-36.8523, 174.7642]}>
          <Popup>Fantail — approximate location</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default PublicMap