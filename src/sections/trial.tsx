import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Curtain } from '@/components/curtain'
import { Pending, VideoSlot } from '@/components/paper'
import { Reveal } from '@/components/reveal'
import { site, trial } from '@/data/site'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'

/** Quanto tempo o item fica visível antes de se marcar. Curto o bastante para
    acompanhar a rolagem, longo o bastante para a marca ser vista acontecendo:
    marcado instantaneamente, ninguém percebe que houve um gesto. */
const TICK_DELAY_MS = 260

/**
 * [IV] A AULA EXPERIMENTAL — a seção que entrou no lugar do corpo técnico.
 *
 * Ela existe porque a objeção real de quem nunca treinou não é "o professor é
 * bom?", é "o que exatamente vai acontecer comigo quando eu atravessar aquela
 * porta?". Uma seção de coaches PEDE confiança; esta ENTREGA a informação que
 * substitui a confiança, que é mais barato para quem ainda não conhece ninguém
 * ali.
 *
 * DUAS COLUNAS: o vídeo de dentro da academia à esquerda, a prancheta à
 * direita. O vídeo é o segundo arquivo do cliente e NÃO é o mesmo do hero: lá é
 * o professor falando com a câmera (quem eu sou), aqui é a sala funcionando
 * (como é lá dentro).
 *
 * O vídeo fica à ESQUERDA, e não à direita como no hero. Duas seções com a
 * mesma peça no mesmo lado leem como a mesma seção repetida; espelhado, o par
 * lê como uma rima. No celular a ordem se inverte (`order-*`): empilhado, a
 * prancheta vem primeiro, porque quem rolou até aqui precisa do título antes do
 * vídeo para saber se vale o play.
 *
 * É a primeira das duas inversões escuras da página. A segunda é o pedido.
 */
export function Trial({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="trial"
      ref={ref}
      /* 80px em cima e embaixo, fixo, a pedido. Não é o `band` da casa (que vai
         a 128px) porque esta seção divide a tela com um vídeo 9/16, e cada
         pixel de folga sai da altura dele. */
      className="relative overflow-hidden bg-ink py-20 text-paper"
    >
      <SectionVideo />
      <Curtain target={ref} className="bg-red" />

      <div className="shell relative">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-14">
          {/* A largura do vídeo sai da ALTURA da janela, e não da coluna: 68svh
              de altura em 9/16 dá a largura. É o que garante que a seção inteira
              caiba numa tela sem nunca deformar o vídeo. O teto subiu de 68% a
              76% da altura: com a prancheta travada em 34rem, sobrou largura na
              linha, e quem devia ficar com ela é o vídeo. */}
          <div className="order-2 w-full max-w-[18rem] shrink-0 sm:max-w-[21rem] lg:order-1 lg:w-[min(32rem,calc(76svh*9/16))] lg:max-w-none">
            <Reveal gesture="rise">
              {/* O vídeo colado com FITA. A tira fica dentro do mesmo `Reveal`
                  que o vídeo: animada à parte, ela entraria deslocada do que
                  está prendendo, e fita que não acompanha o que cola não é
                  fita. */}
              <div className="relative">
                <VideoSlot
                  src={site.insideVideo.src}
                  poster={site.insideVideo.poster}
                  brief={trial.videoBrief}
                  ratio="9 / 16"
                  /* Toca sozinho, mudo e em laço. Autoplay IMPLICA mudo:
                     navegador nenhum autoriza som sem interação. Os controles
                     continuam ali, então quem quiser ouvir a sala tira o mudo
                     com um clique. */
                  autoplay
                  onPlay={() => track('vsl_play', { location: 'trial' })}
                  className="shadow-lift"
                />
                <Tape />
              </div>
            </Reveal>

            {/* A pendência do vídeo só aparece enquanto o arquivo não existe.
                Ele chegou, então ela não é impressa: marcador que continua na
                tela depois do dado chegar é pior que marcador nenhum, porque
                ensina o cliente a ignorar os outros. */}
            {!site.insideVideo.src && (
              <div className="mt-2.5 flex justify-center lg:justify-start">
                <Pending dark>Video to record</Pending>
              </div>
            )}
          </div>

          {/* A prancheta tem largura FIXA no desktop em vez de tomar o que
              sobra. Com `flex-1` ela esticava até quase novecentos pixels numa
              tela larga, e uma folha desse tamanho deixa de parecer uma
              prancheta e passa a parecer uma página. O par fica centrado na
              linha, e o que cresce numa tela maior é o vídeo. */}
          <div className="order-1 w-full min-w-0 lg:order-2 lg:w-[34rem] lg:shrink-0">
            <Clipboard onBook={onBook} />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * A FITA que prende o vídeo pelo topo.
 *
 * Três coisas fazem uma tira translúcida ler como durex em vez de retângulo
 * claro, e nenhuma é opcional:
 *
 *  · as PONTAS SÃO RASGADAS. Fita arrancada do rolo com a mão nunca sai reta, e
 *    a ponta reta é o detalhe que denuncia o desenho. O recorte é um polígono
 *    com serrilha nas duas laterais.
 *  · ela DESFOCA o que está atrás (`backdrop-blur`). Fita adesiva é fosca: sem
 *    isso a tira lê como vidro, e vidro sobre vídeo lê como erro de opacidade.
 *  · ela é TORTA. Colada a prumo vira faixa de interface; três graus bastam para
 *    virar um gesto de mão.
 *
 * O brilho é um gradiente vertical com o meio mais SATURADO, que é como a luz
 * bate numa fita levemente curvada: o vinco central pega mais luz e as bordas
 * caem. Sem ele a tira fica chapada.
 *
 * A fita é VERMELHA, e por isso ela é quase opaca (70% nas bordas, 90% no
 * meio): fita colorida de verdade não deixa ver o que está embaixo, e uma
 * translucidez maior faria o vermelho virar um véu rosado em cima do vídeo em
 * vez de um objeto sobre ele. O desfoque continua, porque mesmo opaca ela
 * precisa da superfície fosca.
 */
function Tape() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-5 left-1/2 h-10 w-28 -translate-x-1/2 -rotate-3 bg-gradient-to-b from-red/70 via-red/90 to-red/70 shadow-[0_3px_8px_-3px_rgba(0,0,0,0.6)] backdrop-blur-[2px] md:w-32"
      style={{
        clipPath:
          'polygon(5% 0%, 95% 0%, 100% 18%, 96% 36%, 100% 54%, 96% 72%, 100% 100%, 5% 100%, 0% 78%, 4% 58%, 0% 40%, 4% 20%)',
      }}
    />
  )
}

