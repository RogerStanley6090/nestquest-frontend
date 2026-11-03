import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { researcherApi } from './api/client.js'
import './dashboard.css'

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


function formatCoordinates(location) {
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
  { key: 'id', label: 'Report #' },
  { key: 'species', label: 'Species' },
  { key: 'location', label: 'Location' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
]

const DEFAULT_SORT_KEY = 'id'
const DEFAULT_SORT_DIR = 'asc'

function getDisplaySpecies(report) {
  return report.final_species_name || report.final_species || report.species_name || '—'
}

function getSortValue(report, key) {
  if (key === 'id') return report.id
  if (key === 'species') return getDisplaySpecies(report).toLowerCase()
  if (key === 'location') {
  return (report.location?.location_name || formatCoordinates(report.location)
  ).toLowerCase()
  }
  if (key === 'date') return report.date || report.created_at || ''
  if (key === 'status') return report.status || ''
  return ''
}

function Dashboard() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY)
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR)

  useEffect(() => {
    let cancelled = false
    researcherApi.listReports().then((data) => {
      if (cancelled) return
      setReports(data)
      setUsingMockData(false)
    }).catch((err) => {
      if (cancelled) return
      console.log('Could not reach real API, using mock data:', err.message)
      setUsingMockData(true)
    }).finally(() => {
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

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function resetFilters() {
    setStatusFilter('all')
    setSearchTerm('')
    setSortKey(DEFAULT_SORT_KEY)
    setSortDir(DEFAULT_SORT_DIR)
  }

  const filtersActive = statusFilter !== 'all' || searchTerm.trim() !== '' || sortKey !== DEFAULT_SORT_KEY || sortDir !== DEFAULT_SORT_DIR

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  let visibleReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      searchTerm.trim() === '' ||
      getDisplaySpecies(r).toLowerCase().includes(searchTerm.trim().toLowerCase())
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
    <div style={{ padding: '16px 0' }}>
      <div className="nq-dash-head">
        <div>
          <p className="nq-eyebrow">Researcher area</p>
          <h1 style={{ color: '#F5EFD9', fontSize: 'clamp(28px, 4vw, 36px)', margin: 0 }}>Researcher dashboard</h1>
        </div>
        <span className="nq-dash-count">{loading ? 'Loading…' : `${reports.length} reports`}</span>
      </div>

      {loading && (
        <div className="nq-dash-banner" role="status">
          <span>
            <i className="ti ti-loader-2" aria-hidden="true" />
            Loading reports. The first load can take up to a minute while the server wakes up.
          </span>
        </div>
      )}

      {!loading && usingMockData && (
        <div className="nq-dash-banner" role="alert">
          <span>
            <i className="ti ti-plug-off" aria-hidden="true" />
            Couldn’t reach the server, so this is placeholder data.
          </span>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}

      <div className="nq-stat-grid" style={{ margin: '22px 0 28px' }}>
        {FILTERS.filter((f) => f.key !== 'all').map((f) => {
          const meta = STATUS_META[f.key]
          const isActive = statusFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(isActive ? 'all' : f.key)}
              aria-pressed={isActive}
              className={`nq-dstat${isActive ? ' nq-dstat-active' : ''}`}
              style={{ '--c': meta.bg, '--ct': meta.text }}
            >
              <div className="nq-dstat-top">
                <span className="nq-dstat-label">{f.label}</span>
                <span className="nq-dstat-icon" aria-hidden="true">
                  <i className={`ti ${meta.icon}`} style={{ fontSize: 15 }}></i>
                </span>
              </div>
              <span className="nq-dstat-num">{statusCounts[f.key] || 0}</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="nq-dsearch">
          <i className="ti ti-search" aria-hidden="true"></i>
          <input
            type="text"
            aria-label="Search by species"
            placeholder="Search by species"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filtersActive && (
          <button type="button" onClick={resetFilters} className="nq-dreset">
            <i className="ti ti-refresh" style={{ fontSize: 14 }} aria-hidden="true"></i>
            Reset filters
          </button>
        )}
      </div>

      <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            aria-pressed={statusFilter === f.key}
            className="nq-dpill"
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="nq-dtable-wrap">
        <div className="nq-table-scroll">
          <table className="nq-dtable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {SORT_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button type="button" className="nq-th-btn" data-active={sortKey === col.key} onClick={() => handleSort(col.key)}>
                      {col.label}
                      {sortKey === col.key && (
                        <i className={`ti ti-arrow-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ fontSize: 13 }} aria-hidden="true"></i>
                      )}
                    </button>
                  </th>
                ))}
                <th><span style={{ position: 'absolute', left: -9999 }}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0, 1, 2, 3].map((n) => (
                    <tr key={n} className="nq-dskel" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((c) => (
                        <td key={c}><span style={{ width: c === 0 ? 40 : c === 5 ? 50 : 110 }} /></td>
                      ))}
                    </tr>
                  ))
                : visibleReports.map((r) => {
                    const meta = STATUS_META[r.status] || STATUS_META.unverified
                    return (
                      <tr key={r.id}>
                        <td><span className="nq-id">#{r.id}</span></td>
                        <td>{getDisplaySpecies(r)}</td>
                        <td style={{ color: '#B7C0AC' }}>{r.location?.location_name || formatCoordinates(r.location)}</td>
                        <td style={{ color: '#B7C0AC' }}>{r.date || r.created_at || '—'}</td>
                        <td>
                          <span className="nq-badge" style={{ background: meta.bg, color: meta.text }}>
                            <i className={`ti ${meta.icon}`} aria-hidden="true"></i>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/dashboard/report/${r.id}`} className="nq-vlink" aria-label={`View report ${r.id}`}>
                            View
                            <i className="ti ti-arrow-right" aria-hidden="true"></i>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!loading && visibleReports.length === 0 && (
          <div className="nq-dempty">
            <i className="ti ti-inbox" aria-hidden="true"></i>
            <p style={{ margin: 0 }}>No reports match this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard