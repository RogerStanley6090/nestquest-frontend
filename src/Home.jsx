import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <p>Help protect NZ's birds — report a nest sighting.</p>
      <Link to="/guide">Report a nest</Link>
    </div>
  )
}

export default Home