import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#B7C0AC',
  accent: '#93BB4A',
}

const SUGGESTIONS = [
  { to: '/guide', icon: 'ti-binoculars', label: 'Identify a nest' },
  { to: '/species', icon: 'ti-feather', label: 'Browse species' },
  { to: '/map', icon: 'ti-map-pin', label: 'See the nest map' },
]

function NotFound() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = 'Page not found | NestQuest'
  }, [])

  return (
    <div style={{ maxWidth: 580, margin: '40px auto', textAlign: 'center' }}>
      <div
        className="nq-glass"
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: '44px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
        }}
      >
        <svg className="nq-empty-nest" viewBox="0 0 120 80" width="132" height="88" fill="none" aria-hidden="true">
          <path d="M14 42c4 24 24 34 46 34s42-10 46-34" stroke="#93BB4A" strokeWidth="3" strokeLinecap="round" />
          <path d="M10 42c14 8 34 12 50 12s36-4 50-12" stroke="#93BB4A" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M22 54c10 6 24 9 38 9s28-3 38-9" stroke="#93BB4A" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
          <ellipse cx="60" cy="36" rx="13" ry="16" stroke="#F5EFD9" strokeWidth="2" strokeDasharray="4 5" opacity="0.55" />
        </svg>

        <p className="nq-eyebrow" style={{ margin: '14px 0 6px' }}>Error 404</p>
        <h1 style={{ fontSize: 28, color: BRAND.text, margin: '0 0 10px' }}>This nest is empty</h1>
        <p style={{ fontSize: 15, color: BRAND.textMuted, margin: '0 auto 8px', lineHeight: 1.6, maxWidth: 420 }}>
          We couldn't find that page. It may have moved, or the address might have a typo. Here are a few places to get back on the trail.
        </p>
        <p className="nq-404-path" title={pathname}>{pathname}</p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '22px 0 26px' }}>
          {SUGGESTIONS.map((s) => (
            <Link key={s.to} to={s.to} className="nq-404-chip">
              <i className={`ti ${s.icon}`} aria-hidden="true" />
              {s.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="nq-btn nq-btn-primary"
            style={{ background: BRAND.accent, color: '#0F2818', textDecoration: 'none', padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center' }}
          >
            Back to Home
          </Link>
          <Link
            to="/report"
            className="nq-btn nq-btn-secondary"
            style={{ color: BRAND.text, textDecoration: 'none', padding: '14px 28px', borderRadius: 999, border: `1px solid ${BRAND.border}`, display: 'inline-flex', alignItems: 'center' }}
          >
            Report a nest
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound