# design-decisions.md — HOL-001

Preset: **OLD SCHOOL**, em leitura **minimalista e soft**. Papel quente, tinta
quase preta, vermelho da marca.

Rotina cumprida: entrar na referência, absorver o que funciona, replicar com
outra leitura. Nada aqui foi clonado tela a tela.

---

## 0. Referências abertas e o que ficou de cada uma

| Rota | O que se absorveu |
|---|---|
| `D:\DOCUMENTOS\NovoDash\COLLECTIVE JIU-JITSU` | **A espinha inteira.** Foi a página que o cliente aprovou sem uma alteração, e o pedido foi explicitamente "aprenda com ela". Vieram: o sistema de placa e fio duplo, o numeral romano costurando as seções, o `SectionHead`, o vocabulário de quatro gestos de entrada, a cortina de cor ligada ao scroll, o mecanismo de preenchimento dos passos, o cartão de programa com placa sobre foto, o FAQ de cabeçalho grudado, a faixa do mapa encostada no rodapé e, principalmente, a **disciplina de dado**: `Pending` no lugar do que o cliente não mandou. |
| `Design System` da casa | Tokens em `@theme`, tipografia fluida, `overflow: clip` no lugar de `hidden`, e os dois defeitos conhecidos do boilerplate (ver §8). |
| Preset old school do PRD (Fight Sports, Fight Sports Club) | A **marca de fundo gigante**, a headline **bicolor** e a alternância claro/escuro. Dosados: ver §2. |

**Herdado:** a arquitetura, o contrato de dados, o modo prospect, os mecanismos.
**Variado:** a tipografia, a paleta, o letreiro, a marca, a seção de programas, o
diferencial com foto, a seção de avaliações, a de endereço e o formulário.

---

## 1. O que NÃO foi copiado da Collective, e o que entrou no lugar

| Na Collective | Aqui | Por quê |
|---|---|---|
| Big Shoulders Display (condensada de esquadro) + Archivo | **Uma família só: Archivo Variable em duas larguras** | O pedido foi "condensada, porém minimalista e soft". Ver §3. |
| Letreiro em duas fitas cruzadas em X, inclinadas 3° | **Uma faixa reta**, tinta, com losango vermelho entre os itens | Fita torta é ornamento. A leitura pedida é minimalista, e a faixa reta faz o mesmo trabalho (marcar a passagem do hero para o corpo) sem cobrar atenção. |
| Oferta de fundação com três faixas, cadeado e barra de vagas | **Nada.** A oferta é uma só e cabe numa linha: a primeira aula é grátis | Mecanismo de escassez numa academia que já está aberta há anos seria invenção. A Collective estava inaugurando; esta não. |
| Contador regressivo em painel de partidas | **Nada** | Mesmo motivo: não existe data para contar. |
| Galeria da obra | **Seção "why people stay"**, quatro diferenciais com foto e ícone | A academia não está em obra. O que a campanha precisa provar é que o lugar é sério E recebe quem nunca treinou. |
| Brasão circular com raios e losango | **Monograma H**, onde a travessa da letra é a faixa, com o nó no meio | O nome do cliente é Holanda, e a letra é o ativo mais barato que existe. Uma versão anterior estendia a faixa para fora das hastes e o símbolo virava um par de asas; dentro dos limites do H ele lê primeiro como letra. |
| Depoimentos ausentes, sem seção | **Seção de avaliações com o painel de nota**, e a lista de depoimentos vazia | A nota do Google é verificável e a campanha precisa dela. Os textos não vieram, e depoimento inventado numa página de academia some no instante em que um aluno real lê. |
| Modal de dois passos | **Quatro estados, três perguntas**, começando pela turma | Dois públicos diferentes (pais de 26 a 50, adultos de 18 a 50) e a turma é o que decide o resto: pede nome e idade da criança, e muda os horários oferecidos. |

---

## 2. A dose do "old school"

O preset do PRD pede tipografia condensada em caixa alta, marca de fundo
gigante, headline bicolor, alternância claro/escuro e vermelho forte pontual.
Tudo isso está aqui, e cada um está **dosado** porque a instrução final foi
minimalista e soft:

