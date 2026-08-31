import { useNavigate } from 'react-router-dom'

function Confirmation() {
  const navigate = useNavigate()

  return (
    <div>
      <h2>Thank you — your report has been submitted.</h2>
      <p>A researcher will review your submission.</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  )
}

export default Confirmation