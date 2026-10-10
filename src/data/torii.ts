/**
 * A geometria do TORII do distintivo, medida no arquivo do cliente
 * (`brand/logo-source.webp`). As duas páginas desenham a mesma peça: a `/` pelo
 * `Mark` (src/components/mark.tsx) e a Kids pelo `Torii` (src/kids/ui/icons.tsx).
 * Por isso os caminhos moram aqui, num módulo sem dependência nenhuma, e não no
 * componente: a Kids não precisa carregar o `cn()` da `/` para ter a marca.
 *
 * A razão de cada forma está comentada no `Mark`.
 */
export const TORII_VIEWBOX = '0 0 424 376'

export const TORII = {
  /** Kasagi, a viga de cima (um arco, não uma barra). */
  kasagi:
    'M0 2C40 14 120 21 212 21C304 21 384 14 424 2L424 18L400 50C330 62 270 65 212 65C154 65 94 62 24 50L0 18Z',
  /** Gakuzuka, o montante curto entre a viga e a travessa. */
  gakuzuka: 'M197 78h32v34h-32Z',
  /** Nuki, a travessa que passa para fora dos pilares. */
  nuki: 'M34 110h358v34H34Z',
  /** Hashira, os pilares, que se abrem conforme descem. */
  left: 'M98 70h35l-19 304H69Z',
  right: 'M293 70h35l28 304h-45Z',
} as const
