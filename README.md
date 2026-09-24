# Holanda BJJ Academy — landing page (HOL-001)

Landing page de aquisição para a **Holanda BJJ Academy**, 47 Franklin Street,
Framingham, MA. Destino do tráfego pago (Google Ads Performance Max, e Meta em
preparação) com uma oferta só: **a primeira aula é grátis**.

React 19 + Vite 8 + Tailwind 4 + `motion`. Sem GSAP e sem biblioteca de
componentes.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run preview
```

---

## O que precisa do cliente antes de publicar

A página **nunca inventa um dado**. O que não veio aparece marcado com uma
pastilha de pendência, e a pastilha some inteira quando `VITE_UX_MODE=client`.
Cada item abaixo é uma linha de `src/data/site.ts`.

| # | O que falta | Onde entra | Trava a publicação? |
|---|---|---|---|
| 1 | **A VSL** (vídeo vertical 9:16 do Diego, ~90s) | `site.vsl.src` e `.poster` | Sim. É a peça central do hero |
| 1b | **O vídeo de dentro da academia** (vertical 9:16: a sala, o tatame, uma aula rolando) | `site.insideVideo.src` e `.poster` | Sim. É metade da seção da aula experimental |
| 2 | **Grade de horários real** | `schedule` + `schedulePending = false` | Sim. A grade atual é rascunho, e é ela que alimenta o horário do rodapé E os horários oferecidos no agendamento |
| 3 | **O hex exato do vermelho da marca** | `--color-red` e `--accent-rgb` | Sim. O logo já chegou; o vermelho da página ainda é o meu palpite a partir da viga do torii |
| 5 | **Domínio** | `index.html` (canonical + og:url) e `public/sitemap.xml` | Sim |
| 6 | **Fotos da academia para os cartões** | `programs[].image`, `reasons[].image` | Não, mas é o maior salto de qualidade disponível. A foto da turma e o retrato já chegaram e estão no ar (primeira tela, CTA final, painel da nota); o que ainda é banco de imagens são os quatro cartões de programa e os quatro de "why people stay" |
| 6b | **Autorização de imagem das crianças** | — | **Sim, para a campanha.** Há menores identificáveis na foto da turma e no vídeo da aula. Rosto de menor em página pública e em anúncio pago precisa de autorização dos responsáveis, que é coisa diferente de já ter sido postado no Instagram |
| 7 | **Link do perfil do Google** | `site.rating.profileUrl` | Não. Preenchido, o botão "read them on Google" aparece sozinho sob a nota |
| 8 | **E-mail de atendimento** | `site.email` | Não |
| 9 | **O número tem WhatsApp?** | `site.whatsapp` | Não. Preenchido, o botão da referência aparece sozinho no CTA final |
| 10 | **Faixa e linhagem do Diego** | `instructor.belt` / `.lineage` | Não mais. Ficam guardadas no dado para o dia em que uma seção de professor voltar |

**Nada de foto de banco de imagens.** Enquanto a foto real não chega, o slot é
uma placa desenhada: papel tonalizado com a textura da página, fio interno
recuado, a marca vazada e o briefing do que precisa entrar ali. Trocar
`image: null` pelo caminho do arquivo é o único passo.

### Já resolvidos
- **CEP.** O briefing trazia 10702, que não é CEP de Massachusetts. O perfil do
  Google da academia imprime `47 Franklin St, Framingham, MA 01702`. Confirmado.
- **Nota.** 5,0 com **35** avaliações, e não as 100 do planejamento.
- **Depoimentos.** Seis reais do perfil do Google, três de aluno e três de pai
  ou mãe, em `reviews`.

O `count` das avaliações é o único dado da página que envelhece sozinho: ele
sobe a cada avaliação nova. Vale reconferir de vez em quando, e é preferível
ficar desatualizado para baixo do que para cima.

---

## Modos

`VITE_UX_MODE` em `.env`:

- `prospect` (padrão) — imprime todas as pastilhas de pendência. É a versão de
  trabalho, e é ela que serve de lista de pedidos para o cliente.
- `client` — esconde todas. É a versão que o cliente abre e a que vai ao ar.

---

## Formulário, agendamento e tracking

Kit padrão da Novo Dash em `src/nd/` (igual em todas as LPs; o único arquivo
desta academia é `src/nd/client.ts`, com os ids do cadastro e os textos do
painel). Turmas e horários vêm ao vivo do app, o lead vai ao GHL e o
agendamento ao n8n; Pixel com espelho CAPI (`api/capi.ts`), GA4 e conversões
do Ads. Tags no bloco `nd:tracking` do `index.html`. Sem GTM.

Todo botão de agendar abre o modal do kit. **`#book` na URL abre o formulário
direto.** Serve para o anúncio mandar para `lp.../#book` sem depender de a
pessoa achar o botão.

