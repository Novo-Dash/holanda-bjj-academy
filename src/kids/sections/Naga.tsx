import { useEffect, useRef } from 'react'
import { naga } from '../data/kids'
import { prefersReducedMotion } from '../lib/motion'
import { Torii } from '../ui/icons'
import { Button } from '../ui/parts'
import type { Book } from '../KidsApp'

/**
 * III · NAGA, a prova de que é sério. Seção VERMELHA (pedido do Adryan,
 * 09/10), desenvolvida a partir do post da academia: o texto à esquerda, em
 * blocos (título, parágrafo e o cartão com a frase da copy),
 * e o vídeo do cinturão de equipe numa POLAROID grande à direita.
 *
 * O vídeo toca mudo e em laço só enquanto está na tela; com reduced-motion,
 * fica o poster. O arquivo (1,1 MB) só desce quando a seção chega perto.
 */
export function Naga({ onBook }: { onBook: Book }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    v.muted = true
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = '/kids/naga.mp4'
          void v.play().catch(() => {})
        } else v.pause()
      },
      { threshold: 0.35 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hk-sec hk-naga hk-on-red" aria-labelledby="naga-title">
      <div className="hk-shell hk-naga__grid">
        <div className="hk-naga__copy">
          <p className="hk-eyebrow">
            <Torii />
            <span>{naga.eyebrow}</span>
          </p>
          <h2 id="naga-title" className="hk-type-h2" data-rise="">
            {naga.h2}
          </h2>
          <p className="hk-type-lead hk-naga__body">{naga.body}</p>
          <div className="hk-naga__cards">
            <p className="hk-naga__card">
              <Torii className="hk-naga__card-mark" />
              <span>{naga.line}</span>
            </p>
          </div>
          <Button variant="gold" onClick={() => onBook('naga')}>
            {naga.cta}
          </Button>
        </div>

        <div className="hk-naga__media">
          <figure className="hk-polaroid hk-naga__video" data-rise="">
            <video
              ref={ref}
              poster="/kids/naga-poster.webp"
              width={540}
              height={960}
              muted
              loop
              playsInline
              preload="none"
              aria-label={naga.videoLabel}
            />
            <figcaption className="hk-kid">{naga.videoCaption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
