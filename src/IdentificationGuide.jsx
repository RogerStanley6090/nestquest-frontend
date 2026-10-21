import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import silvereyePhoto from './assets/birds/silvereye.jpg'
import fantailPhoto from './assets/birds/fantail.jpg'
import greywarblerPhoto from './assets/birds/greywarbler.jpg'
import blackbirdPhoto from './assets/birds/blackbird.jpg'
import songthrushPhoto from './assets/birds/songthrush.jpg'

// Based on the NestQuest Bird Nest Information packets (Rachel, sponsor),
// including the "Species Expansion" packet. Results are provisional only.

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
  'Please do not touch, move, collect, climb to, look inside or disturb any nest. ' +
  'If there are eggs, chicks, or adult birds nearby, observe only from a distance. ' +
  'Take photos only if it is safe to do so without disturbing the nest. Nest ' +
  'collection requires appropriate permission/permits. "Not sure" is always a fine answer.'

// ===== LOGIC START =====

// Answer text (kept in one place so the questions and the rules always match)
const A = {
  shapeCup: 'Open cup or bowl',
  shapePlatform: 'Broad, flat platform-like nest',
  shapeDome: 'Enclosed dome / hanging pouch',
  shapeCavity: 'Messy cavity / enclosed space',
  notSure: 'Not sure',

  sizeSmall: 'Small / about palm-sized',
  sizeMedium: 'Medium / a little bigger than a palm',
  sizeLarge: 'Larger / bulkier like a cereal bowl or larger',

  posFork: 'In a fork',
  posBelow: 'Supported from below',
  posHanging: 'Hanging / suspended',
  posCanopy: 'High up in a tree',
  posGround: 'Close to the ground / in long grass',
  posLedge: 'Fixed to a ledge, wall, bridge or building',
  posHole: 'Inside a hole, roof gap or nest box',
  posUnclear: 'In a hedge/shrub/tree but attachment unclear',

  entSide: 'Yes, side entrance',
  entTop: 'No, open top',
  entHole: 'A hole leading into a cavity',
  entUnknown: 'Cannot tell',

  insSmallGrass: 'Small cup with grasses',
  insSmallWool: 'Small cup with hair/wool',
  insLargeGrass: 'Large bulky bowl with grasses',
  insLargeSmooth: 'Large bulky bowl with smooth/plastered-looking inside',
  insUnknown: "Not sure / can't tell",

  dTiny: 'A tiny, neat cup that blends into the branch',
  dLeafy: 'A small, neat cup among leafy outer branches',
  dLowShrub: 'A small cup deep in a low, dense shrub',
  dBulkySmall: 'A fairly bulky small-to-medium cup in a shrub or tree',
  dPlatform: 'A broad, shallow twig platform with a padded-looking centre',
  dChunky: 'A bowl of chunky, visible sticks in a fairly open tree',
  dNone: 'None of these / unsure',

  birdSparrow: 'A house sparrow',
  birdStarling: 'A common starling',
  birdMyna: 'A common myna',
  birdOther: 'Another bird',
  birdNone: 'No / not sure',
}

const CAVITY_BIRDS = ['housesparrow', 'starling', 'myna']

const BIRD_SEEN_MAP = {
  [A.birdSparrow]: 'housesparrow',
  [A.birdStarling]: 'starling',
  [A.birdMyna]: 'myna',
}

// Cavity nests: from the shape, the position, or the entrance answer
function isCavityEarly(a) {
  return a.nest_shape === A.shapeCavity || a.position_type === A.posHole
}
function isCavity(a) {
  return isCavityEarly(a) || a.entrance_visible === A.entHole
}