- **Marca de fundo**: contorno de 1px a 5% de opacidade, e não letra cheia em
  cinza. Duas na página inteira (`PROGRAMS` e `HOLANDA`), e as duas derivam
  devagar na horizontal com a rolagem. Marca de fundo sólida compete com o
  conteúdo que ela deveria apoiar.
- **Headline bicolor**: duas vezes na página, e nas duas frases que a campanha
  compra. "Framingham, MA" no hero e "trial class today" no pedido final.
  Terceira vez viraria maneirismo.
- **Alternância**: NÃO existe mais alternância entre tons claros. A pedido do
  Adryan, toda seção clara é o mesmo papel branco; o tom intermediário
  (`--color-paper-2`) sobreviveu só como superfície de componente (cartão do
  FAQ e slot de foto vazio, que sem ele sumiriam no fundo). O que separa uma
  seção da seguinte é o **fio duplo** que abre cada cabeçalho, e não uma troca
  de fundo. Restam **duas** inversões escuras (a aula experimental e o pedido) e
  nenhuma a mais.
- **Vermelho**: é a cor da AÇÃO. Botão, numeral do eyebrow, losango separador,
  placa do cartão de programa e a segunda metade das duas headlines. Nunca em
  fundo de seção inteira, exceto como cortina em movimento.
- **Textura**: papel de FIBRA, gerado para esta página e não a lavagem de papel
  empoeirado que a Collective e o Fight Sports Club compartilham. Trama fina de
  fios curtos nas duas direções, em `multiply`, com o pixel mais escuro do
  ladrilho em 245 de 255. Mais o grão fino a 2,5% por cima (metade do que a
  Collective usa). Ver §12.

---

## 3. Tipografia: duas famílias, papéis separados

**Sofia Sans Extra Condensed** nos títulos, **Archivo** no corpo. As duas por
`@fontsource-variable`, importadas em `main.tsx` e nunca por `<link>`.

O título é caixa alta, peso 700, tracking positivo de 0,02em, entrelinha 0,92.

### Como chegou aqui, e por que a decisão anterior caiu

A página começou com **uma família só**: a Archivo Variable, puxada a 68% de
largura no título e 100% no corpo. O argumento era bom no papel — mesma letra,
diferença por largura/peso/caixa, um arquivo a menos, a página lendo como um
sistema — e ele sobreviveu à primeira rodada de feedback.

Ele caiu na terceira, com a frase mais útil que o cliente deu até agora:
**"parece muito Bebas, parece genérica"**. E está certo. O eixo de largura de
uma grotesca de texto **comprime** o desenho, não o redesenha: o C, o S e o G da
Archivo a 68% viram os mesmos arcos de qualquer condensada de sistema, e o que
sobra é a silhueta estreita — que é, literalmente, o que faz uma letra "parecer
Bebas".

A Sofia Extra Condensed é desenhada estreita de origem. O J tem gancho, o G tem
espora, o R tem perna reta que sai do ombro. Numa headline de três linhas isso é
a diferença entre uma tipografia e uma medida.

**Como a escolha foi feita:** as candidatas foram renderizadas na PRÓPRIA hero,
ao vivo, trocando a família por CDP — nunca num specimen genérico. A folha ficou
em `brand/font-options.png`. As outras finalistas eram Big Shoulders Display (a
de mais caráter, mas o oposto de "soft") e Antonio (limpa, e a que mais corria o
risco de cair de volta no genérico).

### O que sobrou da Archivo, e por quê

O corpo. E também o `display-soft` (hoje só o texto dos depoimentos), que puxa o
eixo `wdth` a 82%: um parágrafo de quatro linhas numa extra condensed vira uma
coluna de palitos, e o aperto de 18% da Archivo se lê como voz em vez de
esforço. É por isso que o `main.tsx` continua importando a folha **`wdth`** da
Archivo e não a padrão.

**A armadilha que isso traz:** `@fontsource-variable/archivo` tem quatro folhas
(`index`, `standard`, `wght`, `wdth`). Só a `wdth` carrega o eixo de largura.
Importando qualquer outra, `font-stretch: 82%` é ignorado **em silêncio**, sem
quebrar nada e sem avisar ninguém.

O `display` NÃO tem `font-stretch`: a Sofia Extra Condensed não tem eixo de
largura, e a regra só valeria para o fallback — Archivo Narrow a 68% ficaria
bem mais apertada que a fonte real, e o salto na troca seria pior que a
ausência da regra.

