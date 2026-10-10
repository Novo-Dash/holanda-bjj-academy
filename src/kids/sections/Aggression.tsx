import { aggression } from '../data/kids'
import { reading, useScrollProgress } from '../lib/motion'
import { Star } from '../ui/icons'

/**
 * VI · A pergunta que ninguém faz em voz alta. Diagramação (refeita a pedido
 * do Adryan, 09/10): no desktop, a POLAROID da turma enfileirada à esquerda e,
 * à direita, a pergunta, a resposta e a fala de um pai num balão. No celular,
 * uma coluna: pergunta, polaroid, resposta, balão.
 *
 * Mecanismo: a resposta ACENDE palavra por palavra conforme se lê (técnica da
 * Maison, CSS puro: cada palavra tem `--i`, o bloco recebe `--p` do scroll).
 * O estado-base é tudo aceso; o apagado só existe com `.is-live`. O texto
 * inteiro existe para o leitor de tela sempre.
 */
export function Aggression() {
  const ref = useScrollProgress<HTMLDivElement>(reading)
  const words = aggression.body.split(' ')

  return (
    <section className="hk-sec hk-aggr" aria-labelledby="aggr-title">
      <div className="hk-shell hk-aggr__grid">
        <h2 id="aggr-title" className="hk-type-q hk-aggr__q">
          <span className="hk-aggr__quote" aria-hidden="true">
            “
          </span>
          {aggression.question}
          <span className="hk-aggr__quote" aria-hidden="true">
            ”
          </span>
        </h2>

        <figure className="hk-polaroid hk-aggr__photo" data-rise="">
          <picture>
            <source
              type="image/webp"
              srcSet="/kids/lineup-512.webp 512w, /kids/lineup-640.webp 640w"
              sizes="(min-width: 960px) 30vw, 80vw"
            />
            <img
              src="/kids/lineup-512.webp"
              width={512}
              height={640}
              loading="lazy"
              decoding="async"
              alt="The kids class lined up on the mat at the start of class, facing the instructor"
            />
          </picture>
          <figcaption className="hk-kid">{aggression.photoCaption}</figcaption>
        </figure>

        <div ref={ref} className="hk-aggr__answer" style={{ ['--n' as string]: words.length }}>
          <p className="hk-lit">
            {words.map((w, i) => (
              <span key={i} style={{ ['--i' as string]: i }}>
                {w}{' '}
              </span>
            ))}
          </p>
          <blockquote className="hk-aggr__bubble" data-rise="">
            <span className="hk-aggr__stars" role="img" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} />
              ))}
            </span>
            <p>“{aggression.quote.text}”</p>
            <footer>
              <b>{aggression.quote.name}</b>, {aggression.quote.role}
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
