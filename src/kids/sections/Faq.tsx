import { useId, useState } from 'react'
import { site } from '@/data/site'
import { track } from '@/lib/track'
import { faq } from '../data/kids'
import { afterPaint } from '../lib/motion'
import { Button, Pending, shows } from '../ui/parts'
import type { Book } from '../KidsApp'

/** As perguntas que vão ao ar: o FAQPage do prerender usa a MESMA lista. */
export const faqItems = faq.items.filter(shows)

/**
 * XI · FAQ, numa coluna só (pedido do Adryan, 09/10), com o accordion de
 * "brinquedo": cartão branco com a base dura que afunda, a pergunta na voz
 * dos pais, um balão "?" que vira vermelho e um botão redondo cujo "+" gira
 * em "×" com mola. "Will my kid get hurt?" começa aberta.
 *
 * Abrir e fechar é `grid-template-rows: 0fr → 1fr`; a resposta recolhida tem
 * `inert`, para o Tab não entrar nela.
 */
export function Faq({ onBook }: { onBook: Book }) {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId()

  return (
    <section id="faq" className="hk-sec hk-faq" aria-labelledby="faq-title">
      <div className="hk-shell hk-faq__col">
        <header className="hk-faq__head" data-rise="">
          <h2 id="faq-title" className="hk-type-h2">
            {faq.h2}
          </h2>
          <p>
            {faq.sub} <a href={site.phoneHref}>{site.phone}</a>
          </p>
        </header>

        <div className="hk-faq__list">
          {faqItems.map((item, i) => {
            const isOpen = open === i
            const panel = `${uid}-a${i}`
            return (
              <div key={item.q} className={`qa${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="qa-q"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => {
                      setOpen(isOpen ? null : i)
                      if (!isOpen) afterPaint(() => track('faq_open', { q: item.q }))
                    }}
                  >
                    <span className="qa-bubble" aria-hidden="true">
                      ?
                    </span>
                    <span className="qa-text">{item.q}</span>
                    <span className="qa-toggle" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5v14" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={panel} className="qa-a" role="region" inert={!isOpen}>
                  <div>
                    {item.a && <p>{item.a}</p>}
                    <Pending>{item.pending}</Pending>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hk-faq__cta">
          <Button onClick={() => onBook('faq')}>{faq.cta}</Button>
        </div>
      </div>
    </section>
  )
}
