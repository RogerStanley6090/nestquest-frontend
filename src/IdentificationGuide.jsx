import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import silvereyePhoto from './assets/birds/silvereye.jpg'
import fantailPhoto from './assets/birds/fantail.jpg'
import greywarblerPhoto from './assets/birds/greywarbler.jpg'
import blackbirdPhoto from './assets/birds/blackbird.jpg'
import songthrushPhoto from './assets/birds/songthrush.jpg'

// Based on the updated NestQuest Bird Nest Information packet (Rachel, sponsor)

const BRAND = {
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#8A9483',
  accent: '#93BB4A',
  inputBg: '#0F2818',
  warn: '#E5A83A',
}

const SAFETY_MESSAGE =
  'Please do not touch, move, collect, or disturb any nest. If there are eggs, ' +
  'chicks, or adult birds nearby, observe only from a distance. Take photos only ' +
  'if it is safe to do so without disturbing the nest. Nest collection requires ' +
  'appropriate permission/permits.'

const STEPS = [
  {
    key: 'nest_shape',
    question: 'What shape is the nest?',
    options: ['Open cup or bowl', 'Enclosed dome / hanging pouch', 'Messy cavity / enclosed space', 'Not sure'],
  },
  {
    key: 'size_category',
    question: 'How big does it look?',
    options: ['Small / about palm-sized', 'Larger / bulkier like a cereal bowl or larger', 'Not sure'],
  },
  {
    key: 'position_type',
    question: 'Where is the nest positioned / attached?',
    options: ['In a fork', 'Supported from below', 'Hanging / suspended', 'In a hedge/shrub/tree but attachment unclear', 'Not sure'],
  },
  {
    key: 'entrance_visible',
    question: 'Does it have an entrance hole?',
    options: ['Yes, side entrance', 'No, open top', "Cannot tell"],
  },
  {
    key: 'inside_visible',
    question: "If visible from your photo, what does the inside look like? (Don't touch or move the nest to check.)",
    options: [
      'Small cup with grasses',
      'Small cup with hair/wool',
      'Large bulky bowl with grasses',
      'Large bulky bowl with smooth/plastered-looking inside',
      "Not sure / can't tell",
    ],
  },
]

const SPECIES_INFO = {
  silvereye: {
    name: 'Silvereye / Tauhou',
    clue: 'A small, neat cup woven onto a forked branch.',
    photo: silvereyePhoto,
  },
  fantail: {
    name: 'Fantail / Pīwakawaka',
    clue: 'A small cup nest with a more obvious base/support rather than sitting neatly in a fork.',
    photo: fantailPhoto,
  },
  greywarbler: {
    name: 'Grey Warbler / Riroriro',
    clue: 'A hanging enclosed nest with a side entrance.',
    photo: greywarblerPhoto,
  },
  blackbird: {
    name: 'Blackbird',
    clue: 'A large, bulky cup nest in a shrub, hedge, or tree.',
    photo: blackbirdPhoto,
  },
  songthrush: {
    name: 'Song Thrush',
    clue: 'A larger bowl nest with a smooth-looking inner cup.',
    photo: songthrushPhoto,
  },
  unknown: { name: 'Unknown / Other', clue: 'No problem — nest identification can be tricky.', photo: null },
}

// Priority: shape (dome) > entrance (side) > inside appearance > position > unknown.
function computeLikelyMatch(answers) {
  if (answers.nest_shape === 'Enclosed dome / hanging pouch') return 'greywarbler'
  if (answers.entrance_visible === 'Yes, side entrance') return 'greywarbler'

  if (answers.inside_visible === 'Small cup with grasses') return 'silvereye'
  if (answers.inside_visible === 'Small cup with hair/wool') return 'fantail'
  if (answers.inside_visible === 'Large bulky bowl with grasses') return 'blackbird'
  if (answers.inside_visible === 'Large bulky bowl with smooth/plastered-looking inside') return 'songthrush'

  if (answers.position_type === 'In a fork') return 'silvereye'
  if (answers.position_type === 'Supported from below') return 'fantail'
  if (answers.position_type === 'Hanging / suspended') return 'greywarbler'

  return 'unknown'
}

