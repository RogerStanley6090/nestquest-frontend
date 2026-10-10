import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#B7C0AC',
  accent: '#93BB4A',
}

function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | NestQuest'
  }, [])

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <div
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 12,
          padding: '44px 28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <p
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 72,
            color: BRAND.accent,
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: 24, color: BRAND.text, margin: '14px 0 10px' }}>This nest is empty</h1>
        <p style={{ fontSize: 15, color: BRAND.textMuted, margin: '0 0 28px', lineHeight: 1.6 }}>
          We couldn't find the page you were looking for. It may have moved, or the address might have a typo.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="nq-button"
            style={{
              background: BRAND.accent,
              color: '#0F2818',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '12px 24px',
              borderRadius: 8,
            }}
          >
            Back to home
          </Link>
          <Link
            to="/report"
            style={{
              background: 'transparent',
              color: BRAND.text,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '12px 24px',
              borderRadius: 8,
              border: `1px solid ${BRAND.border}`,
            }}
          >
            Report a nest
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound