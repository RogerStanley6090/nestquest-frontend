import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home.jsx'
import IdentificationGuide from './IdentificationGuide.jsx'
import ReportingForm from './ReportingForm.jsx'
import Confirmation from './Confirmation.jsx'
import PublicMap from './PublicMap.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import ReportDetail from './ReportDetail.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import NotFound from './NotFound.jsx'
import About from './About.jsx'
import { useScrollReveal } from './hooks.js'
import nestquestIcon from './assets/nestquest-icon.png'
import './App.css'

const BRAND = {
  header: '#0F2818',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
}

const FOOTER_TEXT = '#B7C0AC'

// Styles for the phone menu button and the "skip to content" link.
// !important is used so these rules win over the inline styles on the nav.
const RESPONSIVE_CSS = `
  .nq-skip {
    position: absolute;
    left: -9999px;
    top: 8px;
    background: #93BB4A;
    color: #0F2818;
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    z-index: 1000;
  }
  .nq-skip:focus { left: 8px; }
  .nq-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: transparent;
    border: 1px solid rgba(147, 187, 74, 0.45);
    border-radius: 8px;
    color: #93BB4A;
    cursor: pointer;
  }
  @media (max-width: 768px) {
    .nq-header { flex-wrap: wrap !important; }
    .nq-menu-btn { display: inline-flex; }
    .nq-nav {
      display: none !important;
      width: 100%;
      flex-direction: column;
      align-items: flex-start !important;
      gap: 16px !important;
      padding: 16px 0 8px;
    }
    .nq-nav.nq-nav-open { display: flex !important; }
    .nq-nav a:not(.nq-dash) { font-size: 13px; padding: 6px 0; }
    .nq-nav .nq-dash { width: 100%; justify-content: center; }
  }
`

// Browser tab title for each page
const PAGE_TITLES = {
  '/': "NestQuest | Help protect New Zealand's birds",
  '/guide': 'Identification guide | NestQuest',
  '/report': 'Report a nest | NestQuest',
  '/confirmation': 'Report submitted | NestQuest',
  '/map': 'Nest map | NestQuest',
  '/login': 'Researcher login | NestQuest',
  '/about': 'About & privacy | NestQuest',
  '/dashboard': 'Researcher dashboard | NestQuest',
}

const footerHeading = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  color: BRAND.accent,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontWeight: 700,
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
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Per-page tab title (NotFound sets its own) and scroll-to-top on navigation
  useEffect(() => {
    const title = PAGE_TITLES[pathname] || (pathname.startsWith('/dashboard/report/') ? 'Report detail | NestQuest' : null)
    if (title) document.title = title
    window.scrollTo(0, 0)
  }, [pathname])

  useScrollReveal(pathname)

  // Pressing Escape closes the phone menu
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  function handleLogout() {
    localStorage.removeItem('nq_auth_token')
    navigate('/')
  }

  function navLinkStyle({ isActive }) {
    return {
      color: isActive ? BRAND.accent : BRAND.textMuted,
      transition: 'color 0.15s ease',
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{RESPONSIVE_CSS}</style>
      <a href="#main-content" className="nq-skip">Skip to main content</a>
      <header
        className="nq-header"
        style={{ background: BRAND.header, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(147,187,74,0.15)' }}
      >
        <Link to="/" className="nq-brand" aria-label="NestQuest home">
          <img src={nestquestIcon} alt="" className="nq-brand-icon" width="40" height="41" />
          <span className="nq-brand-text">
            Nest<span>Quest</span>
          </span>
        </Link>
        <button
          type="button"
          className="nq-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="nq-main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        <nav
          id="nq-main-nav"
          aria-label="Main navigation"
          className={`nq-nav${menuOpen ? ' nq-nav-open' : ''}`}
          style={{ display: 'flex', alignItems: 'center' }}
          onClick={() => setMenuOpen(false)}
        >
          <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
          <NavLink to="/guide" style={navLinkStyle}>Guide</NavLink>
          <NavLink to="/report" style={navLinkStyle}>Report</NavLink>
          <NavLink to="/map" style={navLinkStyle}>Map</NavLink>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="nq-link-muted"
              style={{ background: 'none', border: 'none', color: BRAND.textMuted, cursor: 'pointer', padding: 0 }}
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" style={navLinkStyle}>Login</NavLink>
          )}
          <NavLink
            to="/dashboard"
            className="nq-dash"
            style={({ isActive }) => ({
              color: isActive ? BRAND.header : BRAND.accent,
              background: isActive ? BRAND.accent : 'transparent',
              border: `1px solid ${BRAND.accent}`,
              padding: '10px 20px',
              borderRadius: 999,
            })}
          >
            Dashboard
            <i className="ti ti-arrow-up-right" aria-hidden="true" />
          </NavLink>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1} className="nq-main" style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <div key={pathname} className="nq-page">
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
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
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
              <Link to="/guide" className="nq-footer-link" style={footerLink}>Identification guide</Link>
              <Link to="/report" className="nq-footer-link" style={footerLink}>Report a nest</Link>
              <Link to="/map" className="nq-footer-link" style={footerLink}>Nest map</Link>
              <Link to="/about" className="nq-footer-link" style={footerLink}>About &amp; privacy</Link>
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