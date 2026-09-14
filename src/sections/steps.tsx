import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { SectionHead } from '@/components/paper'
import { steps } from '@/data/site'
import { track } from '@/lib/track'

const TOTAL = steps.length
/** Quanto tempo cada passo fica sozinho antes de o próximo acender. Três
    segundos é o tempo de ler um título curto e duas linhas sem pressa. */
const STEP_INTERVAL_MS = 3000

/**
 * [III] COMO COMEÇAR — a seção-mecanismo da página.
 *
 * Ela vem LOGO depois dos programas, e não no meio da página: quem acabou de
 * escolher a turma está com a pergunta "e como eu faço isso?" na cabeça, e é
 * essa a pergunta que os três passos respondem. Adiar isso obriga a pessoa a
 * segurar a intenção por cinco seções.
 *
 * Três passos, com o numeral vazado em contorno e um fio que corre por cima da
 * pauta. Os numerais vão SE PREENCHENDO em sequência, e é o único lugar da
 * página onde alguma coisa acontece sozinha.
 *
 * Quatro restrições impedem que isso vire o carrossel com autoplay que esta
 * página não tem:
 *
 *   1. começa na interseção, não na montagem. Timer rodando desde o load faria
 *      o visitante chegar com o primeiro passo já gasto.
 *   2. o hover acende o passo apontado e NÃO interfere no preenchimento. Os
 *      dois são independentes: hover é o visitante apontando, o preenchimento
 *      é a seção falando.
 *   3. nada aparece, desaparece ou reflui. Só duas cores e a escala de um fio,
 *      então não há o que perder olhando para o lado (WCAG 2.2.2 no espírito, e
 *      não só na letra). E como é cumulativo, quem olhou para o lado volta e vê
 *      MAIS, nunca menos.
 *   4. com `prefers-reduced-motion` não existe timer: os três já vêm cheios,
 *      que é o estado final correto de uma sequência que termina.
 *
 * E o mecanismo MUDA embaixo de md: empilhados no celular, os passos são
 * passados um a um com o scroll, então o timer seria o instrumento errado (ele
 * encheria o 03 com o leitor ainda no 01). Lá o preenchimento segue a viewport,
 * também sem nunca voltar atrás; do md para cima os três dividem a tela e o
 * timer é o que caminha o olho.
 */