---

## 4. Paleta

Tokens em `src/index.css`, e só lá.

Papel `#FBF9F7` + tinta `#14120F` + vermelho `#C8161D` **[CONFIRMAR o hex do
logo]**.

O papel é quente de propósito: branco 100% é tela, papel tem temperatura. A
tinta é preta QUENTE pelo mesmo motivo: preto absoluto sobre papel quente lê
como buraco.

Contrastes medidos (ficam no comentário do token, para quem trocar a cor ter a
fasquia à frente):

- `#C8161D` sobre papel → **5,6:1** (AA, passa em texto pequeno)
- papel sobre `#C8161D` → **5,9:1**
- `#14120F` sobre papel → **16,9:1**
- `#6B645C` sobre papel → **5,6:1** (só texto secundário)

Quem trocar o vermelho pelo hex real precisa limpar 4,5:1 nos dois sentidos.
E precisa trocar **um** token: `--accent-rgb` alimenta as sombras coloridas do
botão, então a troca chega no botão junto.

### As superfícies, depois das últimas rodadas

A regra original era: tudo papel, duas inversões escuras (aula experimental e
pedido final), e **vermelho nunca como fundo de seção inteira**. Ela mudou por
pedido, e hoje são quatro superfícies:

1. **papel** — a maioria das seções;
2. **tinta com foto** — a primeira tela e o pedido final, os dois com a foto da
   turma atrás de um véu de 88% e 92%. A foto é a mesma de propósito: a página
   abre mostrando quem treina aqui e fecha pedindo para a pessoa entrar nessa
   foto;
3. **tinta chapada** — a aula experimental;
4. **vermelho** — **só** a seção "how to get started" (III).

A quarta é a exceção, e ela se sustenta por um motivo e não por gosto: aquela
seção **é** a ação. Os três passos são o mecanismo de agendar e o botão no fim é
o mesmo clique da barra fixa, então o vermelho ali continua apontando para onde
sempre apontou. Uma **segunda** seção vermelha acaba com o argumento, porque a
cor deixa de indicar um lugar.

**Detalhe que custou uma medição:** a cortina que tomba sobre a aula
experimental é vermelha e vinha lisa, enquanto a seção III é vermelha e
texturizada. A multiplicação da textura escurece o vermelho o bastante para as
duas leituras não fecharem, e a emenda aparecia exatamente onde a folha deveria
parecer o prolongamento da seção de cima. Hoje a cortina também leva
`.textured`: medidos, os dois ficam em `rgb(198 24 31)` contra
`rgb(198 23 30)`.

---

## 5. Momento de assinatura

O **hero em duas colunas com a VSL vertical emoldurada**, com o carimbo
"primeira aula grátis" mordendo o canto do vídeo.

É onde a ousadia foi gasta, e é a decisão estratégica do projeto: quem chega de
Performance Max não conhece a academia nem o professor, e noventa segundos de
vídeo do responsável falando com a câmera resolvem o que parágrafo nenhum
resolve. O formato é de reel porque é o formato que as pessoas assistem.

A primeira tela é **papel**, e não foto cheia com texto por cima, que é o hero
padrão do nicho.

---

## 6. Ordem da página

Hero (VSL) → letreiro → programas → por que aqui → o professor → como funciona →
avaliações → perguntas → onde e quando → o pedido → mapa → rodapé.

O raciocínio de cada posição está no comentário de `src/App.tsx`. Em resumo: as
duas primeiras perguntas de quem chega são "tem turma para mim?" e "é lugar
sério que aceita iniciante?", e as duas primeiras seções respondem exatamente
isso. O professor vem em seguida porque numa academia de jiu-jitsu quem assina é
a pessoa. Endereço e horário ficam no fim, para quem já decidiu.

---

## 7. Movimento

Quatro gestos de entrada (`src/components/reveal.tsx`): `rise`, `veil`, `rule`,
`settle`. Mais a entrada palavra a palavra, reservada a um parágrafo por seção.

Nenhum deles recorta. Um gesto que esconde com `clip-path` falha fechado: se o
observador de viewport não disparar, o bloco fica com a altura ocupada e nada
pintado. `rise` erra para o lado seguro, porque o pior caso dele é aparecer sem
animação.

