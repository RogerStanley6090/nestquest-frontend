import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { researcherApi, getPhotoUrl } from './api/client.js'

const MOCK_REPORTS = [
  { id: 1, species: 'Blackbird', location: 'Henderson Park', date: '12 Aug', status: 'unverified' },
  { id: 2, species: 'Fantail', location: 'Botanic Gardens', date: '10 Aug', status: 'verified' },
  { id: 3, species: 'Unknown', location: 'Karori Reserve', date: '9 Aug', status: 'needs_info' },
]

const STATUS_META = {
  unverified: { label: 'Unverified', bg: '#E5A83A', text: '#3D2A05', icon: 'ti-clock' },
  verified: { label: 'Verified', bg: '#93BB4A', text: '#1B2E08', icon: 'ti-check' },
  rejected: { label: 'Rejected', bg: '#9A9A92', text: '#232320', icon: 'ti-x' },
  needs_info: { label: 'Needs info', bg: '#E4685A', text: '#3D0F0A', icon: 'ti-help' },
}

const SPECIES_NAMES = {
  1: 'Blackbird',
  2: 'Fantail / Pīwakawaka',
  3: 'Silvereye / Tauhou',
  4: 'Grey Warbler / Riroriro',
  5: 'Song Thrush',
}

function formatSpecies(species) {
  if (species == null) return '—'
  if (typeof species === 'object') return species.name || '—'
  return SPECIES_NAMES[species] || `Species #${species}`
}

function formatLocation(location) {
  if (!location) return '—'
  if (typeof location === 'string') return location
  const lat = location.exact_latitude ?? location.masked_latitude
  const lng = location.exact_longitude ?? location.masked_longitude
  if (lat == null || lng == null) return '—'
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unverified', label: 'Unverified' },
  { key: 'verified', label: 'Verified' },
  { key: 'needs_info', label: 'Needs info' },
  { key: 'rejected', label: 'Rejected' },
]

const SORT_COLUMNS = [
  { key: 'species', label: 'Species' },
  { key: 'location', label: 'Location' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
]

function getSortValue(report, key) {
  if (key === 'species') return formatSpecies(report.species).toLowerCase()
  if (key === 'location') return formatLocation(report.location).toLowerCase()
  if (key === 'date') return report.date || report.created_at || ''
  if (key === 'status') return report.status || ''
  return ''
}

function Dashboard() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    researcherApi.listReports()
      .then((data) => {
        setReports(data)
        setUsingMockData(false)
      })
      .catch((err) => {
        console.log('Could not reach real API, using mock data:', err.message)
        setUsingMockData(true)
      })
  }, [])

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  let visibleReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      searchTerm.trim() === '' ||
      formatSpecies(r.species).toLowerCase().includes(searchTerm.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (sortKey) {
    visibleReports = [...visibleReports].sort((a, b) => {
      const va = getSortValue(a, sortKey)
      const vb = getSortValue(b, sortKey)
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={{ color: '#93BB4A', fontSize: 30, margin: 0 }}>Researcher dashboard</h1>
        <span style={{ color: '#8A9483', fontSize: 13 }}>{reports.length} reports</span>
      </div>

      {usingMockData && (
        <p style={{ color: '#8A9483', fontSize: 12, marginBottom: 16 }}>
          Showing placeholder data — not yet connected to the live API.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, margin: '20px 0 28px' }}>
        {FILTERS.filter((f) => f.key !== 'all').map((f) => {
          const meta = STATUS_META[f.key]
          const isActive = statusFilter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setStatusFilter(isActive ? 'all' : f.key)}
              className="nq-stat-card"
              style={{
                background: '#173722',
                border: isActive ? `1px solid ${meta.bg}` : '1px solid #234A2E',
                borderRadius: 12,
                padding: '16px 18px',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: meta.bg }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: '#8A9483', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</p>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${meta.icon}`} style={{ fontSize: 14, color: meta.text }} aria-hidden="true"></i>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 500, color: '#F5EFD9', margin: 0, fontFamily: "'Fraunces', Georgia, serif" }}>
                {statusCounts[f.key] || 0}
              </p>
            </button>
          )
        })}
      </div>

      <div style={{ position: 'relative', maxWidth: 340, margin: '0 0 16px' }}>
        <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#6E8A5E' }} aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Search by species"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', paddingLeft: 34, background: '#173722', border: '1px solid #2E5C3E', color: '#F5EFD9', borderRadius: 8, height: 38 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const active = statusFilter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`nq-pill ${active ? 'nq-pill-active' : ''}`}
              style={{
                background: active ? '#93BB4A' : 'transparent',
                color: active ? '#0F2818' : '#C9CFC0',
                border: active ? 'none' : '1px solid #2E5C3E',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                padding: '7px 16px',
                borderRadius: 20,
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div style={{ background: '#173722', border: '1px solid #234A2E', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #234A2E' }}>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, color: '#8A9483', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photo</th>
              {SORT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 500, color: '#8A9483', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <i className={`ti ti-arrow-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ fontSize: 12, marginLeft: 4, verticalAlign: 'middle' }} aria-hidden="true"></i>
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleReports.map((r, i) => {
              const meta = STATUS_META[r.status] || STATUS_META.unverified
              const thumbUrl = getPhotoUrl(r.photo_storage_path)
              return (
                <tr key={r.id} className="nq-row" style={{ borderBottom: i === visibleReports.length - 1 ? 'none' : '1px solid #1F3F28' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: '#0F2818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-feather" style={{ fontSize: 16, color: '#4D6B48' }} aria-hidden="true"></i>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{formatSpecies(r.species)}</td>
                  <td style={{ padding: '12px 16px', color: '#B7C0AC' }}>{formatLocation(r.location)}</td>
                  <td style={{ padding: '12px 16px', color: '#B7C0AC' }}>{r.date || r.created_at || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: meta.bg, color: meta.text, fontSize: 12, padding: '3px 12px', borderRadius: 20, fontWeight: 500 }}>
                      {meta.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to={`/dashboard/report/${r.id}`} className="nq-view-link" style={{ color: '#93BB4A', fontSize: 13, fontWeight: 500 }}>View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visibleReports.length === 0 && (
          <p style={{ padding: '24px 16px', textAlign: 'center', color: '#8A9483' }}>No reports match this filter.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard