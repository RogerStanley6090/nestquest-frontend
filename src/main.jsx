import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import './index.css'
import './polish.css'
import './leafletIconFix.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <OfflineBanner />
    </BrowserRouter>
  </React.StrictMode>
)