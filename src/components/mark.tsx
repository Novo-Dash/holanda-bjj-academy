import { cn } from '@/lib/utils'

/**
 * A marca, em traço: o TORII do distintivo do cliente.
 *
 * Ela substituiu um monograma "H" que era invenção minha, e que só existia
 * porque o logo real ainda não tinha chegado. Com o distintivo em mãos, manter
 * o H seria pior do que não ter marca nenhuma: a página passaria a ter dois
 * símbolos disputando o mesmo papel, um no topo e outro na marca d'água.
 *
 * A geometria NÃO é estilizada de memória — ela foi medida no arquivo que o
 * cliente mandou, linha por linha (`brand/logo-source.webp`): a viga de cima
 * tem 44px de espessura constante e só afina nos 20px de cada ponta, os pilares abrem para fora conforme descem
 * (98→69 à esquerda, 328→356 à direita) e o montante central tem 32px de
 * largura. É por isso que ela lê como o mesmo objeto do distintivo e não como
 * "um torii qualquer".
 *
 * Fica MONOCROMÁTICA, em `currentColor`, e a viga vermelha do distintivo não
 * vem junto: os três usos desta peça são uma marca d'água a 7%, um carimbo no
 * canto de uma placa e o cabeçalho do modal, e nos três a cor é decidida por
 * quem chama. Uma peça que traz cor própria não serve de marca d'água.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 424 376" className={className} fill="currentColor" aria-hidden="true">
      {/* Kasagi, a viga de cima. Ela é um ARCO e não uma barra: no distintivo
          a face de cima sobe 19px do meio para as pontas e a de baixo sobe 51,
          então a peça afina até quase sumir nas extremidades. Desenhada como
          trapézio, a marca inteira ficava pesada no topo e deixava de parecer
          madeira apoiada. */}
      <path d="M0 2C40 14 120 21 212 21C304 21 384 14 424 2L424 18L400 50C330 62 270 65 212 65C154 65 94 62 24 50L0 18Z" />
      {/* Gakuzuka, o montante curto entre a viga e a travessa. */}
      <path d="M197 78h32v34h-32Z" />
      {/* Nuki, a travessa. É ela que atravessa os dois pilares e passa para
          fora deles nos dois lados, que é o que distingue um torii de uma
          letra grega. */}
      <path d="M34 110h358v34H34Z" />
      {/* Hashira, os dois pilares. Quadriláteros e não retângulos: eles se
          afastam da vertical conforme descem, exatamente como no distintivo, e
          é essa abertura que dá a impressão de peso apoiado no chão. */}
      <path d="M98 70h35l-19 304H69Z" />
      <path d="M293 70h35l28 304h-45Z" />
    </svg>
  )
}

/**
 * O logotipo como se lê no topo e no rodapé: o DISTINTIVO do cliente mais o
 * nome em duas linhas.
 *
 * O distintivo é imagem porque ele é uma foto de um patch de PVC, com relevo e
 * sombra própria — não há SVG que o reproduza, e vetorizar uma foto de emborra-
 * chado dá um desenho que não é nem a foto nem a marca. Fica em WebP de 512px,
 * que cobre tela de 3x no maior uso da página (96px) com folga.
 *
 * O nome CONTINUA sendo tipografia ao lado dele, e isso não é redundância com o
 * texto que o próprio distintivo traz em arco: a 44px aquele arco é ilegível,
 * então quem diz o nome é a tipografia e quem diz a marca é o disco. É a mesma
 * divisão que a academia usa no kimono e na fachada.
 *
 * `alt=""`: o nome está escrito ao lado em texto, e o link do topo já tem
 * `aria-label`. Descrever o disco aqui faria o leitor de tela anunciar "Holanda
 * BJJ Academy" duas vezes seguidas.
 */
export function Wordmark({
  className,
  invert = false,
}: {
  className?: string
  invert?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <img
        src="/logo.webp"
        alt=""
        width={512}
        height={512}
        /* Dimensões declaradas para o navegador reservar o quadrado antes de
           baixar: sem elas a barra do topo dá um pulo de 44px no primeiro
           carregamento, bem no campo de visão de quem acabou de chegar. */
        className="h-11 w-11 shrink-0 select-none object-contain"
        draggable={false}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'display text-[1.45rem] tracking-[0.045em]',
            invert ? 'text-paper' : 'text-ink'
          )}
        >
          Holanda
        </span>
        <span
          className={cn(
            'label mt-1 text-[0.55rem] tracking-[0.28em]',
            invert ? 'text-paper/55' : 'text-ink-soft'
          )}
        >
          BJJ Academy
        </span>
      </span>
    </span>
  )
}
