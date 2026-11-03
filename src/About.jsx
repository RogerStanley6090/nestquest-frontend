import { Link } from 'react-router-dom'

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
  accent: '#93BB4A',
}

const POINTS = [
  {
    icon: 'ti-map-pin-off',
    title: 'Exact locations are never public',
    text: 'The public map only ever shows an approximate area. The precise spot where you found a nest is visible to verified researchers only.',
  },
  {
    icon: 'ti-photo-off',
    title: 'Hidden photo data is removed',
    text: 'Photos often carry hidden location data. We strip it before a photo is stored, so an image cannot give the nest away.',
  },
  {
    icon: 'ti-shield-check',
    title: 'Every report is reviewed',
    text: 'A researcher checks each submission before it appears on the map, so what you see has been verified.',
  },
  {
    icon: 'ti-hand-off',
    title: 'Please leave nests alone',
    text: 'Never touch, move, climb to or look inside a nest. Observe from a distance, and only take photos if it is safe to do so.',
  },
]

function About() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 0 16px' }}>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          color: BRAND.accent,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          margin: '0 0 14px',
        }}
      >
        About &middot; Privacy
      </p>
      <h1 style={{ fontSize: 'clamp(30px, 5vw, 42px)', lineHeight: 1.15, color: BRAND.text, margin: '0 0 18px' }}>
        Built to help birds, <span className="nq-accent-italic">designed to protect them.</span>
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.7, color: BRAND.textMuted, margin: '0 0 36px', maxWidth: 680 }}>
        NestQuest is a citizen-science tool that helps people identify bird nests and send
        researchers reports they can actually use. It was created as a capstone project at
        Unitec by Katana and Curry, working with our project sponsor.
      </p>

      <h2 style={{ fontSize: 24, color: BRAND.text, margin: '0 0 18px' }}>How we protect nests and your privacy</h2>
      <div className="nq-stagger" data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="nq-card-hover"
            style={{ background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: 24 }}
          >
            <i className={`ti ${p.icon}`} style={{ fontSize: 28, color: BRAND.accent }} aria-hidden="true" />
            <h3 style={{ fontSize: 18, color: BRAND.text, margin: '14px 0 8px' }}>{p.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: BRAND.textMuted, margin: 0 }}>{p.text}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 24, color: BRAND.text, margin: '44px 0 12px' }}>Identification results are a guide</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: BRAND.textMuted, margin: '0 0 36px', maxWidth: 680 }}>
        The identification guide suggests a likely species from your answers. It is provisional
        only, and a researcher confirms the final species when they review your report. Choosing
        &ldquo;Not sure&rdquo; is always fine.
      </p>

      <div
        data-reveal
        style={{
          background: `linear-gradient(135deg, ${BRAND.card} 0%, #1B4228 100%)`,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: '32px 28px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 22, color: BRAND.text, margin: '0 0 18px' }}>Ready to help?</h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/guide"
            className="nq-btn nq-btn-primary"
            style={{ background: BRAND.accent, color: '#0F2818', textDecoration: 'none', padding: '14px 28px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 10 }}
          >
            Start a report
            <i className="ti ti-arrow-right" style={{ fontSize: 18 }} aria-hidden="true" />
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

export default About