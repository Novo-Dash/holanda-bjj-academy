import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Mark } from '@/components/mark'
import { Reveal } from '@/components/reveal'
import { site } from '@/data/site'

/* ── Pendência ───────────────────────────────────────────────────────────────
   Marca no lugar do dado que o cliente ainda não mandou. A página imprime o
   marcador em vez de inventar: faixa de professor, nota de avaliação, horário
   de aula e telefone não se preenchem com placeholder plausível, porque
   plausível é exatamente o que ninguém confere depois.

   Fica visível em modo prospect (o padrão) e some quando VITE_UX_MODE=client,
   que é a versão que o cliente abre. */
export const CLIENT_MODE = import.meta.env.VITE_UX_MODE === 'client'

export function Pending({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  if (CLIENT_MODE) return null
  return (
    <span
      className={cn(
        'mt-2 inline-flex items-center gap-2 rounded-inner border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]',
        dark
          ? 'border-paper/30 bg-paper/10 text-paper/80'
          : 'border-red/30 bg-red-soft text-red-deep'
      )}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}

/* ── Fundo fotográfico ───────────────────────────────────────────────────────
   A foto da turma atrás de uma seção escura. Duas seções usam isto — a
   primeira tela e o pedido final —, e por isso ela é uma peça e não duas
   cópias: o véu e os degradês são o que torna a foto legível por baixo do
   texto, e dois ajustes feitos em lugares diferentes viram duas seções que
   quase combinam.

   Quem chama diz só o quanto quer fechar o véu e de que lado precisa do
   reforço. Nada aqui é decorativo: sem os degradês de topo e pé a seção não
   emenda com a de cima nem com a de baixo, e a foto termina num corte seco. */
export function PhotoBackdrop({
  veil = 0.88,
  scrim = 'none',
  position = 'center',
  priority = false,
}: {
  /** Fração de tinta por cima da foto. Quanto mais texto por cima, mais alto. */
  veil?: number
  /** Reforço extra de um lado, para o texto que não fica centralizado. */
  scrim?: 'none' | 'left'
  /** `object-position` da foto. Duas seções com a mesma foto no mesmo
      enquadramento leem como erro de montagem. */
  position?: 'center' | 'top' | 'bottom'
  priority?: boolean
}) {
  return (
    <>
      <img
        src={site.heroImage.src}
        alt={site.heroImage.alt}
        width={site.heroImage.width}
        height={site.heroImage.height}
        /* Na primeira tela ela é o LCP e precisa da dica de prioridade; no
           pedido final ela está a nove seções de distância e carregar cedo só
           tira banda de quem ainda está lendo o começo. */
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'absolute inset-0 -z-20 h-full w-full select-none object-cover',
          position === 'top' ? 'object-top' : position === 'bottom' ? 'object-bottom' : 'object-center'
        )}
        draggable={false}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink"
        style={{ opacity: veil }}
      />
      {scrim === 'left' && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-ink via-ink/45 to-transparent lg:w-3/5"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-ink to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ink to-transparent"
      />
    </>
  )
}

/* ── Mídia ───────────────────────────────────────────────────────────────────
   Toda foto passa por aqui.

   O SLOT VAZIO NÃO É UMA CAIXA CINZA. Enquanto a foto real não chega, o lugar
   dela é uma placa desenhada: papel tonalizado com a textura da página, fio
   interno recuado e a marca vazada no centro. Essa é a diferença entre uma
   página que parece inacabada e uma que parece composta: caixa tracejada
   vazia lê como erro, placa com a marca lê como parte do desenho.

   O briefing do que precisa entrar ali fica embaixo, e some no modo cliente
   junto com a pendência. Trocar `image: null` pelo caminho do arquivo em
   `src/data/site.ts` é tudo o que é preciso fazer quando a foto chegar. */
export function Media({
  src,
  alt,
  brief,
  className,
  imgClassName,
  ratio = '4 / 5',
  fill = false,
  width,
  height,
  priority = false,
}: {
  src: string | null
  alt: string
  /** O que precisa aparecer nesta foto. Vira o rótulo do slot vazio. */
  brief: string
  className?: string
  imgClassName?: string
  ratio?: string
  /** Ignora a proporção e ocupa a altura do pai. Para quando quem manda no
      tamanho é o contêiner (o cartão do carrossel, cuja altura sai da janela) e
      não a imagem: `aspect-ratio` e `height: 100%` ao mesmo tempo é uma
      contradição, e o navegador resolve ela do jeito que quiser. */
  fill?: boolean
  /** Obrigatórias, e não opcionais: imagem sem dimensão declarada reserva zero
      de altura e a página inteira pula quando o arquivo chega. É a métrica de
      CLS indo embora por um atributo esquecido. */
  width: number
  height: number
  /** Só o hero. Tira a imagem da fila preguiçosa e pede prioridade de rede. */
  priority?: boolean
}) {
  if (!src) {
    return (
      <div
        className={cn('plate textured relative overflow-hidden bg-paper-2', fill && 'h-full', className)}
        style={fill ? undefined : { aspectRatio: ratio }}
        role="img"
        aria-label={brief}
      >
        <Mark className="absolute left-1/2 top-1/2 h-2/5 max-h-32 w-auto -translate-x-1/2 -translate-y-1/2 text-ink opacity-[0.07]" />
        {!CLIENT_MODE && (
          <span className="absolute inset-x-5 bottom-5 block text-center">
            <span className="label block text-ink-soft">Photo pending</span>
            <span className="mx-auto mt-2 block max-w-[26ch] text-[0.76rem] leading-snug text-ink-soft">
              {brief}
            </span>
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn('overflow-hidden rounded-plate bg-paper-2', fill && 'h-full', className)}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </div>
  )
}

/* ── Vídeo ───────────────────────────────────────────────────────────────────
   Mesma regra da foto: enquanto o arquivo não existe, o slot é uma placa
   desenhada com o briefing do que precisa ser gravado. Um player quebrado ou
   um vídeo de banco de imagens no hero custa mais caro que um slot honesto.

   `controls` do navegador por padrão, porque é por ali que a pessoa pausa e
   liga o som. `soundInvite` troca esses controles por um player da casa, que
   pede uma coisa só e a pede grande: o som. Ver `PlayableVideo`.

   `autoplay` é OPCIONAL e vem desligado. Ligado, ele traz `muted` e `loop`
   junto, e não por gosto: navegador nenhum autoriza autoplay com som, então
   autoplay implica mudo. Os controles continuam ali, então quem quiser o som
   tira o mudo com um clique.

   COM AUTOPLAY, O ARQUIVO SÓ É BAIXADO QUANDO A SEÇÃO SE APROXIMA. Um vídeo que
   toca sozinho e tem `src` desde a montagem começa a baixar assim que o React
   monta a árvore, e aqui isso são megabytes cobrados de quem talvez nunca role
   até a seção. O `src` entra a uma tela de distância, e o vídeo PAUSA quando
   sai da tela: laço rodando fora de vista é bateria queimada sem ninguém ver.

   Sem autoplay, `preload="metadata"`: o navegador busca só a duração e o
   primeiro frame, e o resto quando alguém dá play. */
export function VideoSlot({
  src,
  poster,
  brief,
  ratio = '9 / 16',
  autoplay = false,
  soundInvite = false,
  dark = false,
  onPlay,
  className,
}: {
  src: string | null
  poster?: string | null
  /** O que precisa estar neste vídeo. Vira o rótulo do slot vazio. */
  brief: string
  ratio?: string
  autoplay?: boolean
  /** Troca os controles do navegador por um player da casa, desenhado para
      CONVIDAR AO SOM. Só faz sentido junto de `autoplay`, e é por isso que ele
      é ignorado sem ele: o convite existe porque o vídeo já está rodando mudo. */
  soundInvite?: boolean
  /** A placa vazia sobre fundo escuro. Sem isto o slot da VSL vira um retângulo
      branco no meio da primeira tela, que é a única coisa que o olho vê. */
  dark?: boolean
  onPlay?: () => void
  className?: string
}) {
  if (!src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          dark ? 'plate-dark bg-ink-2' : 'plate textured bg-paper-2',
          className
        )}
        style={{ aspectRatio: ratio }}
        role="img"
        aria-label={brief}
      >
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-7 text-center">
          <span
            className={cn(
              'grid h-16 w-16 place-items-center rounded-full border',
              dark ? 'border-paper/25 bg-paper/10' : 'border-line-strong bg-paper/60'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-red" aria-hidden="true">
              <path d="M6 3.5v17l15-8.5-15-8.5Z" />
            </svg>
          </span>
          {!CLIENT_MODE && (
            <>
              <span className={cn('label', dark ? 'text-paper/70' : 'text-ink-soft')}>
                Video pending
              </span>
              <span
                className={cn(
                  'max-w-[24ch] text-[0.76rem] leading-snug',
                  dark ? 'text-paper/60' : 'text-ink-soft'
                )}
              >
                {brief}
              </span>
            </>
          )}
        </span>
      </div>
    )
  }

  return <PlayableVideo {...{ src, poster, ratio, autoplay, soundInvite, onPlay, className }} />
}

function PlayableVideo({
  src,
  poster,
  ratio,
  autoplay,
  soundInvite,
  onPlay,
  className,
}: {
  src: string
  poster?: string | null
  ratio: string
  autoplay: boolean
  soundInvite: boolean
  onPlay?: () => void
  className?: string
}) {
  const holder = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  /* Sem autoplay o `src` entra de saída: quem clica em play espera o vídeo, não
     um observador decidindo se já pode carregar. */
  const [armed, setArmed] = useState(!autoplay)

  /* O convite ao som depende do autoplay: sem ele o vídeo já começa parado e o
     play do navegador dá conta. Não há o que convidar num vídeo que não anda. */
  const invite = soundInvite && autoplay

  /** Mudo, e portanto ainda no estado em que o vídeo é PAPEL DE PAREDE. */
  const [silent, setSilent] = useState(true)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  /* Depois que a pessoa mexe, o observador de rolagem para de dar play sozinho.
     Sem isto, quem pausou o vídeo e rolou a página veria ele voltar a tocar ao
     subir de novo, que é o player desobedecendo uma ordem explícita. */
  const taken = useRef(false)

  useEffect(() => {
    if (!autoplay) return
    const el = holder.current
    if (!el) return

    /* Um observador arma o carregamento a uma tela de distância; o outro liga e
       desliga a reprodução conforme o vídeo entra e sai da tela. São dois
       porque as margens são diferentes: carregar cedo é bom, tocar cedo (fora
       da vista) não é. */
    const arm = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setArmed(true)
        arm.disconnect()
      },
      { rootMargin: '100% 0px' }
    )
    arm.observe(el)

    const toggle = new IntersectionObserver(
      (entries) => {
        const node = video.current
        if (!node) return
        if (!entries[0]?.isIntersecting) node.pause()
        else if (!taken.current) void node.play().catch(() => {})
      },
      { threshold: 0.2 }
    )
    toggle.observe(el)

    return () => {
      arm.disconnect()
      toggle.disconnect()
    }
  }, [autoplay])

  /** O clique que vale: liga o som e RECOMEÇA O VÍDEO. Quem tira o mudo aos
      quarenta segundos pegou o argumento pela metade, e recomeçar entrega a
      conversa inteira em vez do fim dela. O laço cai junto: repetir de graça
      uma imagem de fundo é atmosfera, repetir alguém falando é disco riscado. */
  function turnOnSound() {
    const el = video.current
    if (!el) return
    taken.current = true
    el.muted = false
    el.defaultMuted = false
    el.volume = 1
    el.loop = false
    el.currentTime = 0
    void el.play().catch(() => {})
    setSilent(false)
    /* É AQUI que o play é contado, e não no evento do vídeo. Com autoplay o
       evento dispara em toda visita e a métrica vira uma segunda contagem de
       pageview; o que merece medida é a pessoa PEDINDO o som. */
    onPlay?.()
  }

  function toggleRun() {
    const el = video.current
    if (!el) return
    taken.current = true
    if (el.paused) void el.play().catch(() => {})
    else el.pause()
  }

  /** Clicar na régua pula para o ponto. Barra que anda mas não obedece é
      enfeite, e o visitante descobre isso na primeira tentativa. */
  function seek(event: MouseEvent<HTMLDivElement>) {
    const el = video.current
    if (!el || !el.duration) return
    const box = event.currentTarget.getBoundingClientRect()
    const at = (event.clientX - box.left) / box.width
    taken.current = true
    el.currentTime = Math.min(Math.max(at, 0), 1) * el.duration
  }

  return (
    <div
      ref={holder}
      className={cn('relative overflow-hidden rounded-plate bg-ink', className)}
      style={{ aspectRatio: ratio }}
    >
      <video
        /* O `muted` do JSX NÃO basta. O React aplica esse atributo de forma não
           confiável no <video> (facebook/react#10389), e sem o mudo valendo de
           verdade o autoplay ou é bloqueado pelo navegador, ou toca COM som
           quando a pessoa já interagiu com a página antes de chegar aqui, que é
           o caso mais comum numa landing page.

           O ref liga as duas propriedades na própria tag: `muted` (o estado
           agora) e `defaultMuted` (que é o que escreve o atributo no HTML, e o
           que vale quando o vídeo recarrega). */
        ref={(el) => {
          video.current = el
          if (!el) return
          el.muted = autoplay
          el.defaultMuted = autoplay
          if (autoplay) el.volume = 0
        }}
        src={armed ? src : undefined}
        poster={poster ?? undefined}
        controls={!invite}
        playsInline
        muted={autoplay}
        autoPlay={autoplay}
        loop={autoplay}
        preload={autoplay ? 'auto' : 'metadata'}
        onPlay={invite ? () => setPaused(false) : onPlay}
        onPause={invite ? () => setPaused(true) : undefined}
        onTimeUpdate={
          invite
            ? (event) => {
                const el = event.currentTarget
                if (el.duration) setProgress(el.currentTime / el.duration)
              }
            : undefined
        }
        className="h-full w-full object-cover"
      />

      {invite && (
        <>
          {/* O CONVITE. Enquanto está mudo, a superfície inteira é um botão, e o
              que ele oferece é o SOM, não o play: o vídeo já está rodando, e
              pedir play no que já se move é o convite errado. Depois que o som
              entra, o mesmo lugar vira pausa.

              O selo tem fundo próprio porque a VSL tem legenda queimada clara, e
              rótulo branco sobre imagem clara some. */}
          <button
            type="button"
            onClick={silent ? turnOnSound : toggleRun}
            aria-label={silent ? 'Turn on sound' : paused ? 'Play video' : 'Pause video'}
            className="group absolute inset-0 grid place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper"
          >
            {silent ? (
              <span className="flex flex-col items-center gap-3">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-red text-paper shadow-plate ring-4 ring-paper/20 transition-transform duration-200 group-hover:scale-105">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                </span>
                <span className="label rounded-full bg-ink/70 px-3 py-1.5 text-paper backdrop-blur-sm">
                  Turn on sound
                </span>
              </span>
            ) : (
              paused && (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-ink/70 text-paper backdrop-blur-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1" aria-hidden="true">
                    <path d="M6 3.5v17l15-8.5-15-8.5Z" />
                  </svg>
                </span>
              )
            )}
          </button>

          {/* A RÉGUA. Progresso de verdade e sem relógio: o número da duração na
              primeira tela entrega o tamanho do compromisso antes de a pessoa
              ter motivo para assumi-lo. A faixa de clique é alta o bastante
              para o polegar; o traço desenhado é fino. */}
          <div
            onClick={seek}
            role="presentation"
            className="absolute inset-x-0 bottom-0 flex h-6 cursor-pointer items-end"
          >
            <span className="block h-[3px] w-full bg-paper/25">
              <span
                className="block h-full bg-red transition-[width] duration-150 ease-linear"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </span>
          </div>

          {/* O mudo continua alcançável depois do convite aceito: quem ligou o
              som num escritório precisa desligar sem procurar. */}
          {!silent && (
            <button
              type="button"
              onClick={() => {
                const el = video.current
                if (!el) return
                el.muted = !el.muted
                setSilent(el.muted)
              }}
              aria-label="Mute video"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/60 text-paper backdrop-blur-sm transition-colors hover:bg-ink/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ── Fio duplo animado ───────────────────────────────────────────────────────
   A divisória da casa. Abre do centro para as pontas quando entra na tela: é
   o gesto `rule` do vocabulário, e o único lugar onde ele é usado. */
function DoubleRule({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Reveal gesture="rule" className={cn('h-[4px] w-full', className)}>
      <div className={dark ? 'rule-double-dark h-[4px] w-full' : 'rule-double h-[4px] w-full'} />
    </Reveal>
  )
}

/* ── Cabeçalho de seção ──────────────────────────────────────────────────────
   Contrato de abertura: numeral romano, rótulo, headline e, opcionalmente, uma
   linha de apoio à direita. O numeral é o que costura a página como um índice
   de catálogo: é ele que dá a sensação de coleção, e não de scroll infinito de
   blocos. */
export function SectionHead({
  index,
  label,
  stroke,
  title,
  aside,
  dark = false,
  accent = false,
  center = false,
  large = false,
  rule = 'double',
  className,
}: {
  /** O numeral e o rótulo do eyebrow. Omitir os DOIS tira a linha inteira: é
      assim que uma seção abre direto no título, sem um par de props com um
      `false` do lado explicando que elas não valem. */
  index?: string
  label?: string
  /** O nome da seção em contorno, acima do título e na mesma aresta dele. É o
      que ocupa hoje o lugar do eyebrow: o nome CURTO da seção. Três palavras é
      o teto — em contorno a 68px, uma frase inteira vira parede de texto
      vazado e come a atenção que era do título. */
  stroke?: string
  title: ReactNode
  aside?: ReactNode
  dark?: boolean
  /** Sobre o vermelho da marca. NÃO é o mesmo que `dark`: lá o rótulo pode ser
      papel a 70%, porque sobre tinta isso ainda dá 11:1. Sobre vermelho, papel
      a 70% cai para 3,3:1 e reprova para texto pequeno, então aqui ele é papel
      cheio. Um tom que só troca de cor sem refazer a conta de contraste é como
      a acessibilidade some de uma página sem ninguém notar. */
  accent?: boolean
  center?: boolean
  /** O fio de abertura. `double` é o da casa; `single` para coluna estreita,
      onde as duas linhas empilhadas viram um toco em vez de uma divisória. */
  rule?: 'double' | 'single' | 'none'
  /** Um degrau de corpo acima (`type-section-lg`, 78px de teto contra 56px).
      Nasceu para o cabeçalho que tem a largura toda, mas vale também com nota
      de apoio ao lado quando o título é curto: a coluna do título é `flex` e
      encolhe para o que sobra da linha, então o `max-w-4xl` daqui nunca chega a
      valer nesses casos. O limite é o título, não a prop: "Four ways to start."
      mede 536px a 78px de corpo numa coluna de 752px, e cabe numa linha. */
  large?: boolean
  className?: string
}) {
  const eyebrow = Boolean(index || label)

  return (
    <div className={className}>
      {rule === 'double' && <DoubleRule dark={dark || accent} />}
      {rule === 'single' && (
        <Reveal gesture="rule" className={cn('h-px w-full', dark || accent ? 'bg-paper/25' : 'bg-line-strong')}>
          <span className="sr-only" />
        </Reveal>
      )}

      <div
        className={cn(
          'mt-6 flex flex-col gap-6 md:gap-10',
          center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
        )}
      >
        <div className={large ? 'max-w-4xl' : 'max-w-2xl'}>
          {stroke && (
            <Reveal gesture="rise">
              {/* O TÍTULO SOBE POR CIMA DELA, e é isso que a margem negativa
                  faz. Sem ela a palavra vazada era uma linha empilhada em cima
                  do título com um vão entre as duas, ou seja: dois textos, um
                  depois do outro. Com -0,36em (da altura DELA, não da do
                  título) as caixas se sobrepõem em pouco mais de um terço, e a
                  leitura muda de "rótulo em cima" para "palavra passando por
                  trás" — que junto com a dissolução para baixo é o efeito
                  inteiro.

                  Quem pinta por cima é o título, sem z-index nenhum: caixas em
                  fluxo, não posicionadas, pintam na ordem da árvore, e o título
                  vem depois.

                  `leading-none` para a caixa da palavra ser a altura do corpo
                  dela, que é o que torna a margem em `em` previsível. */}
              <span
                className={cn(
                  'display stroke-word -mb-[0.36em] block leading-none',
                  'text-[clamp(3.25rem,7vw,5.75rem)]',
                  (dark || accent) && 'stroke-word-light'
                )}
                aria-hidden="true"
              >
                {stroke}
              </span>
            </Reveal>
          )}

          {eyebrow && (
            <Reveal gesture="rise">
              {/* Eyebrow: um bloco sólido de canto macio com o numeral romano em
                  papel, e o rótulo ao lado em caixa alta com tracking largo. O
                  `div` de fora existe só para o `justify-center`: o eyebrow é
                  inline-flex, e `text-center` do pai não centraliza filho flex. */}
              <div className={cn('flex', center && 'justify-center')}>
                <span className="inline-flex items-center gap-3.5">
                  {index && (
                    <span
                      className={cn(
                        'tnum rounded-inner px-2.5 py-1.5 font-sans text-[0.68rem] font-bold leading-none tracking-[0.08em]',
                        dark ? 'bg-paper text-ink' : accent ? 'bg-paper text-red' : 'bg-red text-paper'
                      )}
                    >
                      {index}
                    </span>
                  )}
                  {label && (
                    <span
                      className={cn(
                        'font-sans text-[0.68rem] font-bold uppercase tracking-[0.3em]',
                        dark ? 'text-paper/70' : accent ? 'text-paper' : 'text-red'
                      )}
                    >
                      {label}
                    </span>
                  )}
                </span>
              </div>
            </Reveal>
          )}

          <Reveal gesture="veil" delay={eyebrow || stroke ? 0.06 : 0} as="h2">
            <span
              className={cn(
                'display block text-balance',
                /* A folga só existe se houver alguma coisa em cima. Sem nada, o
                   título encosta no fio duplo com o mesmo respiro das outras
                   seções. Depois da palavra vazada ela é menor (0,5rem contra
                   1,25rem): ali são duas linhas de tipografia grande da mesma
                   família, e elas precisam ler como um bloco só. */
                /* Depois da palavra vazada o título não leva folga NENHUMA: a
                   sobreposição é feita pela margem negativa dela, e qualquer
                   `mt` aqui a desfaria por cima. */
                eyebrow ? 'mt-5' : '',
                large ? 'type-section-lg' : 'type-section',
                dark || accent ? 'text-paper' : 'text-ink'
              )}
            >
              {title}
            </span>
          </Reveal>
        </div>

        {aside && (
          <Reveal gesture="rise" delay={0.12} className={center ? '' : 'md:max-w-[23rem] md:text-right'}>
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  )
}
