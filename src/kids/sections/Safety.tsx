import { useEffect, useId, useRef } from 'react'
import { track } from '@/lib/track'
import { safety } from '../data/kids'
import { afterPaint } from '../lib/motion'
import { EyeArt, GripArt, SeesawArt, TapArt, playEye, playGrip, playSeesaw, playTap } from '../ui/SafetyArt'
import { Eyebrow, shows } from '../ui/parts'

/** Uma ilustração e um gesto por regra, na ordem das regras do kids.ts. */
const ART = [
  { Art: GripArt, play: playGrip, tone: 'red' },
  { Art: SeesawArt, play: playSeesaw, tone: 'ink' },
  { Art: TapArt, play: playTap, tone: 'paper' },
  { Art: EyeArt, play: playEye, tone: 'deep' },
] as const

/**
 * III · Safety. Arquétipo: QUATRO CARTÕES ILUSTRADOS, um por regra, cada um
 * com o seu gesto (pedido do Adryan, 09/10: "igual ao Dárcio Lira, com ícones
 * animados"). Os desenhos e os gestos estão em ui/SafetyArt.tsx.
 *
 * Cada cartão toca o gesto quando entra na tela (um depois do outro) e de novo
 * no hover e no toque. No celular os cartões viram uma fila que rola para o
 * lado: empilhados, quatro cartões ilustrados empurrariam o resto da página
 * três telas para baixo.
 */
export function Safety() {
  const rules = safety.rules.filter((r) => r.title && shows(r))
  const list = useRef<HTMLUListElement>(null)
  const uid = useId().replace(/:/g, '')

  useEffect(() => {
    const ul = list.current
    if (!ul || typeof IntersectionObserver === 'undefined') return
    const cards = Array.from(ul.querySelectorAll<HTMLElement>('.hs-card'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = cards.indexOf(e.target as HTMLElement)
          window.setTimeout(() => ART[i]?.play(e.target), 250 + i * 180)
          io.unobserve(e.target)
        }
      },
      { threshold: 0.45 }
    )
    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  return (
    <section id="safety" className="hk-sec hk-safety" aria-labelledby="safety-title">
      <div className="hk-shell">
        <header className="hk-safety__head">
          <Eyebrow>{safety.eyebrow}</Eyebrow>
          <h2 id="safety-title" className="hk-type-h2">
            {safety.h2}
          </h2>
          <p className="hk-type-body hk-safety__body">{safety.body}</p>
        </header>

        <ul ref={list} className="hs-cards">
          {rules.map((r, i) => {
            const { Art, play, tone } = ART[i]
            return (
              <li key={r.title} className={`hs-card hs-card--${tone}`}>
                <button
                  type="button"
                  className="hs-stage"
                  aria-label={`${r.title} ${safety.playLabel}`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && play(e.currentTarget.parentElement)}
                  onClick={(e) => {
                    play(e.currentTarget.parentElement)
                    afterPaint(() => track('safety_art', { rule: i + 1 }))
                  }}
                >
                  <span className="hs-n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <Art id={`${uid}-${i}`} />
                </button>
                <h3 className="hs-title">{r.title}</h3>
                <p className="hs-text">{r.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
