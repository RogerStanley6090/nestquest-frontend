import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { researcherApi } from './api/client.js'

const MOCK_REPORTS = [
  { id: 1, species: 'Blackbird', location: 'Henderson Park', date: '12 Aug', status: 'unverified' },
  { id: 2, species: 'Fantail', location: 'Botanic Gardens', date: '10 Aug', status: 'verified' },
  { id: 3, species: 'Unknown', location: 'Karori Reserve', date: '9 Aug', status: 'needs_info' },
]

const STATUS_LABELS = { all: 'All', unverified: 'Unverified', verified: 'Verified', needs_info: 'Needs Info', rejected: 'Rejected' }

function formatLocation(location) {
  if (!location) return '—'
  if (typeof location === 'string') return location
  const lat = location.exact_latitude ?? location.masked_latitude
  const lng = location.exact_longitude ?? location.masked_longitude
  if (lat == null || lng == null) return '—'
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`
}

function Dashboard() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [usingMockData, setUsingMockData] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

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

  const visibleReports = reports.filter((r) => statusFilter === 'all' || r.status === statusFilter)

  return (
    <div>
      <h2>Researcher Dashboard</h2>
      {usingMockData && (
        <p style={{ color: 'grey', fontSize: 12 }}>
          Showing placeholder data — not yet connected to the live API.
        </p>
      )}

      <div style={{ margin: '10px 0' }}>
        {Object.keys(STATUS_LABELS).map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            style={{ fontWeight: statusFilter === key ? 'bold' : 'normal' }}
          >
            {STATUS_LABELS[key]}
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Species</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleReports.map((r) => (
            <tr key={r.id}>
              <td>[img]</td>
              <td>{r.species || '—'}</td>
              <td>{formatLocation(r.location)}</td>
              <td>{r.date || r.created_at || '—'}</td>
              <td>{STATUS_LABELS[r.status] || r.status || '—'}</td>
              <td><Link to={`/dashboard/report/${r.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleReports.length === 0 && <p>No reports match this filter.</p>}
    </div>
  )
}

export default Dashboard