import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { SectionHead } from '@/components/paper'
import { Reveal } from '@/components/reveal'
import { faq } from '@/data/site'
import { cn } from '@/lib/utils'

/**
 * [VII] PERGUNTAS — uma coluna só, centrada.
 *
 * Era duas colunas (cabeçalho grudado à esquerda, lista à direita) e virou uma,
 * a pedido. A lista ganhou medida de leitura travada em `max-w-3xl`: pergunta
 * em linha larga demais obriga o olho a voltar até a margem esquerda a cada
 * linha, e numa seção que a pessoa varre procurando a dúvida DELA isso é o
 * custo mais caro possível.
 *
 * O sinal é um mais dentro de um círculo, que gira 45° e vira X quando abre.
 * A cor do cartão NÃO muda ao abrir: a mesma superfície nos dois estados, e o
 * que muda é só o contorno. Trocar o fundo junto fazia a lista piscar de tom a
 * cada clique.
 *
 * A pergunta vai na fonte de apoio, e não na condensada de título: pergunta
 * inteira em caixa alta condensada se lê pior justamente onde alguém está
 * procurando a dele.
 *
 * O JSON-LD sai da MESMA lista que a tela, então pergunta e resposta existem
 * num lugar só e nunca divergem.
 */
export function Faq({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(0)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section id="faq" className="textured band relative bg-paper">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>

      <div className="shell relative">
        <SectionHead
          stroke="Questions"
          title="The bits people always ask."
          center
          large
        />

        <Reveal gesture="rise" delay={0.12}>
          <p className="type-body mx-auto mt-6 max-w-[52ch] text-center leading-relaxed text-ink-soft">
            Still unsure? Come and take the free trial class. The answers make a lot more sense on
            the mats than they do on a page.
          </p>
        </Reveal>

        <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {faq.map((item, i) => {
            const isOpen = open === i
            return (
              <li
                key={item.q}
                className={cn(
                  'overflow-hidden rounded-plate border bg-paper-2 transition-colors duration-300',
                  isOpen ? 'border-red' : 'border-line hover:border-red/40'
                )}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="label tnum shrink-0 text-red">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[1.02rem] font-medium leading-snug text-ink md:text-[1.1rem]">
                        {item.q}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-club)]',
                        isOpen ? 'rotate-45 bg-red text-paper' : 'bg-red-soft text-red'
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-ink-soft sm:pl-16">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>

        {/* O botão fecha a seção em vez de abrir. Numa coluna só, a ordem é a
            da leitura: primeiro as objeções respondidas, depois o pedido. Na
            versão de duas colunas ele ficava ao lado da lista e era visto antes
            de qualquer pergunta ter sido lida. */}
        <Reveal gesture="rise" delay={0.1}>
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              onClick={onBook}
            >
              Book your free trial
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