const STEPS = [
  {
    key: 'nest_shape',
    question: 'What shape is the nest?',
    options: [A.shapeCup, A.shapePlatform, A.shapeDome, A.shapeCavity, A.notSure],
  },
  {
    key: 'size_category',
    question: 'How big does it look?',
    options: [A.sizeSmall, A.sizeMedium, A.sizeLarge, A.notSure],
    showIf: (a) => a.nest_shape !== A.shapeCavity,
  },
  {
    key: 'position_type',
    question: 'Where is the nest positioned / attached?',
    options: [A.posFork, A.posBelow, A.posHanging, A.posCanopy, A.posGround, A.posLedge, A.posHole, A.posUnclear, A.notSure],
  },
  {
    key: 'entrance_visible',
    question: 'Does it have an entrance hole?',
    options: [A.entSide, A.entTop, A.entHole, A.entUnknown],
    showIf: (a) => !isCavityEarly(a),
  },
  {
    key: 'inside_visible',
    question: "If visible from your photo, what does the inside look like? (Don't touch or move the nest to check.)",
    options: [A.insSmallGrass, A.insSmallWool, A.insLargeGrass, A.insLargeSmooth, A.insUnknown],
    showIf: (a) => !isCavity(a),
  },
  {
    key: 'extra_detail',
    question: 'Does any of this describe what you can already see in your photo?',
    options: [A.dTiny, A.dLeafy, A.dLowShrub, A.dBulkySmall, A.dPlatform, A.dChunky, A.dNone],
    showIf: (a) => !isCavity(a),
  },
  {
    key: 'bird_seen',
    question: 'Did you see a bird using it? (From a safe distance only.)',
    options: [A.birdSparrow, A.birdStarling, A.birdMyna, A.birdOther, A.birdNone],
    showIf: (a) => isCavity(a),
  },
]

// Returns { keys: [...], group?: 'cavity' }. keys[0] is the best guess and the
// rest are other possibilities. An empty keys list means "unknown".
function computeResult(a) {
  // 1. Cavity nests: never force a single species
  if (isCavity(a)) {
    const seen = BIRD_SEEN_MAP[a.bird_seen]
    if (seen) return { keys: [seen, ...CAVITY_BIRDS.filter((k) => k !== seen)] }
    return { keys: CAVITY_BIRDS, group: 'cavity' }
  }

  // 2. Enclosed dome / side entrance
  if (a.nest_shape === A.shapeDome || a.entrance_visible === A.entSide) {
    if (a.position_type === A.posHanging) return { keys: ['greywarbler'] }
    if (a.size_category === A.sizeLarge) return { keys: ['housesparrow', 'greywarbler'] }
    return { keys: ['greywarbler'] }
  }

  // 3. Large stick nests (tui / magpie)
  if (a.extra_detail === A.dChunky) return { keys: ['magpie', 'tui'] }
  if (a.extra_detail === A.dPlatform) return { keys: ['tui', 'magpie'] }
  if (a.nest_shape === A.shapePlatform) return { keys: ['tui', 'magpie'] }

  // 4. Fixed to a structure
  if (a.position_type === A.posLedge) return { keys: ['welcomeswallow'] }

  // 5. On or near the ground
  if (a.position_type === A.posGround) return { keys: ['yellowhammer'] }

  // 6. Small-cup visual clues
  if (a.extra_detail === A.dTiny) return { keys: ['chaffinch', 'goldfinch', 'silvereye'] }
  if (a.extra_detail === A.dLeafy) return { keys: ['goldfinch', 'chaffinch', 'silvereye'] }
  if (a.extra_detail === A.dLowShrub) return { keys: ['dunnock'] }
  if (a.extra_detail === A.dBulkySmall) return { keys: ['greenfinch', 'chaffinch', 'goldfinch'] }

  // 7. Inside appearance (original key)
  if (a.inside_visible === A.insSmallGrass) return { keys: ['silvereye'] }
  if (a.inside_visible === A.insSmallWool) return { keys: ['fantail'] }
  if (a.inside_visible === A.insLargeGrass) return { keys: ['blackbird'] }
  if (a.inside_visible === A.insLargeSmooth) return { keys: ['songthrush'] }

  // 8. Large cup high in a tree
  if (a.size_category === A.sizeLarge && a.position_type === A.posCanopy) {
    return { keys: ['magpie', 'tui', 'blackbird'] }
  }

  // 9. Position (original key)
  if (a.position_type === A.posFork) return { keys: ['silvereye'] }
  if (a.position_type === A.posBelow) return { keys: ['fantail'] }
  if (a.position_type === A.posHanging) return { keys: ['greywarbler'] }

  // 10. Medium cup
  if (a.size_category === A.sizeMedium) return { keys: ['greenfinch', 'chaffinch', 'goldfinch'] }

  return { keys: [] }
}