export function Steps({ onBook }: { onBook: () => void }) {
  const listRef = useRef<HTMLOListElement>(null)
  /** Quantos numerais estão cheios. Só sobe, e para em TOTAL. */
  const [filled, setFilled] = useState(1)
  const filledRef = useRef(1)
  const reduce = useReducedMotion()

  useEffect(() => {
    /* O ref espelha o state para o timer continuar de onde parou quando o
       efeito roda de novo (girar o celular troca o mecanismo), em vez de
       recomeçar do 01 e esvaziar o que já estava cheio. */
    const bump = (next: number) => {
      const value = Math.min(Math.max(next, filledRef.current), TOTAL)
      if (value === filledRef.current) return
      filledRef.current = value
      setFilled(value)
    }

    /* Sem movimento, o estado final: os três cheios. É o certo para uma
       sequência que termina, e não deixa a seção pela metade. */
    if (reduce) {
      bump(TOTAL)
      return
    }

    const list = listRef.current
    if (!list) return

    let timer: number | undefined
    let observer: IntersectionObserver | undefined

    const start = () => {
      timer = window.setInterval(() => {
        bump(filledRef.current + 1)
        if (filledRef.current >= TOTAL && timer) {
          window.clearInterval(timer)
          timer = undefined
        }
      }, STEP_INTERVAL_MS)
    }

    const teardown = () => {
      observer?.disconnect()
      observer = undefined
      if (timer) window.clearInterval(timer)
      timer = undefined
    }

    /* Empilhado: o preenchimento segue quem cruza o meio da tela. A faixa de
       -45% em cima e embaixo deixa 10% no centro. O `bump` nunca volta atrás,
       então subir a página não esvazia numeral já cheio. */
    const scrollLinked = () => {
      const items = Array.from(list.children) as HTMLElement[]
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const i = items.indexOf(entry.target as HTMLElement)
            if (i !== -1) bump(i + 1)
          }
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      )
      items.forEach((item) => observer?.observe(item))
    }

    /* Lado a lado: o ciclo começa quando a fileira está sendo olhada, e não
       quando o primeiro pixel dela passa da dobra. Se já encheu tudo, não há o
       que observar. */
    const timed = () => {
      if (filledRef.current >= TOTAL) return
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return
          observer?.disconnect()
          observer = undefined
          start()
        },
        { threshold: 0.4 }
      )
      observer.observe(list)
    }

    const stacked = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      teardown()
      if (stacked.matches) scrollLinked()
      else timed()
    }

    apply()
    stacked.addEventListener('change', apply)

    return () => {
      teardown()
      stacked.removeEventListener('change', apply)
    }
  }, [reduce])

  return (
    /* A ÚNICA seção inteiramente vermelha da página, e ela é a exceção que a
       regra das superfícies previa: o resto é papel, com duas inversões escuras
       (a aula experimental e a reivindicação). O vermelho era só a cor da AÇÃO.
       Aqui ele vira superfície, e isso só se sustenta porque esta seção É a
       ação: os três passos são o mecanismo de agendar, e o botão no fim é o
       mesmo clique da barra fixa. Uma segunda seção vermelha acabaria com o
       argumento, porque a cor pararia de apontar para um lugar. */
    <section id="how" className="textured band bg-red">
      <div className="shell">
        {/* SEM EYEBROW, e é a única seção assim. O numeral e o rótulo abriam a
            seção com duas linhas antes do título, e sobre o vermelho cheio isso
            virava um amontoado no topo. Aqui o fio duplo já abre, e a pergunta
            entra sozinha. O "III" some do índice da página nesta parada, o que é
            o preço de um topo limpo na seção que é a própria ação. */}
        <SectionHead accent center large title="How to get started?" />

        {/* A calha entre as colunas é larga de propósito: sem borda de cartão
            separando, o vão é a única coisa que separa, então ele precisa ser
            inequivocamente maior que o espaço dentro da coluna. */}
        <ol ref={listRef} className="mt-16 grid gap-y-14 md:grid-cols-3 md:gap-x-8 lg:gap-x-14">
          {steps.map((step, i) => (
            <li
              key={step.id}
              /* O estado é atributo e não classe para os dois gatilhos ficarem
                 declarativos no mesmo lugar, sem um ganhar do outro.
                 Não é `aria-current`: isto é um preenchimento decorativo, não a
                 posição do visitante num processo, e anunciar "atual" a cada
                 três segundos empurraria atualização ao vivo para o leitor de
                 tela por motivo puramente visual. */
              data-active={i < filled}
              className="step group relative pt-8"
            >
              {/* Fio em repouso: todos os passos têm o seu, então as três
                  colunas leem como um sistema pautado e não como três blocos
                  soltos. */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-paper/30" />

              {/* O fio que corre por cima dele. Transform e não largura, para
                  nunca tocar o layout, e `origin-left` para ler como traçado da
                  esquerda para a direita em vez de crescido do meio. Como o
                  preenchimento é cumulativo, os fios ficam: as três colunas
                  terminam com uma pauta vermelha contínua. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-paper transition-transform duration-500 ease-[var(--ease-club)] group-hover:scale-x-100 group-data-[active=true]:scale-x-100 motion-reduce:transition-none"
              />

              {/* aria-hidden: a própria <ol> já carrega a ordem, e anunciar
                  "01" antes do título seria duplicata. */}
              <span
                aria-hidden="true"
                className="step-numeral step-numeral-invert display block select-none text-[5rem] leading-[0.8] tnum md:text-[6.5rem]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <h3 className="display mt-7 text-[1.5rem] leading-none text-paper md:text-[1.75rem]">
                {step.title}
              </h3>

              {/* Medida curta mesmo numa coluna já estreita: é o que mantém três
                  parágrafos escaneáveis lado a lado. */}
              {/* Papel a 78% e não a 70%: sobre tinta 70% ainda dá 11:1, sobre
                  vermelho cai para 3,9:1 e reprova no piso de 4,5:1 de texto
                  pequeno. A mesma opacidade não vale nas duas superfícies. */}
              <p className="mt-4 max-w-sm text-[0.92rem] leading-relaxed text-paper/[0.78]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex justify-center">
          {/* Vermelho sobre vermelho seria invisível, então aqui a ação é a
              placa de papel. É o primeiro uso real da variante `onDark`, que
              existia sem dono desde que as duas seções escuras passaram a levar
              o botão vermelho. */}
          <Button
            variant="onDark"
            size="lg"
            onClick={() => {
              track('cta_click', { location: 'steps' })
              onBook()
            }}
          >
            Start step one
          </Button>
        </div>
      </div>
    </section>
  )
}
