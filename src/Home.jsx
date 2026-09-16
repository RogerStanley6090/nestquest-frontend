import { Link } from 'react-router-dom'
import nestquestIcon from './assets/nestquest-icon.png'

const BRAND = {
  header: '#0F2818',
  card: '#173722',
  border: '#234A2E',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#8A9483',
}

const STEPS = [
  {
    number: '1',
    title: 'Spot a nest',
    text: 'Come across a bird nest while out and about? Take a photo without touching or disturbing it.',
  },
  {
    number: '2',
    title: 'Answer a few questions',
    text: 'Our guided identification tool asks about shape, size, and position to suggest a likely species.',
  },
  {
    number: '3',
    title: 'Submit for review',
    text: 'A researcher verifies your submission. The exact location is always kept private — only a general area is ever shown publicly.',
  },
]

function Home() {
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 48,
          padding: '48px 0 64px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 300 }}>
          <p
            style={{
              color: BRAND.accent,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            Citizen Science &middot; Aotearoa New Zealand
          </p>
          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.15,
              color: BRAND.text,
              margin: '0 0 20px',
              fontWeight: 700,
            }}
          >
            Help protect New Zealand's birds, one nest at a time.
          </h1>
          <p style={{ fontSize: 16, color: BRAND.textMuted, lineHeight: 1.6, margin: '0 0 32px', maxWidth: 480 }}>
            Spotted a nest on your travels? NestQuest guides you through identifying it and
            submitting a report that researchers can actually use — while keeping the exact
            location private to protect the birds.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/guide"
              style={{
                background: BRAND.accent,
                color: '#0F2818',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 8,
                letterSpacing: '0.01em',
              }}
            >
              Report a nest
            </Link>
            <Link
              to="/map"
              style={{
                background: 'transparent',
                color: BRAND.text,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 500,
                padding: '14px 28px',
                borderRadius: 8,
                border: `1px solid ${BRAND.border}`,
              }}
            >
              View the map
            </Link>
          </div>
        </div>

        <div
          style={{
            flex: '0 0 auto',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: BRAND.card,
            border: `1px solid ${BRAND.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={nestquestIcon} alt="NestQuest" style={{ width: 130, height: 130, objectFit: 'contain' }} />
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '48px 0' }}>
        <h2 style={{ fontSize: 24, color: BRAND.text, margin: '0 0 32px', textAlign: 'center' }}>
          How it works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              style={{
                background: BRAND.card,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: BRAND.accent,
                  color: '#0F2818',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {step.number}
              </div>
              <h3 style={{ fontSize: 17, color: BRAND.text, margin: '0 0 8px' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: BRAND.textMuted, lineHeight: 1.6, margin: 0 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing CTA */}
      <div
        style={{
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 12,
          padding: '36px 32px',
          textAlign: 'center',
          margin: '24px 0 48px',
        }}
      >
        <h2 style={{ fontSize: 20, color: BRAND.text, margin: '0 0 10px' }}>
          Spotted a nest recently?
        </h2>
        <p style={{ fontSize: 14, color: BRAND.textMuted, margin: '0 0 24px' }}>
          It only takes a couple of minutes to submit a report.
        </p>
        <Link
          to="/guide"
          style={{
            background: BRAND.accent,
            color: '#0F2818',
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: 8,
            display: 'inline-block',
          }}
        >
          Start a report
        </Link>
      </div>
    </div>
  )
}

export default Home