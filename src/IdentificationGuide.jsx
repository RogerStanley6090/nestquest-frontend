import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import silvereyePhoto from './assets/birds/silvereye.jpg'
import fantailPhoto from './assets/birds/fantail.jpg'
import greywarblerPhoto from './assets/birds/greywarbler.jpg'
import blackbirdPhoto from './assets/birds/blackbird.jpg'
import songthrushPhoto from './assets/birds/songthrush.jpg'

// Based on the updated NestQuest Bird Nest Information packet (Rachel, sponsor)

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

  if (showSafety) {
    return (
      <div>
        <h2>Before you begin</h2>
        <p>{SAFETY_MESSAGE}</p>
        <button onClick={() => setShowSafety(false)}>I understand — continue</button>
      </div>
    )
  }

  if (showResult) {
    const matchKey = computeLikelyMatch(answers)
    const match = SPECIES_INFO[matchKey]
    const isUnknown = matchKey === 'unknown'
    return (
      <div>
        <h2>{isUnknown ? "That's not my nest result" : 'Likely match result'}</h2>
        {isUnknown ? (
          <p>
            No problem — nest identification can be tricky. You can submit this as an unknown
            nest and upload photos for researcher review.
          </p>
        ) : (
          <>
            <h3>Your likely match is: {match.name}</h3>
            {match.photo && (
              <img
                src={match.photo}
                alt={`Example ${match.name} nest`}
                style={{ maxWidth: 320, width: '100%', borderRadius: 8, display: 'block', margin: '10px 0' }}
              />
            )}
            <p>
              This result is based on your answers about nest shape, size, position, and visible
              features. Nest identification can still be uncertain, so any submitted photos will
              be reviewed before the record is used for research.
            </p>
            <p style={{ fontStyle: 'italic' }}>Best public clue: {match.clue}</p>
          </>
        )}
        <button onClick={resetGuide}>That's not my nest / Start again</button>
        <br />
        <button onClick={goToReportingForm}>Submit this nest report</button>
      </div>
    )
  }

  return (
    <div>
      <p>
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <h2>{step.question}</h2>
      {step.options.map((option) => (
        <button key={option} onClick={() => selectOption(option)}>
          {option} {answers[step.key] === option ? '✓' : ''}
        </button>
      ))}
      <br />
      <button onClick={goBack} disabled={stepIndex === 0}>
        Back
      </button>
      <button onClick={goNext} disabled={!hasAnswered}>
        {isLastStep ? 'See likely match' : 'Next'}
      </button>
    </div>
  )
}

export default IdentificationGuide