// ===== LOGIC END =====

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
  tui: {
    name: 'Tūī',
    clue: 'A broad, rounded twig platform with a shallow, padded centre.',
    photo: null,
  },
  magpie: {
    name: 'Australian Magpie / Makipai',
    article: 'an',
    clue: 'A substantial bowl made of chunky, visible sticks, usually up in a relatively open tree.',
    photo: null,
  },
  chaffinch: {
    name: 'Chaffinch / Pahirini',
    clue: 'A tiny, tidy cup that blends into the branch where it is built.',
    photo: null,
  },
  goldfinch: {
    name: 'European Goldfinch / Kōurarini',
    clue: 'A small, neat cup hidden among leaves or outer branches.',
    photo: null,
  },
  greenfinch: {
    name: 'European Greenfinch',
    clue: 'A fairly bulky small-to-medium open cup in a shrub or tree.',
    photo: null,
  },
  housesparrow: {
    name: 'House Sparrow / Tiu',
    clue: 'A bulky nest tucked into a cavity or roof gap; visible grass may help, but the hole alone is not proof.',
    photo: null,
  },
  welcomeswallow: {
    name: 'Welcome Swallow / Warou',
    clue: 'A little bowl fixed to a building, bridge or ledge.',
    photo: null,
  },
  myna: {
    name: 'Common Myna / Maina',
    clue: 'A hole or gap used for nesting; the nest shape is often hidden.',
    photo: null,
  },
  starling: {
    name: 'Common Starling / Tāringi',
    clue: 'A nest inside a tree hollow, box or building gap; the nest itself is usually hidden.',
    photo: null,
  },
  dunnock: {
    name: 'Dunnock',
    clue: 'A small cup nest tucked deep in a low, dense shrub.',
    photo: null,
  },
  yellowhammer: {
    name: 'Yellowhammer / Hurukōwhai',
    clue: 'A cup nest on or close to the ground. Please do not go closer to check.',
    photo: null,
  },
}

