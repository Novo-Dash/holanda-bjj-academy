import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ACADEMY, IMAGES, KID_AGES, PRIZES, pickPrize, type Answer, type Exp, type KidAge, type Who } from '@/pages/black-friday/data/campaign'
import { clearReservation, loadReservation, saveReservation } from '@/pages/black-friday/lib/reservation'
import BeltArt from './BeltArt'
import GiftBox from './GiftBox'
import Reveal from './Reveal'
import StepTimeline from './StepTimeline'
import './game.css'

type Step = 'who' | 'exp' | 'gift' | 'reveal'

const WHO_OPTIONS: { v: Who; label: string; sub: string; img: string; pos: string }[] = [
  { v: 'me', label: 'Me', sub: `Adult classes, ${ACADEMY.adultsAge}`, img: IMAGES.me.src, pos: IMAGES.me.position },
  { v: 'kid', label: 'My kid', sub: `Kids ${ACADEMY.kidsAges}`, img: IMAGES.kid.src, pos: IMAGES.kid.position },
  { v: 'both', label: 'Both of us', sub: 'Train as a family', img: IMAGES.both.src, pos: IMAGES.both.position },
]

// Question 2: an adult says how much they trained (it picks the gift and the level);
// for a kid the age matters, because it is what picks the class.
const Q2: Record<Who, string> = {
  me: 'Have you trained Jiu-Jitsu before?',
  kid: 'How old is your kid?',
  both: 'How old is your kid?',
}

const EXP_OPTIONS: { v: Exp; label: string; sub: string }[] = [
  { v: 'never', label: 'Never', sub: 'Fresh white belt. We start from zero.' },
  { v: 'little', label: 'A few classes', sub: 'Tried it. Ready for more.' },
  { v: 'back', label: 'Yes, coming back', sub: 'Time to dust off the gi.' },
]

