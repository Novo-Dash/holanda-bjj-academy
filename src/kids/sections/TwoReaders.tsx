import { useEffect, useRef } from 'react'
import { twoReaders } from '../data/kids'
import { prefersReducedMotion } from '../lib/motion'
import { Check, Star } from '../ui/icons'
import { Button, shows } from '../ui/parts'
import type { Book } from '../KidsApp'

/**
 * V · For parents / For kids. DUAS PRANCHETAS lado a lado (pedido do Adryan,
 * 09/10, a partir da prancheta do Like Water Kids), uma para cada leitor:
 *
 *  - pais: prancheta de tinta, papel pautado com a margem vermelha. A caneta
 *    marca cada item com um ✓ e a marca-texto passa atrás do título;
 *  - crianças: prancheta vermelha, papel quadriculado, a letra solta. Cada
 *    item ganha uma estrela que pula, e no fim cai o carimbo de estrela.
 *
 * Elas SE PREENCHEM SOZINHAS por tempo quando entram na tela (a dos pais
 * primeiro). O CSS-base é a página pronta (tudo marcado, carimbo no lugar):
 * sem JS ou com reduced-motion é isso que aparece. O JS "arma" a prancheta
 * (página em branco) só enquanto ela está fora da tela.
 */
export function TwoReaders({ onBook }: { onBook: Book }) {
  const { parents, kids } = twoReaders
  const kidsItems = kids.items.filter(shows)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = wrap.current
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    const boards = Array.from(root.querySelectorAll<HTMLElement>('.cb'))
    const timers: number[] = []
    boards.forEach((b) => b.classList.add('is-armed'))

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const board = e.target as HTMLElement
          io.unobserve(board)
          const delay = boards.indexOf(board) * 500
          const items = Array.from(board.querySelectorAll<HTMLElement>('.cb-item'))
          items.forEach((it, i) =>
            timers.push(window.setTimeout(() => it.classList.add('is-on'), 700 + delay + i * 550))
          )
          timers.push(
            window.setTimeout(() => board.classList.add('is-done'), 700 + delay + items.length * 550 + 250)
          )
        }
      },
      { threshold: 0.35 }
    )
    boards.forEach((b) => io.observe(b))
    return () => {
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
      boards.forEach((b) => {
        b.classList.remove('is-armed', 'is-done')
        b.querySelectorAll('.cb-item').forEach((it) => it.classList.remove('is-on'))
      })
    }
  }, [])

  return (
    <section className="hk-sec hk-readers" aria-labelledby="readers-title">
      <div className="hk-shell">
        <h2 id="readers-title" className="hk-type-h2 hk-readers__title" data-rise="">
          {twoReaders.h2}
        </h2>

        <div ref={wrap} className="hk-readers__boards">
          <article className="cb cb--parents" data-rise="">
            <span className="cb-clip" aria-hidden="true" />
            <div className="cb-paper">
              <p className="cb-label">{parents.label}</p>
              <h3 className="hk-type-h3 cb-title">{parents.h3}</h3>
              <ul className="cb-list">
                {parents.items.map((it) => (
                  <li key={it.title} className="cb-item">
                    <span className="cb-box" aria-hidden="true">
                      <Check />
                    </span>
                    <p>
                      <b className="cb-hl">{it.title}</b> {it.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="cb cb--kids" data-rise="">
            <span className="cb-clip" aria-hidden="true" />
            <div className="cb-paper cb-paper--grid">
              <p className="cb-label cb-label--kid">{kids.label}</p>
              <h3 className="hk-kid cb-title cb-title--kid">{kids.h3}</h3>
              <ul className="cb-list">
                {kidsItems.map((it) => (
                  <li key={it.id} className="cb-item cb-item--kid">
                    <span className="cb-star" aria-hidden="true">
                      <Star />
                    </span>
                    <p className="hk-kid">{it.text}</p>
                  </li>
                ))}
              </ul>
              <span className="cb-stamp" aria-hidden="true">
                <Star />
              </span>
            </div>
          </article>
        </div>

        <div className="hk-readers__cta">
          <Button onClick={() => onBook('two_readers')}>{twoReaders.cta}</Button>
        </div>
      </div>
    </section>
  )
}
