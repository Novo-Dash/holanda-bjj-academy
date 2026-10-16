import { useCallback, useEffect, useRef, useState } from 'react'
import { parents } from '../data/kids'
import { prefersReducedMotion } from '../lib/motion'
import { ArrowNuki, GoogleMark, Star } from '../ui/icons'
import { Button } from '../ui/parts'
import type { Book } from '../KidsApp'

const INTERVAL = 5000

/** Duas iniciais, derivadas do nome (nunca escritas à mão). */
const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

/**
 * IX · Os pais, nas palavras deles. O DESENHO é o carrossel do Satori Kids
 * (pedido do Adryan, 09/10): título à esquerda e as setas à direita, a pista
 * SANGRANDO para fora da casca, o cartão ativo com borda e barra vermelhas,
 * avanço sozinho a cada 5 s, pausa no mouse e no foco, pontos embaixo.
 *
 * Os três defeitos que o do Satori tinha, e que aqui não vieram:
 *  - as setas do teclado eram ouvidas no DOCUMENTO inteiro (mexiam no
 *    carrossel enquanto alguém digitava no formulário). Aqui, só com o foco
 *    dentro da seção;
 *  - os pontos eram `tablist` sem `tabpanel`. Aqui são botões com
 *    `aria-pressed`;
 *  - o autoplay ignorava reduced-motion. Aqui ele não liga.
 */
export function Parents({ onBook }: { onBook: Book }) {
  const total = parents.reviews.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [perView, setPerView] = useState(1)
  const viewport = useRef<HTMLDivElement>(null)

  const shift = Math.min(index, Math.max(0, total - perView))
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])

  /* quantos cartões cabem: lido do CSS, nunca duplicado aqui */
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const card = parseFloat(cs.getPropertyValue('--rv-card'))
      const gap = parseFloat(cs.getPropertyValue('--rv-gap'))
      if (!card) return
      const inner = el.clientWidth - parseFloat(cs.paddingLeft)
      setPerView(Math.max(1, Math.floor((inner + gap) / (card + gap))))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const id = window.setInterval(next, INTERVAL)
    return () => window.clearInterval(id)
  }, [next, paused])

  return (
    <section
      id="reviews"
      className="hk-sec hk-parents"
      aria-labelledby="parents-title"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
    >
      <div className="hk-shell rv-head" data-rise="">
        <div>
          <p className="rv-eyebrow">{parents.eyebrow}</p>
          <h2 id="parents-title" className="hk-type-h2">
            {parents.h2}
          </h2>
        </div>
        <div className="rv-nav">
          <button type="button" onClick={prev} aria-label={parents.prev}>
            <ArrowNuki className="rv-nav__back" />
          </button>
          <button type="button" onClick={next} aria-label={parents.next}>
            <ArrowNuki />
          </button>
        </div>
      </div>

      <div
        ref={viewport}
        className="rv-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="rv-track" style={{ translate: `calc(${-shift} * (var(--rv-card) + var(--rv-gap)))` }}>
          {parents.reviews.map((r, i) => (
            <article key={r.name} className="rv-card" data-active={i === index ? '' : undefined}>
              <span className="rv-bar" aria-hidden="true" />
              <div className="rv-body">
                <div className="rv-top">
                  <span className="rv-stars" role="img" aria-label={parents.stars}>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} />
                    ))}
                  </span>
                  <GoogleMark />
                </div>
                <blockquote className="rv-text">“{r.text}”</blockquote>
                <footer className="rv-by">
                  <span className="rv-avatar" aria-hidden="true">
                    {initials(r.name)}
                  </span>
                  <span className="rv-who">
                    <strong>{r.name}</strong>
                    <span>{parents.source}</span>
                    {r.translated && <span className="rv-tr">{parents.translated}</span>}
                  </span>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hk-shell rv-foot">
        <div className="rv-dots">
          {parents.reviews.map((r, i) => (
            <button
              key={r.name}
              type="button"
              aria-pressed={i === index}
              aria-label={parents.goTo(i + 1)}
              data-active={i === index ? '' : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <p className="rv-note">{parents.sub}</p>
        <Button onClick={() => onBook('reviews')}>{parents.cta}</Button>
      </div>
    </section>
  )
}
