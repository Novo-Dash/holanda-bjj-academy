import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { CLIENT_MODE, Pending, SectionHead } from '@/components/paper'
import { Arrow, Star } from '@/components/icons'
import { Reveal } from '@/components/reveal'
import { reviews, site, type Review } from '@/data/site'
import { cn } from '@/lib/utils'

/**
 * [VI] AVALIAÇÕES.
 *
 * Os seis depoimentos são REAIS e vieram do perfil do Google da academia, com o
 * texto e o nome como a pessoa escreveu. A nota também: 5,0 com 35 avaliações,
 * conferida no perfil (o planejamento dizia 100, e estava errado).
 *
 * O ENQUADRAMENTO é o da referência, e ele é a parte que importa: o título não
 * diz "o que dizem de nós", diz que gente da cidade de quem está lendo já treina
 * lá. Prova social de academia é geográfica antes de ser qualitativa, porque
 * ninguém dirige quarenta minutos para treinar.
 *
 * A nota NÃO entra no JSON-LD, e não é por falta de dado confirmado: o Google
 * não aceita marcação de avaliação que o próprio negócio faz sobre si mesmo em
 * LocalBusiness. Publicar não traria estrela nenhuma na busca e é justamente o
 * tipo de marcação que rende aviso.
 *
 * A COMPOSIÇÃO é uma peça vermelha fixa (a nota) ancorando um carrossel de
 * cartões escuros. É a única seção da página com três superfícies ao mesmo
 * tempo, e é de propósito: ela é a prova, e prova pede peso.
 *
 * O carrossel fica DENTRO da margem da página, e não sangrando até a borda da
 * janela como é moda. A identidade daqui é folha impressa com margem: uma
 * fileira vazando para fora brigaria com o fio duplo, a placa e o numeral, que
 * é tudo o que mantém a página na mesma grade do começo ao fim.
 */