// Cards lean toward the cursor and catch a glare where it points (mouse only).
function tiltMove(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`)
  el.style.setProperty('--rx', `${(0.5 - y) * 9}deg`)
  el.style.setProperty('--mx', `${x * 100}%`)
  el.style.setProperty('--my', `${y * 100}%`)
}

function tiltLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

const BELT_GLOW: Record<Exp, string> = {
  never: 'rgba(255,255,255,.22)',
  little: 'rgba(255,255,255,.22)',
  back: 'rgba(70,120,255,.4)',
}

function beltFor(v: Exp) {
  if (v === 'never') return { belt: '#f1eee8', stripes: 0 }
  if (v === 'little') return { belt: '#f1eee8', stripes: 2 }
  return { belt: '#2453b8', stripes: 1 }
}

const AGE_GLOW = 'rgba(255,255,255,.18)'
const ageLabel = (v: KidAge) => `${v.replace('-', '–')} years`

gsap.registerPlugin(ScrollTrigger, useGSAP)

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Test mode (dev server, or ?test on any URL): every load starts at question 1
// and the confirmation offers a restart. Visitors never see it.
const TEST_MODE = import.meta.env.DEV || new URLSearchParams(window.location.search).has('test')

export default function GiftGame() {
  // A returning visitor gets the same gift and the same deadline back, never a re-roll.
  const [initial] = useState(() => {
    if (TEST_MODE || new URLSearchParams(window.location.search).has('reset')) clearReservation()
    return loadReservation()
  })
  const [reservation, setReservation] = useState(initial)
  const [who, setWho] = useState<Who | null>(initial?.who ?? null)
  const [answer, setAnswer] = useState<Answer | null>(initial?.answer ?? null)
  const [step, setStep] = useState<Step>(initial ? 'reveal' : 'who')
  const [picked, setPicked] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const interacted = useRef(false)
  const arenaRef = useRef<HTMLDivElement>(null)

  // Like Water opening: the arena enters as an inset rounded card and opens to
  // full-bleed as it scrolls up. Scrubbed, no pin (the game changes height).
  useGSAP(
    () => {
      if (reduced()) return
      const scrollTrigger = { trigger: arenaRef.current, start: 'top 92%', end: 'top 8%', scrub: 0.7 }
      gsap.fromTo(arenaRef.current, { '--k': 1 }, { '--k': 0, ease: 'power2.in', scrollTrigger })
      gsap.fromTo('.arena-bg', { scale: 1.12 }, { scale: 1, ease: 'power2.out', scrollTrigger })
      gsap.fromTo(
        '.game-head > *',
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { ...scrollTrigger, start: 'top 80%', end: 'top 25%' } },
      )
    },
    { scope: arenaRef },
  )

  useEffect(() => {
    if (interacted.current) headingRef.current?.focus({ preventScroll: true })
  }, [step])

  function choose<T extends string>(v: T, set: (v: T) => void, next: Step) {
    if (picked) return
    interacted.current = true
    setPicked(v)
    set(v)
    window.setTimeout(() => {
      setPicked(null)
      setStep(next)
    }, reduced() ? 80 : 520)
  }

  function handleOpened() {
    if (!who || !answer) return
    const r = reservation ?? saveReservation({ prize: pickPrize(who, answer).key, who, answer })
    setReservation(r)
    setStep('reveal')
  }

  function playAgain() {
    clearReservation()
    setReservation(null)
    setWho(null)
    setAnswer(null)
    interacted.current = true
    setStep('who')
  }

  const stripes = step === 'who' ? (picked ? 1 : 0) : step === 'exp' ? (picked ? 2 : 1) : 2
  const unlocked = step === 'reveal'
  const status =
    step === 'who' ? 'Question 1 of 2' : step === 'exp' ? 'Question 2 of 2' : step === 'gift' ? 'Your gift is ready to open' : 'Gift unlocked'

  return (
    <section className="game" id="game" aria-labelledby="game-title">
      <div className={`arena arena--${step}`} ref={arenaRef}>
        <div className="arena-bg" aria-hidden="true" />
        <div className="wrap arena-inner">
          <div className="game-head">
            <p className="eyebrow game-eyebrow">Black Friday gift</p>
            <h2 id="game-title">
              <span>Unlock your</span> <span>Black Friday gift</span>
            </h2>
            <p className="game-sub">
              Two questions. Your gift is matched to who's training, not left to luck.
            </p>
          </div>
          <StepTimeline
            done={unlocked ? 3 : stripes}
            current={step === 'who' ? 0 : step === 'exp' ? 1 : 2}
            count={unlocked ? 'Gift unlocked' : step === 'gift' ? 'Open your gift' : `${stripes} of 2 stripes`}
          />
          <p className="sr-only" aria-live="polite">{status}</p>

          {step === 'who' && (
            <div className="step" key="who">
              <div className="step-head">
                <p className="step-count">Question 1 of 2</p>
                <h3 className="step-q" ref={headingRef} tabIndex={-1}>
                  Who's stepping on the mat?
                </h3>
                <StepHint>Tap a photo to choose</StepHint>
              </div>
              <div className={`who-grid${picked ? ' has-pick' : ''}`}>
                {WHO_OPTIONS.map((o, i) => (
                  <button
                    key={o.v}
                    type="button"
                    className={`opt who-card${picked === o.v ? ' is-picked' : ''}`}
                    aria-pressed={who === o.v}
                    style={{ '--i': i } as CSSProperties}
                    onClick={() => choose(o.v, setWho, 'exp')}
                    onPointerMove={tiltMove}
                    onPointerLeave={tiltLeave}
                  >
                    <span className="who-media">
                      <img src={o.img} alt="" loading="lazy" decoding="async" style={{ objectPosition: o.pos }} />
                    </span>
                    <span className="opt-num" aria-hidden="true">0{i + 1}</span>
                    <span className="who-text">
                      <span className="opt-label">{o.label}</span>
                      <span className="opt-sub">{o.sub}</span>
                      <Cta />
                    </span>
                    <Check />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'exp' && who && (
            <div className="step" key="exp">
              <div className="step-head">
                <p className="step-count">Question 2 of 2</p>
                <h3 className="step-q" ref={headingRef} tabIndex={-1}>
                  {Q2[who]}
                </h3>
                <StepHint>Tap one to continue</StepHint>
                <button type="button" className="step-back" onClick={() => setStep('who')}>
                  ← Change my first answer
                </button>
              </div>
              {who === 'me' ? (
              <div className={`exp-grid${picked ? ' has-pick' : ''}`}>
                {EXP_OPTIONS.map((o, i) => (
                  <button
                    key={o.v}
                    type="button"
                    className={`opt exp-card${picked === o.v ? ' is-picked' : ''}`}
                    aria-pressed={answer === o.v}
                    style={{ '--i': i, '--glow': BELT_GLOW[o.v] } as CSSProperties}
                    onClick={() => choose<Answer>(o.v, setAnswer, 'gift')}
                    onPointerMove={tiltMove}
                    onPointerLeave={tiltLeave}
                  >
                    <span className="exp-art">
                      <BeltArt {...beltFor(o.v)} />
                    </span>
                    <span className="exp-text">
                      <span className="opt-label">{o.label}</span>
                      <span className="opt-sub">{o.sub}</span>
                      <Cta />
                    </span>
                    <Check />
                  </button>
                ))}
              </div>
              ) : (
              <div className={`exp-grid age-grid${picked ? ' has-pick' : ''}`} style={{ '--ages': KID_AGES.length } as CSSProperties}>
                {KID_AGES.map((o, i) => (
                  <button
                    key={o.v}
                    type="button"
                    className={`opt exp-card age-card${picked === o.v ? ' is-picked' : ''}`}
                    aria-pressed={answer === o.v}
                    aria-label={`${o.label} years old, ${o.sub}`}
                    style={{ '--i': i, '--glow': AGE_GLOW } as CSSProperties}
                    onClick={() => choose<Answer>(o.v, setAnswer, 'gift')}
                    onPointerMove={tiltMove}
                    onPointerLeave={tiltLeave}
                  >
                    <span className="exp-art age-art" aria-hidden="true">
                      <b>{o.label}</b>
                      <small>years old</small>
                    </span>
                    <span className="exp-text">
                      <span className="opt-label">{ageLabel(o.v)}</span>
                      <span className="opt-sub">{o.sub} class</span>
                      <Cta />
                    </span>
                    <Check />
                  </button>
                ))}
              </div>
              )}
            </div>
          )}

          {step === 'gift' && who && answer && (
            <div className="step step-gift" key="gift">
              <div className="step-head">
                <p className="step-count">Both stripes earned</p>
                <h3 className="step-q" ref={headingRef} tabIndex={-1}>
                  Your gift is tied and ready
                </h3>
              </div>
              <GiftBox prize={pickPrize(who, answer)} onOpened={handleOpened} />
            </div>
          )}

          {step === 'reveal' && reservation && (
            <Reveal
              key="reveal"
              prize={PRIZES[reservation.prize]}
              reservation={reservation}
              headingRef={headingRef}
            />
          )}

          {step === 'reveal' && TEST_MODE && (
            <div className="test-actions">
              <button type="button" className="btn" onClick={playAgain}>
                Começar de novo (teste)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StepHint({ children }: { children: string }) {
  return (
    <p className="step-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V8a1.5 1.5 0 0 1 3 0v2m0-.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L4 14.5a1.5 1.5 0 0 1 2.3-1.9L9 15" />
      </svg>
      {children}
    </p>
  )
}

// Always-visible button on every option, so nobody wonders whether the card is clickable.
function Cta() {
  return (
    <span className="opt-cta" aria-hidden="true">
      <span className="opt-cta-text">Choose</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  )
}

function Check() {
  return (
    <span className="opt-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}
