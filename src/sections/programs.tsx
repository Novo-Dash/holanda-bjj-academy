import { motion, useReducedMotion } from 'motion/react'
import { SectionHead } from '@/components/paper'
import { ArrowDiagonal } from '@/components/icons'
import { Mark } from '@/components/mark'
import { programs, type Program } from '@/data/site'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'

/**
 * [II] PROGRAMAS — "quatro jeitos de começar", em quatro cartões de foto com
 * placa por cima.
 *
 * O arquétipo é o da casa: a foto preenche o cartão inteiro, e sobre ela uma
 * placa sólida no alto carrega o nome, para quem é, e uma descrição. O cartão
 * todo é clicável, abre o agendamento já com aquele programa escolhido, e no
 * rodapé dele repete "book this class" como afordância explícita, que é o
 * desenho da referência.
 *
 * Quatro lado a lado, e não um índice que troca uma folha grande: quem chega
 * quer comparar (a turma do filho E a minha) e, num índice, dois dos quatro
 * viram texto cinza que ninguém clica.
 *
 * A REFERÊNCIA SEPARA OS PROGRAMAS EM DUAS ABAS ("para mim" e "para meu
 * filho"), e isso não veio. Lá são sete programas, três deles infantis; aqui
 * são quatro, e a aba de kids ficaria com um cartão sozinho num vão de três
 * colunas, que é pior que não ter aba. O rótulo "for kids" / "for adults" na
 * primeira linha de cada cartão faz a mesma triagem sem quebrar a fileira.
 *
 * A ESCADA (o segundo e o quarto descem) existe só do lg para cima, onde os
 * quatro dividem a linha. É `mt` e não `translate-y`: a margem empurra a altura
 * da linha junto, então a seção cresce com a escada em vez de o conteúdo de
 * baixo ser invadido.
 */
