import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge de classes com desempate correto do Tailwind.
 *
 * CUIDADO: o tailwind-merge trata qualquer classe que comece por `text-` como
 * do grupo de tamanho/cor de fonte. Uma utility da casa chamada `text-*` é
 * engolida quando aparece ao lado de outra `text-*` na mesma chamada, e o
 * sintoma é um h2 renderizando a 16px sem ninguém perceber.
 *
 * Por isso as escalas fluidas deste projeto se chamam `type-hero`,
 * `type-section` e afins, e a textura se chama `textured` e não `bg-texture`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
