import { useEffect, useRef } from 'react'
import { site } from '@/data/site'
import { nav } from '../data/kids'
import { isInAppBrowser } from '../lib/motion'
import { Phone } from '../ui/icons'
import { Button } from '../ui/parts'
import type { Book } from '../KidsApp'

/**
 * Barra do topo. Transparente sobre a primeira tela; ao rolar, vidro sobre o
 * cinza do tatame (no WebView do Instagram/Facebook, cor chapada: blur em
 * scroll custa quadro em aparelho fraco, PRD 13).
 *
 * Sem menu sanfona no celular, de propósito: os quatro links são atalhos de
 * quem já está lendo, e no celular o que importa (agendar e ligar) está aqui e
 * na barra fixa de baixo. Um menu a mais seria JS, foco preso e `inert` para
 * um uso que o diagnóstico não mostrou.
 *
 * O estado "rolado" é uma classe trocada por IntersectionObserver numa
 * sentinela, e não um ouvinte de scroll.
 */
export function Nav({ onBook }: { onBook: Book }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isInAppBrowser()) el.classList.add('is-webview')
    const sentinel = document.getElementById('hk-top-sentinel')
    if (!sentinel) return
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-scrolled', !e.isIntersecting))
    io.observe(sentinel)
    return () => io.disconnect()
  }, [])

  return (
    <header ref={ref} className="hk-nav">
      <div className="hk-nav__in">
        {/* O nome visível ("Holanda Kids") é o nome do link: um aria-label
            diferente do texto reprova o "label in name" e confunde quem dita
            comandos de voz. */}
        <a className="hk-brand" href="#top">
          <img src="/kids/logo-96.webp" alt="" width={96} height={96} />
          <span>
            Holanda <b>Kids</b>
          </span>
        </a>
        <nav className="hk-nav__links" aria-label="Sections">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="hk-nav__phone" href={site.phoneHref} aria-label={`Call ${site.phone}`}>
          <Phone />
          <span>{site.phone}</span>
        </a>
        <Button size="small" arrow={false} onClick={() => onBook('nav')}>
          {/* Um rótulo por largura; o escondido sai da árvore de acessibilidade
              junto com o `display: none`. */}
          <span className="hk-nav__cta-long">{nav.cta}</span>
          <span className="hk-nav__cta-short">{nav.ctaShort}</span>
        </Button>
      </div>
    </header>
  )
}
