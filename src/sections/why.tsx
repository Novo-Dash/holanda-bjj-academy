import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Media, SectionHead } from '@/components/paper'
import { ReasonIcon } from '@/components/icons'
import { reasons, type Reason } from '@/data/site'
import { cn } from '@/lib/utils'

/** Qual dos quatro cartões é o escuro. Um só: o cartão invertido é o acento da
    fileira, e acento repetido deixa de ser acento. O terceiro por ser o do meio
    para o fim, onde a fileira já começou a ficar monótona. */
const DARK_CARD = 2

/** Em que ponto da rolagem presa a fileira TERMINA de andar.
 *
 *  Antes era 1, ou seja: o último cartão só ficava inteiro no quadro exato em
 *  que a seção se soltava e começava a subir. Na prática ninguém chegava a ver
 *  o quarto cartão completo, porque ele terminava de entrar e saía junto.
 *
 *  A 0,86 a fileira acaba de andar faltando 14% da rolagem presa, e esse resto
 *  é um REPOUSO: o último cartão fica parado, inteiro e alinhado com a margem
 *  do texto, antes de a página seguir. A altura da seção cresce na mesma
 *  proporção (`overflow / TRAVEL_END`), então o repouso é tempo ADICIONADO no
 *  fim e não aceleração da fileira: um pixel rolado continua valendo um pixel
 *  andado de lado, que é o que mantém o peso do gesto. */
const TRAVEL_END = 0.86

/**
 * [V] POR QUE AS PESSOAS FICAM — carrossel horizontal preso à rolagem.
 *
 * O título é o da referência ("why people stay") e ele é melhor que "por que
 * aqui" por um motivo de argumento: quem chega de anúncio já viu dez academias
 * dizerem por que são boas. Quem FICOU é outra afirmação.
 *
 * A ESTRUTURA é a do "our classes" do Renzo Gracie Canadá, e a versão anterior
 * desta seção estava errada exatamente onde ela acerta:
 *
 *  · lá o cartão é um BLOCO SÓLIDO com fundo próprio, texto de um lado e imagem
 *    sangrando até a borda do outro. Aqui era uma foto solta com texto ao lado,
 *    sem nada segurando os dois, e o resultado lia como pedaços espalhados em
 *    vez de quatro peças;
 *  · lá o cartão ocupa quase metade da tela. Aqui tinha 544px, tamanho de
 *    cartão de lista, e num carrossel de tela cheia isso parece um erro de
 *    escala;
 *  · lá a barra de progresso fica no CABEÇALHO, debaixo do título. Aqui ela
 *    corria no pé dos cartões, e com o cartão virando bloco sólido não existe
 *    mais uma borda onde ela possa correr.
 *
 * O que NÃO veio de lá: a paleta, a tipografia, a moldura (o `plate` da casa,
 * com fio interno recuado), o disco vermelho do ícone e o numeral vazado. A
 * estrutura é emprestada; o material é o desta página.
 *
 * O carrossel anda de lado enquanto a página desce, e isso NÃO sequestra a
 * rolagem: nada é `preventDefault`. A pessoa rola como sempre, e o que muda é só
 * o que ela vê enquanto rola.
 *
 * TRÊS MODOS, e os dois de fallback não são enfeite:
 *
 *  · no desktop, preso e ligado à rolagem;
 *  · no celular, a fileira vira uma PILHA VERTICAL e a seção volta à altura
 *    normal (é o que a referência faz também). Prender a tela num aparelho onde
 *    a rolagem é o dedo é o jeito mais rápido de alguém achar que travou;
 *  · com `prefers-reduced-motion`, o modo do celular vale em qualquer largura.
 */
