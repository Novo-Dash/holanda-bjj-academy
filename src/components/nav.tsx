import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Phone } from '@/components/icons'
import { site } from '@/data/site'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'

/* DOIS destinos, e não os cinco de antes.
   A barra fixa não é o índice da página: ela é o atalho para os dois lugares
   que alguém abre uma landing page de academia para ver — que aulas existem e
   como é a aula grátis. Reviews, "how to start" e as perguntas continuam na
   página, na ordem em que fazem sentido ler, e quem quer chegar neles rola. Uma
   trilha de cinco pílulas obrigava a espremer o botão para caber em 1024px; com
   duas sobram 450px de folga na mesma janela. */
const LINKS = [
  { label: 'Programs', href: '#programs' },
  { label: 'Trial class', href: '#trial' },
]

/**
 * A BARRA DO TOPO, em peças flutuantes.
 *
 * ORIGEM: é o `PillNav` do Carlson Gracie Vacaville, portado. De lá vêm a
 * arquitetura, a geometria e o gesto:
 *
 *  · a barra não atravessa a tela. São PEÇAS SOLTAS flutuando sobre a página,
 *    centradas, com ar em volta;
 *  · a marca fica separada da trilha, e é só o distintivo: sem nome escrito ao
 *    lado. O patch é a coisa mais reconhecível que a academia tem, e o nome já
 *    está no título da aba, no rodapé e no schema;
 *  · trilha e pílulas são CÁPSULAS, raio cheio, como lá;
 *  · o hover de cada pílula é um CÍRCULO QUE SOBE DE BAIXO e toma a peça, com o
 *    rótulo saindo por cima enquanto uma cópia dele entra por baixo. É esse
 *    gesto que faz a barra parecer um objeto e não uma lista de âncoras;
 *  · no celular a trilha some e sobra marca + hambúrguer, com os mesmos links
 *    empilhados numa peça que abre embaixo.
 *
 * O QUE MUDOU, e por quê (é aqui que ela deixa de ser cópia):
 *
 *  · SEM GSAP. Lá o círculo é medido em JavaScript a cada `resize` e a cada
 *    `fonts.ready`, com uma timeline por item. Aqui ele é geometria de CSS: um
 *    quadrado de 220% da largura da peça, redondo, com o centro ancorado na
 *    aresta de baixo. 220% cobre qualquer proporção de botão que caiba numa
 *    barra (a conta exata é 2·√(l²/4 + a²), e ela sempre dá menos que isso para
 *    um botão mais largo que alto), então o círculo varre a peça inteira sem
 *    uma linha de medição, sem recalcular em `resize` e sem depender de a fonte
 *    já ter carregado.
 *  · TRÊS PEÇAS E NÃO DUAS. Lá são marca e trilha. Aqui entra uma terceira com
 *    o TELEFONE, que esta página precisa ter sempre à mão e que não existe na
 *    referência.
 *  · O TELEFONE NÃO É VERMELHO, e isso é decisão antiga desta página que o
 *    porte não desfaz: com uma ação vermelha fixa no topo, o botão vermelho do
 *    hero (o que a campanha paga para ser clicado) vira o SEGUNDO vermelho que
 *    o olho encontra na primeira tela. O vermelho da barra fica guardado para o
 *    menu do celular, onde o botão de agendar é a última coisa da lista e não
 *    divide a tela com o hero.
 *
 * A barra é ESCURA o tempo todo, e isso some com um problema que a versão
 * anterior tinha: ela era transparente sobre o hero e virava papel ao rolar,
 * então cada peça precisava saber em qual dos dois fundos estava. Peça de tinta
 * se lê sobre a foto escura do hero e sobre o papel das seções seguintes com o
 * mesmo contraste, e não há estado nenhum para manter.
 */
