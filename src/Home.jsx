import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import nestquestIcon from './assets/nestquest-icon.png'
import fantailPhoto from './assets/birds/fantail.jpg'
import silvereyePhoto from './assets/birds/silvereye.jpg'
import greywarblerPhoto from './assets/birds/greywarbler.jpg'
import blackbirdPhoto from './assets/birds/blackbird.jpg'
import songthrushPhoto from './assets/birds/songthrush.jpg'
import { publicApi } from './api/client.js'
import { useCountUp } from './hooks.js'

const BRAND = {
  header: '#0F2818',
  card: '#173722',
  border: '#234A2E',
  accent: '#93BB4A',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
}

// Update this number if the species list in the guide changes.
const SPECIES_COUNT = 16

const STEPS = [
  {
    number: '1',
    icon: 'ti-camera',
    title: 'Spot a nest',
    text: 'Come across a bird nest while out and about? Take a photo without touching or disturbing it.',
  },
  {
    number: '2',
    icon: 'ti-list-check',
    title: 'Answer a few questions',
    text: 'Our guided identification tool asks about shape, size, and position to suggest a likely species.',
  },
  {
    number: '3',
    icon: 'ti-clipboard-check',
    title: 'Submit for review',
    text: 'A researcher verifies your submission. The exact location is always kept private — only a general area is ever shown publicly.',
  },
]

const TRUST = [
  {
    icon: 'ti-lock',
    title: 'Locations stay private',
    text: 'Only a general area is ever shown on the public map.',
  },
  {
    icon: 'ti-list-check',
    title: `${SPECIES_COUNT} species in the guide`,
    text: 'Step-by-step questions point you to the most likely bird.',
  },
  {
    icon: 'ti-shield-check',
    title: 'Reviewed by researchers',
    text: 'Every report is checked before it appears on the map.',
  },
]

// A taste of the species covered by the identification guide
const SPECIES_PREVIEW = [
  { name: 'Fantail', maori: 'Pīwakawaka', photo: fantailPhoto },
  { name: 'Silvereye', maori: 'Tauhou', photo: silvereyePhoto },
  { name: 'Grey warbler', maori: 'Riroriro', photo: greywarblerPhoto },
  { name: 'Blackbird', maori: null, photo: blackbirdPhoto },
  { name: 'Song thrush', maori: null, photo: songthrushPhoto },
]

// Live numbers from the public API. Renders nothing if the server is
// unreachable or there are no verified reports yet, so it never shows "0".
function StatsStrip() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    publicApi
      .getVerifiedReports()
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : data.results || []
        const species = new Set(list.map((r) => r.species_name).filter(Boolean))
        if (list.length > 0) setStats({ nests: list.length, species: species.size })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const nests = useCountUp(stats?.nests ?? 0)
  const species = useCountUp(stats?.species ?? 0)

  if (!stats) return null

  return (
    <section aria-label="Community progress" className="nq-stats" data-reveal>
      <div>
        <span className="nq-stat-num">{nests}</span>
        <span className="nq-stat-label">verified {stats.nests === 1 ? 'nest' : 'nests'}</span>
      </div>
      <div>
        <span className="nq-stat-num">{species}</span>
        <span className="nq-stat-label">species recorded</span>
      </div>
      <div>
        <span className="nq-stat-num">Private</span>
        <span className="nq-stat-label">exact locations, always</span>
      </div>
    </section>
  )
}

const primaryButton = {
  background: BRAND.accent,
  color: '#0F2818',
  textDecoration: 'none',
  padding: '15px 30px',
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
}

const secondaryButton = {
  background: 'transparent',
  color: BRAND.text,
  textDecoration: 'none',
  padding: '15px 30px',
  borderRadius: 999,
  border: `1px solid ${BRAND.border}`,
  display: 'inline-flex',
  alignItems: 'center',
}

