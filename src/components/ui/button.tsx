import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { Arrow } from '@/components/icons'
import { cn } from '@/lib/utils'

type Variant = 'solid' | 'outline' | 'onDark' | 'quiet' | 'quietOnDark'
type Size = 'md' | 'lg'

/**
 * Botão de placa esmaltada. Quatro camadas, e cada uma resolve uma coisa:
 *
 *  1. LEVANTA — no hover ele sobe 2px e a sombra abre, e NADA troca de cor.
 *     O botão é vermelho, vermelho é a cor da ação nesta página, e peça que
 *     muda de cor ao ser apontada deixa de ser a mesma peça que era.
 *  2. BRILHO INTERNO — um fio branco de 1px no topo, por dentro (inset). É o
 *     que dá aspecto de esmalte em vez de retângulo pintado, e é a diferença
 *     entre um botão que parece objeto e um que parece div.
 *  3. SOMBRA COLORIDA — a sombra é vermelha e não preta: peça vermelha projeta
 *     sombra vermelha, e sombra preta debaixo de cor saturada é o detalhe que
 *     faz um botão parecer template. Ela é longa e fraca, que é o que dá a
 *     leitura soft pedida para esta página.
 *  4. AFUNDA — no clique ele volta para baixo do ponto de partida. Botão que
 *     não reage ao toque parece travado no meio milissegundo entre o clique e
 *     a resposta.
 *
 * E o fio vertical antes da seta, que repete o fio duplo da página dentro do
 * botão e separa rótulo de sinal sem gastar espaço.
 *
 * O canto é o mesmo raio das placas, num token. Longe de pílula: pílula é
 * linguagem de app moderno, e a página é feita de fio duplo e esmalte.
 *
 * Altura mínima 48px nos dois tamanhos: o piso de alvo de toque é 44px, e um
 * botão que passa raspando no piso falha no primeiro dedo grande.
 */
const SIZES: Record<Size, string> = {
  md: 'h-12 gap-3.5 px-6 text-[0.72rem]',
  lg: 'h-14 gap-4 px-8 text-[0.78rem]',
}

const VARIANTS: Record<Variant, string> = {
  /* As sombras são TOKENS (`--shadow-enamel` e companhia, em index.css) e não
     rgba escrito aqui: a sombra do botão sólido é feita do vermelho da marca, e
     repetir os canais dentro do componente faria a troca do vermelho arrumar a
     página e esquecer o botão. */
  solid: 'bg-red text-paper border border-red shadow-enamel hover:shadow-enamel-lift',
  outline: 'bg-transparent text-red border border-red/40 hover:border-red/70 hover:shadow-ghost',
  /* Papel sobre fundo escuro. NINGUÉM USA HOJE: as duas seções escuras passaram
     a levar o botão vermelho, a pedido, para a ação ter a mesma cor da primeira
     tela até o fim da página.

     O vermelho sobre tinta passa no piso de 3:1 de contraste de componente
     (3,11:1), então a troca não custou acessibilidade. A variante fica de pé
     para o caso de uma seção escura precisar de uma ação SECUNDÁRIA, que é
     exatamente onde ela não pode ser vermelha. */
  onDark: 'bg-paper text-ink border border-paper shadow-onink hover:shadow-onink-lift',
  /* Sem cor e sem sombra: fio cinza, texto tinta. É a peça para a ação
     SECUNDÁRIA que precisa estar sempre à mão sem competir com o vermelho.
     Se ela ganhasse sombra ou preenchimento, a página passaria a ter dois
     botões disputando o mesmo olhar, e o vermelho deixaria de significar
     "é aqui que se avança". */
  quiet: 'bg-transparent text-ink border border-line-strong hover:border-ink',
  /* A `quiet` do outro lado. Ela existe porque a primeira tela virou escura e o
     telefone da barra do topo mora em cima dela: o fio cinza sumia no fundo e o
     texto tinta ficava ilegível. Continua sendo a peça SEM cor — quem tem cor
     na primeira tela é o botão de agendar, e só ele. */
  quietOnDark: 'bg-paper/5 text-paper border border-paper/35 hover:border-paper/70 hover:bg-paper/10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  href?: string
  children: ReactNode
  withCaret?: boolean
}

export function Button({
  variant = 'solid',
  size = 'md',
  href,
  children,
  className,
  withCaret = true,
  ...rest
}: ButtonProps) {
  /* `onClick` sai do resto para valer nos DOIS ramos. Antes ele só chegava no
     <button>, então um botão com `href` engolia o clique de medição em
     silêncio: o link funcionava e o evento nunca era disparado. */
  const { onClick, ...buttonRest } = rest
  const classes = cn(
    'group relative inline-flex select-none items-center justify-center',
    'rounded-plate font-sans font-semibold uppercase tracking-[0.16em] no-underline',
    /* `whitespace-nowrap` e `shrink-0`: rótulo de botão não quebra linha, e
       botão não encolhe para caber. Sem os dois, o telefone da barra fixa
       virava duas linhas assim que os cinco links do menu apertavam a fileira,
       e a barra crescia junto. Quem tem que ceder espaço numa barra cheia é o
       menu, não a ação. */
    'whitespace-nowrap shrink-0',
    'transition-[box-shadow,transform,border-color] duration-300 ease-[var(--ease-club)]',
    'hover:-translate-y-0.5 active:translate-y-px',
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
    'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-red',
    SIZES[size],
    VARIANTS[variant],
    className
  )

  const inner = (
    <>
      {/* `inline-flex` e NÃO um <span> simples: o preflight do Tailwind põe
          `display:block` em todo <svg>, então um botão com ícone + rótulo
          (o telefone da barra do topo) quebrava em duas linhas dentro deste
          invólucro, com o ícone em cima e o número embaixo. Não era o
          `whitespace-nowrap` falhando: não havia texto quebrando, havia um
          bloco empurrando o irmão para a linha de baixo. */}
      <span className="inline-flex items-center gap-2">{children}</span>
      {withCaret && (
        <>
          <span
            aria-hidden="true"
            className="h-3.5 w-px bg-current opacity-30 transition-opacity duration-300 group-hover:opacity-45"
          />
          <Arrow className="h-3 w-3 transition-transform duration-300 ease-[var(--ease-club)] group-hover:translate-x-1 motion-reduce:transition-none" />
        </>
      )}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
      >
        {inner}
      </a>
    )
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...buttonRest}>
      {inner}
    </button>
  )
}
