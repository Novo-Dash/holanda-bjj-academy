import type { SVGProps } from 'react'
import { TORII, TORII_VIEWBOX } from '@/data/torii'

/**
 * Ícones da rota Kids, desenhados para ela (PRD 8.9): traço da espessura da
 * viga do torii, terminais RETOS (`square`) e cantos vivos (`miter`), que é
 * como o torii é construído: madeira, não tubo. Nada de Lucide/Heroicons, que
 * têm terminal redondo e leriam como outra família ao lado do distintivo.
 *
 * Todos `aria-hidden`: onde existem, o texto ao lado diz o que eles dizem.
 */

type P = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.25,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
}

/** O torii do distintivo. `line` desenha só o contorno de cada peça. */
export function Torii({ line = false, ...p }: P & { line?: boolean }) {
  return (
    <svg
      viewBox={TORII_VIEWBOX}
      fill={line ? 'none' : 'currentColor'}
      aria-hidden="true"
      className={`hk-torii${line ? ' hk-torii--line' : ''}${p.className ? ` ${p.className}` : ''}`}
      style={p.style}
    >
      <path d={TORII.kasagi} pathLength={1} />
      <path d={TORII.gakuzuka} pathLength={1} />
      <path d={TORII.nuki} pathLength={1} />
      <path d={TORII.left} pathLength={1} />
      <path d={TORII.right} pathLength={1} />
    </svg>
  )
}

/** A seta do botão é a TRAVESSA do torii: uma barra reta e a ponta. */
export function ArrowNuki(p: P) {
  return (
    <svg viewBox="0 0 22 14" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M0 5.5h14v3H0z" />
      <path d="M12.6 0.6 21.4 7l-8.8 6.4-1.8-2.4L16.3 7 10.8 3z" />
    </svg>
  )
}

export function Phone(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export function Pin(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <path d="M12 7v5M9.5 9.5h5" />
    </svg>
  )
}

export function Star(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="m12 2.5 2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z" />
    </svg>
  )
}

/** Dois do mesmo tamanho lado a lado: "matched by age and size". */
export function Size(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="7" cy="6" r="2.2" />
      <circle cx="17" cy="6" r="2.2" />
      <path d="M7 10v11M17 10v11M3.5 13.5h7M13.5 13.5h7" />
    </svg>
  )
}

export function Eye(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

/** O kimono: a gola cruzada e a faixa. */
export function Gi(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M8 3 3 6.5V11l3 .5V21h12v-9.5l3-.5V6.5L16 3" />
      <path d="M8 3l4 6.5L16 3M12 9.5V21M6 14.5h12" />
    </svg>
  )
}

export function Check(p: P) {
  return (
    <svg {...base} strokeWidth={3} {...p}>
      <path d="m4 12.5 5 5L20 6.5" pathLength={1} />
    </svg>
  )
}

export function Alert(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3 2 20.5h20z" />
      <path d="M12 9.5v5M12 17v.5" />
    </svg>
  )
}

export function SoundOff(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 9.5h4L13 5v14l-5-4.5H4z" />
      <path d="m16.5 9.5 5 5M21.5 9.5l-5 5" />
    </svg>
  )
}

export function Play(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M7 4.5v15L19.5 12z" />
    </svg>
  )
}

export function Pause(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" />
    </svg>
  )
}

export function Replay(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4 3.5V8h4.5" />
    </svg>
  )
}

export function Calendar(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3.5 5.5h17v15h-17zM3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

/**
 * O traço sob a palavra marcada do título. NÃO é o rabisco de dois fios das
 * referências: é a curva do KASAGI, a viga do torii, cujas pontas sobem. Um
 * traço só, grosso, que se desenha da esquerda para a direita.
 */
export function KasagiStroke(p: P) {
  return (
    <svg viewBox="0 0 200 24" preserveAspectRatio="none" fill="none" aria-hidden="true" {...p}>
      <path
        d="M4 6C44 17 104 19 196 4"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** O "G" do Google, nas cores da marca (tokens --hk-g-*). */
export function GoogleMark(p: P) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}>
      <path
        style={{ fill: 'var(--hk-g-blue)' }}
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        style={{ fill: 'var(--hk-g-green)' }}
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        style={{ fill: 'var(--hk-g-yellow)' }}
        d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        style={{ fill: 'var(--hk-g-red)' }}
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}