export function Reviews() {
  const hasReviews = reviews.length > 0

  return (
    <section id="reviews" className="textured band bg-paper">
      <div className="shell">
        <SectionHead
          stroke="Reviews"
          title="Framingham already trains here."
          aside={
            <p className="type-body leading-relaxed text-ink-soft">
              Parents, beginners and people who have trained for years, in their own words. Every
              line below is on the academy{'’'}s Google profile.
            </p>
          }
        />

        {hasReviews ? (
          <Reveal gesture="rise">
            <div className="mt-14 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
              <RatingPanel />
              <Carousel />
            </div>
          </Reveal>
        ) : (
          <div className="mt-14 flex flex-col gap-6 lg:flex-row lg:gap-8">
            <RatingPanel />
            {!CLIENT_MODE && (
              <div className="plate flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
                <p className="display text-[1.5rem] text-ink">Reviews go here</p>
                <p className="max-w-[46ch] text-[0.88rem] leading-relaxed text-ink-soft">
                  Send the real reviews from the Google profile, with the name exactly as it appears
                  there and whether the person is a member, a parent or a beginner. They drop
                  straight into the carousel.
                </p>
                <Pending>Reviews to collect</Pending>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * O carrossel.
 *
 * O motor é `scroll-snap` NATIVO, e não um estado de "slide atual" em
 * JavaScript. A diferença aparece na mão: assim o dedo, o trackpad de dois
 * dedos, a roda do mouse na horizontal, o Tab e as setas do teclado já
 * funcionam sem uma linha de código, e o movimento é o do sistema operacional
 * em vez de uma interpolação minha. Um carrossel controlado por índice só
 * responde aos dois botões que eu desenhei, e ignora todo o resto.
 *
 * O que o JavaScript faz aqui é só OLHAR: ele lê a posição da rolagem para
 * saber se ainda há para onde ir (e desabilitar a seta) e para desenhar a barra
 * de progresso. Se ele falhar, o carrossel continua sendo uma fileira que rola.
 *
 * Três detalhes de acessibilidade que costumam faltar:
 *  · a trilha tem `tabIndex={0}` e nome acessível, porque região rolável sem
 *    foco é intocável por teclado (é a regra "scrollable region must have
 *    keyboard access" do axe);
 *  · as setas ficam desabilitadas nas pontas em vez de girar em laço. Laço num
 *    carrossel de depoimentos faz a pessoa reler o primeiro sem perceber;
 *  · com `prefers-reduced-motion` o salto é instantâneo em vez de deslizar.
 */
function Carousel() {
  const trackRef = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const [view, setView] = useState({ left: 0, client: 0, total: 0 })

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setView({ left: el.scrollLeft, client: el.clientWidth, total: el.scrollWidth })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    /* ResizeObserver e não `resize` da janela: o que importa é a largura da
       TRILHA, e ela muda quando a fonte carrega e quando a coluna do lado
       muda de altura, não só quando alguém puxa a janela. */
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  const max = Math.max(0, view.total - view.client)
  const atStart = view.left <= 1
  const atEnd = view.left >= max - 1

  function page(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    /* Um passo é UM cartão mais a calha, medido do DOM em vez de constante:
       o cartão muda de largura em três breakpoints, e um número fixo aqui
       deixaria o salto desalinhado com o snap em dois deles. */
    const card = el.querySelector('li')
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' })
  }

  /* Barra de progresso no formato de polegar de rolagem: a largura conta quanto
     da fileira cabe na tela, e a posição conta onde ela está. Dois números do
     mesmo lugar, então ela nunca mente sobre quantos cartões faltam. */
  const thumbWidth = view.total > 0 ? Math.min(100, (view.client / view.total) * 100) : 100
  const thumbLeft = view.total > 0 ? (view.left / view.total) * 100 : 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-6 flex items-center gap-6">
        {/* Os controles ficam ACIMA da fileira, a pedido, e a troca tem um
            efeito colateral bom: eles passam a nascer na mesma linha do topo do
            painel da nota, então a seção abre com um travessão de controles
            atravessando as duas colunas em vez de terminar com ele.

            A trilha ocupa o espaço que sobra e os botões ficam à direita dela:
            a ordem lê como "isto é o quanto falta, e é aqui que se avança". */}
        <div aria-hidden="true" className="h-px min-w-0 flex-1 bg-line-strong">
          <div
            className="h-px bg-red transition-[margin,width] duration-150 ease-out motion-reduce:transition-none"
            style={{ width: `${thumbWidth}%`, marginInlineStart: `${thumbLeft}%` }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <PageButton label="Previous reviews" disabled={atStart} onClick={() => page(-1)} back />
          <PageButton label="Next reviews" disabled={atEnd} onClick={() => page(1)} />
        </div>
      </div>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Student reviews, scroll sideways for more"
        className={cn(
          'no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto',
          'scroll-smooth motion-reduce:scroll-auto',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red'
        )}
      >
        {reviews.map((review) => (
          <ReviewCard key={review.name} review={review} />
        ))}
      </ul>

    </div>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  back = false,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  back?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'grid h-11 w-11 place-items-center rounded-full border transition-colors duration-200',
        disabled
          ? 'cursor-default border-line text-line-strong'
          : 'border-ink bg-ink text-paper hover:border-red hover:bg-red'
      )}
    >
      <Arrow className={cn('h-4 w-4', back && 'rotate-180')} />
    </button>
  )
}

/**
 * Um depoimento, em cartão escuro.
 *
 * As iniciais são derivadas do nome e não um campo: um avatar é uma foto que
 * ninguém vai mandar, e duas letras num disco dizem a mesma coisa sem pedir
 * nada a ninguém.
 *
 * `snap-start` e largura fixa: é o par que faz o cartão parar alinhado com a
 * borda da trilha em vez de parar cortado ao meio.
 *
 * NO DESKTOP A LARGURA É FRAÇÃO DA TRILHA, e não uma medida em rem. Com 21rem
 * fixos cabiam dois cartões e 164px do terceiro: um cartão pela metade, que num
 * carrossel de depoimentos é pior que um espaço vazio, porque a pessoa lê meia
 * frase de um elogio e a outra metade nunca chega. `calc((100% - gap) / 2)` faz
 * dois cartões INTEIROS ocuparem a trilha exata, sobre qualquer largura de
 * janela, e a fileira anda de dois em dois.
 *
 * Abaixo do `lg` a medida continua fixa, e ali o pedaço do cartão seguinte é
 * proposital: sem a coluna da nota ao lado, a trilha ocupa a página toda e o
 * espiar é a única coisa que avisa que a fileira continua.
 */
function ReviewCard({ review }: { review: Review }) {
  const initials = review.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <li className="w-[17.5rem] shrink-0 snap-start sm:w-[19.5rem] lg:w-[calc((100%-1.25rem)/2)]">
      <figure className="plate-dark flex h-full flex-col justify-between p-7">
        <span className="flex items-center gap-1 text-red" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="h-3.5 w-3.5" />
          ))}
        </span>

        <blockquote className="m-0 mt-5 grow">
          <p className="display-soft text-[1.02rem] text-paper/90">{review.text}</p>
        </blockquote>

        <figcaption className="mt-7 flex items-center gap-3.5 border-t border-paper/15 pt-5">
          <span
            aria-hidden="true"
            className="label grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-[0.62rem] text-paper"
          >
            {initials}
          </span>
          <span className="block min-w-0">
            {/* Sem `truncate`: um nome longo quebra em duas linhas em vez de
                virar "Patrick William de Olivei…". Cortar o nome de quem
                escreveu o elogio é a única economia de espaço que esta seção
                não pode fazer. */}
            <span className="label block text-paper">{review.name}</span>
            <span className="mt-1.5 block text-[0.78rem] text-paper/55">
              {review.role} · Google
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  )
}

/**
 * O painel da nota, em VERMELHO.
 *
 * É a peça mais saturada da página inteira, e ela está aqui e não no hero de
 * propósito: vermelho cheio é o que a página reserva para a ação (o botão), e
 * o único outro lugar que merece esse peso é o número que prova que a ação vale
 * a pena.
 *
 * Tudo por cima dele é papel sólido, sem transparência. Papel a 70% sobre
 * vermelho cai abaixo do piso de contraste, e é o jeito mais fácil de um painel
 * bonito ficar ilegível no celular ao sol.
 */
function RatingPanel() {
  const { score, count, provisional, profileUrl } = site.rating

  return (
    <div className="relative isolate flex shrink-0 flex-col justify-center overflow-hidden rounded-plate bg-red p-8 text-center text-paper shadow-lift lg:w-[17rem] lg:p-9">
      {/* A foto entra por baixo do vermelho, não no lugar dele. O painel é a
          peça mais vermelha da página e é assim que ele é achado no meio de uma
          seção clara; o que a foto acrescenta é MATÉRIA, para ele deixar de ser
          um retângulo de cor chapada.

          O véu é o vermelho da marca a 72% mais um fio de tinta: a 72% a figura
          ainda se lê e o `label` embaixo mantém 5,4:1 sobre a parte mais clara
          da imagem. Abaixo disso o número da nota começa a brigar com o ombro
          do kimono, que é justo onde ele cai. */}
      <img
        src={site.ratingImage.src}
        alt=""
        width={site.ratingImage.width}
        height={site.ratingImage.height}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full select-none object-cover object-top"
        draggable={false}
      />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-red/[0.72]" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/15" />
      {/* No celular o painel deita: o número ao lado das estrelas em vez de
          empilhado, senão ele come meia tela antes do primeiro depoimento. */}
      <div className="flex items-center justify-center gap-6 lg:flex-col lg:gap-0">
        <span className="display block text-[4.2rem] leading-none tnum lg:text-[5rem]">{score}</span>

        <div className="flex flex-col items-center lg:mt-4">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5" />
            ))}
          </span>
          <span className="label mt-3 text-paper lg:mt-5">
            <span className="tnum">{count}</span> reviews on Google
          </span>
        </div>
      </div>

      {provisional && (
        <span className="mt-4 flex justify-center">
          <Pending dark>Rating to confirm</Pending>
        </span>
      )}

      {profileUrl && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="label mt-6 inline-block py-1.5 text-paper underline underline-offset-4"
        >
          Read them on Google
        </a>
      )}
    </div>
  )
}
