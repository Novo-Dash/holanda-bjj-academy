import { prefersReducedMotion } from '../lib/motion'

/**
 * As quatro ilustrações da Safety, uma por regra (pedido do Adryan: "igual ao
 * Dárcio Lira, com ícones animados"). Desenho com preenchimento, sombra e
 * personagem, não ícone de traço. As cores vêm dos tokens por classe
 * (`.sa-*` em kids-sections.css), nunca hex aqui.
 *
 * Animação por Web Animations API, sem GSAP: cada `play*` recebe o cartão e
 * roda o gesto uma vez. O cartão chama ao entrar na tela e de novo no hover e
 * no toque (o toque responde: diagnóstico de cliques mortos).
 *
 * O ESTADO FINAL de cada desenho é o que está no SVG. A animação parte de um
 * estado anterior e termina nele (`fill: 'backwards'`), então sem JS e com
 * reduced-motion a ilustração aparece pronta.
 */

type Kf = Keyframe[]
const EASE = 'cubic-bezier(.22,1,.36,1)'
const SPRING = 'cubic-bezier(.3,1.6,.5,1)'

function run(root: Element | null, sel: string, frames: Kf, opts: KeyframeAnimationOptions) {
  const el = root?.querySelector(sel)
  if (!el) return
  el.getAnimations().forEach((a) => a.cancel())
  el.animate(frames, { fill: 'backwards', ...opts })
}

type ArtProps = { id: string }

/* ─── 1 · Zero strikes: jiu-jitsu é PEGADA, não soco ─────────────────────────
   A mão entra pela direita, fecha na gola do kimono e dá o puxão. (A luva com
   o carimbo de proibido era o desenho do Dárcio; este é nosso.) */
export function GripArt(_: ArtProps) {
  return (
    <svg className="sa" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse className="sa-shadow" cx="96" cy="160" rx="58" ry="6" />
      <g className="sa-gi">
        {/* o tronco do kimono */}
        <path className="sa-white sa-line" d="M40 160 50 52C64 38 80 32 96 32S128 38 142 52L152 160Z" />
        {/* a gola: as duas lapelas em V, a da direita por baixo */}
        <path className="sa-lapel" d="M118 34 96 116" />
        <path className="sa-lapel-in" d="M118 34 96 116" />
        <path className="sa-lapel" d="M74 34 98 116" />
        <path className="sa-lapel-in" d="M74 34 98 116" />
        <rect className="sa-ink" x="44" y="124" width="104" height="13" rx="3" />
        <path className="sa-none sa-thin" d="M96 137 90 156M100 137 106 155" />
      </g>
      <g className="sa-grip">
        {/* a manga e o antebraço que entram pela direita */}
        <path className="sa-white sa-line" d="M206 58 150 62 152 88 206 92Z" />
        <path className="sa-skin sa-line" d="M152 64C140 64 128 66 120 68L121 86C130 87 142 87 152 86Z" />
        {/* o punho fechado na lapela */}
        <g className="sa-fist">
          <path
            className="sa-skin sa-line"
            d="M122 64C110 60 94 62 86 70C80 76 80 86 86 92C94 98 110 98 122 92Z"
          />
          <path className="sa-none sa-thin" d="M90 72H112M88 80H112M90 88H112" />
          <path className="sa-skin sa-line" d="M104 62C100 54 90 52 86 58C84 62 88 66 94 66" />
        </g>
      </g>
    </svg>
  )
}

export function playGrip(card: Element | null) {
  if (!card || prefersReducedMotion()) return
  run(
    card,
    '.sa-grip',
    [
      { transform: 'translateX(70px)' },
      { transform: 'translateX(0)', offset: 0.35 },
      { transform: 'translateX(6px)', offset: 0.62 },
      { transform: 'translateX(0)' },
    ],
    { duration: 1500, easing: EASE }
  )
  /* a mão chega aberta e FECHA na gola */
  run(
    card,
    '.sa-fist',
    [
      { transform: 'scaleX(1.35) rotate(-8deg)' },
      { transform: 'scaleX(1.35) rotate(-8deg)', offset: 0.33 },
      { transform: 'scaleX(1) rotate(0deg)', offset: 0.48 },
      { transform: 'scaleX(1) rotate(0deg)' },
    ],
    { duration: 1500, easing: SPRING }
  )
  /* e o kimono vem junto no puxão */
  run(
    card,
    '.sa-gi',
    [
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(0) rotate(0deg)', offset: 0.5 },
      { transform: 'translateX(10px) rotate(3deg)', offset: 0.62 },
      { transform: 'translateX(-3px) rotate(-1deg)', offset: 0.8 },
      { transform: 'translateX(0) rotate(0deg)' },
    ],
    { duration: 1500, easing: EASE }
  )
}