function IdentificationGuide() {
  const navigate = useNavigate()
  const [showSafety, setShowSafety] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const hasAnswered = Boolean(answers[step?.key])

  function selectOption(option) {
    setAnswers({ ...answers, [step.key]: option })
  }

  function goNext() {
    if (isLastStep) {
      setShowResult(true)
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  function resetGuide() {
    setShowResult(false)
    setStepIndex(0)
    setAnswers({})
  }

  function goToReportingForm() {
    const keyResult = computeLikelyMatch(answers)
    navigate('/report', {
      state: {
        guideAnswers: {
          ...answers,
          key_result: keyResult,
          user_clicked_not_my_nest: 'no',
          confidence_level: keyResult === 'unknown' ? 'low' : 'medium',
          researcher_final_id: 'pending',
          verification_status: 'unverified',
        },
      },
    })
  }

  const cardStyle = {
    background: BRAND.card,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 12,
    padding: 28,
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  }

  const primaryButton = (disabled) => ({
    background: disabled ? '#6E8A5E' : BRAND.accent,
    color: '#0F2818',
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '12px 28px',
    borderRadius: 8,
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  })

  const secondaryButton = {
    background: 'transparent',
    color: BRAND.textMuted,
    border: `1px solid ${BRAND.border}`,
    fontSize: 14,
    fontWeight: 500,
    padding: '12px 24px',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  // ============================================================
  // SAFETY SCREEN
  // ============================================================
  if (showSafety) {
    return (
      <div>
        <h1 style={{ color: BRAND.accent, fontSize: 28, margin: '0 0 20px' }}>Before you begin</h1>
        <div style={{ ...cardStyle, maxWidth: 620 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: BRAND.warn, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 22, color: '#3D2A05' }} aria-hidden="true"></i>
            </div>
            <p style={{ fontSize: 14, color: BRAND.text, margin: 0, lineHeight: 1.6 }}>{SAFETY_MESSAGE}</p>
          </div>
          <button className="nq-button" onClick={() => setShowSafety(false)} style={primaryButton(false)}>
            <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true"></i>
            I understand — continue
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // RESULT SCREEN
  // ============================================================
  if (showResult) {
    const matchKey = computeLikelyMatch(answers)
    const match = SPECIES_INFO[matchKey]
    const isUnknown = matchKey === 'unknown'
    return (
      <div>
        <h1 style={{ color: BRAND.accent, fontSize: 28, margin: '0 0 20px' }}>
          {isUnknown ? "That's not my nest" : 'Likely match result'}
        </h1>
        <div style={{ ...cardStyle, maxWidth: 620 }}>
          {isUnknown ? (
            <p style={{ fontSize: 14, color: BRAND.text, lineHeight: 1.6 }}>
              No problem — nest identification can be tricky. You can submit this as an unknown
              nest and upload photos for researcher review.
            </p>
          ) : (
            <>
              {match.photo && (
                <img
                  src={match.photo}
                  alt={`Example ${match.name} nest`}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 20 }}
                />
              )}
              <h2 style={{ color: BRAND.text, fontSize: 20, margin: '0 0 12px' }}>
                Your likely match is: <span style={{ color: BRAND.accent }}>{match.name}</span>
              </h2>
              <p style={{ fontSize: 14, color: BRAND.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                This result is based on your answers about nest shape, size, position, and visible
                features. Nest identification can still be uncertain, so any submitted photos will
                be reviewed before the record is used for research.
              </p>
              <div style={{ background: BRAND.inputBg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <i className="ti ti-bulb" style={{ fontSize: 16, color: BRAND.accent, marginTop: 2 }} aria-hidden="true"></i>
                <p style={{ fontSize: 13, color: BRAND.text, margin: 0, fontStyle: 'italic' }}>Best public clue: {match.clue}</p>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={resetGuide} style={secondaryButton}>
              <i className="ti ti-refresh" style={{ fontSize: 15 }} aria-hidden="true"></i>
              That's not my nest / Start again
            </button>
            <button className="nq-button" onClick={goToReportingForm} style={primaryButton(false)}>
              <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Submit this nest report
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // QUESTION STEPS
  // ============================================================
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ color: BRAND.accent, fontSize: 24, margin: 0 }}>Identification guide</h1>
        <span style={{ fontSize: 13, color: BRAND.textMuted }}>
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= stepIndex ? BRAND.accent : BRAND.border,
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      <div style={{ ...cardStyle, maxWidth: 620 }}>
        <h2 style={{ color: BRAND.text, fontSize: 19, margin: '0 0 20px', lineHeight: 1.4 }}>{step.question}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {step.options.map((option) => {
            const selected = answers[step.key] === option
            return (
              <button
                key={option}
                onClick={() => selectOption(option)}
                className="nq-pill"
                style={{
                  textAlign: 'left',
                  background: selected ? 'rgba(147,187,74,0.12)' : BRAND.inputBg,
                  border: `1px solid ${selected ? BRAND.accent : BRAND.border}`,
                  color: BRAND.text,
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                {option}
                {selected && <i className="ti ti-check" style={{ fontSize: 16, color: BRAND.accent, flexShrink: 0 }} aria-hidden="true"></i>}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={goBack} disabled={stepIndex === 0} style={{ ...secondaryButton, opacity: stepIndex === 0 ? 0.5 : 1, cursor: stepIndex === 0 ? 'default' : 'pointer' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true"></i>
            Back
          </button>
          <button className="nq-button" onClick={goNext} disabled={!hasAnswered} style={primaryButton(!hasAnswered)}>
            {isLastStep ? 'See likely match' : 'Next'}
            <i className={`ti ti-${isLastStep ? 'search' : 'arrow-right'}`} style={{ fontSize: 15 }} aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IdentificationGuide