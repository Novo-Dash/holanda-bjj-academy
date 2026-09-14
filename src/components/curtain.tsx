import type { RefObject } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Cortina de FOLHA TOMBANDO.
 *
 * A seção é montada por baixo do jeito que ela é, e esta camada entra por cima
 * de TUDO, texto incluído. Ela é uma folha de cor com dobradiça na BORDA DE
 * BAIXO: conforme a seção sobe, a folha tomba para trás em torno desse eixo,
 * some de vista e deixa a seção à mostra, de cima para baixo.
 *
 * É o TERCEIRO desenho desta peça, e os dois anteriores caíram pelo mesmo
 * motivo: já existiam no portfólio.
 *
 *   1. uma camada recortada por uma diagonal que o scroll empurrava. É a
 *      `Curtain` da Collective, arquivo por arquivo.
 *   2. sete ripas horizontais recolhendo em sequência. É a do Christ
 *      Jiu-Jitsu (quatro painéis verticais subindo em escada, portada do
 *      Fight Sports Miami): painel que se retira em sequência, mesmo gesto em
 *      outro eixo.
 *
 * O que sobra de diferente depois de eliminar esses dois não é outro jeito de
 * um retângulo sair de cena, é OUTRA CLASSE DE MOVIMENTO. Diagonal e painel são
 * os dois transformações no plano; esta é uma rotação em profundidade. Por isso
 * ela não tem como parecer nenhuma das outras, e por isso ela é a única que
 * precisa de `perspective`.
 *
 * E ela cabe: a página inteira se apoia na leitura de folha impressa (o papel
 * quente, a placa, o fio duplo, a marca d'água). Uma folha que tomba é o gesto
 * que esse material faz.
 *
 * Três detalhes que não são enfeite:
 *
 *  · a dobradiça fica EMBAIXO e a folha tomba para trás, então o que aparece
 *    primeiro é o topo da seção. Com a dobradiça em cima, a seção se revelaria
 *    de baixo para cima e o título seria a última coisa a surgir.
 *  · a folha ESCURECE enquanto tomba. Papel que sai do plano da tela pega menos
 *    luz, e sem isso a rotação lê como um retângulo encolhendo em vez de um
 *    objeto girando. É o que separa 3D de um `scaleY` disfarçado, e a razão de
 *    a perspectiva ser curta (1000px): quanto mais perto o observador, mais
 *    forte o escorço e mais óbvio que aquilo é uma folha e não uma faixa.
 *  · `backfaceVisibility: hidden` para o verso nunca aparecer, e o ângulo final
 *    passa de 90° (vai a 96°) porque exatamente em 90° a folha fica de perfil e
 *    alguns navegadores ainda desenham um fio de um pixel.
 *
 * Com `prefers-reduced-motion` a cortina não é renderizada. Ela é um gesto de
 * entrada, e gesto de entrada não pode ser o que decide se a seção aparece.
 */
export function Curtain({
  target,
  className,
}: {
  /** A seção sobre a qual a cortina corre. Precisa ser `relative`. */
  target: RefObject<HTMLElement | null>
  className?: string
}) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target,
    /* Termina quando o TOPO da seção chega a 25% da altura da janela, e não
       quando o centro dela chega ao centro.

       Não é gosto, é um defeito que apareceu: a barra fixa linka para `#trial`,
       e âncora larga a pessoa com o topo da seção logo abaixo do menu. Com a
       faixa antiga (`center center`) a cortina ainda estava na metade nesse
       ponto, e quem clicava no menu caía num texto coberto pela folha, sem
       nunca ter visto o gesto. Terminando pelo topo, quem chega rolando vê a
       folha tombar durante a entrada da seção, e quem chega por âncora encontra
       a seção já aberta. */
    offset: ['start end', 'start 25%'],
  })

  const rotateX = useTransform(scrollYProgress, [0, 1], [0, -96])
  /* A sombra entra devagar e fecha forte no fim, quando a folha já está quase
     de perfil: em ângulo raso ela deveria estar praticamente preta. */
  const shade = useTransform(scrollYProgress, [0, 0.55, 1], [0, 0.26, 0.72])

  if (reduce) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      style={{ perspective: '1000px', perspectiveOrigin: 'center 30%' }}
    >
      {/* `textured`: a folha carrega a MESMA trama de fibra das seções, e isso
          não é enfeite. A seção de cima é vermelha e texturizada; a folha era
          vermelha e lisa, e a multiplicação da textura escurece o vermelho o
          bastante para as duas leituras não fecharem — uma emenda visível
          exatamente onde a folha deveria parecer o prolongamento da seção. */}
      <motion.div
        className={cn('textured absolute inset-0', className)}
        style={{
          rotateX,
          transformOrigin: 'center bottom',
          backfaceVisibility: 'hidden',
        }}
      >
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: shade }} />
      </motion.div>
    </div>
  )
}
