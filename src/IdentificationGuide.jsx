import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { key: 'shape', question: 'What shape is the nest?', options: ['Cup', 'Dome', 'Platform', 'Cavity'] },
  { key: 'placement', question: 'Where is it built?', options: ['In a tree/shrub', 'On the ground', 'In a cavity/hole'] },
]

function IdentificationGuide() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const hasAnswered = Boolean(answers[step.key])

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
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  function goToReportingForm() {
    navigate('/report', { state: { guideAnswers: answers } })
  }

  if (showResult) {
    return (
      <div>
        <h2>Likely match: Fantail</h2>
        <p>Based on your answers. A researcher will confirm this after you submit.</p>
        <button onClick={() => { setShowResult(false); setStepIndex(0); }}>
          That's not my nest
        </button>
        <br />
        <button onClick={goToReportingForm}>Continue to report</button>
      </div>
    )
  }

  return (
    <div>
      <p>Step {stepIndex + 1} of {STEPS.length}</p>
      <h2>{step.question}</h2>
      {step.options.map((option) => (
        <button key={option} onClick={() => selectOption(option)}>
          {option} {answers[step.key] === option ? '✓' : ''}
        </button>
      ))}
      <br />
      <button onClick={goBack} disabled={stepIndex === 0}>Back</button>
      <button onClick={goNext} disabled={!hasAnswered}>
        {isLastStep ? 'See likely match' : 'Next'}
      </button>
    </div>
  )
}

export default IdentificationGuide