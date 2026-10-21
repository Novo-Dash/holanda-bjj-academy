import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Perk } from '@/pages/black-friday/data/academy'
import './prizeshow.css'

/*
 * The offer, shown as perks on the voucher. Each kind has its own entrance:
 *  - bonus:   the paid months light up, then the free ones pop in, gold
 *  - price:   the old price is struck through, the new one drops in
 *  - percent: a ring fills while the number counts up
 *  - free:    a "$0" stamp slams onto the card
 *  - gift:    the gi draws itself, line by line
 *  - total:   a bundle price drops in, with what it includes ticking on one by one
 * Reduced motion: everything is shown in its final state.
 */

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useCount(to: number, delay: number) {
  const [v, setV] = useState(() => (reduced() ? to : 0))
  useEffect(() => {
    if (reduced()) return
    let raf = 0
    const t0 = performance.now() + delay
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 1100))
      setV(Math.round(to * (1 - (1 - k) ** 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, delay])
  return v
}

function Bonus({ perk, delay }: { perk: Extract<Perk, { kind: 'bonus' }>; delay: number }) {
  const total = perk.base + perk.plus
  return (
    <div className="ps-tile ps-bonus" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <div className="ps-months" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < perk.base ? 'is-paid' : 'is-free'} style={{ '--i': i } as CSSProperties}>
            <b>{i + 1}</b>
          </span>
        ))}
      </div>
      <p className="ps-big">
        <span>{perk.base}</span>
        <em>+{perk.plus}</em>
        <small>{perk.unit}</small>
      </p>
      <p className="ps-label">{perk.label}</p>
    </div>
  )
}

function Price({ perk, delay }: { perk: Extract<Perk, { kind: 'price' }>; delay: number }) {
  return (
    <div className="ps-tile ps-price" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <p className="ps-was">
        <span>{perk.was}</span>
        <i aria-hidden="true" />
      </p>
      <p className="ps-big ps-now">{perk.now}</p>
      <p className="ps-label">{perk.label}</p>
    </div>
  )
}

function Total({ perk, delay }: { perk: Extract<Perk, { kind: 'total' }>; delay: number }) {
  return (
    <div className="ps-tile ps-total" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <p className="ps-big ps-now">
        <small>All for</small>
        {perk.value}
      </p>
      <ul className="ps-incl">
        {perk.items.map((it, i) => (
          <li key={it} style={{ '--i': i } as CSSProperties}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Percent({ perk, delay }: { perk: Extract<Perk, { kind: 'percent' }>; delay: number }) {
  const v = useCount(perk.value, delay + 250)
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="ps-tile ps-percent" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <svg className="ps-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ps-ring-bg" />
        <circle cx="32" cy="32" r={r} className="ps-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <p className="ps-big">
        {v}%<small>off</small>
      </p>
      <p className="ps-label">{perk.label}</p>
    </div>
  )
}

function Free({ perk, delay }: { perk: Extract<Perk, { kind: 'free' }>; delay: number }) {
  return (
    <div className="ps-tile ps-free" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <p className="ps-stamp" aria-hidden="true">
        <span>$0</span>
      </p>
      <p className="ps-big">No fee</p>
      <p className="ps-label">{perk.label}</p>
    </div>
  )
}

function Gift({ perk, delay }: { perk: Extract<Perk, { kind: 'gift' }>; delay: number }) {
  return (
    <div className="ps-tile ps-gift" style={{ '--d': `${delay}ms` } as CSSProperties}>
      <svg className="ps-gi" viewBox="0 0 64 64" aria-hidden="true">
        {/* a gi jacket: shoulders, lapels, sleeves and the belt */}
        <path pathLength={1} d="M22 8 L32 20 L42 8 L56 16 L60 34 L50 36 L48 28 L48 58 L16 58 L16 28 L14 36 L4 34 L8 16 Z" />
        <path pathLength={1} d="M22 8 L32 34 L42 8" />
        <path pathLength={1} className="ps-belt" d="M16 40 L48 40 M30 40 L26 50 M34 40 L38 50" />
      </svg>
      <p className="ps-big">{perk.title}</p>
      <p className="ps-label">{perk.label}</p>
    </div>
  )
}

export default function PrizeShow({ perks }: { perks: Perk[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // The voucher mounts after the box opens: start the show on the next frame so the entrance plays.
  const [on, setOn] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div ref={ref} className={`ps${on ? ' is-on' : ''}${perks.length === 1 ? ' is-solo' : ''}`} data-count={perks.length}>
      {perks.map((p, i) => {
        const delay = 250 + i * 380
        if (p.kind === 'bonus') return <Bonus key={i} perk={p} delay={delay} />
        if (p.kind === 'price') return <Price key={i} perk={p} delay={delay} />
        if (p.kind === 'percent') return <Percent key={i} perk={p} delay={delay} />
        if (p.kind === 'free') return <Free key={i} perk={p} delay={delay} />
        if (p.kind === 'total') return <Total key={i} perk={p} delay={delay} />
        return <Gift key={i} perk={p} delay={delay} />
      })}
    </div>
  )
}
