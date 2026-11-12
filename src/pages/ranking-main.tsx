import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ranking/ranking.css'
import RankingPage from './RankingPage'

/* Entry of /ranking (ranking/index.html). Its own entry, like /referral: nothing here reaches the main
   page's bundle. No prerender: the board is live data, and the page is noindex. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RankingPage />
  </StrictMode>
)
