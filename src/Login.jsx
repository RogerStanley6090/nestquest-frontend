import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { researcherApi } from './api/client.js'

const BRAND = {
  page: '#0F2818',
  card: '#173722',
  border: '#234A2E',
  text: '#F5EFD9',
  textMuted: '#8A9483',
  accent: '#93BB4A',
  danger: '#E4685A',
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const response = await researcherApi.login(username, password)

      const token =
        response.token ||
        response.key ||
        response.access

      if (!token) {
        throw new Error('No authentication token was returned.')
      }

      localStorage.setItem('nq_auth_token', token)

      navigate(from, { replace: true })
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#0F2818',
    border: `1px solid ${BRAND.border}`,
    color: BRAND.text,
    borderRadius: 8,
    padding: '11px 12px',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    color: BRAND.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 7,
  }

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: BRAND.card,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 14,
          padding: 32,
          boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#0F2818',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: `1px solid ${BRAND.border}`,
            }}
          >
            <i
              className="ti ti-user-shield"
              style={{ fontSize: 24, color: BRAND.accent }}
              aria-hidden="true"
            />
          </div>

          <h1
            style={{
              color: BRAND.accent,
              fontSize: 26,
              margin: '0 0 8px',
            }}
          >
            Researcher Login
          </h1>

          <p
            style={{
              color: BRAND.textMuted,
              fontSize: 13,
              margin: 0,
            }}
          >
            Sign in to access the NestQuest researcher dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Password
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  ...inputStyle,
                  paddingRight: 44,
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: BRAND.textMuted,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <i
                  className={
                    showPassword
                      ? 'ti ti-eye-off'
                      : 'ti ti-eye'
                  }
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(228,104,90,0.12)',
                border: '1px solid rgba(228,104,90,0.35)',
                color: BRAND.danger,
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? '#6E8A5E'
                : BRAND.accent,
              color: '#0F2818',
              border: 'none',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading
                ? 'default'
                : 'pointer',
            }}
          >
            {loading
              ? 'Logging in...'
              : 'Log in'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          <Link
            to="/"
            style={{
              color: BRAND.textMuted,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login