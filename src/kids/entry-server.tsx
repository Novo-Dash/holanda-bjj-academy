import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import KidsApp from './KidsApp'
import { faqItems } from './sections/Faq'
import type { Variant } from './data/kids'

/**
 * Prerender da /kids (scripts/prerender-kids.mjs). Uma chamada por variante
 * de headline: /kids (A), /kids/b e /kids/c. O HTML sai com o conteúdo inteiro
 * (H1, CTA, selos, formulário), e o main.tsx hidrata em vez de pintar do zero:
 * é o que segura o LCP e o primeiro toque no celular.
 */
export function render(variant: Variant) {
  return renderToString(
    <StrictMode>
      <KidsApp variant={variant} />
    </StrictMode>
  )
}

/** O FAQPage do JSON-LD sai da MESMA lista que a página mostra. */
export function faqJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
      .filter((f) => f.a)
      .map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
  })
}
