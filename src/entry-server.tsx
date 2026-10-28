import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import App from './App'
import { BookingProvider } from './nd'

/**
 * Prerender da `/` (scripts/prerender-main.mjs). Mesmo motivo da /kids: os
 * crawlers de busca por IA (GPTBot, PerplexityBot, ClaudeBot) e os scrapers de
 * preview não rodam JavaScript, e sem isto o HTML da página principal era só
 * `<div id="root">`.
 *
 * `prerenderToNodeStream` e não `renderToString`: as seções abaixo da dobra são
 * `lazy()`, e só o prerender espera os chunks resolverem. Com renderToString o
 * HTML sairia com o fallback (uma caixa vazia de 60vh) no lugar de cada uma.
 *
 * A árvore é a MESMA do src/main.tsx, para o hydrateRoot casar nó a nó.
 */
export async function render() {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <BookingProvider>
        <App />
      </BookingProvider>
    </StrictMode>
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return html
}
