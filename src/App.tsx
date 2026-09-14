import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Nav } from '@/components/nav'
import { StickyCTA } from '@/components/sticky-cta'
import { Hero } from '@/sections/hero'
import { Programs } from '@/sections/programs'
import { bootTracking } from '@/lib/track'

/* Abaixo da dobra em chunk próprio. O <Suspense> devolve uma ALTURA RESERVADA
   em vez de null: sem ela a página encolhe enquanto o chunk chega e o scroll
   pula debaixo do dedo de quem já estava rolando. */
const Steps = lazy(() => import('@/sections/steps').then((m) => ({ default: m.Steps })))
const Trial = lazy(() => import('@/sections/trial').then((m) => ({ default: m.Trial })))
const Why = lazy(() => import('@/sections/why').then((m) => ({ default: m.Why })))
const Reviews = lazy(() => import('@/sections/reviews').then((m) => ({ default: m.Reviews })))
const Faq = lazy(() => import('@/sections/faq').then((m) => ({ default: m.Faq })))
const Claim = lazy(() => import('@/sections/claim').then((m) => ({ default: m.Claim })))
const MapBand = lazy(() => import('@/sections/map-band').then((m) => ({ default: m.MapBand })))
const Footer = lazy(() => import('@/sections/footer').then((m) => ({ default: m.Footer })))
const BookingModal = lazy(() =>
  import('@/booking/booking-modal').then((m) => ({ default: m.BookingModal }))
)

function Hold({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>{children}</Suspense>
}

/**
 * Refaz o salto de âncora depois que as seções montam.
 *
 * Tudo abaixo da dobra é `lazy`, então no primeiro paint o alvo de um
 * `lp.../#trial` ainda não existe no DOM: o navegador tenta saltar, não acha
 * nada, desiste em silêncio e a pessoa cai no topo da página. Quem clica no
 * menu não vê isso (a essa altura já montou tudo); quem ABRE um link
 * compartilhado vê sempre.
 *
 * Uma tentativa por frame, por meio segundo. `scrollIntoView` e não
 * `scrollTo`, para o `scroll-margin-top` da seção continuar valendo e o título
 * não sumir debaixo da barra fixa.
 */
function jumpToHash() {
  const hash = window.location.hash
  /* Só identificador simples. `querySelector` com um hash esquisito
     (`#1`, `#foo bar`) lança, e não vale derrubar a carga da página por causa
     de uma âncora que alguém digitou errado. */
  if (!/^#[A-Za-z][\w-]*$/.test(hash)) return

  let tries = 0
  const jump = () => {
    const target = document.querySelector(hash)
    if (target) {
      target.scrollIntoView()
      return
    }
    if (tries++ < 30) requestAnimationFrame(jump)
  }
  requestAnimationFrame(jump)
}

/**
 * Ordem da página, e a razão de cada posição. É a ordem da referência que o
 * Adryan mandou, e ela é melhor que a que estava aqui por um motivo: o "como
 * começar" vem LOGO depois dos programas, enquanto a pessoa ainda está com a
 * turma escolhida na cabeça, em vez de no meio da página.
 *
 *   I    hero com a VSL      quem chega do anúncio não conhece a academia
 *   II   programas           a primeira pergunta é "tem turma para mim?"
 *   III  como começar        e a segunda é "e como eu faço isso?"
 *   IV   a aula experimental o medo real: o que acontece comigo lá dentro
 *   V    por que ficam       o que segura quem já entrou
 *   VI   avaliações          a prova, geográfica antes de qualitativa
 *   VII  perguntas           as objeções que sobraram
 *   VIII o pedido            a última palavra é a oferta
 *
 * Não existe seção de endereço e horário: o mapa em largura total antes do
 * rodapé responde "onde fica", e a grade mora na coluna "visit us" do rodapé,
 * que é onde alguém procura por ela depois de já ter decidido.
 *
 * O modal é montado só no primeiro ocioso depois do load. Renderizar
 * `<Suspense><BookingModal open={false}/></Suspense>` de saída faria o React
 * resolver o chunk no primeiro paint, que é o oposto de adiar.
 */
export default function App() {
  const [booking, setBooking] = useState(false)
  const [program, setProgram] = useState<string | undefined>(undefined)
  const [modalReady, setModalReady] = useState(false)

  const openBooking = useCallback((programId?: string) => {
    setProgram(programId)
    setModalReady(true)
    setBooking(true)
  }, [])
  const closeBooking = useCallback(() => setBooking(false), [])

  useEffect(() => {
    bootTracking()

    /* `#book` na URL abre o formulário direto, sem precisar de clique. Serve
       para o anúncio: uma extensão de link ou um criativo pode mandar para
       lp.../#book e a pessoa cai já no passo 1 em vez de ter que achar o
       botão. Também é o jeito de abrir a folha numa conferência rápida. */
    if (window.location.hash === '#book') {
      openBooking()
    } else {
      jumpToHash()
    }

    /* Pré-carrega o chunk do modal quando o navegador não tem mais nada para
       fazer. Quem clicar antes disso não espera nada: o `openBooking` monta na
       hora, e o Suspense cobre o intervalo. */
    const hasIdle = typeof window.requestIdleCallback === 'function'
    const idle = hasIdle
      ? window.requestIdleCallback(() => setModalReady(true))
      : window.setTimeout(() => setModalReady(true), 2500)

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [openBooking])

  return (
    <div className="paper-grain">
      <a href="#top" className="skip-link">
        Skip to content
      </a>

      <Nav onBook={() => openBooking()} />

      <main>
        <Hero onBook={() => openBooking()} />
        <Programs onBook={openBooking} />

        <Hold>
          <Steps onBook={() => openBooking()} />
        </Hold>
        <Hold>
          <Trial onBook={() => openBooking()} />
        </Hold>
        <Hold>
          <Why />
        </Hold>
        <Hold>
          <Reviews />
        </Hold>
        <Hold>
          <Faq onBook={() => openBooking()} />
        </Hold>
        <Hold>
          <Claim onBook={() => openBooking()} />
        </Hold>
      </main>

      {/* Mapa em largura total, encostado no rodapé. */}
      <Suspense fallback={<div style={{ minHeight: '300px' }} />}>
        <MapBand />
      </Suspense>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <StickyCTA onBook={() => openBooking()} hidden={booking} />

      {modalReady && (
        <Suspense fallback={null}>
          <BookingModal open={booking} initialProgram={program} onClose={closeBooking} />
        </Suspense>
      )}
    </div>
  )
}
