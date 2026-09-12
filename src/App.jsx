import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './Home.jsx'
import IdentificationGuide from './IdentificationGuide.jsx'
import ReportingForm from './ReportingForm.jsx'
import Confirmation from './Confirmation.jsx'
import PublicMap from './PublicMap.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import ReportDetail from './ReportDetail.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import nestquestLogo from './assets/nestquest-logo.png'
import './App.css'

const BRAND = {
  header: '#0F2818',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#8A9483',
}

function App() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('nq_auth_token'))

  function handleLogout() {
    localStorage.removeItem('nq_auth_token')
    navigate('/')
  }

  const navLinkStyle = { color: BRAND.textMuted, textDecoration: 'none', fontSize: 14, letterSpacing: '0.01em' }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: BRAND.header, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(147,187,74,0.15)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={nestquestLogo} alt="NestQuest" style={{ height: 34, display: 'block' }} />
        </Link>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/guide" style={navLinkStyle}>Guide</Link>
          <Link to="/map" style={navLinkStyle}>Map</Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: BRAND.textMuted, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" style={navLinkStyle}>Login</Link>
          )}
          <Link
            to="/dashboard"
            style={{ color: BRAND.accent, textDecoration: 'none', fontSize: 14, fontWeight: 500, border: `1px solid ${BRAND.accent}`, padding: '6px 16px', borderRadius: 6 }}
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<IdentificationGuide />} />
          <Route path="/report" element={<ReportingForm />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/map" element={<PublicMap />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/report/:id"
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App