import { Suspense, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { captureAttribution } from '@/nd/attribution'
import { setTrackContext, track, trackView } from '@/kids/lib/track'
import type { Variant } from './data/kids'
import { prefetchPrograms, setBooking } from './lib/booking-kids'
import { afterPaint, usePageMotion } from './lib/motion'
import { Nav } from './layout/Nav'
import { Hero } from './sections/Hero'
import { Naga } from './sections/Naga'
import { Safety } from './sections/Safety'
import { TwoReaders } from './sections/TwoReaders'
import { Aggression } from './sections/Aggression'
import { FirstClass } from './sections/FirstClass'
import { Coach } from './sections/Coach'
import { Parents } from './sections/Parents'
import { QuickCheck } from './sections/QuickCheck'
import { Faq } from './sections/Faq'
import { FinalCta } from './sections/FinalCta'
import { BookSheet, type SheetHandle } from './ui/BookSheet'

export type Book = (location: string) => void

/**
 * Cada seção abaixo do formulário é um limite de Suspense. Não há nada lazy
 * dentro: o limite existe para a HIDRATAÇÃO. Sem ele, o React hidrata a
 * página inteira numa tarefa só (330 ms no Lighthouse com CPU 4x); com ele,
 * hidrata uma seção por vez e devolve a thread entre elas, então um toque no
 * meio da carga é atendido em vez de esperar a página toda (INP, P6).
 */
function Part({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

/**
 * LP Kids · ordem da página (PRD §6, que vence divergência de ordem).
 *
 * Regra do diagnóstico: no celular, até o fim da 3ª tela a mãe já viu a
 * oferta, a prova, a segurança e o BOTÃO (rolagem média de 37%, 82% no
 * celular). Por isso a Safety sobe para III, antes de "For parents / For
 * kids" (divergência com a copy, registrada no PRD e em design-decisions.md).
 * O formulário é popup: todo botão da página o abre.
 *
 *   I    Hero                "é para o meu filho? quanto custa tentar?"
 *   II   Safety              "ele vai se machucar?"
 *   III  NAGA                "isso é sério?"
 *   V    Two Readers         "o que muda em casa? ele vai gostar?"
 *   VI   Aggression          o medo que ninguém fala
 *   VII  First Class         "o que acontece quando eu chegar?"
 *   VIII Coach               "quem fica com meu filho?"
 *   IX   Parent Reviews      "outros pais confirmam?"
 *   X    Quick-check         "é para o MEU filho?"
 *   XI   FAQ                 o que sobrou
 *   XII  Final CTA           a última palavra é a oferta e o endereço
 */
export default function KidsApp({ variant }: { variant: Variant }) {
  usePageMotion()
  const sheet = useRef<SheetHandle>(null)

  useEffect(() => {
    setBooking({ variant })
    setTrackContext({ page: 'kids', headline_variant: variant })

    /* Tracking e horários entram no OCIOSO depois do load: nada disso pode
       disputar a thread principal com o primeiro toque (INP, P6). */
    /* A atribuição (UTMs, gclid, fbclid) é guardada na primeira visita da
       sessão, como no kit; as tags já vieram do bloco nd:tracking do head. */
    captureAttribution()
    const start = () => {
      trackView()
      void prefetchPrograms()
    }
    /* O Safari só ganhou requestIdleCallback há pouco; sem ele, um atraso fixo. */
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(cb, { timeout: 3000 })
        : setTimeout(cb, 1500)
    if (document.readyState === 'complete') idle(start)
    else window.addEventListener('load', () => idle(start), { once: true })

    /* `#book` na URL abre o formulário direto (link de anúncio). */
    if (window.location.hash === '#book') sheet.current?.open()
  }, [variant])

  /**
   * Todo botão de agendar passa por aqui e abre o formulário em POPUP (folha
   * de baixo no celular, janela no desktop). Não existe mais formulário em
   * linha na página: decisão do Adryan em 09/10.
   */
  const book = useCallback<Book>((location) => {
    sheet.current?.open()
    afterPaint(() => track('cta_click', { location }))
  }, [])

  return (
    <>
      <a className="hk-skip" href="#main">
        Skip to content
      </a>
      <span id="hk-top-sentinel" aria-hidden="true" />
      <Nav />
      <main id="main">
        <span id="top" />
        <Hero onBook={book} variant={variant} />
        <Safety />
        <Naga onBook={book} />
        <Part>
          <TwoReaders onBook={book} />
        </Part>
        <Part>
          <Aggression />
        </Part>
        <Part>
          <FirstClass onBook={book} />
        </Part>
        <Part>
          <Coach onBook={book} />
        </Part>
        <Part>
          <Parents onBook={book} />
        </Part>
        <Part>
          <QuickCheck onBook={book} />
        </Part>
        <Part>
          <Faq onBook={book} />
        </Part>
        <Part>
          <FinalCta onBook={book} />
        </Part>
      </main>
      <BookSheet ref={sheet} />
    </>
  )
}
