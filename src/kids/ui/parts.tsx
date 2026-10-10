import { useRef, type ReactNode, type MouseEvent } from 'react'
import { ArrowNuki, Torii } from './icons'
import { afterPaint, prefersReducedMotion } from '../lib/motion'

/** client = a página que vai ao ar; prospect = a de revisão, com as pastilhas. */
export const CLIENT = import.meta.env.VITE_UX_MODE === 'client'

/** Item com `gated` e pendência não existe em client (PRD 0.5). */
export function shows(item: { pending?: string; gated?: boolean }) {
  return !(CLIENT && item.gated && item.pending)
}

/** A pastilha do que falta. Em client não renderiza nada. */
export function Pending({ children }: { children?: string }) {
  if (CLIENT || !children) return null
  return <span className="hk-pending">CONFIRMAR · {children}</span>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="hk-eyebrow">
      <Torii />
      <span>{children}</span>
    </p>
  )
}

/**
 * Botão da página. `<a>` quando tem `href`, `<button>` quando não. A seta é a
 * travessa do torii, em duas cópias: uma sai pela direita, a outra entra pela
 * esquerda (só no hover; no toque, o feedback é o afundar).
 */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size,
  block,
  arrow = true,
  type = 'button',
  className,
}: {
  children: ReactNode
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  variant?: 'primary' | 'light' | 'gold'
  size?: 'small'
  block?: boolean
  arrow?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const cls = [
    'hk-btn',
    variant !== 'primary' && `hk-btn--${variant}`,
    size && `hk-btn--${size}`,
    block && 'hk-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className="hk-btn__arrow" aria-hidden="true">
          <ArrowNuki />
          <ArrowNuki />
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick}>
        {inner}
      </a>
    )
  }
  return (
    <button className={cls} type={type} onClick={onClick}>
      {inner}
    </button>
  )
}

/**
 * Sticker na voz da criança. É botão: o toque faz o carimbo e a letra pula.
 * O wiggle é uma classe trocada e removida no fim da animação, sem estado do
 * React (o feedback não espera render).
 */
export function Sticker({
  children,
  tilt = -3,
  className,
  onTap,
}: {
  children: ReactNode
  tilt?: number
  className?: string
  onTap?: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <button
      ref={ref}
      type="button"
      className={`hk-sticker${className ? ` ${className}` : ''}`}
      style={{ ['--tilt' as string]: `${tilt}deg` }}
      onClick={() => {
        const el = ref.current
        if (!el) return
        /* Web Animations e não "remove a classe, lê offsetWidth, põe de
           novo": aquele truque força um layout inteiro dentro do toque, que é
           exatamente o custo que o INP mede. */
        if (!prefersReducedMotion()) {
          el.animate(
            [0, 6, -4, 2, 0].map((d) => ({ rotate: `${tilt + d}deg` })),
            { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }
          )
          el.classList.add('is-wiggle')
          window.setTimeout(() => el.classList.remove('is-wiggle'), 520)
        }
        if (onTap) afterPaint(onTap)
      }}
    >
      <span className="hk-sticker__dot" aria-hidden="true" />
      <span className="hk-kid">{children}</span>
    </button>
  )
}
