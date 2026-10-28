import type { CSSProperties } from 'react'
import { ACADEMY, IMAGES, TRIAL, VSL } from '@/pages/black-friday/data/campaign'
import Vsl from './Vsl'
import './hero.css'

export default function Hero() {
  return (
    <header className="hero">
      <div
        className="hero-bg"
        aria-hidden="true"
        style={{ '--hero-pos': IMAGES.hero.position, '--hero-pos-m': IMAGES.hero.positionMobile } as CSSProperties}
      >
        <img src={IMAGES.hero.src} alt="" fetchPriority="high" decoding="async" />
      </div>

      <div className="wrap hero-top">
        <a className="hero-brand" href="/">
          <img src={IMAGES.logo.src} alt={ACADEMY.name} width={IMAGES.logo.width} height={IMAGES.logo.height} />
        </a>
        <a className="hero-phone" href={ACADEMY.phoneHref}>
          <span className="hero-phone-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
          </span>
          {ACADEMY.phone}
        </a>
      </div>

      <div className={VSL.src ? 'wrap hero-grid' : 'wrap hero-grid hero-grid--solo'}>
        <div className="hero-copy">
          <h1 className="hero-title">
            <span>Black{' '}</span>
            <span className="belt-line hero-belt" aria-hidden="true" />
            <span>Friday</span>
          </h1>
          <p className="hero-lead">
            This year the deal is a gift. Answer two quick questions and untie the
            Jiu-Jitsu gift picked for you. Kids {ACADEMY.kidsMin}+ and adults, no
            experience needed.
          </p>
          <p className="hero-terms">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </svg>
            <span>
              Valid when you enroll. Starts with a {TRIAL.label}.
            </span>
          </p>
          <div className="hero-actions">
            <a href="#game" className="btn">
              Unlock my gift
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <p className="hero-rating">
              <span className="hero-stars" aria-hidden="true">★★★★★</span>
              <span>
                <b>{ACADEMY.googleRating}</b> on Google · {ACADEMY.googleReviews} reviews
              </span>
            </p>
          </div>
        </div>

        <Vsl />
      </div>
    </header>
  )
}