function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="nq-hero"
        aria-labelledby="home-heading"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 48,
          padding: '56px 0 48px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 280 }}>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              color: BRAND.accent,
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: '0 0 14px',
            }}
          >
            Citizen Science &middot; Aotearoa New Zealand
          </p>
          <h1
            id="home-heading"
            style={{
              fontSize: 'clamp(32px, 5.2vw, 46px)',
              lineHeight: 1.12,
              color: BRAND.text,
              margin: '0 0 20px',
              fontWeight: 600,
              letterSpacing: '-0.015em',
            }}
          >
            Help protect New Zealand's birds,{' '}
            <span className="nq-accent-italic" style={{ whiteSpace: "nowrap" }}>one nest at a time.</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: BRAND.textMuted,
              lineHeight: 1.65,
              margin: '0 0 32px',
              maxWidth: 520,
            }}
          >
            Spotted a nest on your travels? NestQuest guides you through identifying it and
            submitting a report that researchers can actually use — while keeping the exact
            location private to protect the birds.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/guide" className="nq-btn nq-btn-primary" style={primaryButton}>
              Report a nest
              <i className="ti ti-arrow-right" style={{ fontSize: 18 }} aria-hidden="true" />
            </Link>
            <Link to="/map" className="nq-btn nq-btn-secondary" style={secondaryButton}>
              View the map
            </Link>
          </div>
        </div>

        <div
          style={{
            flex: '0 0 auto',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: BRAND.card,
            border: `1px solid ${BRAND.border}`,
            boxShadow: '0 0 0 12px rgba(147,187,74,0.05), 0 18px 50px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <img
            src={nestquestIcon}
            alt="NestQuest"
            style={{ width: 140, height: 140, objectFit: 'contain' }}
          />
        </div>
      </section>

      {/* Trust strip */}
      <section
        aria-label="Why NestQuest"
        data-reveal
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          padding: '8px 0 24px',
        }}
      >
        {TRUST.map((item) => (
          <div
            key={item.title}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '16px 18px',
              borderRadius: 12,
              border: `1px solid ${BRAND.border}`,
              background: 'rgba(23,55,34,0.55)',
            }}
          >
            <i
              className={`ti ${item.icon}`}
              style={{ fontSize: 24, color: BRAND.accent, marginTop: 2 }}
              aria-hidden="true"
            />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: BRAND.text }}>
                {item.title}
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: BRAND.textMuted }}>
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </section>

      <StatsStrip />

      {/* Species preview */}
      <section aria-labelledby="species-heading" style={{ padding: '32px 0 8px' }}>
        <div data-reveal style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 id="species-heading" style={{ fontSize: 28, color: BRAND.text, margin: '0 0 8px' }}>
            Meet the birds
          </h2>
          <p style={{ fontSize: 15, color: BRAND.textMuted, margin: 0 }}>
            The guide covers {SPECIES_COUNT} species you might find nesting around Aotearoa.
          </p>
        </div>
        <ul className="nq-species-strip" data-reveal>
          {SPECIES_PREVIEW.map((bird) => (
            <li key={bird.name}>
              <Link to="/guide" className="nq-species-card">
                <img src={bird.photo} alt="" loading="lazy" />
                <span className="nq-species-name">
                  {bird.name}
                  {bird.maori && <em>{bird.maori}</em>}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link to="/guide" className="nq-species-card nq-species-more">
              <span>
                See all {SPECIES_COUNT}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          </li>
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" style={{ padding: '40px 0 24px' }}>
        <h2
          id="how-heading"
          data-reveal
          style={{ fontSize: 28, color: BRAND.text, margin: '0 0 8px', textAlign: 'center' }}
        >
          How it works
        </h2>
        <p
          style={{
            fontSize: 15,
            color: BRAND.textMuted,
            textAlign: 'center',
            margin: '0 0 32px',
          }}
        >
          Three simple steps from spotting a nest to helping research.
        </p>
        <div
          className="nq-stagger"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="nq-card-hover"
              style={{
                background: BRAND.card,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 14,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
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
                  }}
                >
                  {step.number}
                </div>
                <i
                  className={`ti ${step.icon}`}
                  style={{ fontSize: 28, color: BRAND.accent, opacity: 0.85 }}
                  aria-hidden="true"
                />
              </div>
              <h3 style={{ fontSize: 18, color: BRAND.text, margin: '0 0 8px' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: BRAND.textMuted, lineHeight: 1.65, margin: 0 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section
        aria-labelledby="cta-heading"
        data-reveal
        style={{
          background: `linear-gradient(135deg, ${BRAND.card} 0%, #1B4228 100%)`,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
          margin: '32px 0 48px',
        }}
      >
        <h2 id="cta-heading" style={{ fontSize: 24, color: BRAND.text, margin: '0 0 10px' }}>
          Spotted a nest recently?
        </h2>
        <p style={{ fontSize: 15, color: BRAND.textMuted, margin: '0 0 26px' }}>
          It only takes a couple of minutes to submit a report.
        </p>
        <Link
          to="/guide"
          className="nq-btn nq-btn-primary"
          style={{ ...primaryButton, padding: '15px 34px' }}
        >
          Start a report
          <i className="ti ti-arrow-right" style={{ fontSize: 18 }} aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}

export default Home