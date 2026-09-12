import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './Home.jsx'
import IdentificationGuide from './IdentificationGuide.jsx'
import ReportingForm from './ReportingForm.jsx'
import Confirmation from './Confirmation.jsx'
import PublicMap from './PublicMap.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import ReportDetail from './ReportDetail.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

function App() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('nq_auth_token'))

  function handleLogout() {
    localStorage.removeItem('nq_auth_token')
    navigate('/')
  }

  return (
    <div>
      <header>
        <h1>NestQuest</h1>
        <nav>
          <Link to="/">Home</Link>
          {' | '}
          <Link to="/guide">Guide</Link>
          {' | '}
          <Link to="/map">Map</Link>
          {' | '}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
          {' | '}
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guide" element={<IdentificationGuide />} />
        <Route path="/report" element={<ReportingForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/map" element={<PublicMap />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/report/:id"
          element={
            <ProtectedRoute>
              <ReportDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App