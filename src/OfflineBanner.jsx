import { useEffect, useState } from 'react'

// Small banner that appears when the phone/laptop loses internet,
// and briefly says "Back online" when it returns.
function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [justBack, setJustBack] = useState(false)

  useEffect(() => {
    let timer
    function goOffline() {
      clearTimeout(timer)
      setJustBack(false)
      setOnline(false)
    }
    function goOnline() {
      setOnline(true)
      setJustBack(true)
      timer = setTimeout(() => setJustBack(false), 3000)
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (online && !justBack) return null

  return (
    <div className={`nq-offline ${online ? 'nq-offline-ok' : ''}`} role="status" aria-live="polite">
      <i className={`ti ${online ? 'ti-wifi' : 'ti-wifi-off'}`} aria-hidden="true" />
      {online
        ? 'Back online. You can keep going.'
        : "You're offline. You can keep browsing, but reports can't be sent until you're back online."}
    </div>
  )
}

export default OfflineBanner