/**
 * O vídeo de fundo.
 *
 * Ele só é BAIXADO quando a seção se aproxima da tela: o elemento nasce sem
 * `src` e com `preload="none"`, e um observador escreve a fonte quando falta uma
 * tela inteira para chegar. São 1,1 MB que não saem da rede de quem nunca rola
 * até aqui, e a seção é a quarta da página.
 *
 * O `poster` aparece antes do arquivo chegar, então o fundo nunca é um
 * retângulo preto esperando: é o primeiro quadro, já escurecido pelo mesmo véu.
 *
 * O VÉU é de 82%, e não é conservadorismo de designer. A filmagem mostra a sala
 * VAZIA, com os tatames enrolados no plástico; no claro, ela contradiz o texto
 * que está por cima (que descreve aquecimento, drill e rola). A 82% ela cumpre o
 * papel que um fundo tem que cumprir, que é dar profundidade e lugar, sem
 * afirmar nada que a copy desminta.
 *
 * `muted` vai no ref e não só no JSX: o React aplica esse atributo de forma não
 * confiável no <video> (facebook/react#10389), e sem o mudo valendo de verdade o
 * autoplay é bloqueado pelo navegador.
 *
 * Com `prefers-reduced-motion` o vídeo não é montado e fica só o pôster: fundo
 * em movimento é exatamente o que essa preferência existe para desligar.
 */
