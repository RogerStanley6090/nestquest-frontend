import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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
  tui: '#7B5CD6',
  'australian magpie': '#5C5C5C',
  chaffinch: '#D97A4A',
  'european goldfinch': '#E6C34A',
  'european greenfinch': '#7FA34A',
  'house sparrow': '#9B7653',
  'welcome swallow': '#4A7FB3',
  'common myna': '#8A6A3A',
  'common starling': '#5B6F7A',
  dunnock: '#8B8177',
  yellowhammer: '#D9B83E',
  unknown: '#777777',
}

function getSpeciesKey(name) {
  const value = (name || '').toLowerCase()
  if (value.includes('fantail')) return 'fantail'
  if (value.includes('silvereye')) return 'silvereye'
  if (value.includes('grey warbler')) return 'grey warbler'
  if (value.includes('blackbird')) return 'blackbird'
  if (value.includes('song thrush')) return 'song thrush'
  if (value.includes('tūī') || value.includes('tui')) return 'tui'
  if (value.includes('australian magpie')) return 'australian magpie'
  if (value.includes('chaffinch')) return 'chaffinch'
  if (value.includes('european goldfinch')) return 'european goldfinch'
  if (value.includes('european greenfinch')) return 'european greenfinch'
  if (value.includes('house sparrow')) return 'house sparrow'
  if (value.includes('welcome swallow')) return 'welcome swallow'
  if (value.includes('common myna')) return 'common myna'
  if (value.includes('common starling')) return 'common starling'
  if (value.includes('dunnock')) return 'dunnock'
  if (value.includes('yellowhammer')) return 'yellowhammer'
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


// Zooms the map so every plotted nest is in view
function FitToMarkers({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 13)
      return
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 14 })
  }, [map, positions])

  return null
}

function PublicMap() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [selectedSpecies, setSelectedSpecies] = useState('all')

  useEffect(() => {
    let cancelled = false

    publicApi
      .getVerifiedReports()
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : data.results || []
        setReports(list)
        setUsingMockData(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.log('Could not reach real API, using mock data:', err.message)
        setUsingMockData(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  // Automatically create species filters from API data
  const speciesNames = useMemo(
    () => [...new Set(reports.map((r) => r.species_name).filter(Boolean))],
    [reports]
  )

  const filteredReports = useMemo(
    () =>
      selectedSpecies === 'all'
        ? reports
        : reports.filter((r) => r.species_name === selectedSpecies),
    [reports, selectedSpecies]
  )

  const plottableReports = useMemo(
    () => filteredReports.filter((r) => getMaskedPosition(r) !== null),
    [filteredReports]
  )

  const positions = useMemo(
    () => plottableReports.map((r) => getMaskedPosition(r)),
    [plottableReports]
  )

  const noticeBox = {
    background: BRAND.card,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 18,
    fontSize: 13,
    color: BRAND.textMuted,
    lineHeight: 1.5,
  }

  function chipStyle(selected, color) {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 14px',
      borderRadius: 20,
      border: `1px solid ${selected ? color : BRAND.border}`,
      background: selected ? color : BRAND.card,
      color: selected ? '#111' : BRAND.text,
      fontSize: 13,
      cursor: 'pointer',
    }
  }

  return (
    <div>
      <style>{`@keyframes nq-spin { to { transform: rotate(360deg); } }`}</style>

      <Link
        to="/"
        style={{ fontSize: 13, color: BRAND.accent, textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}
      >
        &larr; Back to Home
      </Link>

      <h2>Nest Map</h2>

      {/* Privacy notice */}
      <div style={noticeBox}>
        <strong style={{ color: BRAND.text }}>Location privacy:</strong>{' '}
        Locations shown on this map are approximate. Exact nest locations are hidden for
        privacy and conservation purposes.
      </div>

      {/* Loading state (the server can take a while to wake up) */}
      {loading && (
        <div
          role="status"
          style={{ ...noticeBox, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              border: `2px solid ${BRAND.border}`,
              borderTopColor: BRAND.accent,
              borderRadius: '50%',
              display: 'inline-block',
              flexShrink: 0,
              animation: 'nq-spin 0.8s linear infinite',
            }}
          />
          <span>
            <strong style={{ color: BRAND.text }}>Loading nest reports…</strong>
            <br />
            The first load can take up to a minute while the server wakes up.
          </span>
        </div>
      )}

      {/* Could not reach the server */}
      {usingMockData && !loading && (
        <div
          role="alert"
          style={{ ...noticeBox, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
        >
          <span>
            Couldn’t reach the server, so this map is showing placeholder data.
          </span>
          <button
            type="button"
            onClick={retry}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: `1px solid ${BRAND.accent}`,
              background: 'transparent',
              color: BRAND.accent,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Species filters (each chip colour matches its map marker) */}
      {!loading && (
        <div
          role="group"
          aria-label="Filter nests by species"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}
        >
          <button
            type="button"
            aria-pressed={selectedSpecies === 'all'}
            onClick={() => setSelectedSpecies('all')}
            style={{
              ...chipStyle(selectedSpecies === 'all', BRAND.accent),
              color: selectedSpecies === 'all' ? '#0F2818' : BRAND.text,
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
                aria-pressed={selected}
                onClick={() => setSelectedSpecies(name)}
                style={chipStyle(selected, color)}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
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

      {/* Summary line */}
      {!loading && !usingMockData && (
        <p style={{ color: BRAND.textMuted, fontSize: 13, margin: '0 0 12px' }}>
          Showing {plottableReports.length} verified{' '}
          {plottableReports.length === 1 ? 'nest' : 'nests'}
          {selectedSpecies !== 'all' ? ` for ${selectedSpecies}` : ''}.
          {plottableReports.length < filteredReports.length &&
            ` ${filteredReports.length - plottableReports.length} hidden (missing location data).`}
        </p>
      )}

      {/* Empty state */}
      {!loading && !usingMockData && plottableReports.length === 0 && (
        <div style={noticeBox}>
          <strong style={{ color: BRAND.text }}>No verified nests to show yet.</strong>
          <br />
          {selectedSpecies === 'all'
            ? 'Reports appear here after a researcher has verified them.'
            : 'Try another species, or choose All.'}
        </div>
      )}

      <MapContainer
        center={[-36.8523, 174.7642]}
        zoom={12}
        style={{
          height: 'min(560px, 65vh)',
          minHeight: 340,
          width: '100%',
          borderRadius: 12,
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FitToMarkers positions={positions} />

        {plottableReports.map((r) => (
          <Marker
            key={r.id}
            position={getMaskedPosition(r)}
            icon={createSpeciesIcon(r.species_name)}
          >
            <Popup>
              <strong>{r.species_name || 'Unknown species'}</strong>
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