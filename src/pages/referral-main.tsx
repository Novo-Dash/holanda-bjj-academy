import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './referral/referral-tw.css'
import { captureAttribution } from '@/nd/attribution'
import ReferralPage from './ReferralPage'

/* Entry of /referral (referral/index.html). Its own entry, like /kids and /black-friday: the main
   page's bundle does not grow because of it. It does take the main page's stylesheet (tokens, the two
   fonts, Tailwind) on purpose, because the page is built from the main page's own parts. No
   BookingProvider here (no booking on this page), so the first-touch UTMs and click ids are captured
   at boot; the tags come from the nd:tracking block in the HTML head. */
captureAttribution()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReferralPage />
  </StrictMode>
)
