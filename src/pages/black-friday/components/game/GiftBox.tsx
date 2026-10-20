import { useRef, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Prize } from '@/pages/black-friday/data/campaign'
import './giftbox.css'

gsap.registerPlugin(useGSAP)

interface Props {
  prize: Prize
  onOpened: () => void
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const SIDES = ['front', 'back', 'left', 'right'] as const

// A red gift box tied with white satin ribbon and a bow. Opening it pulls the bow
// apart, slides the ribbon off, lifts the lid and lets the prize rise on its own light.
export default function GiftBox({ prize, onOpened }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const opening = useRef(false)

  const { contextSafe } = useGSAP(
    () => {
      if (reduced()) return
      gsap.to('.gb-float, .gb-knot-float', { y: -12, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.gb-shadow', { scaleX: 0.84, opacity: 0.5, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.fromTo('.gb-spin', { rotationY: -41 }, { rotationY: -29, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      // Every few seconds the knot gets a little tug: an invitation, not a flashing light.
      gsap
        .timeline({ repeat: -1, repeatDelay: 2.6, delay: 1.4 })
        .to('.gb-knot-svg', { rotation: -5, scale: 1.05, duration: 0.14, ease: 'power2.out' })
        .to('.gb-knot-svg', { rotation: 4, duration: 0.14 })
        .to('.gb-knot-svg', { rotation: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
    },
    { scope: root },
  )

  // eslint-disable-next-line react-hooks/refs -- contextSafe wraps an event handler; refs are read on interaction, not during render
  const onMove = contextSafe((e: PointerEvent) => {
    if (opening.current || e.pointerType !== 'mouse' || reduced() || !root.current) return
    const r = root.current.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    gsap.to('.gb-tilt', { rotationY: dx * 18, rotationX: -dy * 10, duration: 0.9, ease: 'power3.out' })
    gsap.to('.gb-knot-pos', { x: dx * 14, duration: 0.9, ease: 'power3.out' })
  })

  // eslint-disable-next-line react-hooks/refs -- contextSafe wraps an event handler; refs are read on interaction, not during render
  const onLeave = contextSafe(() => {
    if (opening.current) return
    gsap.to('.gb-tilt', { rotationY: 0, rotationX: 0, duration: 1.2, ease: 'power3.out' })
    gsap.to('.gb-knot-pos', { x: 0, duration: 1.2, ease: 'power3.out' })
  })

  // eslint-disable-next-line react-hooks/refs -- contextSafe wraps an event handler; refs are read on interaction, not during render
  const open = contextSafe(() => {
    if (opening.current) return
    opening.current = true
    root.current?.classList.add('is-opening')
    if (reduced()) {
      onOpened()
      return
    }

    gsap.killTweensOf('.gb-float, .gb-knot-float, .gb-shadow, .gb-spin, .gb-knot-svg')
    const tl = gsap.timeline({ onComplete: onOpened })

    tl.to('.gb-tilt', { rotationX: 0, rotationY: 0, duration: 0.4, ease: 'power2.out' }, 0)
      .to('.gb-knot-pos', { x: 0, duration: 0.4 }, 0)
      .to('.gb-float, .gb-knot-float', { y: 0, duration: 0.4, ease: 'power2.out' }, 0)
      .to('.gb-spin', { rotationY: -35, duration: 0.5, ease: 'power2.out' }, 0)

      // The tug, then the knot gives.
      .to('.gb-knot-svg', { scale: 0.9, duration: 0.12, ease: 'power2.in' }, 0.05)
      .to('.gb-knot-svg', { scale: 1.1, duration: 0.18, ease: 'power2.out' })
      .to('.gb-loop-l', { rotation: -50, x: -70, y: -30, opacity: 0, duration: 0.6, ease: 'power2.in', transformOrigin: '100% 70%' }, '>-0.04')
      .to('.gb-loop-r', { rotation: 50, x: 70, y: -30, opacity: 0, duration: 0.6, ease: 'power2.in', transformOrigin: '0% 70%' }, '<')
      .to('.gb-tail-l', { rotation: 30, x: -30, y: 90, opacity: 0, duration: 0.7, ease: 'power2.in', transformOrigin: '50% 0%' }, '<+0.05')
      .to('.gb-tail-r', { rotation: -30, x: 30, y: 90, opacity: 0, duration: 0.7, ease: 'power2.in', transformOrigin: '50% 0%' }, '<')
      .to('.gb-knot-core', { scale: 0.2, opacity: 0, duration: 0.4, ease: 'back.in(2)', transformOrigin: '50% 50%' }, '<+0.05')

      // The belt slides off every face.
      .to('.gb-band-v', { scaleY: 0, duration: 0.5, ease: 'power3.inOut', stagger: 0.025 }, '<+0.05')
      .to('.gb-band-h', { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, '<')

      // Lid: a small pop, then gone.
      .to('.gb-lid', { y: -22, duration: 0.2, ease: 'power2.out' }, '>-0.15')
      .to('.gb-lid', { y: -300, x: 70, rotationX: -38, rotationZ: 18, duration: 0.85, ease: 'power3.in' }, '>')
      .to('.gb-lid .gb-f', { opacity: 0, duration: 0.3 }, '>-0.3')

      // Light from inside.
      .to('.gb-glow', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<-0.45')
      .fromTo('.gb-beam', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.8, ease: 'expo.out' }, '<')
      .to('.gb-spot', { opacity: 1, duration: 0.8 }, '<')
      .fromTo(
        '.gb-dust i',
        { y: 0, x: 0, opacity: 0 },
        {
          y: () => -gsap.utils.random(150, 300),
          x: () => gsap.utils.random(-60, 60),
          opacity: () => gsap.utils.random(0.5, 1),
          duration: () => gsap.utils.random(1.2, 2),
          ease: 'power1.out',
          stagger: 0.035,
        },
        '<+0.1',
      )

      // The prize rises out of the box.
      .fromTo(
        '.gb-prize',
        { y: 90, scale: 0.45, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'expo.out' },
        '<+0.15',
      )
      .to('.gb-dust i', { opacity: 0, duration: 0.6 }, '>-0.3')
      .to({}, { duration: 0.9 })
  })

  return (
    <div className="gb" ref={root} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="gb-spot" aria-hidden="true" />
      <div className="gb-halo" aria-hidden="true" />
      <div className="gb-warm" aria-hidden="true" />
      <div className="gb-floorline" aria-hidden="true" />
      <div className="gb-shadow" aria-hidden="true" />
      <div className="gb-beam" aria-hidden="true" />
      <div className="gb-dust" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${50 + ((i * 37) % 60) - 30}%` }} />
        ))}
      </div>
      <div className="gb-prize" aria-hidden="true">
        <span>Your gift</span>
        <b>{prize.title}</b>
        <em className="gb-prize-rank">
          <i /><i /><i /><i />
        </em>
      </div>

      <button type="button" className="gb-hit" onClick={open} aria-label="Open your gift">
        <span className="gb-tilt">
          <span className="gb-float">
            <span className="gb-obj">
              <span className="gb-spin">
                <span className="gb-body">
                  {SIDES.map((s) => (
                    <span key={s} className={`gb-f gb-${s}`}>
                      <i className="gb-band-v" />
                    </span>
                  ))}
                  <span className="gb-f gb-bottom" />
                  {SIDES.map((s) => (
                    <span key={s} className={`gb-in gb-in-${s}`}>
                      <i className="gb-glow" />
                    </span>
                  ))}
                  <span className="gb-in gb-floor">
                    <i className="gb-glow" />
                  </span>
                </span>

                <span className="gb-lid-pos">
                  <span className="gb-lid">
                    <span className="gb-f gb-top">
                      <i className="gb-band-h" />
                      <i className="gb-band-v" />
                    </span>
                    {SIDES.map((s) => (
                      <span key={s} className={`gb-f gb-l${s}`}>
                        <i className="gb-band-v" />
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>

        <span className="gb-knot-pos" aria-hidden="true">
          <span className="gb-knot-float">
            <Bow />
          </span>
        </span>
      </button>

      <p className="gb-hint" aria-hidden="true">Tap the box to open your gift</p>
    </div>
  )
}

// Front view of a satin bow: two loops with their inner fold, the center knot
// and two dovetail tails.
function Bow() {
  return (
    <svg className="gb-knot-svg" viewBox="0 0 220 200">
      <defs>
        <linearGradient id="gbSatin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#f1ede6" />
          <stop offset="1" stopColor="#cfc7bb" />
        </linearGradient>
        <linearGradient id="gbSatinL" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e0d6" />
          <stop offset=".45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d2cabe" />
        </linearGradient>
        <linearGradient id="gbSatinR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6e0d6" />
          <stop offset=".45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d2cabe" />
        </linearGradient>
        <linearGradient id="gbTail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d2c7" />
          <stop offset=".5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbc3b6" />
        </linearGradient>
        <radialGradient id="gbKnot" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#ece7df" />
          <stop offset="1" stopColor="#c6bdb0" />
        </radialGradient>
        <filter id="gbShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodOpacity=".55" style={{ floodColor: 'hsl(from var(--accent) h s 11.4%)' }} />
        </filter>
      </defs>

      <g filter="url(#gbShadow)">
        <path className="gb-tail-l" d="M101 80 L117 85 L88 170 L77 159 L65 167 Z" fill="url(#gbTail)" />
        <path className="gb-tail-r" d="M119 80 L103 85 L132 170 L143 159 L155 167 Z" fill="url(#gbTail)" />

        <g className="gb-loop-l">
          <path d="M110 74 C 90 36, 36 22, 28 54 C 22 84, 78 96, 110 74 Z" fill="url(#gbSatinL)" />
          <path d="M108 74 C 92 52, 56 44, 48 60 C 44 74, 82 84, 108 74 Z" fill="#b9af9f" opacity=".45" />
          <path d="M110 74 C 90 36, 36 22, 28 54" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".9" />
        </g>
        <g className="gb-loop-r">
          <path d="M110 74 C 130 36, 184 22, 192 54 C 198 84, 142 96, 110 74 Z" fill="url(#gbSatinR)" />
          <path d="M112 74 C 128 52, 164 44, 172 60 C 176 74, 138 84, 112 74 Z" fill="#b9af9f" opacity=".45" />
          <path d="M110 74 C 130 36, 184 22, 192 54" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".9" />
        </g>

        <g className="gb-knot-core">
          <rect x="95" y="58" width="30" height="30" rx="9" fill="url(#gbKnot)" />
          <ellipse cx="106" cy="67" rx="8" ry="4.5" fill="#fff" opacity=".85" />
        </g>
      </g>
    </svg>
  )
}
