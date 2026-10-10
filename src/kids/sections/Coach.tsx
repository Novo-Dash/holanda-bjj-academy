import { coach } from '../data/kids'
import { Button, Eyebrow } from '../ui/parts'
import type { Book } from '../KidsApp'

/**
 * VIII · Quem fica com o seu filho. O retrato vai numa POLAROID (pedido do
 * Adryan, 09/10), com o nome escrito à mão na borda de baixo. Duas colunas DENTRO da casca, centradas
 * (o retrato sangrando para a borda esquerda lia como seção quebrada, pedido
 * do Adryan em 09/10). No celular, tudo centrado numa coluna.
 *
 * Mecanismo: o retrato entra sem cor e a cor volta (o gesto da Maison). O
 * estado-base é colorido; o cinza só existe com `hk-motion` antes de entrar.
 *
 * Grau, anos de tatame, linhagem, idioma e o título NAGA não aparecem até o
 * cliente confirmar (lista no README).
 */
export function Coach({ onBook }: { onBook: Book }) {
  return (
    <section id="coach" className="hk-sec hk-coach" aria-labelledby="coach-title">
      <div className="hk-shell hk-coach__grid">
        <figure className="hk-polaroid hk-coach__photo" data-rise="">
          <picture>
            <source
              type="image/webp"
              srcSet="/kids/coach-560.webp 560w, /kids/coach-1120.webp 1120w"
              sizes="(min-width: 960px) 40vw, 80vw"
            />
            <img
              src="/kids/coach-560.webp"
              width={560}
              height={700}
              loading="lazy"
              decoding="async"
              alt="Professor Diego Holanda in a black gi, standing on the mat of the academy"
            />
          </picture>
          <figcaption className="hk-kid">{coach.photoCaption}</figcaption>
        </figure>

        <div className="hk-coach__copy">
          <Eyebrow>{coach.eyebrow}</Eyebrow>
          <h2 id="coach-title" className="hk-type-h2">
            {coach.h2}
          </h2>
          {coach.body.map((t) => (
            <p key={t} className="hk-type-body">
              {t}
            </p>
          ))}
          <Button onClick={() => onBook('coach')}>{coach.cta}</Button>
        </div>
      </div>
    </section>
  )
}
