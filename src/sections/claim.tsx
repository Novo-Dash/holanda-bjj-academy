import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Curtain } from '@/components/curtain'
import { PhotoBackdrop } from '@/components/paper'
import { Reveal } from '@/components/reveal'
import { offer, site } from '@/data/site'
import { track } from '@/lib/track'

/**
 * [IX] O PEDIDO — última seção antes do mapa, e a segunda (e última) inversão
 * da página. A página abre em papel, escurece na aula experimental, volta ao
 * papel e escurece aqui para pedir.
 *
 * Ela é curta de propósito: um título, uma linha, a ação e o telefone. Quem
 * chegou até aqui já leu tudo, e mais argumento neste ponto só adia o clique.
 *
 * Ela não repete os programas no pé, e não carrega marca de fundo: quem chegou
 * até aqui já passou pelos quatro cartões e pela seção da aula. A última tela
 * pede uma coisa só, e tudo que divide espaço com o pedido adia o clique.
 *
 * O WhatsApp da referência entra aqui SOZINHO no dia em que `site.whatsapp`
 * deixar de ser nulo. Enquanto ninguém confirmar que o número tem WhatsApp, o
 * botão não existe: abrir uma conversa que não existe é pior que não oferecer.
 */
export function Claim({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="claim"
      ref={ref}
      className="band relative isolate overflow-hidden bg-ink text-paper"
    >
      {/* A MESMA foto da primeira tela, e isso é de propósito: a página abre
          mostrando quem treina aqui e fecha pedindo para a pessoa entrar nessa
          foto. O enquadramento é outro (pé em vez de centro) e o véu é mais
          fechado, porque aqui o texto é centralizado e passa por cima do meio
          da imagem, onde na primeira tela ele só ocupava a esquerda. */}
      <PhotoBackdrop veil={0.92} position="bottom" />
      <Curtain target={ref} className="bg-red" />

      <div className="shell relative text-center">
        <Reveal gesture="veil" as="h2">
          <span className="display type-section-lg mx-auto block max-w-4xl text-balance">
            Book your free{' '}
            <br />
            <span className="mark">trial class today.</span>
          </span>
        </Reveal>

        <Reveal gesture="rise" delay={0.16}>
          <p className="type-body mx-auto mt-7 max-w-[58ch] leading-relaxed text-paper/70">
            {/* Duas linhas, e isso é o que dimensiona a frase. A versão
                anterior tinha três: "start your Brazilian jiu-jitsu journey"
                gastava seis palavras para dizer o que "start training" diz em
                duas, e o endereço completo com "on this page" no fim empurrava
                para a terceira.

                A frase também NÃO abre com "no experience needed": `offer.note`
                já começa com isso, e as duas juntas imprimiam a mesma garantia
                duas vezes seguidas. */}
            Start training at {site.address.line1}, in the middle of {site.city}. {offer.note}
          </p>
        </Reveal>

        <Reveal gesture="rise" delay={0.24}>
          <div className="mt-11 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
            <Button
              size="lg"
              onClick={() => {
                track('cta_click', { location: 'final' })
                onBook()
              }}
            >
              Book here
            </Button>

            {site.whatsapp ? (
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('cta_click', { location: 'final_whatsapp' })}
                className="label inline-flex items-center gap-3 py-2.5 text-paper no-underline"
              >
                Message us on WhatsApp
                <span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
              </a>
            ) : (
              <span className="text-[0.9rem] text-paper/55">
                or call{' '}
                <a
                  href={site.phoneHref}
                  onClick={() => track('cta_click', { location: 'final_phone' })}
                  className="tnum text-paper underline underline-offset-4 decoration-red"
                >
                  {site.phone}
                </a>
              </span>
            )}
          </div>
        </Reveal>

      </div>
    </section>
  )
}
