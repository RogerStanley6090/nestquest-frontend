import { Link } from 'react-router-dom'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
  accent: '#93BB4A',
}

function Confirmation() {
  return (
    <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <div
        role="status"
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: '44px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
        }}
      >
        <div className="nq-success" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="76" height="76" fill="none">
            <circle className="nq-success-ring" cx="26" cy="26" r="24" />
            <path className="nq-success-tick" d="M15 27l8 8 14-17" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, color: BRAND.text, margin: '22px 0 10px' }}>
          Thank you — your report has been submitted.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: BRAND.textMuted, margin: '0 0 28px' }}>
          A researcher will review your submission. The exact location stays private.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="nq-btn nq-btn-primary"
            style={{ background: BRAND.accent, color: '#0F2818', textDecoration: 'none', padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center' }}
          >
            Back to Home
          </Link>
          <Link
            to="/map"
            className="nq-btn nq-btn-secondary"
            style={{ color: BRAND.text, textDecoration: 'none', padding: '14px 28px', borderRadius: 999, border: `1px solid ${BRAND.border}`, display: 'inline-flex', alignItems: 'center' }}
          >
            View the map
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Confirmation