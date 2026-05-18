import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OrbitalChoreScheduler from './OrbitalChoreScheduler'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OrbitalChoreScheduler />
  </StrictMode>,
)