Ligados ao scroll, e só estes três:

1. **a cortina de FOLHA TOMBANDO** (duas vezes: a aula experimental e o
   pedido). Uma folha de cor com dobradiça na borda de baixo que tomba para
   trás, escurecendo enquanto sai do plano. É o único efeito da página que usa
   perspectiva. Ver §12;
2. **o preenchimento dos passos**, que é a seção-mecanismo da página. Timer no
   desktop (começa quando a fileira está sendo olhada, nunca na montagem),
   ligado ao scroll no celular, cumulativo e sem laço;
3. **a deriva da marca de fundo**, lenta e horizontal. Vertical seria paralaxe
   de banner, e paralaxe vertical em texto gigante enjoa.

Tudo respeita `prefers-reduced-motion`: sem movimento o conteúdo aparece pronto,
e nunca escondido. **Sem GSAP**: `motion` dá conta e é uma dependência a menos.

---

## 8. Os dois defeitos conhecidos do boilerplate, e como estão tratados

1. **`cn()` come as classes de escala fluida.** O `tailwind-merge` lê qualquer
   classe que comece por `text-` como do grupo de tamanho/cor e descarta a
   anterior. Aqui as escalas se chamam `type-hero`, `type-section` e afins, e a
   textura se chama `textured` e não `bg-texture` pelo mesmo motivo (uma classe
   `bg-*` apagaria em silêncio o `background-color` da seção e o `multiply` não
   teria contra o que misturar).
2. **`DeferredSection` de altura zero não adia nada.** Aqui o adiamento é
   `React.lazy` + `Suspense` com **altura reservada** (`minHeight: 60vh`), e não
   uma sentinela de altura zero. E o modal só é montado no primeiro ocioso
   depois do load, porque renderizar `<Suspense><Modal open={false}/></Suspense>`
   faz o React resolver o chunk no primeiro paint.

---

## 9. Três armadilhas encontradas nesta página

- **O embed do Google Maps.** O endereço que todo mundo copia
  (`maps.google.com/maps?q=…&output=embed`) hoje devolve **301 com
  `X-Frame-Options: SAMEORIGIN`**, e o navegador recusa o iframe no
  redirecionamento, antes de chegar ao destino. O sintoma é uma faixa branca no
  lugar do mapa, sem erro visível. A correção é usar o destino final
  (`/maps/embed?origin=mfe&pb=…`), que responde 200 e sem cabeçalho de moldura.
  Sem chave de API.
- **`rule-double` aplicada num elemento de altura real.** A utility é
  `border-top` mais um `box-shadow` deslocado 3px, e num elemento alto o
  deslocamento cai embaixo da caixa: o resultado é um fio em cima e outro no
  pé, não um fio duplo. Ela só lê como fio duplo num elemento de 4px de altura,
  que é o que o componente `DoubleRule` é.

---

## 10. A passada de copy e estrutura (a partir da referência do Adryan)

Depois da primeira entrega o Adryan mandou a copy inteira de uma página do
portfólio e pediu: mesma estrutura e mesmo tom, e no lugar da seção de corpo
técnico uma chamada **"how the trial class works at Holanda BJJ"**.

O que veio de lá:

| Da referência | Como ficou aqui |
|---|---|
| Headline geográfica empilhada | "Brazilian / jiu-jitsu in / Framingham, MA", com o lugar em vermelho |
| "Seven ways to start", cartão com foto, descrição de duas frases e "book this class" | "Four ways to start", mesmo cartão, com "book this class" no pé |
| "How to get started?" com três passos logo depois dos programas | Igual, e a mudança de POSIÇÃO é a parte que importa: quem acabou de escolher a turma está com a pergunta "e como eu faço isso?" na cabeça |
| "Why people stay" | Igual. O título é melhor que "por que aqui": quem chega já viu dez academias dizerem por que são boas, e quem FICOU é outra afirmação |
| Depoimentos com iniciais, nome e "Member · Google" | Mesmo desenho, lista ainda vazia |
| "People from your postcode already train here" | "People from your town already train here", com as cidades vizinhas na linha de apoio. Prova social de academia é geográfica antes de ser qualitativa: ninguém dirige quarenta minutos para treinar |
| FAQ de doze perguntas, na voz de quem chega | Dez. Três dependiam de dado que o cliente não deu, e a de preço foi reescrita para responder sem inventar número |
| Rodapé com "explore" e horário junto do endereço | Igual, mais "Built by Novo Dash" |

