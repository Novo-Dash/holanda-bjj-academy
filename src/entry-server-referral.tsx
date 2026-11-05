import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import ReferralPage from './pages/ReferralPage'

/**
 * Prerender of /referral (scripts/prerender-referral.mjs), for the same reasons as the `/` one
 * (src/entry-server.tsx): crawlers and link-preview scrapers do not run JavaScript, and the page paints
 * before its bundle arrives. The tree is the SAME as src/pages/referral-main.tsx, so hydrateRoot matches.
 */
export async function render() {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <ReferralPage />
    </StrictMode>
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return html
}
