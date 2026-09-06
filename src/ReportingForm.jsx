import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { publicApi } from './api/client.js'

function ReportingForm() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const guideAnswers = state?.guideAnswers || {}

  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      ...guideAnswers,
      notes,
      contact_email: email || null,
      location: {
        exact_latitude: -36.8485,
        exact_longitude: 174.7633,
      },
    }

    console.log('Submitting:', payload)

    try {
      const response = await publicApi.submitReport(payload)
      console.log('Submit response:', response)
      navigate('/confirmation')
    } catch (err) {
      console.error('Submit failed:', err)
      setError(`Could not submit report: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2>Report a Nest</h2>
      <p>Shape: {guideAnswers.nest_shape}</p>
      <p>Position: {guideAnswers.position_type}</p>

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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default ReportingForm