O que **não** veio, e por quê:

- **A galeria de doze fotos.** Não existe nenhuma foto. Doze slots vazios são
  piores que não ter a seção.
- **As abas "para mim" / "para meu filho"** nos programas. Lá são sete
  programas, três infantis; aqui são quatro, e a aba de kids ficaria com um
  cartão sozinho num vão de três colunas. O rótulo em cada cartão faz a mesma
  triagem sem quebrar a fileira.
- **O superlativo de mercado** ("a academia que mais cresce da região"). É
  afirmação verificável, e ninguém verificou essa.
- **O botão de WhatsApp.** Entra sozinho quando alguém confirmar que o número
  tem WhatsApp (`site.whatsapp`).

### A seção que substituiu o corpo técnico

`src/sections/trial.tsx`. Duas colunas no formato do hero: o texto de um lado e
um vídeo vertical de DENTRO da academia do outro.

Ela nasceu como uma linha do tempo de seis etapas e o Adryan pediu para virar
texto mais vídeo. O conteúdo não se perdeu: cada garantia que estava numa etapa
continua numa frase dos três parágrafos. O que mudou é quem carrega o peso da
seção, e a troca faz sentido: a pergunta é "como é lá dentro", e para essa
pergunta um vídeo da sala vale mais que seis títulos.

São DOIS vídeos do cliente e não um. O do hero é o professor falando com a
câmera ("quem eu sou"); este é a sala funcionando ("como é lá dentro"). O mesmo
arquivo nos dois lugares responderia uma pergunta duas vezes e a outra nenhuma.

O vídeo fica à ESQUERDA, espelhando o hero: duas seções com a mesma peça no
mesmo lado leem como a mesma seção repetida, espelhadas leem como uma rima. No
celular a ordem se inverte, e o texto vem primeiro.

Ela existe porque a objeção real de quem nunca treinou não é "o professor é
bom?", é "o que exatamente vai acontecer comigo quando eu atravessar aquela
porta?". Uma seção de coaches PEDE confiança; esta ENTREGA a informação que
substitui a confiança, que é mais barato para quem ainda não conhece ninguém
ali. E ela não depende de nenhum dado pendente: não tem horário, não tem preço e
não promete estrutura que ninguém conferiu.

De quebra, resolveu um problema que a seção do professor tinha: faixa e linhagem
do Diego não vieram, então metade daquela seção era pendência impressa.

### A seção de endereço e horário, removida

O Adryan tirou a `[VIII] Where and when` (endereço, telefone, Instagram,
direções e a grade completa por turma). Três dependências caíram junto e foram
arrumadas no mesmo passo, que é a parte que costuma ficar para trás quando se
remove uma seção:

1. o índice do rodapé apontava para `#location`, uma âncora que deixou de
   existir;
2. a resposta do FAQ sobre endereço dizia "a grade completa fica logo acima do
   mapa";
3. o link "get directions" só existia lá. Ele foi para a coluna "visit us" do
   rodapé: é a única ação que aquela seção tinha e que o mapa embutido não
   oferece (o mapa mostra onde é, o link abre a rota no telefone de quem lê).

O endereço continua no rodapé, no mapa em largura total e no JSON-LD. A grade
por turma continua alimentando o passo 3 do agendamento.

### A barra de confiança que entrou e saiu

A referência tem quatro fatos logo abaixo da headline (nota, aula grátis, faixa
etária, endereço). Ela foi construída e o Adryan pediu para tirar. Fica o
registro de duas coisas:

1. o dado dela saiu junto do `site.ts` (dado exportado que ninguém lê é lixo que
   a próxima pessoa acha e tenta entender);
2. o defeito que ela tinha, para não se repetir: o rótulo pequeno estava no DOM
   **duas vezes**, uma em `sr-only` dentro do `<dt>` e outra visível no `<dd>`.
   Ao copiar o texto da página, cada rótulo saía em dobro. Em lista de
   definição, ou o `<dt>` é o rótulo visível, ou o texto visível não repete o
   `sr-only`.