/* ─── 2 · Paired by size: a GANGORRA que fica nivelada ───────────────────────
   Duas crianças do mesmo tamanho: a gangorra balança e para reta, e a bolha
   do nível no meio da tábua vai para o centro. (As crianças lado a lado com a
   régua eram o desenho do Dárcio; este é nosso.) */
function Kid({ x, flip, hair }: { x: number; flip?: boolean; hair: string }) {
  return (
    <g transform={`translate(${x} 110) scale(${flip ? -0.5 : 0.5} 0.5)`}>
      <g className="sa-bob">
        <rect className="sa-white sa-line" x="-14" y="-30" width="12" height="30" rx="5" />
        <rect className="sa-white sa-line" x="2" y="-30" width="12" height="30" rx="5" />
        <path className="sa-white sa-line" d="M-22-30-20-70C-20-78-12-82 0-82S20-78 20-70L22-30Z" />
        <path className="sa-none sa-thin" d="M-10-81 0-60 10-81" />
        <rect className="sa-belt sa-thin" x="-21" y="-46" width="42" height="8" />
        <path className="sa-arm" d="M-20-74C-34-80-40-92-38-104" />
        <path className="sa-arm-in" d="M-20-74C-34-80-40-92-38-104" />
        <path className="sa-arm" d="M20-74C34-80 40-92 38-104" />
        <path className="sa-arm-in" d="M20-74C34-80 40-92 38-104" />
        <circle className="sa-skin sa-line" cx="0" cy="-100" r="18" />
        <path className="sa-ink" d={hair} />
        <circle className="sa-ink" cx="-6" cy="-100" r="2.4" />
        <circle className="sa-ink" cx="6" cy="-100" r="2.4" />
        <path className="sa-none sa-thin" d="M-7-92C-3-86 3-86 7-92" />
        <circle className="sa-blush" cx="-11" cy="-94" r="3" />
        <circle className="sa-blush" cx="11" cy="-94" r="3" />
      </g>
    </g>
  )
}

export function SeesawArt(_: ArtProps) {
  return (
    <svg className="sa" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse className="sa-shadow" cx="100" cy="160" rx="62" ry="6" />
      <path className="sa-red sa-line" d="M100 116 76 158H124Z" />
      <g className="sa-plank">
        <rect className="sa-ink" x="14" y="110" width="172" height="11" rx="5" />
        <Kid x={40} hair="M-18-102C-18-118 18-122 18-104C12-110-4-112-18-102Z" />
        <Kid x={160} flip hair="M-18-100C-20-122 22-126 18-100C14-112 4-114-6-110C-10-106-14-104-18-100Z" />
        {/* o nível: a bolha vai para o centro quando a tábua fica reta */}
        <rect className="sa-white sa-line sa-line--fine" x="80" y="96" width="40" height="12" rx="6" />
        <path className="sa-none sa-thin" d="M94 98V106M106 98V106" />
        <circle className="sa-bubble" cx="100" cy="102" r="4" />
      </g>
    </svg>
  )
}

export function playSeesaw(card: Element | null) {
  if (!card || prefersReducedMotion()) return
  run(
    card,
    '.sa-plank',
    [
      { transform: 'rotate(-14deg)' },
      { transform: 'rotate(11deg)', offset: 0.3 },
      { transform: 'rotate(-6deg)', offset: 0.55 },
      { transform: 'rotate(2.5deg)', offset: 0.75 },
      { transform: 'rotate(0deg)' },
    ],
    { duration: 1800, easing: 'ease-in-out' }
  )
  run(
    card,
    '.sa-bubble',
    [
      { transform: 'translateX(14px)' },
      { transform: 'translateX(-12px)', offset: 0.3 },
      { transform: 'translateX(7px)', offset: 0.55 },
      { transform: 'translateX(-2px)', offset: 0.75 },
      { transform: 'translateX(0)' },
    ],
    { duration: 1800, easing: 'ease-in-out' }
  )
}

/* ─── 3 · Tap means stop: a mão bate três vezes no tatame ────────────────── */
export function TapArt(_: ArtProps) {
  return (
    <svg className="sa" viewBox="0 0 200 170" aria-hidden="true">
      <rect className="sa-shade" x="14" y="128" width="172" height="22" rx="6" />
      <path className="sa-red" d="M14 134a6 6 0 0 1 6-6h52v22H20a6 6 0 0 1-6-6Z" />
      <rect className="sa-red" x="128" y="128" width="58" height="22" rx="6" />
      <g className="sa-rings">
        <ellipse className="sa-ring" cx="120" cy="128" rx="34" ry="9" />
        <ellipse className="sa-ring sa-ring--2" cx="120" cy="128" rx="54" ry="14" />
      </g>
      <g className="sa-hand">
        {/* a manga do kimono e a mão espalmada */}
        <path className="sa-white sa-line" d="M8 92C30 86 56 88 78 96L72 124C50 118 28 118 6 122Z" />
        <path className="sa-none sa-thin" d="M30 89 26 121" />
        <path
          className="sa-skin sa-line"
          d="M74 98C92 96 112 98 134 104C146 107 150 113 146 118C143 122 136 123 128 122L104 120C92 124 82 124 72 122Z"
        />
        <path className="sa-none sa-thin" d="M104 110H130M100 116H124" />
        <path className="sa-skin sa-line" d="M96 100C102 90 112 88 116 94C118 98 114 102 108 104" />
      </g>
      <text className="sa-tap" x="150" y="62">
        tap!
      </text>
    </svg>
  )
}

