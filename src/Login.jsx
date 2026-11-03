import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { researcherApi } from './api/client.js'

const BRAND = {
  page: '#0F2818',
  card: '#173722',
  border: '#2D5A3A',
  text: '#F5EFD9',
  textMuted: '#A3AD9B',
  accent: '#93BB4A',
  danger: '#F08A7E',
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
    padding: '12px 14px',
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }

  const labelStyle = {
    display: 'block',
    color: BRAND.textMuted,
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    marginBottom: 8,
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
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 12px 40px rgba(0,0,0,0.32)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#0F2818',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: `1px solid ${BRAND.border}`,
              boxShadow: '0 0 0 6px rgba(147,187,74,0.06)',
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
              fontSize: 28,
              margin: '0 0 8px',
            }}
          >
            Researcher Login
          </h1>

          <p
            style={{
              color: BRAND.textMuted,
              fontSize: 14,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Sign in to access the NestQuest researcher dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} aria-busy={loading}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="login-username" style={labelStyle}>
              Username
            </label>

            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="login-password" style={labelStyle}>
              Password
            </label>

            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  ...inputStyle,
                  paddingRight: 48,
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
                aria-pressed={showPassword}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: BRAND.textMuted,
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                  lineHeight: 0,
                }}
              >
                <i
                  className={
                    showPassword
                      ? 'ti ti-eye-off'
                      : 'ti ti-eye'
                  }
                  style={{ fontSize: 20 }}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(228,104,90,0.12)',
                border: '1px solid rgba(228,104,90,0.4)',
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
            className="nq-btn nq-btn-primary"
            style={{
              width: '100%',
              background: loading
                ? '#6E8A5E'
                : BRAND.accent,
              color: '#0F2818',
              border: 'none',
              borderRadius: 999,
              padding: '14px 16px',
            }}
          >
            {loading
              ? 'Logging in...'
              : 'Log in'}
          </button>

          {loading && (
            <p
              role="status"
              style={{
                color: BRAND.textMuted,
                fontSize: 12,
                lineHeight: 1.5,
                textAlign: 'center',
                margin: '12px 0 0',
              }}
            >
              The first sign-in can take up to a minute while the server wakes up.
            </p>
          )}
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: 22,
          }}
        >
          <Link
            to="/"
            className="nq-link-muted"
            style={{
              color: BRAND.textMuted,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
          <p
            style={{
              color: BRAND.textMuted,
              fontSize: 12,
              margin: '14px 0 0',
            }}
          >
            Researcher access only.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login