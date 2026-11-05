import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './referral/referral-tw.css'
import { captureAttribution } from '@/nd/attribution'
import ReferralPage from './ReferralPage'

/* Entry of /referral (referral/index.html). Its own entry, like /kids and /black-friday: the main
   page's bundle does not grow because of it. It does take the main page's stylesheet (tokens, the two
   fonts, Tailwind) on purpose, because the page is built from the main page's own parts. No
   BookingProvider here (no booking on this page), so the first-touch UTMs and click ids are captured
   at boot; the tags come from the nd:tracking block in the HTML head. */
captureAttribution()

// Prerendered at build time (scripts/prerender-referral.mjs): hydrate it. Plain render only when the
// root comes empty (the dev server).
const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <ReferralPage />
  </StrictMode>
)
// With reduced motion the tree renders fresh, as on the main page: the prerendered Reveal blocks carry
// their hidden start.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (root.firstElementChild && !reduce) hydrateRoot(root, app)
else createRoot(root).render(app)
