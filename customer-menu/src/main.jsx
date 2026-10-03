import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OwnerDashboard from './components/OwnerDashboard.jsx'
import TableQrCodes from './components/TableQrCodes.jsx'

const searchParams = new URLSearchParams(window.location.search)
const isOwnerView = searchParams.has('owner')
const isQrView = searchParams.has('qr')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isQrView ? <TableQrCodes /> : isOwnerView ? <OwnerDashboard /> : <App />}
  </StrictMode>,
)