function SectionVideo() {
  const holder = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '100% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={holder} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <img
        src={trial.bgVideo.poster}
        alt=""
        width={720}
        height={794}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />

      {!reduce && near && (
        <video
          ref={(el) => {
            if (!el) return
            el.muted = true
            el.defaultMuted = true
            el.volume = 0
          }}
          src={trial.bgVideo.src}
          poster={trial.bgVideo.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-ink/[0.82]" />
    </div>
  )
}

/**
 * A PRANCHETA, e TUDO que a seção tem a dizer está nela: o rótulo, o título, a
 * lista e a ação. Nada dela sobra solto no fundo escuro.
 *
 * Três camadas, e cada uma é uma peça do objeto real: a tábua escura, o clipe
 * de metal mordendo o topo, e a folha de papel presa embaixo dele.
 *
 * É o objeto certo para este conteúdo: o que a seção lista é o que a academia
 * confere antes de a pessoa pisar no tatame, e isso mora numa prancheta na
 * recepção, não num cartão de software. E ele resolve um problema de composição
 * de graça: a seção é escura, a folha é clara, e o bloco inteiro passa a ser a
 * coisa mais legível da tela sem nenhum artifício de cor.
 *
 * A inclinação de 0,6° é o que separa "objeto pousado" de "div": reto demais e
 * volta a ser um cartão; mais que um grau e vira adesivo.
 *
 * A LISTA SE MARCA SOZINHA conforme a seção passa pela tela. Um observador por
 * item: quando o item está bem dentro da tela, um temporizador curto o marca;
 * sair antes disso cancela o temporizador, mas item já marcado NUNCA desmarca.
 * O `rootMargin` corta 12% de baixo para o item precisar subir um pouco além da
 * borda antes de contar, senão a lista inteira acende no primeiro quadro em que
 * a seção entra.
 *
 * A mecânica é portada do `RightFit` do Jiu-Jitsu Prime (back to school). O que
 * NÃO veio de lá foi o vestido: a referência é folha de caderno pautada, furo de
 * fichário, giz de cera e um selo "A+", que é desenho de campanha infantil e
 * serve muito bem ao público de lá.
 *
 * Duas diferenças de comportamento, também de propósito:
 *
 *  · lá o item DESMARCA ao sair da tela; aqui, não. Esta página já estabeleceu
 *    em "how to get started" que o preenchimento é cumulativo e nunca volta
 *    atrás, e duas listas que se animam com regras opostas é ruído.
 *  · lá o item é um botão que a pessoa alterna. Aqui não é: a referência faz
 *    perguntas ao leitor (e alternar é responder), enquanto esta lista afirma o
 *    que acontece na aula. Um "checkbox" que não decide nada só promete uma
 *    interação que não existe.
 *
 * Com `prefers-reduced-motion` os seis já vêm marcados, que é o estado final
 * correto de uma lista que termina cheia.
 */
function Clipboard({ onBook }: { onBook: () => void }) {
  const listRef = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const [done, setDone] = useState<boolean[]>(() => trial.checklist.map(() => false))

  useEffect(() => {
    if (reduce) {
      setDone(trial.checklist.map(() => true))
      return
    }
    const list = listRef.current
    if (!list) return

    const items = Array.from(list.children) as HTMLElement[]
    const timers = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = items.indexOf(entry.target as HTMLElement)
          if (index === -1) continue

          if (entry.isIntersecting) {
            if (timers.has(index)) continue
            const id = window.setTimeout(() => {
              timers.delete(index)
              setDone((prev) => (prev[index] ? prev : prev.map((v, i) => (i === index ? true : v))))
              observer.unobserve(entry.target)
            }, TICK_DELAY_MS)
            timers.set(index, id)
          } else {
            const pending = timers.get(index)
            if (pending) {
              window.clearTimeout(pending)
              timers.delete(index)
            }
          }
        }
      },
      { threshold: 0.9, rootMargin: '0px 0px -12% 0px' }
    )

    items.forEach((item) => observer.observe(item))
    return () => {
      observer.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [reduce])

  const count = done.filter(Boolean).length

  return (
    <Reveal gesture="rise">
      <div className="relative rotate-[-0.6deg]">
        {/* A tábua. O `pt-9` é o espaço que o clipe ocupa. */}
        <div className="rounded-[16px] border border-paper/12 bg-ink-2 p-3 pt-9 shadow-lift">
          {/* A folha. */}
          <div className="rounded-[8px] bg-paper px-6 py-6 md:px-8 md:py-7">
            <p className="label inline-flex items-center gap-2.5 text-ink-soft">
              <span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
              Your first class
            </p>

            {/* O espaço explícito no fim do primeiro bloco: sem ele o
                `textContent` do h2 sai "worksat Holanda BJJ", que é o que o
                leitor de tela pronuncia. Em elemento de bloco ele colapsa na
                renderização e não empurra nada. */}
            {/* DUAS LINHAS EM QUALQUER LARGURA, e é por isso que "works" está
                na segunda e não na primeira.

                A coluna da prancheta tem 34rem, e o que sobra para o texto
                depois da tábua e da folha são 456px. "How the trial class works"
                mede 469px quando a escala da seção chega ao teto (56px, de
                1342px de janela em diante): a linha estourava e a frase virava
                TRÊS linhas. No outro extremo, em 375px, a mesma linha mede 268px
                numa coluna de 263px e estourava de novo.

                Passando uma palavra para a segunda linha, a maior das duas fica
                com 425px no desktop e 243px no celular, com folga nos dois. A
                alternativa seria baixar o corpo do título só aqui, o que
                quebraria a escala de seção da página inteira por causa de uma
                coluna estreita.

                O `block` é o que quebra; o destaque mora no span de dentro
                porque o fundo precisa ter a largura das PALAVRAS. Num elemento
                de bloco ele se estenderia até a margem da coluna. */}
            <h2 className="display type-section mt-4 text-balance text-ink">
              How the trial class{' '}
              <span className="block">
                works <span className="mark">at Holanda BJJ.</span>
              </span>
            </h2>

            <div className="mt-7 flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <p className="label text-ink-soft">Every first class includes</p>
              {/* `aria-hidden`: o contador conta um preenchimento decorativo, e
                  anunciar "1 de 6, 2 de 6" enquanto a pessoa rola empurraria
                  atualização ao vivo para o leitor de tela por motivo visual. A
                  lista em si continua legível item a item. */}
              <p aria-hidden="true" className="label tnum text-ink-soft">
                <span className="text-red">{count}</span>/{trial.checklist.length}
              </p>
            </div>

            <ul ref={listRef} className="flex flex-col divide-y divide-line">
              {trial.checklist.map((item, i) => (
                <li key={item} className="flex items-center gap-3.5 py-2.5">
                  <Tick on={done[i]} />
                  <span
                    className={cn(
                      'text-[0.92rem] leading-snug transition-colors duration-300',
                      done[i] ? 'text-ink' : 'text-ink-soft'
                    )}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-start gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:gap-6">
              <Button
                size="lg"
                onClick={() => {
                  track('cta_click', { location: 'trial' })
                  onBook()
                }}
              >
                Book my free class
              </Button>
              <span className="text-[0.88rem] text-ink-soft">
                or call{' '}
                <a
                  href={site.phoneHref}
                  onClick={() => track('cta_click', { location: 'trial_phone' })}
                  className="tnum text-ink underline underline-offset-4 decoration-red"
                >
                  {site.phone}
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* O clipe, mordendo a borda de cima da tábua. O vão escuro no meio é o
            que faz ele ler como uma peça que aperta em vez de um retângulo
            cinza colado ali. */}
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 flex h-9 w-32 -translate-x-1/2 items-center justify-center rounded-[8px] border border-ink/30 bg-gradient-to-b from-paper via-line to-line-strong shadow-[0_8px_16px_-6px_rgba(0,0,0,0.75)]"
        >
          <span className="block h-2 w-14 rounded-full bg-ink/35 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
        </span>
      </div>
    </Reveal>
  )
}

/**
 * O quadrado do visto.
 *
 * O traço se DESENHA em vez de aparecer: `pathLength={1}` normaliza o
 * comprimento da linha para 1, então um `strokeDashoffset` de 1 a 0 risca o
 * visto da esquerda para a direita sem precisar saber quanto o caminho mede.
 * É a técnica do original, e é a única parte dele que veio intacta.
 */
function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-6 w-6 shrink-0 place-items-center rounded-inner border transition-colors duration-300',
        on ? 'border-red bg-red' : 'border-line-strong bg-transparent'
      )}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
        <path
          d="M5 12.5 10 17.5 19 7"
          pathLength={1}
          stroke="var(--color-paper)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: on ? 0 : 1,
            transition: 'stroke-dashoffset 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>
    </span>
  )
}