### O hero em tela cheia

`min-h-svh`, e não `h-screen`. Três detalhes, todos comentados em
`src/sections/hero.tsx`: a unidade é `svh` porque `100vh` no celular é a altura
da janela SEM a barra de endereço; é `min-h` porque em janela baixa o conteúdo
precisa poder empurrar a seção em vez de vazar; e a largura da VSL é derivada da
ALTURA da janela, senão num monitor largo e baixo o vídeo de 9:16 cresce com a
coluna e a seção de tela cheia deixa de caber na tela cheia.

A escala da headline ganhou um teto por altura de janela (`9.6svh`) pelo mesmo
motivo: em 1440x720 as três linhas empurravam o botão para fora da dobra.

---

## 12. As duas peças que foram refeitas por serem iguais às da referência

### A cortina, em três tentativas

Ela foi refeita DUAS vezes, e as duas primeiras caíram pelo mesmo motivo: já
existiam no portfólio, e o Adryan reconheceu as duas de primeira.

1. **camada recortada por uma diagonal que o scroll empurra.** É a `Curtain` da
   Collective, arquivo por arquivo.
2. **sete ripas horizontais recolhendo em sequência.** É a do Christ Jiu-Jitsu
   (`components/ui/Curtain.tsx`: quatro painéis verticais subindo em escada,
   portada do Fight Sports Miami). Painel que se retira em sequência é o mesmo
   gesto, só que noutro eixo.
3. **a que ficou: uma folha com dobradiça na borda de baixo, que tomba para
   trás.**

A lição, e ela vale para a próxima página: depois de eliminar a diagonal e o
painel, o que sobra de diferente não é outro jeito de um retângulo sair de
cena, é **outra classe de movimento**. As duas primeiras são transformações no
plano; esta é rotação em profundidade, e por isso não tem como parecer nenhuma
das duas. É também o único efeito da página que precisa de `perspective`.

Antes de desenhar a terceira, o portfólio foi varrido atrás de `rotateX` e
`perspective`: eles aparecem em galerias e cartões de outros projetos, nunca
como cortina de seção.

Detalhes que não são enfeite, comentados em `components/curtain.tsx`: a
dobradiça fica embaixo (com ela em cima, o título seria a última coisa a
aparecer); a folha escurece enquanto tomba, senão a rotação lê como um
retângulo encolhendo; a perspectiva é curta, 1000px, porque quanto mais perto o
observador mais forte o escorço e mais óbvio que aquilo é uma folha; e o ângulo
final passa de 90° porque exatamente em 90° alguns navegadores ainda desenham
um fio de um pixel.

### A textura

Era o mesmo arquivo da Collective e do Fight Sports Club. A substituta foi
gerada aqui, e chegar nela custou três tentativas erradas que vale registrar
porque o erro se repete:

1. **ruído fractal rebaixado até quase branco.** Lê como granulado de foto mal
   digitalizada e briga com a tipografia.
2. **manchas grandes e esparsas** ("papel guardado"). Linda isolada, e
   escancarada quando ladrilhada: o olho memoriza uma mancha grande e reconhece
   a cópia. Num campo de 2560px dava para apontar a emenda com o dedo.
3. **a que ficou: fibra.** Marca pequena e numerosa. Não existe forma para o
   olho reconhecer, então a repetição some.

A regra que sai disso: **num ladrilho, o que denuncia a repetição não é a
quantidade de textura, é o tamanho das marcas.**

A força foi calibrada com quatro versões lado a lado no tamanho real (100%,
45%, 30% e 20%). A 100% a trama lia como padrão; a 20% sumia. Ficou a de 30%,
que pesa 5,8 KB contra os 94 KB da textura antiga.

---

## 11. O que está pendente do cliente

A lista completa, com onde cada item entra, está no `README.md`. A regra que
governa todos: **a página imprime o marcador em vez de inventar o dado.** Faixa
de professor, nota de avaliação, horário de aula e texto de depoimento não se
preenchem com placeholder plausível, porque plausível é exatamente o que ninguém
confere depois.

