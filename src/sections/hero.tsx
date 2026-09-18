import { Button } from '@/components/ui/button'
import { PhotoBackdrop, VideoSlot } from '@/components/paper'
import { Reveal, RevealWords } from '@/components/reveal'
import { site } from '@/data/site'
import { track } from '@/lib/track'

/**
 * [I] HERO — placa de fachada, em duas colunas, ocupando a tela inteira.
 *
 * À esquerda o título e a ação; à direita a VSL VERTICAL, no formato de reel,
 * emoldurada como uma placa. É o desenho pedido no PRD §0.11 e §8.7, e a razão
 * é de campanha: quem chega de Performance Max não conhece a academia nem o
 * professor, e um vídeo do responsável falando com a câmera resolve em noventa
 * segundos o que parágrafo nenhum resolve.
 *
 * A HEADLINE É A OFERTA, e não mais o lugar. Ela era geográfica ("Brazilian
 * jiu-jitsu in Framingham, MA", a cidade em vermelho na terceira linha), e a
 * troca tem um custo que vale registrar: quem chega de Performance Max digitando
 * "jiu jitsu framingham" deixa de ver a cidade no maior texto da página. Ela
 * continua no olho logo acima do título (o endereço), na primeira frase do
 * parágrafo de apoio, no title da aba, na meta description, no JSON-LD e no
 * rodapé, que é onde ela trabalha para a busca; o que a primeira linha faz agora
 * é responder ao medo, que é o que trava a inscrição de quem nunca treinou.
 *
 * O VERMELHO SAIU DA CIDADE E FOI PARA "and it's free". O acento da primeira
 * tela é sempre a coisa que a página quer que a pessoa faça, e agora a frase que
 * remove o último obstáculo é a que fica em vermelho, na mesma cor do botão
 * logo abaixo.
 *
 * AS QUATRO LINHAS SÃO FIXAS, a pedido, e a escala foi refeita para elas. A
 * linha mais longa ("Your first jiu-jitsu") mede 5,775em, então a coluna de
 * 657px do desktop comporta 113px de corpo e o teto de 6,25rem cabe com folga;
 * quem manda em janela baixa é o teto por altura, recalculado para quatro
 * linhas em vez de três (ver `type-hero` no index.css). A quarta linha é a
 * única marcada, e é ela que fica por último antes do botão.
 *
 * O FUNDO é a foto da turma inteira, atrás de um véu de tinta bem fechado.
 *
 * A versão anterior desta seção era papel, e o argumento era que as fotos reais
 * não tinham chegado — banco de imagens na primeira dobra é onde a mentira
 * aparece primeiro. Com a foto verdadeira em mãos esse argumento caiu: a
 * primeira tela passa a mostrar a academia de verdade, com gente de verdade
 * dentro dela, que é a única prova que uma página de captação pode dar antes
 * de a pessoa clicar.
 *
 * O VÉU É ALTO (88% de tinta) por dois motivos que puxam na mesma direção: uma
 * foto de trinta rostos é ilegível como imagem principal, e o texto que importa
 * está por cima dela. Fechado assim, ela vira ATMOSFERA — dá volume e presença
 * ao fundo sem nunca disputar a headline. Por cima dele ainda correm três
 * degradês: um no topo (onde a barra fixa precisa de contraste), um no pé (onde
 * a seção precisa fechar em tinta cheia para emendar no que vem depois) e um da
 * esquerda para o centro, que é o que segura a headline sobre trinta rostos.
 *
 * No celular a coluna empilha: texto em cima, vídeo embaixo, e o vídeo continua
 * vertical. Deitar a VSL no celular seria desfazer justamente o formato que faz
 * ela ser assistida.
 *
 * ALTURA: a seção ocupa a tela inteira, com o conteúdo centrado no que sobra.
 * Três detalhes que isso exige:
 *
 *  · a unidade é `svh` e NÃO `vh`. No celular, `100vh` é a altura da janela SEM
 *    a barra de endereço, então a primeira tela nasce mais alta que o visível e
 *    o pé da seção fica escondido até alguém rolar. `svh` é a menor altura
 *    possível da janela, ou seja, a que existe com a barra à mostra: o que foi
 *    desenhado para caber na primeira tela cabe na primeira tela.
 *  · é `min-h` e não `h`. Em janela baixa (um notebook de 13 polegadas, ou o
 *    celular deitado) o conteúdo é maior que a tela, e com altura fixa ele
 *    vazaria por baixo do recorte em vez de empurrar a seção.
 *  · a largura da VSL é derivada da ALTURA da janela
 *    (`min(100%, calc(58svh * 9/16))`). Sem isso, num monitor largo e baixo o
 *    vídeo de 9:16 cresce com a coluna e passa de mil pixels de altura, e a
 *    seção de tela cheia deixa de caber na tela cheia.
 */
