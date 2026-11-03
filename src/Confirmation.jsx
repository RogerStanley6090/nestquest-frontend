import { Link } from 'react-router-dom'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
  accent: '#93BB4A',
}

// Fixed values (not random) so the animation looks the same on every render.
// left = % across the card, delay/duration in seconds, size in px, drift = sideways px
const LEAVES = [
  { left: 6, delay: 0.1, dur: 3.6, size: 10, drift: 18, tone: 0 },
  { left: 12, delay: 0.5, dur: 4.2, size: 14, drift: -22, tone: 1 },
  { left: 18, delay: 0.2, dur: 3.9, size: 9, drift: 26, tone: 2 },
  { left: 25, delay: 0.8, dur: 4.4, size: 12, drift: -16, tone: 0 },
  { left: 31, delay: 0.3, dur: 3.7, size: 15, drift: 20, tone: 1 },
  { left: 38, delay: 0.9, dur: 4.1, size: 10, drift: -24, tone: 2 },
  { left: 44, delay: 0.15, dur: 4.5, size: 13, drift: 14, tone: 0 },
  { left: 50, delay: 0.6, dur: 3.8, size: 9, drift: -18, tone: 1 },
  { left: 56, delay: 0.35, dur: 4.3, size: 14, drift: 24, tone: 2 },
  { left: 62, delay: 1.0, dur: 3.9, size: 11, drift: -20, tone: 0 },
  { left: 68, delay: 0.25, dur: 4.2, size: 15, drift: 16, tone: 1 },
  { left: 74, delay: 0.7, dur: 3.6, size: 10, drift: -26, tone: 2 },
  { left: 80, delay: 0.4, dur: 4.4, size: 12, drift: 22, tone: 0 },
  { left: 86, delay: 0.95, dur: 4.0, size: 9, drift: -14, tone: 1 },
  { left: 92, delay: 0.05, dur: 3.8, size: 13, drift: 18, tone: 2 },
  { left: 96, delay: 0.55, dur: 4.3, size: 10, drift: -22, tone: 0 },
]

function Confirmation() {
  return (
    <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <div
        role="status"
        className="nq-thanks"
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: '44px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
        }}
      >
        {/* Gentle falling leaves, plays once. Hidden if the user prefers reduced motion. */}
        <div className="nq-leaves" aria-hidden="true">
          {LEAVES.map((l, i) => (
            <span
              key={i}
              className={`nq-leaf nq-leaf-${l.tone}`}
              style={{
                left: `${l.left}%`,
                width: l.size,
                height: l.size,
                animationDelay: `${l.delay}s`,
                animationDuration: `${l.dur}s`,
                '--drift': `${l.drift}px`,
              }}
            />
          ))}
        </div>

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