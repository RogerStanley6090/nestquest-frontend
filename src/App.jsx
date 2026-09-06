import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home.jsx'
import IdentificationGuide from './IdentificationGuide.jsx'
import ReportingForm from './ReportingForm.jsx'
import Confirmation from './Confirmation.jsx'
import PublicMap from './PublicMap.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import ReportDetail from './ReportDetail.jsx'

function App() {
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
          <Link to="/login">Login</Link>
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/report/:id" element={<ReportDetail />} />
      </Routes>
    </div>
  )
}

export default App