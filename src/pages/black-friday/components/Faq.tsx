import { ACADEMY, IMAGES } from '@/pages/black-friday/data/campaign'
import { FAQ } from '@/pages/black-friday/data/faq'
import './faq.css'

// Native <details> accordion: works without JS and with the keyboard; the
// open/close height animates in browsers that support ::details-content.
export default function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap faq-col">
        <header className="faq-head">
          <p className="eyebrow faq-eyebrow">FAQ</p>
          <h2 id="faq-title">Before you open your gift</h2>
          <p className="faq-sub">Quick answers about the Black Friday gift and your first class.</p>
        </header>

        <div className="faq-list">
          {FAQ.map((item, i) => (
            <details key={item.q} className="faq-item" name="faq" open={i === 0}>
              <summary>
                <span className="faq-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q">{item.q}</span>
                <span className="faq-toggle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="faq-contact">
          <div>
            <p className="faq-contact-title">Still have a question?</p>
            <p className="faq-contact-sub">Talk to a real person at the academy.</p>
          </div>
          <a className="faq-call" href={ACADEMY.phoneHref}>
            <span className="faq-call-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </span>
            {ACADEMY.phone}
          </a>
        </div>
      </div>

      {/* The page ends on the map: where the academy is, full width. */}
      <div className="faq-map">
        <iframe
          title={`${ACADEMY.name} on Google Maps`}
          src={ACADEMY.mapsEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="faq-map-shade" aria-hidden="true" />
        <span className="faq-map-pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
        </span>
        <div className="wrap faq-map-inner">
          <div className="faq-map-card">
            <p className="eyebrow faq-map-eyebrow">Find us</p>
            <img className="faq-map-logo" src={IMAGES.logo.src} alt={ACADEMY.name} width={IMAGES.logo.width} height={IMAGES.logo.height} />
            <p className="faq-map-addr">
              {ACADEMY.address}
              <br />
              {ACADEMY.plaza}
            </p>
            <a className="faq-map-btn" href={ACADEMY.mapsLink} target="_blank" rel="noopener">
              Get directions
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
