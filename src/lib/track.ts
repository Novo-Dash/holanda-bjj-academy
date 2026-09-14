/**
 * Tracking da página.
 *
 * A prioridade aqui é a CONVERSÃO DO GOOGLE ADS: a academia vai receber
 * campanha Performance Max, e sem o evento de conversão chegando o Pmax otimiza
 * às cegas e o teste de 15 dias não mede nada. Meta Pixel vem junto porque a
 * campanha de Meta está em preparação.
 *
 * Contrato deste módulo:
 *
 *  1. NADA é carregado sem identificador. Cada tag só entra no DOM se o `.env`
 *     tiver o id dela. Sem id, os eventos continuam sendo empilhados no
 *     `dataLayer` (que é só um array), então o dia em que o GTM for colado a
 *     fila inteira já está lá esperando.
 *  2. NADA lança. Uma exceção em bloqueador de anúncio não pode derrubar o
 *     formulário: lead perdido é muito mais caro que evento perdido.
 *  3. Um nome de evento por acontecimento, e os nomes são os do PRD §18.
 *
 * OS IDENTIFICADORES SÃO PÚBLICOS E FICAM NO CÓDIGO, com o `.env` servindo
 * apenas de sobreposição. Eles moravam só em variáveis de ambiente, e o efeito
 * disso é que a página NÃO MEDIA NADA em produção: `.env` é ignorado pelo git,
 * então nada chegava na Vercel, e o console avisava num lugar que ninguém abre.
 * Id de tag não é segredo (ele vai no HTML servido de qualquer jeito, qualquer
 * um lê no devtools); segredo é o token da CAPI, que continua sendo variável de
 * ambiente e não entra aqui.
 *
 * Valores conferidos no cadastro, na linha "Holanda BJJ - Framingham MA".
 *
 * NÃO HÁ GTM, de propósito: as tags do Google e do Meta são disparadas direto,
 * cada uma pela biblioteca dela. Container disparando os mesmos eventos em
 * paralelo é a receita conhecida de conversão contada em dobro.
 *
 * Lembrete de CSP: instalar a tag aqui NÃO basta. O domínio precisa estar
 * liberado em `vercel.json` (script-src e connect-src), senão a tag é bloqueada
 * em produção e funciona no `npm run dev`.
 */

const GTM_ID = import.meta.env.VITE_GTM_ID || ''
const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-Y1PCJ5ENC9'
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || 'AW-18431194134'
const ADS_LEAD_LABEL = import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL || 'pK_cCPHyme8cEJbo1tRE'
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1077682874673890'

type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }
    _fbq?: unknown
  }
}

function script(src: string, async = true) {
  const el = document.createElement('script')
  el.src = src
  el.async = async
  document.head.appendChild(el)
}

function pushLayer(payload: Record<string, unknown>) {
  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(payload)
  } catch {
    /* bloqueador de anúncio, navegação privada. Silêncio é a resposta certa. */
  }
}

/* O StrictMode do React roda o efeito de montagem duas vezes em
   desenvolvimento. Sem esta trava, cada tag entraria duas vezes no DOM e o
   PageView sairia dobrado. */
let booted = false

/** Carrega as tags que têm id. Chamado uma vez, na montagem da página. */
export function bootTracking() {
  if (booted) return
  booted = true

  if (GTM_ID) {
    pushLayer({ 'gtm.start': Date.now(), event: 'gtm.js' })
    script(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`)
  }

  /* gtag.js entra quando existe GA4 ou Ads, e os dois compartilham a mesma
     biblioteca: carregar duas vezes só duplicaria o arquivo. */
  const gtagId = GA4_ID || ADS_ID
  if (gtagId) {
    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag() {
      /* `arguments` de propósito, e não rest: o gtag lê o objeto array-like
         que recebe, e um array de verdade quebra a fila dele. */
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments)
    }
    window.gtag('js', new Date())
    if (GA4_ID) window.gtag('config', GA4_ID)
    if (ADS_ID) window.gtag('config', ADS_ID)
    script(`https://www.googletagmanager.com/gtag/js?id=${gtagId}`)
  }

  if (PIXEL_ID) {
    /* Stub oficial do Meta, reescrito sem o minificado: a fila existe para os
       eventos disparados antes de o arquivo chegar. */
    const fbq: Window['fbq'] = function (...args: unknown[]) {
      if (fbq?.callMethod) fbq.callMethod(...args)
      else fbq?.queue?.push(args)
    } as NonNullable<Window['fbq']>
    fbq.queue = []
    window.fbq = window.fbq ?? fbq
    window._fbq = window._fbq ?? fbq
    script('https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', PIXEL_ID)
    window.fbq('track', 'PageView')
  }

  if (!GTM_ID && !GA4_ID && !ADS_ID && !PIXEL_ID) {
    console.info(
      '[track] nenhum identificador no .env: os eventos vão para o dataLayer e nada é enviado. Ver src/lib/track.ts'
    )
  }

  track('page_view', { page_location: window.location.href })
  watchScrollDepth()
}

/**
 * Um evento. Vai para o dataLayer sempre (é onde o GTM lê) e, quando o Pixel
 * existe, também para o Meta com o nome padrão dele quando há um.
 */
export function track(event: string, params: Params = {}) {
  pushLayer({ event, ...params })

  /* SEM `InitiateCheckout`, e a ausência é deliberada. Ele pressupõe carrinho e
     pagamento, que não existem neste funil: a pessoa agenda uma aula
     experimental gratuita. O evento estava mapeado aqui e disparava na abertura
     do formulário, ensinando à Meta que aquilo era um início de compra. O
     evento certo para "abriu o formulário" é `ViewContent`, e é o que passou a
     sair de lá. O conjunto é fechado: PageView, ViewContent, Lead. */
  const META_STANDARD: Record<string, string> = {
    page_view: 'PageView',
    view_content: 'ViewContent',
    generate_lead: 'Lead',
  }
  const standard = META_STANDARD[event]
  try {
    if (window.fbq) {
      if (standard) window.fbq('track', standard, params)
      else window.fbq('trackCustom', event, params)
    }
    if (window.gtag && !standard) window.gtag('event', event, params)
  } catch {
    /* idem: nunca derrubar a página por causa de medição. */
  }
}

/**
 * O lead. É o único evento que dispara a CONVERSÃO do Google Ads, e por isso
 * ele é uma função própria em vez de mais uma string solta: conversão de Pmax
 * disparada no lugar errado é pior que não disparada, porque o algoritmo
 * aprende com ela.
 */
export function trackLead(params: Params = {}) {
  track('generate_lead', params)
  try {
    if (window.gtag && ADS_ID && ADS_LEAD_LABEL) {
      window.gtag('event', 'conversion', {
        send_to: `${ADS_ID}/${ADS_LEAD_LABEL}`,
        ...params,
      })
    }
  } catch {
    /* idem. */
  }
}

/**
 * Profundidade de rolagem em quatro marcos. Cada um dispara uma vez só, e o
 * ouvinte se remove sozinho depois do último: deixar um listener de scroll
 * vivo pela sessão inteira para não medir mais nada é desperdício de frame.
 */
function watchScrollDepth() {
  const marks = [25, 50, 75, 100]
  let i = 0

  const onScroll = () => {
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    if (max <= 0) return
    const pct = Math.min(100, Math.round((window.scrollY / max) * 100))

    while (i < marks.length && pct >= marks[i]) {
      track('scroll_depth', { percent: marks[i] })
      i++
    }
    if (i >= marks.length) window.removeEventListener('scroll', onScroll)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
}
