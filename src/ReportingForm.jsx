import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function ReportingForm() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const guideAnswers = state?.guideAnswers || {}

  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Submitting:', { ...guideAnswers, notes, email })
    navigate('/confirmation')
  }

  return (
    <div>
      <h2>Report a Nest</h2>
      <p>Shape: {guideAnswers.shape}</p>
      <p>Placement: {guideAnswers.placement}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Notes (optional)</label>
          <br />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <label>Contact email (optional)</label>
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default ReportingForm