function IdentificationGuide() {
  const navigate = useNavigate()
  const [showSafety, setShowSafety] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [rejected, setRejected] = useState([])

  // Only ask the questions that apply to the answers so far
  const visibleSteps = STEPS.filter((s) => !s.showIf || s.showIf(answers))
  const step = visibleSteps[stepIndex]
  const isLastStep = stepIndex === visibleSteps.length - 1
  const hasAnswered = Boolean(step && answers[step.key])

  // Only the answers to questions that were actually shown
  const cleanAnswers = Object.fromEntries(
    visibleSteps.filter((s) => answers[s.key]).map((s) => [s.key, answers[s.key]])
  )

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
    setRejected([])
  }

  // What is shown on the result screen right now
  const result = computeResult(cleanAnswers)
  const available = result.group
    ? (rejected.length ? [] : result.keys)
    : result.keys.filter((k) => !rejected.includes(k))
  const isGroup = Boolean(result.group) && available.length > 0
  const matchKey = isGroup || available.length === 0 ? 'unknown' : available[0]
  const otherKeys = isGroup ? [] : available.slice(1)
  const isUnknown = matchKey === 'unknown' && !isGroup

  function notMyNest() {
    if (isGroup) {
      setRejected(result.keys)
    } else if (available.length > 0) {
      setRejected([...rejected, available[0]])
    }
  }

  function goToReportingForm() {
    navigate('/report', {
      state: {
        guideAnswers: {
          ...cleanAnswers,
          key_result: matchKey,
          also_possible: available.filter((k) => k !== matchKey).join(','),
          user_clicked_not_my_nest: rejected.length > 0 ? 'yes' : 'no',
          confidence_level: matchKey === 'unknown' || isGroup ? 'low' : 'medium',
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

  const noteBox = {
    background: BRAND.inputBg,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 8,
    padding: 14,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
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
    const match = SPECIES_INFO[matchKey]
    return (
      <div>
        <h1 style={{ color: BRAND.accent, fontSize: 28, margin: '0 0 20px' }}>
          {isUnknown ? 'Not sure yet' : 'Likely match result'}
        </h1>
        <div style={{ ...cardStyle, maxWidth: 620 }}>
          {isUnknown && (
            <p style={{ fontSize: 14, color: BRAND.text, lineHeight: 1.6 }}>
              No problem — nest identification can be tricky, and "unknown" is a perfectly good
              result. You can submit this as an unknown nest and upload photos for researcher review.
            </p>
          )}

          {isGroup && (
            <>
              <h2 style={{ color: BRAND.text, fontSize: 20, margin: '0 0 12px' }}>
                This may be a <span style={{ color: BRAND.accent }}>cavity-nesting bird</span>
              </h2>
              <p style={{ fontSize: 14, color: BRAND.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                Nests in holes and gaps look very alike, so we can't pick just one. It could be:
              </p>
              <ul style={{ color: BRAND.text, fontSize: 14, lineHeight: 1.8, margin: '0 0 16px', paddingLeft: 20 }}>
                {result.keys.map((k) => (
                  <li key={k}>{SPECIES_INFO[k].name}</li>
                ))}
              </ul>
              <div style={noteBox}>
                <i className="ti ti-bulb" style={{ fontSize: 16, color: BRAND.accent, marginTop: 2 }} aria-hidden="true"></i>
                <p style={{ fontSize: 13, color: BRAND.text, margin: 0, fontStyle: 'italic' }}>
                  Please don't look inside the hole. A photo of the entrance, or noting which bird uses
                  it from a distance, helps researchers.
                </p>
              </div>
            </>
          )}

          {!isUnknown && !isGroup && (
            <>
              {match.photo && (
                <img
                  src={match.photo}
                  alt={`Example ${match.name} nest`}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 20 }}
                />
              )}
              <h2 style={{ color: BRAND.text, fontSize: 20, margin: '0 0 12px' }}>
                This may be {match.article || 'a'} <span style={{ color: BRAND.accent }}>{match.name}</span> nest.
              </h2>
              <p style={{ fontSize: 14, color: BRAND.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                This is only a suggestion, based on your answers about nest shape, size, position, and
                visible features. Nest identification can be uncertain, so any submitted photos will
                be reviewed before the record is used for research.
              </p>
              <div style={noteBox}>
                <i className="ti ti-bulb" style={{ fontSize: 16, color: BRAND.accent, marginTop: 2 }} aria-hidden="true"></i>
                <p style={{ fontSize: 13, color: BRAND.text, margin: 0, fontStyle: 'italic' }}>Best public clue: {match.clue}</p>
              </div>
              {otherKeys.length > 0 && (
                <p style={{ fontSize: 13, color: BRAND.textMuted, lineHeight: 1.6, margin: '14px 0 0' }}>
                  It could also be: {otherKeys.map((k) => SPECIES_INFO[k].name).join(', ')}.
                </p>
              )}
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {!isUnknown && (
              <button onClick={notMyNest} style={secondaryButton}>
                <i className="ti ti-x" style={{ fontSize: 15 }} aria-hidden="true"></i>
                That's not my nest
              </button>
            )}
            <button onClick={resetGuide} style={secondaryButton}>
              <i className="ti ti-refresh" style={{ fontSize: 15 }} aria-hidden="true"></i>
              Start again
            </button>
            <button className="nq-button" onClick={goToReportingForm} style={primaryButton(false)}>
              <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true"></i>
              Submit a report
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
          Step {stepIndex + 1} of {visibleSteps.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {visibleSteps.map((s, i) => (
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