export function Nav({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false)

  // O menu aberto trava o scroll do fundo, senão a página corre atrás dele.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Esc fecha, como em qualquer camada que cobre a página.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 px-4 sm:px-5 lg:top-5"
    >
      {/* `w-max` e centrado do lg para cima: as peças ocupam o que precisam e o
          conjunto fica no meio da folha. Abaixo disso a fileira abre nas duas
          pontas, marca de um lado e hambúrguer do outro, que é o desenho da
          referência no celular. */}
      <div className="flex items-center justify-between gap-2.5 lg:mx-auto lg:w-max lg:justify-center">
        {/* A MARCA, SOLTA. Sem disco de tinta atrás e sem sombra: o distintivo
            já é um objeto fechado, com forma e cor próprias, e o disco era uma
            moldura desenhando de novo um contorno que o patch já tem. Tirada a
            moldura, os 64px que antes eram peça viram 72px de marca — o mesmo
            lugar na fileira, com o desenho ocupando tudo em vez de 48px no meio
            de um círculo.

            `object-contain`: o patch é quadrado e recortá-lo comeria as pontas
            do torii, que é justamente o desenho.

            O alvo continua com 72px, bem acima do piso de 44 do WCAG, mesmo sem
            fundo nenhum: quem manda no alvo é a caixa do link, não a pintura. */}
        <a
          href="#top"
          aria-label={`${site.name}, back to top`}
          onClick={() => setOpen(false)}
          className="block h-[4.5rem] w-[4.5rem] shrink-0"
        >
          <img
            src="/logo.webp"
            alt=""
            width={512}
            height={512}
            /* Dimensões declaradas para o navegador reservar o quadrado antes
               de baixar: sem elas a peça da marca dá um pulo no primeiro
               carregamento, bem no campo de visão de quem acabou de chegar. */
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
        </a>

        {/* A TRILHA. A cápsula escura é a moldura e os botões vivem dentro dela
            com 3px de folga, como na referência: é essa folga mínima que faz a
            trilha ler como um objeto único em vez de dois botões alinhados. */}
        <nav
          aria-label="Primary"
          className="hidden rounded-full bg-ink p-[3px] shadow-lift lg:block"
        >
          <ul className="flex items-stretch gap-[3px]">
            {LINKS.map((l) => (
              <li key={l.href} className="flex">
                <Pill href={l.href}>{l.label}</Pill>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden rounded-full bg-ink p-[3px] shadow-lift sm:block">
            <Pill href={site.phoneHref} onClick={() => track('cta_click', { location: 'nav_phone' })}>
              <Phone className="h-4 w-4" />
              <span className="tnum">{site.phone}</span>
            </Pill>
          </div>

          {/* O HAMBÚRGUER continua sendo uma peça de tinta, e é a única que
              sobrou com fundo próprio nessa ponta. Ele precisa: é um controle,
              e controle sem superfície sobre uma foto escura some. 52px, menor
              que a marca, porque com a marca solta ele deixou de ter uma peça
              do outro lado para equilibrar e passou a ser o único bloco cheio
              da fileira no celular.

              Duas linhas e não três, como na referência: com duas, o fechar é o
              próprio X, girando 45 graus para cada lado a partir do centro. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center gap-[5px] rounded-full bg-ink shadow-lift lg:hidden"
          >
            <span
              aria-hidden="true"
              className={cn(
                'block h-[2px] w-[18px] origin-center bg-paper transition-transform duration-300 ease-[var(--ease-club)] motion-reduce:transition-none',
                open && 'translate-y-[3.5px] rotate-45'
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                'block h-[2px] w-[18px] origin-center bg-paper transition-transform duration-300 ease-[var(--ease-club)] motion-reduce:transition-none',
                open && '-translate-y-[3.5px] -rotate-45'
              )}
            />
          </button>
        </div>
      </div>

      {/* O MENU DO CELULAR, numa peça que desce por baixo da fileira. Ele é a
          mesma cápsula escura com os mesmos botões: quem abriu o menu continua
          vendo a trilha do desktop, empilhada.

          O raio aqui é fixo e não cheio: uma cápsula de 300px de altura vira um
          comprimido, e o que precisa ser redondo é a PONTA de cada botão dentro
          dela, não a peça inteira.

          `max-h` mais rolagem: em pé a lista cabe de sobra, mas num celular
          deitado (ou com a fonte do sistema aumentada) as peças passam da tela,
          e sem isto as últimas ficam inalcançáveis atrás da dobra. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2.5 max-h-[calc(100svh-7rem)] overflow-y-auto overscroll-contain rounded-[1.75rem] bg-ink p-[3px] shadow-lift lg:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-[3px]">
                {LINKS.map((l) => (
                  <li key={l.href} className="flex">
                    <Pill href={l.href} block onClick={() => setOpen(false)}>
                      {l.label}
                    </Pill>
                  </li>
                ))}
                <li className="flex sm:hidden">
                  <Pill
                    href={site.phoneHref}
                    block
                    onClick={() => {
                      track('cta_click', { location: 'nav_phone' })
                      setOpen(false)
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    <span className="tnum">{site.phone}</span>
                  </Pill>
                </li>
              </ul>

              <Button
                size="lg"
                className="mt-[3px] w-full rounded-full"
                onClick={() => {
                  setOpen(false)
                  onBook()
                }}
              >
                Try a free class
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/**
 * Uma pílula da trilha, com o gesto que veio do Vacaville.
 *
 * São TRÊS camadas na mesma caixa recortada:
 *
 *  1. o círculo de tinta, ancorado na aresta de baixo e em escala zero;
 *  2. o rótulo em tinta, que sobe e sai por cima;
 *  3. uma CÓPIA do rótulo em papel, esperando embaixo, que sobe para o lugar
 *     da primeira.
 *
 * As três andam ao mesmo tempo e na mesma curva, então o que se vê é uma peça
 * virando do avesso, e não três animações acontecendo juntas.
 *
 * A cópia é `aria-hidden`: é o mesmo texto duas vezes no DOM, e sem isso todo
 * leitor de tela leria "programs programs".
 *
 * `overflow-hidden` recorta as três, e é ele que deixa o círculo ser grande
 * demais de propósito.
 */
function Pill({
  href,
  children,
  block = false,
  onClick,
}: {
  href: string
  children: ReactNode
  /** Ocupa a linha inteira, para a versão empilhada do celular. */
  block?: boolean
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'group/pill label relative isolate flex items-center justify-center gap-2 overflow-hidden rounded-full bg-paper px-5 text-ink no-underline',
        /* 44px de alvo, que é o piso do WCAG 2.2 para o dedo. Na referência o
           botão tem 36px, e ali ele é só do desktop; aqui a mesma peça é a
           lista inteira do celular. */
        block ? 'h-12 w-full justify-start px-6' : 'h-11'
      )}
    >
      {/* O CÍRCULO. Quadrado de 220% da largura, redondo, com o CENTRO na
          aresta de baixo do botão: a ordem das funções de transform (`translate`
          depois `scale`, aplicadas da direita para a esquerda) faz a escala
          acontecer em torno do próprio centro e só depois a peça ser levada
          para lá, então o centro fica na aresta em qualquer escala. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 block aspect-square w-[220%] -translate-x-1/2 translate-y-1/2 scale-0 rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:scale-100 group-focus-visible/pill:scale-100 motion-reduce:transition-none"
      />

      <span className="relative block overflow-hidden">
        <span className="flex items-center gap-2 transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:-translate-y-full group-focus-visible/pill:-translate-y-full motion-reduce:transition-none">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex translate-y-full items-center gap-2 text-paper transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:translate-y-0 group-focus-visible/pill:translate-y-0 motion-reduce:transition-none"
        >
          {children}
        </span>
      </span>
    </a>
  )
}
