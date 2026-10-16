import { site } from '@/data/site'
import { track } from '@/kids/lib/track'
import { finalCta, footer } from '../data/kids'
import { afterPaint } from '../lib/motion'
import { Phone, Pin, Torii } from '../ui/icons'
import { Button } from '../ui/parts'
import type { Book } from '../KidsApp'

/**
 * XII · O pedido, o mapa e o rodapé: UMA seção escura, no desenho do Satori
 * Kids (pedido do Adryan, 09/10). O rodapé é desta seção e não um componente
 * à parte, de propósito: uma landing de campanha com menu completo no pé é um
 * convite a sair antes de agendar. Aqui o pé tem nome, endereço e telefone,
 * e nada que leve embora (sem "Get directions", sem link para a `/`).
 *
 * O mapa: o Google Maps nas cores dele, com o pino dele (pedido do Adryan,
 * 09/10), numa moldura com a viga vermelha do torii no topo. O iframe é
 * `lazy`: quem não rola até o fim não paga por ele.
 *
 * A página abre e fecha no MESMO portão: o torii, em traço branco, se desenha
 * uma vez ao entrar. Sem JS e com reduced-motion, ele já está desenhado.
 */
export function FinalCta({ onBook }: { onBook: Book }) {
  return (
    <section className="hk-final hk-on-dark" aria-labelledby="final-title">
      <svg
        className="hk-kasagi-edge hk-kasagi-edge--ink"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0C240 34 520 46 720 46S1200 34 1440 0V56H0Z" />
      </svg>
      <picture className="hk-final__bg" aria-hidden="true">
        <source
          type="image/webp"
          srcSet="/kids/final-960.webp 960w, /kids/final-1920.webp 1920w"
          sizes="100vw"
        />
        <img src="/kids/final-960.webp" width={960} height={458} alt="" loading="lazy" decoding="async" />
      </picture>

      <div className="hk-shell">
        <div className="hk-final__in" data-draw="">
          <Torii line className="hk-final__gate" />
          <h2 id="final-title" className="hk-type-h2 hk-final__title">
            {finalCta.h2}
          </h2>
          <p className="hk-type-lead hk-final__body">{finalCta.body}</p>
          <Button onClick={() => onBook('final')}>{finalCta.cta}</Button>
          <p className="hk-final__micro">
            {finalCta.orCall}{' '}
            <a
              href={site.phoneHref}
              onClick={() => afterPaint(() => track('cta_click', { location: 'final_phone' }))}
            >
              {site.phone}
            </a>{' '}
            · {finalCta.microAfterPhone}
          </p>
        </div>

        <div className="hk-map" data-rise="">
          <iframe
            src={site.mapsEmbedSrc}
            title={finalCta.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <footer className="hk-foot">
          <p className="hk-foot__where">
            <Pin />
            <span>
              {site.name} · {site.address.line1}, {site.address.line2} {site.address.zip}
            </span>
          </p>
          <a
            className="hk-foot__phone"
            href={site.phoneHref}
            onClick={() => afterPaint(() => track('cta_click', { location: 'footer_phone' }))}
          >
            <span className="hk-foot__ring" aria-hidden="true">
              <Phone />
            </span>
            <span>{site.phone}</span>
          </a>
          <p className="hk-foot__fine">
            {footer.tag} · {footer.built}
          </p>
        </footer>
      </div>
    </section>
  )
}
