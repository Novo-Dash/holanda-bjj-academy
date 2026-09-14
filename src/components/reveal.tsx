import { Fragment, type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

/**
 * Vocabulário de entrada da página. Quatro gestos, e nenhum a mais: quando cada
 * seção inventa a própria animação, a página perde sotaque e vira demonstração
 * de biblioteca.
 *
 *  rise   — sobe 22px. O gesto padrão, para blocos de texto, imagens e placas.
 *  veil   — sobe e sai do desfoque. Só em headline de seção.
 *  rule   — o fio se abre do centro para as pontas. Só para divisórias.
 *  settle — entra 2% maior e assenta. Para selos e emblemas.
 *
 * Nenhum deles RECORTA. Um gesto que esconde com `clip-path` falha fechado: se
 * o observador de viewport não dispara, o bloco fica com a altura ocupada e
 * nada pintado, e a seção vira um retângulo em branco. Gesto de entrada não
 * pode ser o que decide se o conteúdo existe: `rise` erra para o lado seguro,
 * porque o pior caso dele é aparecer sem animação.
 *
 * Todos respeitam prefers-reduced-motion: sem movimento o conteúdo aparece
 * pronto, e nunca escondido.
 */
type Gesture = 'rise' | 'veil' | 'rule' | 'settle'

const EASE = [0.22, 1, 0.36, 1] as const

const GESTURES: Record<Gesture, { variants: Variants; duration: number }> = {
  rise: {
    variants: { hidden: { opacity: 0, y: 22 }, shown: { opacity: 1, y: 0 } },
    duration: 0.75,
  },
  veil: {
    variants: {
      hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
      shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    duration: 1,
  },
  rule: {
    variants: { hidden: { scaleX: 0 }, shown: { scaleX: 1 } },
    duration: 0.9,
  },
  settle: {
    variants: {
      hidden: { opacity: 0, scale: 1.02, y: 10 },
      shown: { opacity: 1, scale: 1, y: 0 },
    },
    duration: 0.7,
  },
}

/* Tags permitidas. O componente de motion é resolvido do mapa estático do
   próprio motion: criar um com motion.create() dentro do render devolveria um
   componente novo a cada passagem, e o React remontaria a árvore inteira. */
type Tag = 'div' | 'section' | 'article' | 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'figure'

type RevealProps = {
  children: ReactNode
  gesture?: Gesture
  delay?: number
  className?: string
  as?: Tag
}

export function Reveal({
  children,
  gesture = 'rise',
  delay = 0,
  className,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const { variants, duration } = GESTURES[gesture]
  const MotionTag = motion[as]

  return (
    <MotionTag
      className={className}
      style={gesture === 'rule' ? { transformOrigin: 'center' } : undefined}
      initial={reduce ? false : 'hidden'}
      whileInView={reduce ? undefined : 'shown'}
      viewport={{ once: true, margin: '-70px' }}
      variants={variants}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Texto que entra palavra a palavra, cada uma subindo de trás de uma linha
 * invisível. Diferente do `veil`: aqui o ritmo é o da leitura, não o do bloco.
 * Reservado a um parágrafo por seção, no máximo.
 *
 * O espaço entre palavras fica FORA da máscara. Dentro dela ele é recortado
 * junto com a palavra e o parágrafo colapsa numa só palavra gigante.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <p className={className}>{text}</p>

  const words = text.split(' ')

  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-70px' }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.028, delayChildren: delay } },
      }}
    >
      {/* A FRASE INTEIRA PARA QUEM NÃO VÊ, e as palavras animadas escondidas
          dela. Era um `aria-label` no próprio parágrafo, e isso é atributo
          proibido em `<p>`: elemento de papel genérico não aceita nome
          acessível, então o rótulo era simplesmente descartado e o leitor de
          tela caía nas palavras, todas `aria-hidden`, e não lia nada. Um span
          fora da tela com o texto corrido resolve os dois lados. */}
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden="true" className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </motion.p>
  )
}