export function Programs({ onBook }: { onBook: (programId?: string) => void }) {
  return (
    <section id="programs" className="textured band relative overflow-hidden bg-paper">
      <div className="shell relative">
        <SectionHead
          stroke="Programs"
          title="Four ways to start."
          large
          aside={
            /* Duas linhas na coluna de apoio (~23rem). A frase tinha uma
               terceira oração ("and where you are starting from") que dizia a
               mesma coisa que "quem está no tatame ao seu lado" e empurrava o
               parágrafo para três linhas.

               Aqui o comentário é de JAVASCRIPT: dentro de um slot de
               expressão a forma com chaves do JSX abre uma chave que ninguém
               fecha. E ela também não pode ser citada aqui dentro, porque a
               sequência que a encerra encerraria este bloco junto. */
            <p className="type-body leading-relaxed text-ink-soft">
              The syllabus is the same on every mat. What changes is who is training next to you.
            </p>
          }
        />

      </div>

      {/* A fileira SAI da margem da página (1240px) e vai a 1536px. O cabeçalho
          continua alinhado com o resto do site; só os cartões escapam.

          Não é capricho: com quatro cartões dentro da margem, cada um ficava
          com 275px, e um nome de duas palavras em condensada dentro de 275px
          obriga a diminuir o corpo até ele deixar de ser título. A 346px o nome
          cabe grande, que é o que a seção passou a ser depois que a descrição
          saiu. */}
      <div className="relative mx-auto mt-14 w-full max-w-[96rem] px-5 sm:px-7 lg:px-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {programs.map((program, i) => (
            <ProgramCard
              key={program.id}
              program={program}
              index={i}
              onOpen={() => {
                track('program_click', { program: program.id })
                onBook(program.id)
              }}
              className={cn(i % 2 === 1 && 'lg:mt-14')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProgramCard({
  program,
  index,
  onOpen,
  className,
}: {
  program: Program
  index: number
  onOpen: () => void
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className={className}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`${program.name}, book this class`}
        whileHover={reduce ? undefined : { y: -10 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.6 }}
        /* O FIO VERMELHO DO HOVER, desenhado PARA FORA do cartão.
           Ele é `outline` do próprio botão e não um elemento por dentro, e a
           diferença é o `overflow-hidden` daqui: a foto precisa dele para
           herdar o canto arredondado, e qualquer filho posicionado fora da
           caixa seria cortado por ele. `outline` não é filho, é pintura do
           elemento, e por isso passa por cima do recorte.

           A TRANSIÇÃO É DE COR, e não de estilo: o contorno existe o tempo
           todo, com 2px de largura e transparente. Outline não anima de
           `none` para `solid`, então um contorno que só nasce no hover apareceria
           estalando; transparente para vermelho acende junto com o disco da
           seta, no mesmo tempo e na mesma curva.

           4px de folga cabem na calha entre os cartões (20px no menor
           intervalo) sem os contornos de dois vizinhos se encostarem. E como o
           cartão levanta 10px no hover, o contorno sobe junto: ele é do
           elemento, não uma moldura parada atrás dele.

           O foco de teclado usa o MESMO fio, pelo mesmo motivo de sempre: dois
           desenhos diferentes para "o ponteiro está aqui" e "o teclado está
           aqui" é uma distinção que só o código enxerga. */
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-plate bg-paper text-left shadow-plate outline-2 outline-offset-4 outline-transparent transition-[outline-color] duration-300 ease-[var(--ease-club)] will-change-transform hover:outline-red focus-visible:outline-red motion-reduce:transition-none"
      >
        {program.image ? (
          <img
            src={program.image}
            alt={program.imageAlt}
            width={560}
            height={700}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-club)] group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : (
          /* SEM FOTO, O CARTÃO NÃO VIRA UMA CAIXA CINZA. Ele vira uma placa:
             fio interno recuado e a marca vazada no canto, com a mesma
             densidade visual do cartão com foto.

             Uma versão anterior imprimia os três pontos do programa nesse
             espaço, porque a descrição tinha uma linha só e sobravam 250px de
             papel liso. Com a descrição da referência (duas frases) o vazio
             deixou de existir, e a lista passou a estourar a altura do cartão e
             sair cortada. Os pontos continuam no dado e aparecem no primeiro
             passo do agendamento, onde há espaço para eles. */
          <span aria-hidden="true" className="absolute inset-0 block bg-paper">
            <span className="absolute inset-[6px] block rounded-inner border border-line" />
            {/* No canto de baixo, e não no centro: o centro do cartão agora é do
                nome da turma, e a marca atrás dele deixaria o único texto da
                peça disputando espaço com um desenho. */}
            <Mark className="absolute -bottom-3 -right-3 h-24 w-24 text-ink opacity-[0.06]" />
          </span>
        )}

        {/* Dois véus, e cada um faz uma coisa.

            O de baixo é uma lavagem de tinta na foto inteira: é ele que faz os
            quatro cartões lerem como um conjunto escuro em vez de quatro fotos
            de exposições diferentes, e ele é o que torna o branco do nome
            legível mesmo sobre o canto mais claro de uma imagem.

            O de cima é o fade atrás do texto: forte na borda superior e
            dissolvido na metade do cartão. É ele que garante o contraste do
            nome sem escurecer a foto toda, que é o erro de quem resolve isso
            com um único véu pesado. */}
        {program.image && (
          <>
            <span aria-hidden="true" className="absolute inset-0 bg-ink/30" />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/80 via-ink/40 to-transparent"
            />
          </>
        )}

        {/* Só o nome, centrado na horizontal e ancorado no TOPO.

            No topo e não no meio do cartão porque o que está no meio de uma
            foto de jiu-jitsu são as pessoas: título centrado verticalmente cai
            em cima delas e disputa o assunto da imagem. Encostado no alto, ele
            fica onde a foto costuma ter céu, teto ou parede, e a sequência de
            leitura vira nome primeiro, cena depois.

            A descrição e a chamada "book this class" saíram daqui a pedido: o
            cartão virou uma placa de porta, e placa de porta tem o nome da sala
            e mais nada. A descrição não se perdeu, mudou de lugar: ela agora é
            o texto de apoio de cada turma no primeiro passo do agendamento, que
            é onde alguém de fato escolhe entre uma e outra. */}
        <span className="absolute inset-x-0 top-0 block px-12 pt-7 md:pt-8">
          {/* A margem lateral é SIMÉTRICA e do tamanho do disco. Assim o nome
              continua centrado no cartão de verdade (e não no espaço que sobra
              de um lado só) e nunca corre por baixo do disco — que era o que
              acontecia com "no-gi grappling", o nome mais longo dos quatro. */}
          <span
            className={cn(
              'display block text-center text-[1.6rem] leading-none md:text-[1.85rem]',
              program.image ? 'text-paper' : 'text-ink'
            )}
          >
            {/* O DESTAQUE RISCA O NOME quando o ponteiro entra no cartão. É o
                mesmo bloco dos títulos da página (`.mark`), na versão que
                acende da esquerda para a direita, e ele entra junto com o fio
                vermelho em volta e com o disco da seta: um gesto em três
                lugares, e não três gestos.

                O span de dentro é INLINE de propósito. O de fora é `block` e
                centralizado, e um fundo nele iria de margem a margem do cartão
                em vez de ter a largura do nome. */}
            <span className="mark mark-sweep">{program.name}</span>
          </span>

          {/* O disco com a seta na diagonal. Ele NÃO é um botão: o cartão
              inteiro já é o botão, e um alvo clicável dentro de outro é a
              maneira mais rápida de alguém clicar no lugar certo e achar que
              errou. Ele é o SINAL de que o cartão abre — e por isso fica
              escondido do leitor de tela, que já ouviu "Beginners, book this
              class" no rótulo do botão.

              Ele é ancorado à direita com posição absoluta em vez de participar
              da fileira para não empurrar o título nem alterar a medida dele. */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute right-5 top-6 grid h-11 w-11 shrink-0 place-items-center rounded-full border',
              'transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-club)]',
              'motion-reduce:transition-none md:top-7',
              program.image
                ? 'border-paper/45 text-paper group-hover:border-red group-hover:bg-red'
                : 'border-line-strong text-ink group-hover:border-red group-hover:bg-red group-hover:text-paper'
            )}
          >
            <ArrowDiagonal className="h-[1.1rem] w-[1.1rem] transition-transform duration-300 ease-[var(--ease-club)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </span>
      </motion.button>
    </motion.div>
  )
}
