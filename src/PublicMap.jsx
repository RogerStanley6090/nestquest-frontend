import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup,} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { publicApi } from './api/client.js'

const MOCK_REPORTS = [
  {
    id: 1,
    species: 1,
    species_name: 'Fantail / Pīwakawaka',
    latitude: -36.8523,
    longitude: 174.7642,
  },
]

const BRAND = {
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#8A9483',
  card: '#173722',
  border: '#234A2E',
}

// Marker colours for each species
const SPECIES_COLORS = {
  fantail: '#93BB4A',
  silvereye: '#4FA3D1',
  'grey warbler': '#9A9A92',
  blackbird: '#333333',
  'song thrush': '#E5A83A',
  unknown: '#777777',
}

function getSpeciesKey(name) {
  const value = (name || '').toLowerCase()
  if (value.includes('fantail')) return 'fantail'
  if (value.includes('silvereye')) return 'silvereye'
  if (value.includes('grey warbler')) return 'grey warbler'
  if (value.includes('blackbird')) return 'blackbird'
  if (value.includes('song thrush')) return 'song thrush'
  return 'unknown'
}

function getSpeciesColor(name) {
  return SPECIES_COLORS[getSpeciesKey(name)] || SPECIES_COLORS.unknown
}

function createSpeciesIcon(speciesName) {
  const color = getSpeciesColor(speciesName)
  return L.divIcon({
    className: '',
    html: `
      <div
        style="
          width: 22px;
          height: 22px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.45);
        "
      ></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function getMaskedPosition(report) {
  const lat =
    report.latitude ??
    report.location?.masked_latitude

  const lng =
    report.longitude ??
    report.location?.masked_longitude

  if (lat == null || lng == null) return null
  return [Number(lat), Number(lng)]
}

function PublicMap() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [loading, setLoading] = useState(true)
  const [selectedSpecies, setSelectedSpecies] = useState('all')

  useEffect(() => {
    publicApi
      .getVerifiedReports().then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.results || []
        setReports(list)
        setUsingMockData(false)
      })
      .catch((err) => {
        console.log(
          'Could not reach real API, using mock data:',
          err.message
        )
        setUsingMockData(true)
      }).finally(() => setLoading(false))
  }, [])

  // Automatically create species filters from API data
  const speciesNames = [
    ...new Set(
      reports
        .map((r) => r.species_name).filter(Boolean)
    ),
  ]

  const filteredReports =
    selectedSpecies === 'all'
      ? reports
      : reports.filter(
          (r) => r.species_name === selectedSpecies
        )

  const plottableReports = filteredReports.filter(
    (r) => getMaskedPosition(r) !== null
  )

  return (
    <div>
      <Link
        to="/reports"
        style={{fontSize: 13, color: BRAND.accent, textDecoration: 'none', display: 'inline-block', marginBottom: 12,}}
      >
        &larr; Back to Reports
      </Link>

      <h2>Nest Map</h2>

      {/* Privacy notice */}
      <div
        style={{background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: BRAND.textMuted, lineHeight: 1.5,}}
      >
        <strong style={{ color: BRAND.text }}>
          Location privacy:
        </strong>{' '}
        Locations shown on this map are approximate.
        Exact nest locations are hidden for privacy and
        conservation purposes.
      </div>

      {loading && <p>Loading...</p>}

      {usingMockData && !loading && (
        <p
          style={{color: BRAND.textMuted, fontSize: 12,}}
        >
          Showing placeholder data — not yet connected to
          the live API.
        </p>
      )}

      {/* Species filters */}
      {!loading && (
        <div
          style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18,}}
        >
          <button
            type="button"
            onClick={() => setSelectedSpecies('all')}
            style={{padding: '8px 14px', borderRadius: 20,
              border: `1px solid ${
                selectedSpecies === 'all'
                  ? BRAND.accent
                  : BRAND.border
              }`,
              background:
                selectedSpecies === 'all'
                  ? BRAND.accent
                  : BRAND.card,
              color:
                selectedSpecies === 'all'
                  ? '#0F2818'
                  : BRAND.text,
              cursor: 'pointer',
            }}
          >
            All
          </button>

          {speciesNames.map((name) => {
            const color = getSpeciesColor(name)
            const selected = selectedSpecies === name

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setSelectedSpecies(name)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: `1px solid ${
                    selected
                      ? color
                      : BRAND.border
                  }`,
                  background: selected
                    ? color
                    : BRAND.card,
                  color: selected
                    ? '#111'
                    : BRAND.text,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: color,
                    border: '1px solid white',
                    display: 'inline-block',
                  }}
                />

                {name}
              </button>
            )
          })}
        </div>
      )}

      {!loading &&
        !usingMockData &&
        plottableReports.length <
          filteredReports.length && (
          <p
            style={{
              color: BRAND.textMuted,
              fontSize: 12,
            }}
          >
            {filteredReports.length -
              plottableReports.length}{' '}
            report(s) hidden — missing location data.
          </p>
        )}

      <MapContainer
        center={[-36.8523, 174.7642]}
        zoom={12}
        style={{height: 450, width: '100%', borderRadius: 10,}}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {plottableReports.map((r) => (
          <Marker
            key={r.id}
            position={getMaskedPosition(r)}
            icon={createSpeciesIcon(r.species_name)}
          >
            <Popup>
              <strong>
                {r.species_name || 'Unknown species'}
              </strong>
              <br />
              Approximate location
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default PublicMap