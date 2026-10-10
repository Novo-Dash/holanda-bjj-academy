import { useEffect, useRef } from 'react'
import { track } from '@/lib/track'
import { quickCheck } from '../data/kids'
import { autoFillNotes, toggleNote, useBooking } from '../lib/booking-kids'
import { afterPaint } from '../lib/motion'
import { Check } from '../ui/icons'
import { Button } from '../ui/parts'
import { Bunting } from '../ui/Bunting'
import type { Book } from '../KidsApp'

/**
 * X · "Is jiu-jitsu right for my kid?" Arquétipo: a lista que a mãe MARCA.
 *
 * Cada linha é um checkbox de verdade (o input nativo, invisível sobre a linha
 * desenhada). O que ela marca vai junto no lead como `notes` (lib/booking-kids):
 * quem liga já sabe se o assunto é timidez, energia ou bullying.
 *
 * VERMELHA (pedido do Adryan, 09/10), e é a única seção vermelha da página:
 * ela é a pergunta que decide. Entra pelo varal de bandeirinhas (ui/Bunting).
 *
 * As caixas SE MARCAM SOZINHAS, uma depois da outra (pedido do Adryan,
 * 09/10): no desktop por TEMPO, a partir do momento em que a lista entra na
 * tela; no celular pela ROLAGEM. O contador sobe junto.
 *
 * Isso não vira resposta falsa no CRM: marcas da animação só vão no lead se a
 * mãe tocar na lista (`notesTouched`, lib/booking-kids). No primeiro toque a
 * animação para e a lista passa a ser dela.
 */
export function QuickCheck({ onBook }: { onBook: Book }) {
  const { notes } = useBooking()
  const n = notes.length
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const ul = list.current
    /* SEM o corte de reduced-motion, de propósito: marcar as caixas é o
       conteúdo da seção, não enfeite (o Windows com "mostrar animações"
       desligado também deve ver a lista se preencher). Com a preferência, as
       caixas só aparecem marcadas, sem o traço animado (CSS). */
    if (!ul || typeof IntersectionObserver === 'undefined') return
    const total = quickCheck.items.length

    /* desktop: por TEMPO, uma caixa marcada a cada 450 ms */
    if (window.matchMedia('(min-width: 960px) and (hover: hover)').matches) {
      const timers: number[] = []
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          for (let i = 1; i <= total; i++) timers.push(window.setTimeout(() => autoFillNotes(i), 300 + i * 450))
          io.disconnect()
        },
        { threshold: 0.2 }
      )
      io.observe(ul)
      return () => {
        io.disconnect()
        timers.forEach((t) => window.clearTimeout(t))
      }
    }

    /* celular: pela ROLAGEM (do topo da lista a 85% da tela até o pé a 55%);
       quanto mais a lista sobe, mais caixas marcadas */
    let raf = 0
    const update = () => {
      raf = 0
      const r = ul.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)))
      autoFillNotes(Math.min(total, Math.floor(p * (total + 1))))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
      } else window.removeEventListener('scroll', onScroll)
    })
    io.observe(ul)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="hk-sec hk-check hk-on-red" aria-labelledby="check-title">
      <Bunting />
      <div className="hk-shell hk-check__grid">
        <header className="hk-check__head">
          <h2 id="check-title" className="hk-type-h2" data-rise="">
            {quickCheck.h2}
          </h2>
          <p className="hk-type-body">{quickCheck.sub}</p>
          <div className="hk-check__score">
            <p className="hk-check__count" aria-live="polite">
              {quickCheck.counter(n)}
              {n > 0 && <span className="hk-kid"> {quickCheck.worth}</span>}
            </p>
            <Button variant="gold" onClick={() => onBook('quick_check')}>
              {quickCheck.cta}
            </Button>
          </div>
        </header>

        <ul ref={list} className="hk-check__list">
          {quickCheck.items.map((it) => (
            <li key={it.id}>
              <label className="hk-row">
                <input
                  type="checkbox"
                  checked={notes.includes(it.id)}
                  onChange={() => {
                    toggleNote(it.id)
                    afterPaint(() => track('quick_check', { item: it.id }))
                  }}
                />
                <span className="hk-row__box" aria-hidden="true">
                  <Check />
                </span>
                <span className="hk-row__text">{it.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