export function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section
      id="top"
      /* `isolate`: cria o contexto de empilhamento da seção, e é o que deixa a
         foto e os véus viverem em z negativo sem escaparem para trás do fundo
         da própria seção. Sem isso, `-z-10` some. */
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink pb-12 pt-28 md:pb-16 md:pt-32"
    >
      <PhotoBackdrop veil={0.88} scrim="left" priority />

      <div className="shell relative flex flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
          {/* Coluna do título. Centralizada no celular e à esquerda do lg para
              cima: empilhado, o texto centrado fica alinhado com o vídeo que
              vem embaixo dele, e sem isso a coluna parece encostada na margem
              esquerda com o vídeo solto no meio. */}
          <div className="text-center lg:text-left">
            <Reveal gesture="rise">
              <p className="label inline-flex items-center gap-2.5 text-paper/70">
                <span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
                {site.address.line1}
              </p>
            </Reveal>

            {/* O espaço explícito no fim de cada bloco NÃO é decoração: sem ele
                o `textContent` do h1 sai tudo emendado ("Brazilianjiu-jitsu
                in"), que é o que o leitor de tela pronuncia. Em elemento de
                bloco ele colapsa na renderização e não empurra nada. */}
            {/* O espaço explícito no fim de cada bloco NÃO é decoração: sem ele
                o `textContent` do h1 sai tudo emendado ("jiu-jitsuclass"), que
                é o que o leitor de tela pronuncia. Em elemento de bloco ele
                colapsa na renderização e não empurra nada.

                O ponto no lugar do travessão não é preferência de pontuação: a
                página inteira não usa travessão em texto que o visitante lê, e
                duas frases curtas batem mais forte numa headline que uma frase
                longa com uma pausa no meio. */}
            <h1 className="display type-hero mt-6 text-paper">
              <Reveal gesture="veil" as="span" className="block">
                Your first jiu-jitsu{' '}
              </Reveal>
              <Reveal gesture="veil" delay={0.08} as="span" className="block">
                class is easier{' '}
              </Reveal>
              <Reveal gesture="veil" delay={0.16} as="span" className="block">
                than you think.{' '}
              </Reveal>
              <Reveal gesture="veil" delay={0.24} as="span" className="block">
                <span className="mark">And it{'’'}s free.</span>
              </Reveal>
            </h1>

            <RevealWords
              delay={0.34}
              className="type-body mx-auto mt-8 max-w-[54ch] leading-relaxed text-paper/70 lg:mx-0"
              text="Beginner-friendly BJJ classes for adults, kids and no-gi in Framingham. Structured training in a clean and welcoming academy."
            />

            <Reveal gesture="rise" delay={0.46}>
              {/* UMA ação, e só. O telefone saiu daqui porque ele agora mora na
                  barra fixa do topo, que está sempre na tela: repetir o número
                  ao lado do botão era oferecer duas saídas no mesmo ponto, e a
                  primeira tela existe para oferecer uma. */}
              <div className="mt-10 flex justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => {
                    track('cta_click', { location: 'hero' })
                    onBook()
                  }}
                >
                  Try a free class
                </Button>
              </div>
            </Reveal>
          </div>

          {/* A VSL, encostada na borda direita da folha. Sem fio entre as
              colunas: o vídeo já é um bloco, e bloco com fio do lado vira
              cartão dentro de cartão. */}
          <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[19rem] lg:mr-0 lg:max-w-[min(100%,calc(58svh*9/16))]">
            <Reveal gesture="rise" delay={0.25}>
              <VideoSlot
                src={site.vsl.src}
                poster={site.vsl.poster}
                brief="Head coach to camera, ninety seconds: who we are, what a first class looks like, and how to book the free trial"
                ratio="9 / 16"
                dark
                /* Toca sozinho, mudo e em laço. Autoplay IMPLICA mudo: navegador
                   nenhum autoriza som sem interação. Aqui isso custa menos que
                   em qualquer outro vídeo da página, porque a VSL tem legenda
                   queimada no arquivo: mudo, ela continua sendo lida.

                   `soundInvite` troca os controles cinza do navegador pelo
                   player da casa. O que ele muda de verdade não é o acabamento:
                   é O QUE ESTÁ SENDO PEDIDO. O controle nativo oferece play num
                   vídeo que já está tocando, e o único jeito de ligar o som é
                   achar um ícone de 12px. O player da casa pede uma coisa só, em
                   vermelho e no meio da tela, e é a coisa certa. */
                autoplay
                soundInvite
                /* Com `soundInvite` este evento sai do play automático e passa a
                   marcar o clique no som, que é o engajamento de verdade. */
                onPlay={() => track('vsl_play', { location: 'hero' })}
                className="shadow-plate"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
