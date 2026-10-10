import { track } from '@/lib/track'
import { hero, trust, type Variant } from '../data/kids'
import { afterPaint } from '../lib/motion'
import { Eye, Gi, KasagiStroke, Size, Star, Torii } from '../ui/icons'
import { Button } from '../ui/parts'
import { Vsl } from '../ui/Vsl'
import type { Book } from '../KidsApp'

const CHIP_ICON = { star: Star, size: Size, eye: Eye, gi: Gi } as const

/**
 * I · Hero.
 *
 * O TORII cheio e vermelho atrás da VSL, parado. O zoom do portão ao rolar
 * (a Signature original do PRD 8.7) saiu a pedido do Adryan em 09/10.
 *
 * Sem link de rota aqui: "Get directions" no primeiro terço é rota de fuga
 * (pedido do Adryan, 09/10). O endereço continua no eyebrow, no fechamento e
 * no rodapé.
 *
 * Sem animação de entrada em NADA desta tela: H1, CTA e selos são o conteúdo
 * crítico e o LCP, e nascem prontos no HTML do prerender.
 */
export function Hero({ onBook, variant }: { onBook: Book; variant: Variant }) {
  const h1 = hero.h1[variant]

  return (
    <section className="hk-hero" aria-labelledby="hk-h1">
      <div className="hk-shell hk-hero__grid">
        <div className="hk-hero__copy">
          <p className="hk-eyebrow hk-hero__eyebrow">
            <Torii />
            <span>
              {hero.eyebrow.map((part, i) => (
                <span key={part} className="hk-hero__eb">
                  {i > 0 && (
                    <span className="hk-hero__dot" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {part}
                </span>
              ))}
            </span>
          </p>

          <h1 id="hk-h1" className="hk-type-h1 hk-hero__h1">
            {h1.lines.map((line) => (
              <span key={line} className="hk-hero__line">
                {line.split(new RegExp(`(${h1.mark}[,.]?)`)).map((chunk, i) =>
                  chunk.startsWith(h1.mark) ? (
                    <span key={i} className="hk-mark">
                      {chunk}
                      <KasagiStroke />
                    </span>
                  ) : (
                    chunk
                  )
                )}{' '}
              </span>
            ))}
          </h1>

          <p className="hk-type-lead hk-hero__sub">{hero.sub}</p>

          {/* O botão e a linha de apoio formam um bloco só, da largura do
              botão: a linha fica centrada e colada embaixo dele. */}
          <div className="hk-hero__actions">
            <Button onClick={() => onBook('hero')}>{hero.cta}</Button>
            <p className="hk-hero__micro">{hero.micro}</p>
          </div>
        </div>

        <div className="hk-hero__stage">
          {/* O mural: o torii CHEIO e vermelho, como o pintado na parede da
              sala, diante do qual as fotos kids do cliente foram tiradas
              (direção B do design pass, escolhida pelo Adryan em 09/10). */}
          <div className="hk-hero__gate" aria-hidden="true">
            <Torii />
          </div>
          <Vsl />
        </div>
      </div>

      <div className="hk-shell hk-hero__trust">
        <ul className="hk-chips" aria-label="Why parents pick us">
          {trust.map((t) => {
            const Icon = CHIP_ICON[t.icon]
            return (
              <li key={t.id}>
                <a
                  className="hk-chip"
                  href={t.target}
                  onClick={() => afterPaint(() => track('chip_click', { chip: t.id }))}
                >
                  <Icon />
                  <span>{t.label}</span>
                  {/* O texto visível É o nome do link; o destino vem depois,
                      só para leitor de tela. */}
                  <span className="sr-only">, {t.hint}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
