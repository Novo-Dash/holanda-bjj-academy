import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * Movimento da rota Kids.
 *
 * SEM GSAP, e é decisão de desempenho, não de gosto (registrada em
 * design-decisions.md, HOLK-001). O diagnóstico mediu INP de 300 ms com 82% do
 * tráfego no celular, um terço dentro do navegador do Instagram/Facebook. Os
 * três efeitos de scroll desta página (o portão do hero, a linha dos passos e o
 * texto que acende) são todos "uma variável CSS de 0 a 1"; para isso bastam um
 * IntersectionObserver e um rAF, e o GSAP seria ~40 KB a mais para fazer a
 * mesma conta.
 *
 * Contrato que nenhum efeito quebra (bugs proibidos 1, 6, 7 e 11 do PRD):
 *  - o estado-BASE do CSS é o estado FINAL (tudo visível, tudo aceso);
 *  - o JS só liga o movimento depois de medir, adicionando `hk-motion` no
 *    <html>. Sem JS, com reduced-motion ou com IO ausente, a página é a
 *    versão final, parada;
 *  - a decisão de reduced-motion acontece num efeito de LAYOUT, nunca no
 *    useState: o HTML do prerender e a primeira renderização do cliente são
 *    idênticos, e não há mismatch de hidratação.
 */

const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Roda `fn` depois da próxima pintura: o feedback do toque aparece primeiro,
    o trabalho (tracking, estado) vem depois. É o que segura o INP. */
export function afterPaint(fn: () => void) {
  requestAnimationFrame(() => setTimeout(fn, 0))
}

/**
 * Liga o movimento da página inteira, uma vez, na montagem.
 *
 * `[data-rise]` e `[data-draw]`: NADA é medido na montagem (medir cada
 * elemento forçava um layout da página inteira, e as seções de baixo têm
 * `content-visibility: auto` justamente para não serem calculadas). Quem
 * decide é o primeiro retorno do IntersectionObserver: o que ele diz que está
 * FORA da tela ganha `is-pending` (escondido, e escondido fora da tela não
 * pisca); o que está na tela fica como está. Ao cruzar a tela, `is-pending`
 * sai e `is-in` entra.
 */
export function usePageMotion() {
  useIsoLayout(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    const root = document.documentElement
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-rise],[data-draw]'))
    root.classList.add('hk-motion')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement
          if (!e.isIntersecting) {
            if (!el.classList.contains('is-in')) el.classList.add('is-pending')
            continue
          }
          el.classList.remove('is-pending')
          el.classList.add('is-in')
          io.unobserve(el)
        }
      },
      /* threshold e não rootMargin negativo embaixo: margem negativa deixa
         uma zona morta no fim da página, onde nada nunca cruza (lição do
         Satori, useReveal.ts). */
      { threshold: 0.18 }
    )
    for (const el of items) io.observe(el)

    return () => {
      io.disconnect()
      root.classList.remove('hk-motion')
    }
  }, [])
}

type Range = (rect: DOMRect, vh: number) => number

/** Progresso de LEITURA: do topo a 85% da tela até o pé a 45%. */
export const reading: Range = (r, vh) => (vh * 0.85 - r.top) / (r.height + vh * 0.4)

/**
 * Escreve `--p` (0 a 1) no elemento enquanto ele está perto da tela.
 *
 * Um ouvinte passivo de scroll que só agenda um rAF; o rAF lê UM retângulo e
 * escreve UMA variável. Fora da tela, o ouvinte é removido. Nada disso roda em
 * handler de toque.
 */
export function useScrollProgress<T extends HTMLElement>(range: Range): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return

    let raf = 0
    let last = -1
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, range(el.getBoundingClientRect(), window.innerHeight)))
      /* Arredonda a 3 casas: escrever a mesma variável a cada pixel invalida o
         estilo à toa. */
      const q = Math.round(p * 1000) / 1000
      if (q !== last) {
        last = q
        el.style.setProperty('--p', String(q))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    el.classList.add('is-live')
    update()

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', onScroll, { passive: true })
          onScroll()
        } else {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onScroll)
          update()
        }
      },
      { rootMargin: '25% 0px' }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      el.classList.remove('is-live')
      el.style.removeProperty('--p')
    }
  }, [range])

  return ref
}

/** WebView do Instagram/Facebook: blur e efeitos caros saem (PRD 13). */
export function isInAppBrowser() {
  return typeof navigator !== 'undefined' && /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent)
}
