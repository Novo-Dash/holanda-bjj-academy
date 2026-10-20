import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { captureAttribution } from '@/nd/attribution'
import BlackFridayPage from './BlackFridayPage'

/* Entry of /black-friday (black-friday/index.html). The page has no
   BookingProvider (the booking is inline, after the claim), so the first-touch
   UTMs and click ids are captured here at boot, as on the model's main.tsx.
   The tags themselves come from the nd:tracking block in the HTML head. */
captureAttribution()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlackFridayPage />
  </StrictMode>
)
