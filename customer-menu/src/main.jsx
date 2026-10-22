import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OwnerDashboard from './components/OwnerDashboard.jsx'
import TableQrCodes from './components/TableQrCodes.jsx'

function Root() {
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('qr')) {
      // Immediately wipe ?qr from the browser address bar for security and privacy
      try {
        window.history.replaceState(null, '', window.location.pathname)
      } catch {}
      return 'qr'
    }
    if (params.has('owner')) {
      // Immediately wipe ?owner from the browser address bar for security and privacy
      try {
        window.history.replaceState(null, '', window.location.pathname)
      } catch {}
      return 'owner'
    }
    return 'app'
  })

  if (view === 'qr') {
    return <TableQrCodes onClose={() => setView('owner')} />
  }

  if (view === 'owner') {
    return (
      <OwnerDashboard
        onOpenQr={() => setView('qr')}
        onExit={() => setView('app')}
      />
    )
  }

  return <App onOpenOwner={() => setView('owner')} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