---

## Como a página é feita

- **Tipografia**: uma família só, **Archivo Variable**, em duas larguras. Título
  é a mesma letra do corpo puxada a 68% no eixo `wdth`. O `main.tsx` importa
  `@fontsource-variable/archivo/wdth.css` e **não** o padrão: só esse arquivo
  carrega o eixo de largura, e com o padrão o `font-stretch` é ignorado em
  silêncio e a página perde o sotaque inteiro.
- **Cor**: papel quente, tinta quase preta, vermelho da marca. Nenhum hex mora
  fora de `src/index.css`, sombra colorida inclusive (token `--accent-rgb`).
- **Movimento**: quatro gestos de entrada (`rise`, `veil`, `rule`, `settle`),
  entrada palavra a palavra num parágrafo por seção, e quatro efeitos ligados à
  rolagem: a cortina de cor, o preenchimento dos passos, a linha do tempo da
  aula experimental e a deriva da marca de fundo. Tudo respeita
  `prefers-reduced-motion`, e nenhum gesto decide se o conteúdo aparece.
- **Hero em tela cheia**: `min-h-svh`, e não `100vh`. No celular `vh` é a altura
  da janela SEM a barra de endereço, então a primeira tela nasceria mais alta
  que o visível. A escala da headline também tem um teto por altura de janela,
  para o botão não cair abaixo da dobra num notebook de 13 polegadas.
- **Superfícies**: papel, papel tonalizado, tinta e vermelho, alternando a cada
  seção. Duas inversões escuras e nenhuma a mais (a aula experimental e o
  pedido).

### As nove seções, na ordem

| | Seção | O que ela responde |
|---|---|---|
| I | Hero com a VSL, em tela cheia | quem é essa academia, e onde |
| II | Four ways to start | tem turma para mim? |
| III | How to get started | e como eu faço isso? |
| IV | **How the trial class works** | o que acontece comigo lá dentro? (texto + vídeo de dentro da sala) |
| V | Why people stay | por que quem entrou não saiu |
| VI | Avaliações | quem daqui já treina lá |
| VII | The bits people always ask | as objeções que sobraram |
| VIII | O pedido | a última palavra é a oferta |

Não existe seção de endereço e horário: o mapa em largura total antes do rodapé
responde "onde fica", e o horário mora na coluna "visit us" do rodapé, junto do
endereço e do link de direções. A grade por turma continua viva no passo 3 do
agendamento, que lê da mesma lista.

A estrutura e o tom da copy vieram de uma página de referência do portfólio que
o cliente aprovou. A seção IV existe no lugar da de corpo técnico, a pedido do
Adryan: a objeção real de quem nunca treinou não é "o professor é bom?", é "o
que exatamente vai acontecer comigo quando eu atravessar aquela porta?".

Ver `memory/design-decisions.md` para o porquê de cada escolha.

---

## Estrutura

```
src/
  data/site.ts          todo o conteúdo do cliente, e todas as pendências
  lib/utils.ts          cn()
  components/           átomos: reveal, paper, mark, stamp, curtain, marquee…
  sections/             uma seção por arquivo, na ordem da página
  nd/                   kit Novo Dash: formulário, agendamento e tracking
```

`src/data/site.ts` é o contrato: publicar é trocar valores lá, e não mexer em
componente.

## O que NÃO foi copiado da referência, e por quê

- **A galeria "uma semana normal nos tatames"**: são doze fotos, e não existe
  nenhuma. Doze slots vazios seriam piores que não ter a seção.
- **A seção de corpo técnico**: substituída pela da aula experimental, a pedido.
- **As abas "para mim" / "para meu filho"** nos programas: lá são sete
  programas, três infantis; aqui são quatro, e a aba de kids ficaria com um
  cartão sozinho num vão de três colunas. O rótulo em cada cartão faz a mesma
  triagem.
- **Quatro perguntas do FAQ** (contrato, vestiário, horário de funcionamento e o
  valor exato da mensalidade): dependem de dado que o cliente não mandou. A de
  preço ficou, reescrita para responder sem inventar número.
- **O botão de WhatsApp**: entra sozinho quando `site.whatsapp` deixar de ser
  nulo.
