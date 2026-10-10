import { useEffect, useRef } from 'react'
import { site } from '@/data/site'
import { nav } from '../data/kids'
import { isInAppBrowser } from '../lib/motion'
import { Phone } from '../ui/icons'

/**
 * Barra do topo. Transparente sobre a primeira tela; ao rolar, vidro sobre o
 * cinza do tatame (no WebView do Instagram/Facebook, cor chapada: blur em
 * scroll custa quadro em aparelho fraco, PRD 13).
 *
 * Sem botão de agendar na barra (pedido do Adryan, 10/10): o TELEFONE fica no
 * lugar dele, com o número visível em todas as larguras. Agendar está no hero
 * e em cada seção. Sem menu sanfona no celular: os quatro links são atalhos
 * de quem já está lendo.
 *
 * O estado "rolado" é uma classe trocada por IntersectionObserver numa
 * sentinela, e não um ouvinte de scroll.
 */
export function Nav() {
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
        <a className="hk-nav__phone" href={site.phoneHref}>
          <Phone />
          <span>{site.phone}</span>
        </a>
      </div>
    </header>
  )
}
