import { useEffect } from 'react'
import './black-friday/theme.css'
import './black-friday/styles/global.css'
import { ACADEMY } from './black-friday/data/academy'
import Hero from './black-friday/components/Hero'
import GiftGame from './black-friday/components/game/GiftGame'
import Faq from './black-friday/components/Faq'

const TITLE = `Black Friday · ${ACADEMY.name}`
const DESCRIPTION =
  `Brazilian Jiu-Jitsu in ${ACADEMY.city}. Answer two quick questions and unlock your Black Friday gift. Kids ${ACADEMY.kidsMin}+ and adults, no experience needed.`

// Black Friday 2026 campaign LP (PRD-GBCBF-001). Every style lives under the
// .bf26 root so nothing bleeds into the main landing page.
export default function BlackFridayPage() {
  useEffect(() => {
    const prevTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const prevDesc = meta?.content
    const prevBg = document.body.style.backgroundColor

    document.title = TITLE
    if (meta) meta.content = DESCRIPTION
    // Overscroll and the area under the page stay black, not the site's white.
    document.body.style.backgroundColor = '#000'

    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== undefined) meta.content = prevDesc
      document.body.style.backgroundColor = prevBg
    }
  }, [])

  return (
    <div className="bf26">
      <main>
        <Hero />
        <GiftGame />
        <Faq />
      </main>
    </div>
  )
}