export function Why() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()

  const [pinned, setPinned] = useState(false)
  /** Quanto a fileira é mais larga que a janela. Zero enquanto não se mede. */
  const [overflow, setOverflow] = useState(0)

  /* O modo é decidido por media query, e não por largura guardada em state:
     `matchMedia` avisa quando muda (girar o aparelho, arrastar a janela) sem um
     ouvinte de resize disparando a cada pixel. */
  useEffect(() => {
    if (reduce) {
      setPinned(false)
      return
    }
    const query = window.matchMedia('(min-width: 1024px)')
    const apply = () => setPinned(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [reduce])

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    setOverflow(Math.max(0, track.scrollWidth - viewport.clientWidth))
  }, [])

  /* `useLayoutEffect` e não `useEffect`: a altura da seção depende desta medida,
     e medir depois da pintura faz a página dar um pulo de várias centenas de
     pixels no primeiro quadro. */
  useLayoutEffect(() => {
    if (!pinned) {
      setOverflow(0)
      return
    }
    measure()
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [pinned, measure])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, TRAVEL_END], [0, -overflow])
  /* O preenchimento vem do `MotionValue` e nunca passa pelo React: a barra é
     repintada pela mesma via da fileira, sem um `setState` por quadro.

     Ele acompanha a FILEIRA e não a rolagem: a barra enche quando o último
     cartão chega, e fica cheia durante o repouso. Amarrada à rolagem, ela
     continuaria subindo depois que nada mais se move, que é a barra dizendo
     que falta coisa quando já não falta. */
  const fill = useTransform(scrollYProgress, [0, TRAVEL_END], ['0%', '100%'])

  return (
    <section
      id="why"
      ref={sectionRef}
      className="textured relative bg-paper"
      /* A altura extra é EXATAMENTE a sobra horizontal: um pixel rolado para
         baixo move um pixel para o lado. Qualquer outra proporção faz a fileira
         andar rápido ou devagar demais em relação ao dedo, que é o que dá a
         sensação de peso falso nesse tipo de seção. */
      style={pinned ? { height: `calc(100svh + ${Math.round(overflow / TRAVEL_END)}px)` } : undefined}
    >
      <div
        className={cn(
          pinned ? 'sticky top-0 flex h-svh flex-col overflow-hidden py-14' : 'band flex flex-col'
        )}
      >
        <div className="shell shrink-0">
          <SectionHead
            stroke="Why people stay"
            title="No egos, no guesswork."
            large
            aside={
              /* Duas linhas na coluna de apoio (~23rem). A lista que abria a
                 frase ("academia limpa, currículo claro, treinadores presentes")
                 saiu porque ela É os quatro cartões logo abaixo: o cabeçalho
                 gastava quatro linhas anunciando o que a seção inteira ia
                 dizer em seguida, com foto e tudo. O que sobrou é a única
                 oração que os cartões não repetem. */
              <p className="type-body leading-relaxed text-ink-soft">
                Authentic jiu-jitsu does not have to mean an intimidating first day.
              </p>
            }
          />

          {/* A barra fica no CABEÇALHO, como na referência: ela é o índice da
              seção, e índice se lê antes do conteúdo, não depois. Só no modo
              preso, porque no celular a pilha é vertical e quem mede o avanço é
              a barra de rolagem do próprio navegador. */}
          {pinned && (
            <div aria-hidden="true" className="mt-9 h-0.5 w-full overflow-hidden bg-line">
              <motion.div className="h-full bg-red" style={{ width: fill }} />
            </div>
          )}
        </div>

        <div
          ref={viewportRef}
          className={cn(
            'mt-8 md:mt-10',
            pinned ? 'flex flex-1 items-center overflow-hidden' : 'shell'
          )}
        >
          <motion.ul
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className={cn(
              'flex',
              pinned
                ? 'shell-start shell-end w-max items-stretch gap-5 md:gap-6'
                : 'flex-col gap-5'
            )}
          >
            {reasons.map((reason, i) => (
              <ReasonCard
                key={reason.id}
                reason={reason}
                index={i}
                dark={i === DARK_CARD}
                pinned={pinned}
              />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}

/**
 * Um diferencial, em bloco sólido.
 *
 * Texto à esquerda, imagem sangrando até a borda à direita, e o cartão inteiro
 * com `overflow-hidden` para a foto herdar o canto arredondado sem precisar de
 * raio próprio.
 *
 * O NUMERAL no pé do texto está no lugar onde a referência põe um botão. São
 * quatro cartões: quatro botões idênticos dizendo "experimente uma aula" seriam
 * a mesma frase quatro vezes numa fileira que a pessoa atravessa em seis
 * segundos. O numeral preenche o mesmo canto, diz em que ponto dos quatro ela
 * está, e é o vocabulário que a seção "how to get started" já usa.
 *
 * O disco do ícone virou o RÓTULO do cartão (onde a referência põe um eyebrow de
 * texto). Ele sobreviveu à reforma porque é o único elemento da seção que não é
 * nem foto nem letra, e é o que dá aos quatro cartões uma família.
 */
function ReasonCard({
  reason,
  index,
  dark,
  pinned,
}: {
  reason: Reason
  index: number
  dark: boolean
  pinned: boolean
}) {
  return (
    <li
      className={cn(
        'overflow-hidden rounded-plate',
        dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink',
        pinned
          ? 'flex w-[46vw] max-w-[44rem] shrink-0 flex-row h-[clamp(20rem,52svh,32rem)]'
          : 'flex w-full flex-col'
      )}
    >
      <div className={cn('flex min-w-0 flex-col p-7 md:p-9', pinned && 'flex-1')}>
        <span
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center rounded-full',
            dark ? 'bg-paper text-ink' : 'bg-red text-paper'
          )}
        >
          <ReasonIcon name={reason.icon} className="h-5 w-5" />
        </span>

        <h3 className="display mt-7 text-[1.6rem] leading-none md:text-[2rem]">{reason.title}</h3>

        <p
          className={cn(
            'mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed',
            dark ? 'text-paper/70' : 'text-ink-soft'
          )}
        >
          {reason.body}
        </p>

        <span
          aria-hidden="true"
          className={cn(
            'display tnum mt-7 block select-none text-[2.4rem] leading-none md:mt-auto md:pt-8',
            dark ? 'text-paper/20' : 'text-line-strong'
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className={cn('relative shrink-0', pinned ? 'w-[46%]' : 'h-56 w-full')}>
        <Media
          src={reason.image}
          alt={reason.imageAlt}
          brief={reason.brief}
          fill
          width={560}
          height={700}
          /* Sem raio e sem moldura: quem arredonda é o cartão, e uma borda aqui
             desenharia um fio no meio do bloco. */
          className="h-full rounded-none border-0"
        />
      </div>
    </li>
  )
}
