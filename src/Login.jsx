import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { researcherApi } from './api/client.js'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await researcherApi.login(email, password)
      console.log('Login response:', response) // temporary, so we can see the real shape
      const token = response.token || response.key || response.access
      if (!token) {
        throw new Error('Login succeeded but no token found in response — check console log above')
      }
      localStorage.setItem('nq_auth_token', token)
      navigate('/dashboard')
    } catch (err) {
      setError(`Login failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Researcher / Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
        <div>
          <label>Username or Email</label>
          <br />
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export default Login