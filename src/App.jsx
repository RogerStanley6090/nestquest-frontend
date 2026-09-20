import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import Home from './Home.jsx'
import IdentificationGuide from './IdentificationGuide.jsx'
import ReportingForm from './ReportingForm.jsx'
import Confirmation from './Confirmation.jsx'
import PublicMap from './PublicMap.jsx'
import Reports from './Reports.jsx'
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

  function navLinkStyle({ isActive }) {
    return {
      color: isActive ? BRAND.accent : BRAND.textMuted,
      textDecoration: 'none',
      fontSize: 16,
      letterSpacing: '0.01em',
      fontWeight: isActive ? 600 : 400,
      borderBottom: isActive ? `2px solid ${BRAND.accent}` : '2px solid transparent',
      paddingBottom: 4,
      transition: 'color 0.15s ease, border-color 0.15s ease',
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        className="nq-header"
        style={{ background: BRAND.header, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(147,187,74,0.15)' }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={nestquestLogo} alt="NestQuest" className="nq-logo" style={{ display: 'block' }} />
        </Link>
        <nav className="nq-nav" style={{ display: 'flex', alignItems: 'center' }}>
          <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
          <NavLink to="/guide" style={navLinkStyle}>Guide</NavLink>
          <NavLink to="/report" style={navLinkStyle}>Report</NavLink>
          <NavLink to="/map" style={navLinkStyle}>Map</NavLink>
          <NavLink to="/reports" style={navLinkStyle}>Reports</NavLink>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: BRAND.textMuted, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" style={navLinkStyle}>Login</NavLink>
          )}
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              color: isActive ? BRAND.header : BRAND.accent,
              background: isActive ? BRAND.accent : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              border: `1px solid ${BRAND.accent}`,
              padding: '6px 16px',
              borderRadius: 6,
              transition: 'background 0.15s ease, color 0.15s ease',
            })}
          >
            Dashboard
          </NavLink>
        </nav>
      </header>

      <main className="nq-main" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<IdentificationGuide />} />
          <Route path="/report" element={<ReportingForm />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/map" element={<PublicMap />} />
          <Route path="/reports" element={<Reports />} />
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