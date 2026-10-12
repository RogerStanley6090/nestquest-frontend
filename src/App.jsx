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
import NotFound from './NotFound.jsx'
import nestquestLogo from './assets/nestquest-logo.png'
import './App.css'

const BRAND = {
  header: '#0F2818',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#8A9483',
}

const FOOTER_TEXT = '#B7C0AC'

const footerHeading = {
  fontSize: 12,
  color: BRAND.accent,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 600,
  margin: '0 0 12px',
}

const footerLink = {
  color: FOOTER_TEXT,
  textDecoration: 'none',
  fontSize: 14,
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <main className="nq-main" style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer
        style={{
          background: BRAND.header,
          borderTop: '1px solid rgba(147,187,74,0.15)',
          marginTop: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '32px 24px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: BRAND.text, margin: '0 0 8px' }}>
              Nest<span style={{ color: BRAND.accent }}>Quest</span>
            </p>
            <p style={{ fontSize: 13, color: FOOTER_TEXT, lineHeight: 1.6, margin: 0 }}>
              Citizen science for Aotearoa’s native birds. Spot a nest, report it, and help researchers protect it.
            </p>
          </div>

          <div>
            <p style={footerHeading}>Explore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/guide" style={footerLink}>Identification guide</Link>
              <Link to="/report" style={footerLink}>Report a nest</Link>
              <Link to="/map" style={footerLink}>Nest map</Link>
            </div>
          </div>

          <div style={{ maxWidth: 300 }}>
            <p style={footerHeading}>Your privacy</p>
            <p style={{ fontSize: 13, color: FOOTER_TEXT, lineHeight: 1.6, margin: 0 }}>
              Exact nest locations are never shown publicly, and photos have hidden location data removed before they’re stored.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(147,187,74,0.1)' }}>
          <p
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '14px 24px',
              fontSize: 12,
              color: BRAND.textMuted,
            }}
          >
            © {new Date().getFullYear()} Katana and Curry · Unitec | Te Pūkenga · Capstone Project ISCG7431
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App