export function playTap(card: Element | null) {
  if (!card || prefersReducedMotion()) return
  const beat = (o: number) => [
    { transform: 'translateY(-26px) rotate(-6deg)', offset: o },
    { transform: 'translateY(0) rotate(0deg)', offset: o + 0.08 },
  ]
  run(
    card,
    '.sa-hand',
    [
      { transform: 'translateY(-26px) rotate(-6deg)' },
      ...beat(0.12),
      ...beat(0.38),
      ...beat(0.64),
      { transform: 'translateY(0) rotate(0deg)' },
    ],
    { duration: 1600, easing: 'ease-in-out' }
  )
  const rings = card.querySelectorAll('.sa-ring')
  for (const start of [0.2, 0.46, 0.72]) {
    rings.forEach((el, i) =>
      el.animate(
        [
          { opacity: 0, transform: 'scale(.4)' },
          { opacity: 0, transform: 'scale(.4)', offset: start },
          { opacity: 0.9, transform: 'scale(.7)', offset: start + 0.02 + i * 0.03 },
          { opacity: 0, transform: 'scale(1.15)', offset: Math.min(1, start + 0.18 + i * 0.03) },
          { opacity: 0, transform: 'scale(1.15)' },
        ],
        { duration: 1600, easing: 'ease-out' }
      )
    )
  }
  run(
    card,
    '.sa-tap',
    [
      { opacity: 0, transform: 'scale(.4) rotate(-12deg)' },
      { opacity: 0, transform: 'scale(.4) rotate(-12deg)', offset: 0.2 },
      { opacity: 1, transform: 'scale(1.15) rotate(8deg)', offset: 0.3 },
      { opacity: 1, transform: 'scale(1) rotate(8deg)' },
    ],
    { duration: 1600, easing: SPRING }
  )
}

/* ─── 4 · You see all of it: o olho que pisca e acompanha a aula ─────────── */
export function EyeArt({ id }: ArtProps) {
  return (
    <svg className="sa" viewBox="0 0 200 170" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-eye`}>
          <path d="M28 86C66 36 134 36 172 86C134 136 66 136 28 86Z" />
        </clipPath>
      </defs>
      <path className="sa-none sa-lash" d="M64 50 56 36M100 40V24M136 50 144 36" />
      <path className="sa-white" d="M28 86C66 36 134 36 172 86C134 136 66 136 28 86Z" />
      <g clipPath={`url(#${id}-eye)`}>
        <g className="sa-iris">
          <circle className="sa-red" cx="100" cy="86" r="27" />
          <circle className="sa-ink" cx="100" cy="86" r="13" />
          <circle className="sa-white" cx="92" cy="78" r="5" />
        </g>
        <rect className="sa-lid" x="20" y="30" width="160" height="112" />
      </g>
      <path className="sa-none sa-line sa-line--thick" d="M28 86C66 36 134 36 172 86C134 136 66 136 28 86Z" />
    </svg>
  )
}

export function playEye(card: Element | null) {
  if (!card || prefersReducedMotion()) return
  /* a pálpebra fecha e abre duas vezes (pisca) */
  run(
    card,
    '.sa-lid',
    [
      { transform: 'scaleY(1)' },
      { transform: 'scaleY(0)', offset: 0.18 },
      { transform: 'scaleY(0)', offset: 0.62 },
      { transform: 'scaleY(1)', offset: 0.68 },
      { transform: 'scaleY(0)', offset: 0.74 },
      { transform: 'scaleY(0)' },
    ],
    { duration: 2000, easing: 'ease-in-out' }
  )
  /* e acompanha a aula: olha para um lado, para o outro, volta */
  run(
    card,
    '.sa-iris',
    [
      { transform: 'translate(0,0)' },
      { transform: 'translate(0,0)', offset: 0.2 },
      { transform: 'translate(-26px,4px)', offset: 0.34 },
      { transform: 'translate(-26px,4px)', offset: 0.42 },
      { transform: 'translate(26px,4px)', offset: 0.56 },
      { transform: 'translate(26px,4px)', offset: 0.6 },
      { transform: 'translate(0,0)', offset: 0.8 },
      { transform: 'translate(0,0)' },
    ],
    { duration: 2000, easing: EASE }
  )
}