E **nenhuma foto de banco de imagens**. Onde a foto real ainda não existe, o
slot é uma placa desenhada com a marca vazada e o briefing do que precisa entrar
ali; nos cartões de programa, o espaço que sobra é preenchido com os pontos
reais daquele programa, que somem quando a foto chegar. O estado sem foto
entrega mais informação que o estado com foto, que é o melhor jeito de um buraco
esperar por um arquivo.

---

## 13. O que chegou do cliente nesta rodada, e o que isso mudou

### O distintivo

Chegou como foto de um patch de PVC (`brand/logo-source.webp`, 948px, com
relevo, sombra e fundo já recortado). Ele entrou em quatro lugares:

- **barra do topo e rodapé** — o disco em WebP de 512px ao lado do nome em
  tipografia. Não é redundância com o texto em arco do próprio distintivo: a
  44px aquele arco é ilegível, então quem diz o nome é a tipografia e quem diz a
  marca é o disco. É a divisão que a academia já usa no kimono e na fachada;
- **favicon (32/64) e ícone da Apple** — e aqui o distintivo INTEIRO não serve:
  a 32px o arco "HOLANDA BJJ ACADEMY" vira uma serpentina cinza e o torii fica
  do tamanho de três pixels. O ícone é o **miolo** — disco preto, orla branca,
  torii a 68% do diâmetro. A orla branca é o que separa o ícone de uma aba
  escura;
- **`og.jpg`** — refeita, e ela agora sai da **página de verdade** fotografada
  em 1200×630 por CDP, com o cabeçalho e a coluna da VSL removidos e o disco
  posto no canto. É o único jeito de o cartão usar a fonte, o vermelho e o véu
  reais sem eu reconstruir tudo com PIL e errar por meio tom;
- **o componente `Mark`** — o monograma "H" que eu tinha desenhado foi
  **aposentado**. Ele só existia porque o logo não tinha chegado, e manter os
  dois deixaria a página com dois símbolos disputando o mesmo papel. No lugar
  entrou o **torii em traço**, com a geometria MEDIDA no arquivo do cliente
  linha por linha: viga de 44px de espessura constante que só afina nos 20px de
  cada ponta, pilares que abrem para fora conforme descem (98→69 à esquerda),
  montante central de 32px. É por isso que ele lê como o mesmo objeto do
  distintivo e não como "um torii qualquer". Fica monocromático em
  `currentColor`, porque os três usos (marca d'água a 7%, carimbo de canto,
  cabeçalho do modal) têm a cor decidida por quem chama.

### As fotos

- **`hero.webp`** — a turma inteira posada na sala. Virou o fundo da primeira
  tela e do pedido final, sob véu alto. Aposentou o argumento de "a primeira
  tela é papel porque as fotos reais não vieram";
- **`rating-bg.webp`** — retrato vertical sob luz vermelha, atrás do painel da
  nota, com o vermelho da marca a 72% por cima. Entra como **matéria**, para o
  painel deixar de ser um retângulo de cor chapada;
- as duas são decorativas na hierarquia: o `alt` do painel da nota é vazio de
  propósito, porque descrever "homem de kimono sob luz vermelha" não acrescenta
  nada à informação de que a academia tem 5,0.

**[CONFIRMAR] há crianças identificáveis nas duas fotos e no vídeo da aula
experimental.** Rosto de menor em página pública, e ainda por cima em campanha
paga, precisa de autorização dos responsáveis — que é coisa diferente de já ter
sido postado no Instagram.

### Dois defeitos que apareceram junto

1. **o telefone da barra do topo quebrava em duas linhas**, ícone em cima e
   número embaixo. Não era o `whitespace-nowrap` falhando: o `Button` embrulhava
   os filhos num `<span>` simples, e o preflight do Tailwind põe `display:block`
   em todo `<svg>` — não havia texto quebrando, havia um bloco empurrando o
   irmão para a linha de baixo. O invólucro virou `inline-flex`;
2. **a primeira tela escureceu, e a barra do topo é transparente enquanto não se
   rola.** Os links tinta e o fio cinza sumiam na foto. Hoje um único booleano
   (`onDark`) veste as quatro peças da barra, e o botão do telefone ganhou a
   variante `quietOnDark` — que continua sendo a peça SEM cor, porque quem tem
   cor na primeira tela é o botão de agendar, e só ele.
