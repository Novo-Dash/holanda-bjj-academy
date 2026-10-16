# PRD HOLK-001 · LP Kids · Holanda BJJ Academy

**Padrão:** BLACK-BELT-UX v5.1 · **Modo:** CLIENT · **Execução:** com aprovação (design pass do hero com parada)
**Rota:** `/kids` dentro do repositório `D:\DOCUMENTOS\NovoDash\Holanda Jiu-Jitsu`
**Copy:** `copy-kids.md` (ETAPA 1, 08/10/2026) · **Diagnóstico:** Clarity + GHL + Meta + Google, 18/09 a 07/10/2026
**Data:** 09/10/2026 · **Responsável:** Adryan (Novo Dash)

---

## 0. PROTOCOLO PARA O CLAUDE CODE

**0.1** Este PRD é autocontido. Em conflito com qualquer outra fonte (memory antiga, código das
referências, hábito), o PRD vence. Em conflito entre o PRD e a `copy-kids.md` sobre TEXTO, a copy
vence; sobre ORDEM e MECANISMO, a Seção 6 deste PRD vence.

**0.1.1** Execução: `claude --dangerously-skip-permissions` dentro da pasta do projeto.

**0.1.2** Declaração de fase obrigatória: escrever "Iniciando FASE X" e "FASE X concluída" no chat.

**0.2 Stack.** O repositório já existe e está no ar (`lp.holandabjjacademy.com`, 366 sessões no
último ciclo). Nada da página principal muda, exceto o que a Seção 4 lista como compartilhado.
- React 19 · Vite 8 · TypeScript ~5.9. A rota `/kids` **não usa Tailwind** (CSS próprio em
  `src/kids/kids.css` e `kids-sections.css`). ~~`@base-ui/react`~~ **Executado com `<dialog>`
  nativo** e accordion próprio (09/10): o nativo já prende foco, fecha no Esc e torna o resto
  inerte.
- ~~GSAP 3.14 + ScrollTrigger~~ **Executado sem GSAP** (09/10): os três efeitos de scroll são
  "uma variável de 0 a 1" e saem de IntersectionObserver + rAF (`src/kids/lib/motion.ts`).
  Sem SplitText, sem Lenis, scroll nativo. Motivo: INP de 300 ms (P6).
- `motion` NÃO entra na rota `/kids` (fica só na página principal).
- Prerender estático da rota (padrão Dárcio: `vite.ssr.config.ts` + `scripts/prerender-kids.mjs`).

**0.3 Fases.**
- F0 Referências e prints
- F1 Fundação (entrada MPA, tokens, fontes)
- F2 Átomos (botão, sticker, torii, chips, campo)
- F3 Infra (dados, form, tracking, prerender)
- F4 Design pass do hero (PARADA)
- F5 Seções
- F6 Composição e mobile
- F7 Qualidade e finalizador

**0.4 Proibições absolutas.**
- **Dados e código:**
  - Copy ou hex hardcoded em TSX. Copy fica em `src/kids/data/kids.ts`; hex fica no bloco de
    tokens de `src/kids/kids.css`.
  - Espaçamento fora da escala de 4px.
  - GSAP sem `gsap.context()` + `revert()`.
  - Emojis (usar SVG).
- **Interação:**
  - Alvo de toque menor que 44px.
  - Foco azul do navegador (todo foco é desenhado).
  - "Learn more", "Submit" ou "Get started".
- **Mídia:**
  - `<img>` solto no hero (usar `<picture>` ou `<video>` com poster).
  - Imagem sem `width` + `height`.
  - Foto de banco usada como foto real.
- **Fontes:** fonte via `<link>`.
- **Conteúdo:** horário como imagem.
- **Visual:**
  - Sombra genérica (`shadow-md` e afins).
  - Radius padrão de biblioteca.
  - Gradiente ou blob sem função.
- **Anti-template de criação (regra dura):**
  1. Nenhum componente visível vem de biblioteca com estilo padrão. Botão, link, card, accordion,
     campo, chips, menu, ícones e estados de foco são desenhados para este projeto. Biblioteca só
     como primitivo acessível sem estilo.
  2. Os componentes próprios e seus estados estão na Seção 8.9. Todos derivam do **torii** do
     distintivo e da **faixa kids**. Ícones desenhados no traço do torii; zero Lucide, Heroicons ou
     Material Symbols visíveis.
  3. Todo grafismo tem origem nomeada (Seção 8.0). Grafismo sem origem não entra.
  4. Um mecanismo por seção. Revelações genéricas limitadas a dois gestos (`lines()` em máscara e
     `rise()`); proibido "o mesmo fade com delay diferente".
  5. Arquétipo por seção (Seção 7). Proibido repetir "título centralizado + subtítulo + grid de 3
     cards com ícone".
- **Bugs proibidos** (vistos no código da Maison, OCJ, Dárcio Kids e Satori Kids):
  1. Conteúdo crítico (H1, CTA, selos, form, preço) com `opacity:0` no CSS-base ou sob classe de JS.
  2. Acento ou descendente cortado por máscara de reveal. Os spans-máscara recebem
     `padding-block:.3em .08em; margin-block:-.3em -.08em`.
  3. Contador lido como "0 1 2…9". O valor final fica no HTML com `sr-only` e as tiras ficam
     `aria-hidden`. O contador sempre termina (timeout, `visibilitychange`, reduced-motion).
  4. Decorativo (torii, faixa, sticker, onda) por cima de CTA, form, selos ou preço.
  5. Orçamento de scroll fixo: **zero pin nesta página** (ver 14.2).
  6. Tela vazia em qualquer ponto do scroll. Testar rolando devagar em 1440 e 390.
  7. Hydration mismatch com prerender. Reduced-motion é decidido no `useLayoutEffect`, não no
     `useState`.
  8. Erros de ARIA e acessibilidade:
     - texto real dentro de `aria-hidden`;
     - `tablist` sem tabpanel;
     - carrossel com `aria-hidden` em card visível;
     - autoplay ignorando reduced-motion;
     - conteúdo recolhido sem `inert`.
  9. Fonte menor que 12px; `alt` que não descreve a foto.
  10. Código morto entregue; `memory/*.md` desatualizado no fim.
  11. **(Dárcio)** Passo de linha do tempo preso em `opacity:.4` quando o GSAP não roda
      (reduced-motion). O estado final é o CSS-base; o JS só ANIMA até ele.
  12. **(Dárcio)** Link invisível posicionado por coordenada sobre um frame de vídeo. Proibido;
      CTA de vídeo é botão real fora do vídeo.
  13. **(Satori)** Listener de teclado em `document`. Teclas só no elemento focado.
  14. **(Satori)** Modal de agendamento com copy de adulto na rota kids, ou `SOURCE_LABEL` de
      adulto num lead kids.
  15. **(Satori)** Dois skip links. A rota tem um só.
  16. **(Satori)** Fonte display com `swap` e sem preload. Ver 9.4.

**0.5** Pendência:
- Na copy, pendência vem como `[PENDING]`; no código e na memory, como `[CONFIRMAR]`.
- Em `VITE_UX_MODE=prospect`, a página imprime a pastilha `Pending` (componente existente em
  `src/components/paper.tsx`).
- Em `client`, **o item pendente não renderiza**. Isso vale para a linha, o selo, a pergunta do FAQ
  ou o stat; nunca sai placeholder plausível.
- Imagem pendente vira a placa desenhada (`Media` com `image: null`, padrão da casa).

**0.6** Regra de ouro: nada se escreve duas vezes. Endereço, telefone, nota, e-mail, Instagram e
depoimentos vêm de `src/data/site.ts`; a Kids só acrescenta o que é dela.

**0.7 Posicionamento e restrições de marca.**
- A página fala SÓ com o pai ou a mãe e com a criança. Zero menção a turma adulta, No-Gi adulto ou
  "Beginners".
- Inglês dos EUA.
- **Zero travessão (—) e zero meia-risca (–)** em qualquer texto que o visitante lê: copy,
  `aria-label`, `title`, meta e JSON-LD.
- Zero "Stance". Zero nome de outra academia (o grep do F7 cobre Dárcio, Satori, Maison e OCJ).

**0.8 / 0.9.2 Regra de imagem.**
- Hero, Safety, For Parents/For Kids, Coach e Final CTA têm imagem real do cliente.
- **Não usar Unsplash nesta página.** Criança de banco de imagem numa LP de academia infantil é a
  mentira mais fácil de detectar. Isso sobrepõe a regra da casa, por decisão registrada em
  `design-decisions.md`.
- Faltou a foto: placa desenhada com o briefing do que entra ali.

**0.9 Referências.** Ver Seção 8.10 e F0 (Seção 21).

**0.10 Segredos.**
- Nenhum token, senha ou cartão no repositório. `META_CAPI_ACCESS_TOKEN`, se a CAPI entrar, só nas
  variáveis da Vercel.
- O `location_id` e o uuid do webhook do GHL já estão em `src/booking/webhook.ts` e não são
  segredo: são IDs públicos de webhook de captação.

**0.11 VSL.**
- O briefing pede o "Video Ad Kids campeão" como VSL, e o arquivo NÃO veio.
- Até chegar, a VSL é `public/video/trial-class.mp4`: aula kids real, 9:16, 30 s.
- O slot é o mesmo; trocar é mudar `kids.vsl.src` e `.poster`.
- **[CONFIRMAR] arquivo do vídeo campeão** (MP4 9:16, legenda queimada, ≤ 60 s).

**0.12 Bugs do diagnóstico que esta página precisa resolver por construção.**
- **INP de 300 ms.** 82% do tráfego é celular e um terço chega pelo navegador interno do Instagram
  ou do Facebook. Ver Seção 15.2.
- **8,1% de cliques mortos.** Toda foto, selo, sticker e card responde ao toque. Ver Seção 8.9.
- **Formulário no primeiro terço.** Ver Seção 6.
- **Localhost gravando no Clarity.** Ver Seção 18.

---

## 1. CONTEXTO E PROBLEMA REAL

**Problema-núcleo:** a demanda paga da Holanda é kids, mas a página no ar é genérica (quatro
programas) e o visitante desiste antes de chegar ao formulário.

| # | Evidência (diagnóstico 18/09 a 07/10/2026) | Consequência para esta página |
|---|---|---|
| P1 | 14 dos 18 leads do Meta pediram turma kids; 5 dos 12 do site eram kids | Página só de kids, para onde vai toda a campanha kids do Meta |
| P2 | Rolagem média de 37,2%; 82% no celular | Oferta, prova, segurança e o FORMULÁRIO dentro das 3 primeiras telas do celular |
| P3 | 1 contato a cada 31 sessões (3,2%) | A perda está entre sessão e contato, não depois. O form converte quem chega nele |
| P4 | 51 s de atenção ativa | Uma ideia por bloco; títulos que funcionam sozinhos |
| P5 | 8,1% de cliques mortos (fotos, selos, cards) | Todo elemento com cara de clicável responde |
| P6 | INP 300 ms, um terço em WebView de app | Orçamento de JS e resposta visual imediata ao toque |
| P7 | 47 pedidos de rota em setembro pelo perfil do Google | Endereço no hero e no fechamento, com botão "Get directions" |
| P8 | 13 leads do Meta parados em follow-up | O form agenda na hora (dia e horário reais) e promete o próximo passo por escrito |
| P9 | Google Ads com 0 conversões na história da conta | Conversão do Ads disparando no lead, rotulada como kids |
| P10 | Localhost gravando no projeto do Clarity | Tag do Clarity só em produção |

**Oportunidade:** o site já agenda 50% dos contatos. Subir de 3,2% para 4,5% de sessão para contato
na rota kids, mantendo a taxa de agendamento, é o resultado que esta página persegue. A meta do
placar do próximo ciclo é rolagem acima de 45%, cliques mortos abaixo de 5% e INP até 200 ms.

---

## 2. PERSONAS

**Primária: a mãe ou o pai que viu o anúncio kids** (26 a 50, filho de 4 a 13, Framingham e
arredores, no celular dentro do Instagram).
- **Objeção:** "meu filho vai se machucar?" e, logo depois, a que ninguém fala em voz alta:
  "jiu-jitsu vai deixar meu filho mais agressivo?"
- **Gatilho:** poder assistir à aula inteira, a primeira aula grátis sem assinar nada, e ver
  crianças do tamanho do filho.

**Secundária 1: a criança, lendo junto.**
- **Objeção:** "vai ter alguém maior me esmagando?"
- **Gatilho:** jogos, aprender a cair, sair da primeira aula sabendo um golpe de verdade. Os
  blocos *For kids* da copy são dela, e a página lhe dá voz visual própria (Seção 8.3).

**Secundária 2: o pai ou mãe brasileiro em Framingham** (comunidade grande na cidade; os três
depoimentos de pais têm nome brasileiro).
- **Objeção:** "é jiu-jitsu de verdade ou recreação?"
- **Gatilho:** Professor Diego, jiu-jitsu "taught the way it's taught in Brazil", e o título de
  equipe kids no NAGA.

---

## 3. /memory

Atualizar, não recriar:
- `memory/briefing.md`: nova seção "## HOLK-001 · LP Kids". Registrar o diagnóstico, a rota, a
  persona e o fato de a campanha kids do Meta passar a apontar para `/kids`. Corrigir o telefone
  antigo `(913) 963-3160` que ainda está lá; o certo é **(508) 361-7778**.
- `memory/design-decisions.md`: nova seção "## HOLK-001". Registrar:
  - o que veio do Dárcio e do Satori, e o que foi variado;
  - a fonte;
  - o torii como sistema;
  - a decisão "sem Unsplash";
  - a decisão "zero pin".
- `memory/claude-code-rules.md`: bloco "## Rota /kids" com as regras 0.4 que são específicas
  daqui. Corrigir o telefone e "Kids 7 a 15", que hoje é **4 a 13**.

---

## 4. ARQUITETURA

A Kids é uma **segunda entrada do Vite** (MPA), não uma rota de router. A página principal não
ganha react-router, e o bundle dela não muda de tamanho.

```
kids/index.html                  entrada própria, meta/OG/canonical da Kids, preload das 2 fontes
src/kids/
  main.tsx                       hydrateRoot sobre o HTML prerenderizado
  KidsApp.tsx                    ordem da página (Seção 6), com o comentário do porquê
  kids.css                       tokens (.hk) + estilos da rota, tudo escopado em .hk
  data/kids.ts                   TODA a copy da copy-kids.md, tipada; pendências com flag
  layout/  Nav.tsx · StickyBar.tsx · Footer.tsx
  sections/ Hero · ProofRibbon · Safety · BookInline · TwoReaders · Aggression ·
            FirstClass · Coach · Parents · QuickCheck · Faq · FinalCta
  ui/      Button · Sticker · Torii · Chip · Field · AgePicker · DayPicker · Accordion · Photo
  hooks/   useGsap.ts (defer) · useInView.ts · useReducedMotion.ts (layout effect)
  lib/     motion.ts (lines(), rise()) · booking-kids.ts (estado do form compartilhado)
scripts/prerender-kids.mjs       gera dist/kids/index.html, dist/kids/b/, dist/kids/c/
vite.ssr.config.ts               build SSR da entrada kids (stub do tracking, padrão Dárcio)
```

**Compartilhado com a página principal** (editar com cuidado, sem quebrar a `/`):
- `src/data/site.ts`: telefone, endereço, e-mail, Instagram, nota e depoimentos. Acrescentar
  `excerpt` opcional em `Review` (o trecho que a Kids cita), sem mudar o que a `/` mostra.
- `src/booking/webhook.ts`: parametrizar `SOURCE_LABEL` (`'Landing Page - Kids'` na rota kids) e
  mapear idade para calendário (Seção 11). Nada muda para a `/`.
- `src/lib/track.ts`:
  - parâmetro `page: 'kids'` em todos os eventos;
  - variante de headline;
  - Clarity só fora de `localhost`.
- `src/components/mark.tsx`: o torii medido no distintivo. A Kids importa, não redesenha.
- `vercel.json`: rewrites de `/kids`, `/kids/b` e `/kids/c` para os HTMLs prerenderizados. Se a
  CAPI entrar, `api/capi.ts` (copiar da OCJ, não reescrever).

---

## 5. UX MODE

**CLIENT.**
- O form envia para o GHL de verdade (location já conferido).
- O agendamento puxa horários reais dos calendários kids.
- O tracking é real: Pixel, GA4, Ads e Clarity.
- `VITE_UX_MODE=client` no deploy. Pendência não renderiza (0.5).

Para a revisão interna, `prospect` local mostra as pastilhas, e é a lista de pedidos ao cliente.

---

## 6. JORNADA MENTAL (vence divergências de ordem)

Regra do diagnóstico: **no celular, até o fim da 3ª tela (≈ 2.400px em 390×844) a pessoa já viu a
oferta, a prova, a segurança e o formulário.** O resto é para quem ainda duvida.

| # | Seção | Pergunta da mãe que ela responde | Tela (390) |
|---|---|---|---|
| I | Hero | "É para o meu filho? Quanto custa tentar?" | 1 |
| II | Proof Ribbon | "Isso é sério?" | 1–2 |
| III | Safety | "Ele vai se machucar?" | 2 |
| IV | **BookInline (o formulário)** | "Então como eu marco?" | 3 |
| V | Two Readers (For parents / For kids) | "O que muda em casa? Ele vai gostar?" | 4 |
| VI | The Aggression Question | o medo que ninguém fala | 5 |
| VII | First Class | "O que acontece quando eu chegar?" | 6 |
| VIII | Coach | "Quem fica com meu filho?" | 7 |
| IX | Parent Reviews | "Outros pais confirmam?" | 8 |
| X | Quick-check | "É para o MEU filho?" (autodiagnóstico) | 9 |
| XI | FAQ | o que sobrou | 10 |
| XII | Final CTA | a última palavra é a oferta e o endereço | 11 |
| | Footer | | |

**Divergência com a copy, registrada:** a copy põe *For parents / For kids* antes de *Safety* e
deixa o form como modal no fim. Este PRD:
1. **sobe Safety para III.** A copy pede "segurança nas 3 primeiras telas", e os oito itens de
   Two Readers empurrariam Safety para a 4ª tela no celular;
2. **cria o formulário inline em IV**, que é o item 02 do plano do diagnóstico ("subir o
   formulário para o primeiro terço"). Todo botão da página leva a ele:
   - acima de IV, rolagem suave até o form, com foco no primeiro campo;
   - abaixo de IV, abre o MESMO formulário numa folha inferior (bottom sheet), com estado
     compartilhado (Seção 11). Nada é preenchido duas vezes.

---

## 7. LAYOUT

- **Grid:**
  - Desktop: 12 colunas, `--shell: min(1200px, 100% - 48px)`.
  - Celular: 1 coluna, **gutter de 16px**, sem rolagem horizontal.
- **Ritmo vertical:** variado de propósito.
  - Seções de leitura: `clamp(72px, 9vw, 128px)`.
  - Seções de prova (II, IX): compactas, `clamp(40px, 5vw, 64px)`.
  - O form (IV) cola na Safety sem respiro extra.
- **Arquétipo por seção** (nenhum se repete):

| Seção | Arquétipo | Mecanismo (um só) |
|---|---|---|
| I Hero | Assimétrico 7/5: texto à esquerda, VSL 9:16 DENTRO do torii à direita. Celular: H1, VSL no torii em 62svh, CTA | **Signature: atravessar o portão** (8.7) |
| II Proof Ribbon | Faixa reta horizontal: medalha à esquerda, frase à direita | A medalha balança uma vez ao entrar (CSS) |
| III Safety | "Regras do dojo": 5 placas numeradas presas numa régua de madeira (a viga do torii), foto real de crianças rolando ao lado | Cada placa ganha o carimbo ✓ desenhado (`pathLength=1`) ao entrar |
| IV BookInline | O único bloco vermelho da página: cartão de formulário sobre o vermelho do torii | Passos do form deslizam no eixo X |
| V Two Readers | Página dupla aberta: esquerda formal (pais), direita caderno da criança, inclinado | Os stickers da direita "colam" ao entrar (escala + rotação) |
| VI Aggression | Coluna única editorial: a pergunta entre aspas enormes, a resposta abaixo | A resposta **acende** palavra por palavra com `--p` (técnica Maison, CSS puro) |
| VII First Class | Caminho de 5 portões (5 torii pequenos) na horizontal no desktop e na vertical no celular | Linha que percorre os portões em scrub; cada portão acende |
| VIII Coach | Retrato 4:5 sangrando à esquerda, texto e linha de stats à direita | Retrato sem cor, a cor volta ao entrar (gesto Maison) |
| IX Parents | Três bilhetes em fila com scroll-snap no celular, sem autoplay | Nenhum além de `rise()`. Seção de descanso |
| X Quick-check | Lista de afirmações que a mãe marca com toque | Contador "you checked N" e CTA que muda de texto |
| XI FAQ | Duas colunas: título fixo à esquerda (sticky, não pin), accordion à direita | Accordion por `grid-template-rows` |
| XII Final CTA | Tela cheia com a foto da turma kids sob véu, torii completo em traço | O torii se desenha em volta do botão (`pathLength`) |

---

## 8. DIREÇÃO DE ARTE

### 8.0 Tese visual
*"A Holanda Kids deve parecer **o portão de entrada de um lugar sério que recebe criança com
alegria**, como **passar pelo torii vermelho da parede da academia**, e não **um site de colônia
de férias com fonte de gibi** nem **uma academia de luta que assusta a mãe**."*

- **Sensação-alvo:** seguro, alegre, de verdade.
- **Metáfora âncora:**
  - **O torii.** Está no distintivo e pintado em vermelho na parede da sala; as fotos kids do
    cliente foram tiradas na frente dele. Torii é, literalmente, um portão que se atravessa. A
    primeira aula é atravessar.
  - **A faixa kids com graus** (a copy: "earn stripes on your belt") é o objeto secundário. Serve
    só para progresso e conquista.
- **O que NÃO somos:**
  - Dárcio Kids (faixa branca + sticker + baralho de polaroids).
  - Satori Kids (painel vermelho flutuante + polaroids penduradas + fita cruzada em X + ticket).
  - A página adulta da Holanda (papel quente, condensada caixa alta, numerais romanos).

**Origem de cada grafismo** (nada sem origem):

| Grafismo | Origem |
|---|---|
| Torii em traço (moldura, eyebrow, divisor, progresso, fechamento) | `src/components/mark.tsx`, geometria medida no distintivo |
| Viga curva (kasagi) como borda de seção | A viga do mesmo torii |
| Graus da faixa (4 tiras) | Sistema de graus kids da copy `[CONFIRMAR]` |
| Cinza do tatame | O vinil do tatame nas fotos do cliente |
| Pedra quente | A parede de pedra da sala, nas fotos |

### 8.1 Anti-clichê
- Nenhum dos três clichês de IA.
- O fundo é o **cinza-frio do tatame**: nem creme, nem branco puro, nem preto.
- O vermelho é o do distintivo, não terracota nem vermelhão sobre preto.
- Radius generoso e objetos inclinados; nada de fio de 1px estilo jornal.

### 8.2 Paleta (tokens em `src/kids/kids.css`, escopo `.hk`)

| Token | Hex | Por quê |
|---|---|---|
| `--hk-mat` | `#EEF1F2` | Fundo. O vinil cinza do tatame nas fotos; o chão onde tudo acontece |
| `--hk-paper` | `#FFFFFF` | Superfície de cartão, form, placas |
| `--hk-ink` | `#16191C` | Texto. Preto frio, que casa com o cinza do tatame (o preto quente da `/` brigaria) |
| `--hk-torii` | `#C8161D` `[CONFIRMAR hex do distintivo]` | Ação: botão, torii, carimbo, o bloco do form. Mesmo vermelho da `/`, um só token para trocar nas duas |
| `--hk-torii-deep` | `#9E0F15` | A base "afundada" do botão e o vermelho de áreas grandes com texto branco |
| `--hk-stone` | `#6A5848` | A parede de pedra. Texto secundário quente, legenda, eyebrow |

- **Escalas:** gerar 50→900 de `--hk-torii` e `--hk-mat`, e usar só os passos nomeados na 8.9.
- **Contraste AA, a medir e comentar no token:**
  - ink sobre mat ≥ 15:1;
  - stone sobre mat ≥ 5:1;
  - branco sobre torii ≥ 5,5:1;
  - torii sobre paper ≥ 5,5:1.
- **Texto branco em área vermelha grande** usa `--hk-torii-deep` se o torii final do cliente não
  passar 4,5:1 (lição do Satori: `#FF2236` dava 3,79:1).
- **Sombra colorida:** vem de `--hk-torii-rgb`. Nenhum hex fora deste bloco.

### 8.3 Tipografia: uma letra, duas vozes

A copy tem dois leitores (o pai decide, a criança pede). A tipografia também.

```
Display (pais e títulos) : Shantell Sans Variable, wght 700–800, INFM 0–20, BNCE 0
Voz da criança (For kids, stickers, notas à mão) : a MESMA Shantell, INFM 100, BNCE 60–100
Body (leitura)           : Lexend Variable, 400/500/600
```

**Por que Shantell Sans:**
- As duas referências usaram fonte de mão: Scribble Kidsy no Satori; Grandstander + Gochi Hand
  no Dárcio. O pedido foi "fonte nova como nas referências", e a Shantell é dessa família sem ser
  nenhuma das duas.
- Ela tem um **eixo de informalidade** (INFM) e um de **pulo** (BNCE): a mesma letra vai do
  marcador sóbrio ao rabisco que pula. Nenhuma das referências tinha duas vozes numa família.
- Ela sai de 300 a 800 de peso. Diferente da Scribble Kidsy (só 400), aguenta um H1 pesado sem
  negrito sintético.

**Por que Lexend no corpo:**
- Foi desenhada para fluência de leitura, e o diagnóstico deu 51 s de atenção, no celular.
- É redonda o bastante para conversar com a Shantell e neutra o bastante para não competir.
- Não é Mulish (Dárcio) nem Manrope (Satori).

**Proibidas nesta rota:**
- Grandstander, Scribble Kidsy, Gochi Hand, Fredoka, Baloo, Comic Neue.
- Sofia Sans e Archivo: são a voz da `/`, e misturar as duas páginas apaga a Kids.

**Teste obrigatório no F4:** renderizar o hero real com 3 finalistas trocando a família ao vivo:
1. **Shantell Sans** (recomendada);
2. **Gluten Variable**;
3. **Lilita One** + Shantell só na voz da criança.

Salvar em `brand/kids-font-options.png` e mostrar ao Adryan. Esta é a mesma rotina que escolheu a
Sofia na `/`.

### 8.4 Elevação ("brinquedo", não "material")
- **`elev-0`:** fundo mat.
- **`elev-1`:** placa ou cartão branco, borda `rgb(ink/.08)`, sombra de contato
  `0 2px 0 rgb(ink/.06)`.
- **`elev-2` (objeto que se toca: botão, sticker, chip):** sombra DURA deslocada mais uma difusa.
  - Botão: `0 5px 0 var(--hk-torii-deep), 0 16px 28px -14px rgb(var(--hk-torii-rgb)/.55)`.
  - Pressionado: desce 4px e a sombra dura vai a 1px.
  - É o padrão comprovado nas duas referências (o toque se SENTE).
- **`elev-3` (folha do form no celular, nav rolada):** `0 -12px 40px -16px rgb(ink/.35)`, borda
  superior com a viga do torii.

### 8.5 Tratamento de imagem
- **Proporções fixas:**
  - VSL 9:16;
  - coach 4:5;
  - Safety 4:5;
  - Two Readers 1:1;
  - Final em tela cheia.
- **Unificação:**
  - Leve curva de contraste mais um viés frio de 4% para o cinza do tatame, porque as fotos são de
    celular, com luz mista e LED roxo ao fundo.
  - Texto sobre foto só com véu `--hk-ink` a 70–88%.
- Sem grão. A textura da `/` não vem.
- **Molduras:** a foto principal mora dentro do torii, onde o vão entre os pilares é a janela. As
  outras têm radius 24px e uma "fita" de canto (o sticker), nunca polaroid (Dárcio e Satori).

### 8.6 Estrutura que é informação
- **Numeração:**
  - só em Safety (5 regras reais);
  - em First Class (5 passos em ordem);
  - nos graus da faixa (4).
- Em nenhum outro lugar.
- **Eyebrow:** um torii de 14px mais o rótulo em Lexend 600 caixa alta 0,8rem.
  - Ex.: "IS IT SAFE?", "WHO TEACHES YOUR KID".
- **Divisor de seção:** a viga curva (kasagi) como borda superior das seções vermelha e escura.
  - Nenhuma outra borda decorativa.

### 8.7 Signature Moment: atravessar o portão
- **No hero:**
  - A VSL toca muda dentro do vão de um torii grande, em traço vermelho.
  - Ao rolar para fora do hero, o torii **escala de 1 para ~5 em direção à câmera**, e o
    visitante "passa pelo portão". O vão abre para a Proof Ribbon e para a Safety.
  - O movimento é só `transform` e `opacity` e lê `--p` (0→1) num scrub do ScrollTrigger sobre a
    saída do hero. **Sem pin:** a página continua andando, e o portão só passa por cima dela.
- **No fim:**
  - No Final CTA o mesmo torii aparece inteiro e se desenha em volta do botão.
  - A página abre e fecha no mesmo portão.
- **Por que encarna a tese:** a primeira aula é atravessar a porta. É a única ousadia da página;
  o resto fica quieto.
- **Reduced-motion:** o torii fica parado em volta da VSL, sem escala. Nada some.
- **Em WebView lento:** se o primeiro frame do scrub passar de 16 ms (medir), cair para a versão
  sem escala. Medida antes de beleza (P6).

### 8.8 Realidade dos assets (honesta)

**Fotografia:** celular bom, luz mista. **Só 4 fotos com criança.** Inventário em
`raw/instagram` e `public/`:

| Arquivo | O que é | Uso |
|---|---|---|
| `public/programs/kids.webp` (1121×1485) | Diego e 2 alunos sentados diante do **torii vermelho** pintado | Two Readers |
| `raw/instagram/SnapInsta…574235688…jpg` (1440×1920) | Diego e 2 alunos em pé, sorrindo (o mesmo arquivo aparece 2× no raw) | Coach (alternativa) / hero poster |
| `raw/instagram/photo (2).jpg` (640×1136) | Turma kids enfileirada | Aggression |
| `public/video/trial-class-poster.webp` + `trial-class.mp4` | Crianças rolando no tatame, aula em andamento | VSL provisória + Safety ("learn to fall") |
| `public/hero.webp` (1920×917) | A turma inteira | Final CTA |
| `raw/instagram/SnapInsta…566437768…jpg` (1440×1905) | Diego de kimono, em pé | Coach |
| `public/video/vsl.mp4` (71 s, Diego falando) | VSL adulta | **Não usar** na Kids, a não ser que o Adryan peça |

- Tudo que entra passa por `cwebp` em 2 larguras (`srcset`), com `width`/`height` reais.
- **Faltam, e movem mais o ponteiro que qualquer CSS:**
  - foto do pódio NAGA;
  - Diego ensinando uma criança;
  - pais assistindo da beira do tatame;
  - kimono infantil no dia 1;
  - o vídeo campeão.
- **Logo:** só raster (`brand/logo-source.webp`), mas o torii já está vetorizado em `mark.tsx`.
- **Fontes:** Google Fonts via fontsource, self-host.
- **[CONFIRMAR] autorização de imagem dos responsáveis** para toda criança identificável. Página
  pública mais campanha paga.

### 8.9 Componentes próprios (desenho e estados)

| Componente | Desenho (de onde vem) | hover | active | focus-visible | loading / erro |
|---|---|---|---|---|---|
| **Button** primário | Pílula `--hk-torii`, base afundada `--hk-torii-deep` (5px), texto Lexend 700. Seta = travessa (nuki) do torii, que sai pela direita e volta pela esquerda | sobe 2px, sombra 7px, `rotate:-.6deg` (propriedade separada) | desce 4px, sombra 1px, **na hora** (`:active`, sem JS) | anel duplo: 3px `--hk-ink` + 3px de folga `--hk-paper` | texto vira "Sending…" e a seta gira 1×/s; erro: base fica ink e a mensagem aparece abaixo, `role="alert"` |
| **Button** secundário (telefone) | Pílula branca, borda 2px ink, ícone de telefone desenhado no traço do torii | borda vira torii | desce 2px | igual ao primário | n/a |
| **Sticker** (For kids, psst) | Etiqueta branca recortada, Shantell INFM 100 BNCE 80, inclinada −3°, cantinho descolado | descola 4° | "carimbo": escala .94 e volta com mola. **É um botão**: toque = wiggle + o texto pula (BNCE anima 80→100) | anel duplo | n/a |
| **Chip** (selo de confiança) | Placa branca, ícone próprio + texto; **botão que rola até a seção do selo** | sobe 2px | desce 2px | anel duplo | n/a |
| **Torii** | `Mark` em traço (stroke) ou cheio; escala e cor decididas por quem chama | n/a | n/a | n/a | n/a |
| **Field** | Campo branco alto (56px), borda 2px `ink/.15`, rótulo sempre visível acima (nunca só placeholder) | borda `ink/.35` | n/a | borda torii + sombra torii a 20% | erro: borda torii, ícone "!" desenhado, mensagem abaixo, `aria-describedby` |
| **AgePicker** | 10 botões de idade (4 a 13) em grade 5×2, cada um uma "plaquinha"; a selecionada vira vermelha com a faixa de graus em miniatura | sobe 2px | desce | anel duplo | n/a |
| **DayPicker** | Dias reais do calendário da faixa etária, 14 dias, como placas; horários como pílulas | idem | idem | anel duplo | skeleton em forma de placa; erro: "Call us at (508) 361-7778" com o botão de telefone |
| **Accordion** (FAQ) | Placa branca, "+" desenhado em traço de torii que vira "×" | fundo `mat-50` | n/a | anel duplo | n/a |
| **Photo** | radius 24px, fita de canto, **toque vira a foto** e mostra no verso uma legenda do que acontece ali (resolve o clique morto da foto) | inclina 1° | vira (`rotateY`, 300 ms) | anel duplo | n/a |
| **Ícones** | Telefone, pino de mapa, Instagram, check, "!" e "+" desenhados no traço do torii (terminais retos, espessura da viga). `aria-hidden` quando há texto | | | | |

### 8.10 Referências: o que se herda e o que muda

**Rotas** (o CÓDIGO é a verdade; as memory de lá estão desatualizadas):
```
D:\DOCUMENTOS\NovoDash\Dárcio Lira Jiu-Jitsu         rota /kids  → src/pages/KidsPage.tsx, src/pages/kids/*, src/kids.css
D:\DOCUMENTOS\NovoDash\satori-bjj-phoenix-az-fresh    rota /kids  → src/pages/KidsPage.tsx, src/pages/kids/*, src/kids.css
  (a pasta "-fresh" é a mais nova; a origin/main está 1 commit à frente. NÃO dar fetch nem pull nessas pastas)
Ao vivo: https://darciolirajj.com/kids · https://satoribjjacademy.com/kids
```

| Herdar (a espinha kids) | De onde | Como muda aqui |
|---|---|---|
| Fonte display de mão + corpo neutro | os dois | Shantell (2 vozes) + Lexend |
| Botão "brinquedo" com base dura que afunda | os dois | Seta = travessa do torii |
| Uma seção-mecanismo no "primeiro dia" | Dárcio (relógio), Satori (trilha serpentina) | 5 portões em linha, sem relógio nem serpentina |
| Grafismo = um objeto da marca | Dárcio (faixa branca) | O torii do distintivo |
| Statement que acende por `--p` | Dárcio (Maison) | Na resposta da Aggression, sem cortina e sem pin |
| VSL vertical que toca muda, toque reinicia com som | os dois | Dentro do torii; CTA é botão real abaixo, nunca link sobre o vídeo |
| FAQ com `grid-template-rows` | os dois | Igual (é o certo) |
| Prerender + hidratação + GSAP adiado | Dárcio | Igual, com o cuidado da Seção 15 |
| FAQPage JSON-LD gerado do mesmo dado | os dois | Igual |
| Skin própria do modal de agendamento | os dois | É inline (IV) mais uma folha inferior, não modal centrado |

**O que NÃO vem:**
- polaroids (as duas);
- baralho que embaralha (Dárcio);
- fitas cruzadas em X (as duas);
- painel vermelho flutuante (Satori);
- ticket com furo (Satori);
- cortina com pin (Dárcio);
- cartas distribuídas (Dárcio);
- fundo de pontinhos (Dárcio);
- ondas (Satori).

Quem conhece as três páginas reconhece a família; ninguém diz que é a mesma.

---

## 9. TIPOGRAFIA

### 9.1 Escala (fluida, classes `hk-type-*`, NUNCA `text-*`, porque o `cn()` engole)

| Papel | Tamanho | Família / eixos | lh / tracking |
|---|---|---|---|
| H1 hero | `min(clamp(2.4rem, 5.2vw, 4.6rem), 8.4svh)` | Shantell 800, INFM 10 | 1.02 / −0.02em |
| H2 seção | `clamp(2rem, 3.6vw, 3.4rem)` | Shantell 750, INFM 10 | 1.06 / −0.015em |
| Pergunta Aggression | `clamp(2.4rem, 5.6vw, 5.2rem)` | Shantell 800, INFM 30 | 1.0 |
| H3 | `clamp(1.25rem, 1.6vw, 1.5rem)` | Shantell 700, INFM 0 | 1.2 |
| Voz da criança | `clamp(1.15rem, 1.5vw, 1.45rem)` | Shantell 600, INFM 100, BNCE 80 | 1.25 |
| Body | `clamp(1rem, .3vw + .93rem, 1.125rem)` | Lexend 400 | 1.6, measure 60–68ch |
| Micro / eyebrow | `.8rem` (mín. 12px) | Lexend 600, caixa alta, .1em | 1.4 |

- Quebras do H1 escritas à mão no dado (`\n`), com `text-wrap: balance` como reserva.
- Teto do H1 por altura de janela (`svh`), lição da `/` em 1440×720.

### 9.2 Eixos: armadilha conhecida (a mesma da Archivo `wdth`)
- `@fontsource-variable/shantell-sans` tem folhas separadas por eixo: `wght`, `infm`, `bnce`,
  `spac` e `full`.
- **Só a `full` tem INFM e BNCE juntos** (174 KB latin).
- Importar outra folha faz `font-variation-settings: "INFM" 100` ser ignorado **em silêncio**.
- **Fazer:**
  1. Gerar com `fontTools.varLib.instancer` uma versão da `full` com **SPAC fixo em 0** e
     **wght 600–800**, subset Latin básico mais `’ “ ” · ✓`. Meta ≤ 95 KB.
  2. Salvar em `public/fonts/shantell-kids.woff2`. **Executado: 108 KB** (o peso é das
     variações dos três eixos; ver design-decisions.md HOLK-001 §3).
  3. Declarar o `@font-face` à mão em `kids.css`, com `font-weight: 600 800`.
- Lexend: a folha `wght` latin.

### 9.3 Fallback com métrica
- `@font-face` local com `size-adjust`, `ascent-override` e `descent-override` calibrados para
  Shantell→Arial e Lexend→Arial.
- Isso mantém o CLS em 0 na troca.

### 9.4 Carregamento
- Preload das 2 fontes no `kids/index.html` (`crossorigin` obrigatório) e `font-display: swap`
  com o fallback calibrado da 9.3.
- Não usar `block`: em WebView lento, `block` deixa o H1 invisível até 3 s.

---

## 10. SEÇÃO POR SEÇÃO + `src/kids/data/kids.ts`

**Fonte do texto:** `copy-kids.md`, literal. Não reescrever. O que está abaixo é DESENHO e DADO.
`[PENDING]` da copy vira `pending: true` no dado (0.5).

### I · Hero
- **Nav:**
  - Distintivo (`/logo.webp`) mais "Holanda BJJ Kids".
  - Links Safety · First Class · Coach · FAQ.
  - Botão "Book a Free Kids Class".
  - Telefone `site.phone`.
  - Transparente no topo; ao rolar, vira `elev-3` com fundo mat.
  - No celular: distintivo, telefone (ícone) e menu com `inert` quando fechado.
- **Esquerda:**
  - Eyebrow com o torii.
  - H1 com as quebras à mão. A palavra "calmer" ganha o sublinhado de mão: traço vermelho,
    `pathLength`, Shantell-like.
  - Sub.
  - CTA "Book My Kid's Free Class", que rola até IV e foca o primeiro campo.
  - Micro.
  - **Linha de endereço** com pino desenhado: "47 Franklin Street, Framingham · Get directions"
    (link Maps, P7).
- **Direita:**
  - VSL 9:16 dentro do torii grande.
  - Autoplay mudo e loop só quando visível; `preload="metadata"`; poster prerenderizado.
  - "Tap for sound" reinicia do zero com som (lição: setar `video.muted` como propriedade).
  - Sticker "psst, kids: you leave your first class knowing a real move." mordendo o canto do vão.
- **Trust strip** abaixo, em largura total:
  - 4 Chips: "5.0 on Google · 35 reviews", "Matched by age and size", "Parents watch every class",
    "Kimono on loan, day one".
  - Cada chip rola até a seção correspondente: IX, III, III, VII.
  - No celular: uma linha com scroll-snap horizontal, com a dica visual de "tem mais" (o 4º chip
    cortado pela metade).
  - A nota e a contagem vêm de `site.rating`.
- **Variantes de H1:**
  - `/kids` = A, `/kids/b` = B, `/kids/c` = C.
  - Cada uma é prerenderizada, com `noindex` e canonical para `/kids` em b e c.
  - A variante vai em todo evento (`headline_variant`).
  - Isso é para o Adryan apontar anúncios diferentes, sem trocar H1 no cliente (o que causaria CLS
    e mismatch).
- **Celular (390×844), primeira tela:**
  - eyebrow, H1 (3–4 linhas), sub em 3 linhas, CTA, micro;
  - a VSL começa no fim da 1ª tela;
  - os chips vêm logo abaixo da VSL.

### II · Proof Ribbon
- Faixa ink, altura compacta.
- **Medalha desenhada:** fita vermelha mais um disco com o torii.
- O badge "Kids & Teens Overall Team Champions · NAGA Massachusetts, August 2026" e a frase da
  copy.
- **Pendente:**
  - `[CONFIRMAR evento, data e título por equipe]`.
  - Se não confirmar até o deploy, a faixa mostra só a frase "Most of them walked in nervous on
    day one…" com a nota do Google como prova.
  - **Nunca publicar o título sem confirmação.**
- **Imagem:** foto do pódio, se chegar (redonda, dentro da medalha).

### III · Safety
- Eyebrow "IS IT SAFE?", H2 e body.
- **Régua:** a viga do torii na horizontal, de onde pendem **5 placas numeradas** (1 a 5).
  - A 5 é pendente (tatame e número de professores) e não renderiza em client.
- **Foto 4:5:** frame das crianças rolando (`trial-class`), com o sticker "Learn to fall first."
  na voz da criança.
- **Mecanismo:**
  - Ao entrar cada placa, um ✓ se desenha (`pathLength`, 400 ms).
  - IO puro, sem GSAP.
  - Em reduced-motion, os ✓ já estão desenhados.
- "Paired by size": a frase da copy (5 anos com 5 anos) bate com os calendários do CRM, **4–6** e
  **7–13**.
  - `[CONFIRMAR com o cliente]` que essas são as turmas reais. Se forem, a pendência da copy cai.

### IV · BookInline (o formulário)
- **Superfície:** o único bloco `--hk-torii-deep` da página, com a viga curva no topo.
- **Cartão branco `elev-2` centralizado:**
  - título "Book your kid's free class";
  - os passos (Seção 11);
  - a linha "under the button" da copy.
- **Ao lado (desktop):** "What happens next", com 3 linhas tiradas da micro da copy (texto do
  endereço, o que vestir, horário). No celular essa coluna some, porque a micro já diz isso.
- `id="book"`. `lp…/kids#book` abre já no form (padrão da `/`).

### V · Two Readers
- H2 da copy.
- **Página dupla:**
  - **For parents:** placa branca reta, H3, os 4 itens com marcador de torii.
  - **For kids:** caderno quadriculado claro, inclinado 1,5°, H3 na voz da criança. Os 4 itens são
    stickers que colam ao entrar; cada um é botão (wiggle).
  - O item "stripes" mostra a faixa com 4 graus que se preenchem um a um ao tocar.
  - Pendências: anti-bullying (frequência) e sistema de graus. Em client, a linha sai inteira.
- **Foto:** `programs/kids.webp`, o Diego e as crianças diante do torii pintado. Quadrada, no pé,
  atravessando as duas colunas.
- CTA.

### VI · The Aggression Question
- A pergunta enorme entre aspas desenhadas.
- **Body:**
  - Cada palavra é um `<span>` com `--i`.
  - A opacidade vem de `clamp(.18, calc(var(--p)*(var(--n)+2) - var(--i)), 1)`.
  - `--p` é dado pelo scroll (técnica Dárcio/Maison).
- **Estado-base no CSS: opacidade 1.** O JS só começa o efeito depois de medir (bug proibido 1).
- **Pull quote:** trecho de `reviews` (Patrick), com `excerpt` no `site.ts`.
- **Foto:** turma kids enfileirada, larga, sob a pergunta.

### VII · First Class
- H2.
- **5 portões (torii de 48px)** ligados por uma linha:
  - desktop: horizontal, com o texto embaixo de cada um;
  - celular: vertical, linha no gutter esquerdo.
- **Mecanismo:** scrub do ScrollTrigger enche a linha; cada portão que a linha alcança fica
  vermelho e o passo fica 100%.
- **Estado-base (sem JS, reduced-motion): tudo aceso.** O JS só apaga o que ainda não foi
  alcançado depois de montar.
- **Passo 2:** "We lend a kimono".
  - A copy da `/` diz o mesmo; o Dárcio removeu "free gi".
  - `[CONFIRMAR]` que o empréstimo existe para kids.
- **Passo 4:** duração da aula pendente; em client, a frase da duração não sai.
- Sticker "Wear your comfiest shorts…" e CTA "Pick a Day for the Free Class".

### VIII · Coach
- Eyebrow, H2, body.
- **Stats row:**
  - 3 placas.
  - As pendentes (grau, anos) não renderizam em client.
  - "Kids & Teens Team Champions, NAGA MA 2026" só com a confirmação da Seção II.
- Opcional "Classes taught in English. Professor Diego also speaks Portuguese." só com
  `[CONFIRMAR]`.
- **Retrato:** Diego em pé (`SnapInsta…566437768`), 4:5, sangrando para a esquerda.
  - P&B ao entrar; a cor volta.
  - **Trocar** por "Diego ensinando criança" quando chegar.
- CTA "Meet Professor Diego in a Free Class".

### IX · Parent Reviews
- H2 e sub.
- **3 bilhetes brancos** (radius 20, fita de canto, iniciais em círculo, nome, "parent · Google").
  - Dado: `reviews.filter(r => r.role === 'Parent')`, texto = `excerpt ?? text`.
- Celular: scroll-snap horizontal com 85% de largura, sem setas, sem autoplay, sem tablist.
- **Pendente:** 2 reviews novas de pais.
  - O componente aceita N.
  - Não criar slot vazio.

### X · Quick-check
- H2 e sub.
- **6 afirmações como linhas tocáveis** (`role="checkbox"` nativo: `<input type="checkbox">` com
  rótulo desenhado).
  - Marcada: o check se desenha e a linha fica branca `elev-1`.
- **Contador:**
  - Visível: "You checked 2 of 6."
  - Escondido: um `aria-live="polite"`.
  - A partir de 1 marcada, o CTA vira "Book My Kid's Free Class" com a linha "Worth an hour of your
    week."
- **As afirmações marcadas vão junto no lead** (campo `notes`; ver 11.3). A equipe que liga já sabe
  se é timidez, energia ou bullying. Isso ataca os 13 leads parados em follow-up (P8).
- Evento `quick_check` com o índice marcado.

### XI · FAQ
- Coluna esquerda sticky (`top: 96px`, só desktop): H2 "Questions parents ask" `[CONFIRMAR texto
  com a copy; a copy não dá H2 ao FAQ]`, telefone e CTA.
- **Direita:** as 10 perguntas da copy.
  - **"Will my kid get hurt?" começa aberta.**
  - Pendentes que não saem em client:
    - irmãos e preço família;
    - dias das aulas, enquanto não houver grade em texto.
  - A resposta de preço tem o trecho pendente (contrato) retirado em client, e a frase-base
    continua.
- **Grade kids em texto:**
  - `[CONFIRMAR]`.
  - Os calendários do CRM têm horário, e o PRD **não** gera a grade a partir deles. Slot livre não
    é grade de aula.
- FAQPage JSON-LD gerado do mesmo array, só com as perguntas renderizadas.

### XII · Final CTA
- **Fundo:** `hero.webp` (a turma) sob véu ink 86%, com a viga curva no topo.
- **Torii inteiro em traço** que se desenha em volta do H2 e do botão.
- H2, body (com o endereço) e CTA, que abre a folha do form.
- Micro "or call (508) 361-7778 · No experience. No uniform. No card." O telefone é link
  `tel:`.
- Botão secundário "Get directions" (Maps).

### Footer
- Distintivo, os dados de `site.ts` e "Jiu-Jitsu Kids · Ages 4 to 13".
- Ponto de referência e estacionamento: `[CONFIRMAR]`, não renderiza em client.
- Link "Adult classes →" para `/` (discreto, para o pai que também quer treinar). Única menção a
  adulto.
- Sem mapa embutido (iframe pesa no INP); "Get directions" basta.

### Sticky mobile
- Barra inferior com "Free Kids Class" (primário) e "Call" (secundário).
- Aparece depois do hero e some quando o form IV ou a folha estão na tela.
- `padding-bottom: env(safe-area-inset-bottom)`.

---

## 11. FORMULÁRIO

### 11.1 Passos
O mesmo componente roda inline (IV) e na folha inferior. O estado mora em
`lib/booking-kids.ts` (store simples com `useSyncExternalStore`, sem dependência).

1. **Parent's name · Phone · Child's age (AgePicker 4 a 13).**
   - Botão "Next: pick a day".
   - Ao avançar: dispara o **webhook de lead** (GHL inbound) e `generate_lead` / `Lead` /
     conversão do Ads.
   - O lead existe mesmo que a pessoa pare no passo 2. É o que o diagnóstico chama de "contato".
2. **Best day to come.**
   - DayPicker com os slots reais do calendário da idade:
     - 4–6 → Kids BJJ 4-6;
     - 7–13 → Kids BJJ 7-13.
   - Mais o horário.
   - Ao confirmar: o **webhook de agendamento** (n8n `landing-page-booking`), `Schedule` e
     `trial_booked`.
3. **Thank-you** da copy, com o nome da criança se houver e o botão "Add to calendar" (`.ics`
   gerado no cliente).

### 11.2 Regras
- **E-mail removido** (a copy tem 4 campos).
  - `[CONFIRMAR]` que o workflow `[ND] Primary Workflow` do GHL aceita lead sem e-mail. Se não
    aceitar, o e-mail volta como campo **opcional** no passo 1, e isso é registrado.
- **Nome da criança:** a copy não pede. O payload manda `child_name: ''`. `[CONFIRMAR]` que o n8n
  não exige.
- **Programas e slots:**
  - Vêm de `https://clients.novodash.com/api/public/programs?location_id=…`, filtrados por
    `audience === 'kids'`. É o padrão vivo no Satori e no Dárcio; confirmar a URL no código do
    Dárcio (`src/nd/programs.ts`).
  - Isso substitui o `PROGRAM_CALENDAR_ID` em PLACEHOLDER.
  - Kids No-Gi 7-13 **não** entra na escolha automática.
  - `[CONFIRMAR]` com o Adryan se a 2ª tentativa (sem slot no gi) oferece o no-gi.
- **Payload:**
  - `source: 'Landing Page - Kids'`, `audience: 'kids'`, `child_age`, `notes` (Quick-check),
    `headline_variant`;
  - UTMs e `gclid`/`gbraid`/`wbraid`/`fbclid` de `getAttribution()`.
- **Telefone:** máscara US `(xxx) xxx-xxxx`, `inputmode="tel"`, `autocomplete="tel"`. Validar 10
  dígitos.
- **Anti-spam:** honeypot (`aria-hidden`, `tabIndex=-1`) e tempo mínimo de **3 s**, não os 5 s da
  `/`, porque o form tem 2 campos de texto. Rate limit de 1 envio a cada 30 s por sessão.
- **Falha do envio:**
  - Mensagem humana: "Something went wrong on our side. Call or text (508) 361-7778 and we'll
    book it for you."
  - Botão de telefone.
  - Nunca perder o que foi digitado.
- **Slots indisponíveis** (API fora): o passo 2 vira "We'll text you the next open class for a
  4-year-old" e conclui como lead sem agendamento.

### 11.3 Sem regressão
- A `/` continua com o modal dela, intacto.
- A Kids não importa `booking-modal.tsx`; importa só `webhook.ts` e `track.ts`.

---

## 12. ACESSIBILIDADE (WCAG AA)

- **Estrutura e navegação:**
  - Um skip link.
  - Landmarks `header` / `main` / `footer`.
  - Cada seção com `aria-labelledby`.
- **Foco e toque:**
  - Alvos de toque ≥ 44px (botões 52px).
  - `focus-visible` desenhado (8.9).
  - `touch-action: manipulation` em botões (corta o atraso de toque duplo nos WebViews).
- **Formulário:**
  - `<label>` real em todo campo.
  - Erros com `aria-describedby` e `role="alert"`.
  - A folha inferior é `Dialog` da Base UI: foco preso, Esc fecha, o foco volta ao botão de
    origem, `inert` no resto da página.
- **Leitura e ritmo:**
  - Aggression: o texto existe inteiro para leitor de tela; o efeito é só opacidade, e nunca abaixo
    de .18.
  - Chips de confiança: são botões com rótulo completo ("5.0 on Google from 35 reviews, go to
    reviews").
  - Contadores: valor final no HTML.
- **Reduced-motion como layout alternativo, nunca página vazia:**
  - torii parado;
  - portões acesos;
  - ✓ desenhados;
  - Aggression toda acesa;
  - VSL com poster e botão de play (sem autoplay);
  - stickers sem wiggle.
- **Contraste:** medido e comentado em cada token (8.2).

---

## 13. GLASSMORPHISM

Só na nav rolada:
- `backdrop-filter: blur(14px) saturate(1.2)` sobre `rgb(mat/.82)`.
- `@supports not (backdrop-filter: blur(1px))` cai para `--hk-mat` sólido.
- **Desligar o blur nos WebViews** do Instagram e do Facebook (UA contém `Instagram` ou `FBAN` /
  `FBAV`), porque blur em scroll custa frame em aparelho fraco.
- Em nenhum outro lugar.

---

## 14. ANIMAÇÕES

### 14.1 Gestos
- `rise()`: 20px, 600 ms, `cubic-bezier(.22,1,.36,1)`.
- `lines()`: H2 em linhas reais, máscara com a folga do bug 2, 80 ms entre linhas. **No máximo um
  `lines()` por seção.**
- Os dois por IntersectionObserver e CSS. GSAP **só** para os 2 scrubs (8.7 e VII) e o `--p` da
  Aggression.
- Todo GSAP dentro de `gsap.context()` com `revert()` no cleanup, `invalidateOnRefresh`, e
  `ScrollTrigger.refresh()` depois de `document.fonts.ready`.

### 14.2 Orçamento de scroll
- **Zero pin e zero sticky de conteúdo.** O único sticky é a coluna do FAQ no desktop, que não
  segura a página.
- Em 37% de rolagem média, cada viewport segurada é uma viewport que o visitante não chega a ver.
- Nenhum trecho maior que 2,5 viewports sem CTA. A sticky bar conta no celular.

### 14.3 Toque
- Toda resposta visual ao toque é CSS (`:active`) ou uma classe trocada no `pointerdown`.
- **Nunca** esperar estado do React para o feedback.
- Wiggle dos stickers: `@keyframes` com a propriedade `rotate` separada.

---

## 15. PERFORMANCE E IMAGENS

### 15.1 Metas (celular, Lighthouse mobile com 4× CPU, rota `/kids`)

| Métrica | Meta |
|---|---|
| Performance | ≥ 90 |
| LCP | ≤ 2,0 s |
| CLS | 0 |
| TBT | ≤ 150 ms |
| **INP medido no Clarity no próximo ciclo** | **≤ 200 ms** |

### 15.2 Orçamento de JS (o INP de 300 ms é o problema P6)
- ~~Entrada inicial ≤ 70 KB gzip~~ **Medido: 86 KB** (16 KB da página + 68 KB do React, que
  sozinho já passa de 58 KB). A meta corrigida é: a PÁGINA ≤ 20 KB gzip.
- O GSAP vem por `import()` no primeiro scroll ou toque, ou a 3 s.
- O Dialog da Base UI só entra quando a folha abre pela primeira vez, e é pré-carregado no ocioso.
- O tracking (Pixel, GA4, Ads, Clarity) carrega **depois do `load`** e em `requestIdleCallback`,
  como a `/` já faz. Conferir que nenhum `fbq`/`gtag` roda síncrono num handler de clique: o
  evento vai por `queueMicrotask` ou `setTimeout(0)` **depois** do feedback visual.
- **Hidratação sem tarefa longa:** as seções abaixo da dobra hidratam por IO (`hydrate on
  visible`).
- Nenhum `scroll` listener sem `passive: true`. Leituras de layout fora de handler de toque.
- **Teste obrigatório:**
  - Chrome DevTools, Performance, 4× CPU, 390×844.
  - Tocar no CTA, num chip, num sticker, num AgePicker e numa pergunta do FAQ.
  - Nenhuma interação acima de 100 ms de "processing".
  - Registrar os números em `design-decisions.md`.

### 15.3 Imagens
- Todas em WebP via `cwebp -q 78`, em duas larguras, com `srcset`/`sizes`, `width`/`height` e
  `decoding="async"`.

| Saída | Fonte | Larguras |
|---|---|---|
| `public/kids/vsl-poster.webp` | frame do vídeo kids | 540, 720 |
| `public/kids/safety-fall.webp` | frame de `trial-class.mp4` com crianças rolando | 480, 960 |
| `public/kids/two-readers.webp` | `public/programs/kids.webp` | 600, 1120 |
| `public/kids/lineup.webp` | `raw/instagram/photo (2).jpg` | 640 (fonte pequena; não ampliar) |
| `public/kids/coach.webp` | `raw/instagram/SnapInsta…566437768…jpg` | 560, 1120 |
| `public/kids/final.webp` | `public/hero.webp` | 960, 1920 |
| `public/kids/og.jpg` | prerender da página real em 1200×630 (padrão da `/`) | 1200 |

- **Prioridade:**
  - LCP = H1 (texto) no celular; o poster da VSL tem `fetchpriority="high"` só no desktop.
  - Uma única imagem com prioridade alta.
- **Vídeo:**
  - `trial-class.mp4` já está em 4,5 MB. Reencodar para ≤ 2,5 MB (H.264, 720×1280, CRF 28,
    `+faststart`, sem áudio na versão muda, se houver duas).
  - `preload="none"` até 300px do viewport.

---

## 16. SEGURANÇA

- `vercel.json`: a CSP atual já cobre Pixel, GA4, Ads, Clarity, GHL e n8n.
  - **Acrescentar** `https://clients.novodash.com` em `connect-src` (API de programas).
  - Se a CAPI entrar, nada externo (é `/api/capi`).
- Rewrites de `/kids` e das variantes.
- `.env` fora do git (já está). Nada de token novo no repositório.
- **Grep do F7, todos com resultado zero no output:**
  - `[CONFIRMAR]`, `[PENDING]` e `PLACEHOLDER` no HTML de `client`;
  - `—` e `–`;
  - `Stance`, `Dárcio`, `Darcio`, `Satori`, `Maison`, `OCJ`, `Phoenix`, `Arizona`, `ESA`.

---

## 17. MICROCOPY (fora da copy, em inglês)

| Onde | Texto |
|---|---|
| Field nome | Label "Parent's name" · placeholder "First and last name" |
| Field telefone | Label "Phone" · ajuda "We text the confirmation here." |
| AgePicker | Label "Child's age" · cada botão "4" … "13" com `aria-label="4 years old"` |
| Erros | "Add your name so we know who to expect." · "That number looks short. US numbers have 10 digits." · "Pick your kid's age." · "Pick a day that works." |
| Passo 1 → 2 | "Next: pick a day" |
| Passo 2 → 3 | "Book the free class" |
| DayPicker vazio | "No open spots in the next two weeks. We'll text you the next one." |
| VSL | "Tap for sound" · "Pause" · "Watch again" |
| Foto (verso) | uma linha por foto, descrevendo o que acontece ali `[CONFIRMAR com a copy]` |
| Quick-check | "You checked {n} of 6." |
| 404 da folha | n/a |

---

## 18. TRACKING

Base: `src/lib/track.ts`. Todos os eventos levam `page: 'kids'` e `headline_variant`.

| Evento | Quando | Destinos |
|---|---|---|
| `page_view` + `ViewContent {content_name:'Kids Program'}` | carga | GA4, Pixel |
| `cta_click {location}` | todo botão e telefone (hero, two_readers, first_class, coach, quick_check, final, sticky, nav) | GA4, Pixel custom |
| `chip_click {chip}` | selo do hero | GA4 |
| `sticker_tap {id}` / `photo_flip {id}` | toque (mede se o clique morto caiu) | GA4, Clarity tag |
| `vsl_play` / `vsl_sound` / `vsl_complete` | VSL | GA4 |
| `form_start` | primeiro foco no form | GA4 |
| `generate_lead` + `Lead` + **conversão do Google Ads** | passo 1 concluído | GA4, Pixel (+CAPI), Ads |
| `Schedule` + `trial_booked` | passo 2 concluído | Pixel, GA4, Ads (conversão "booked", se houver label) |
| `quick_check {item}` | marcar afirmação | GA4 |
| `faq_open {q}` | abrir pergunta | GA4 |
| `scroll_depth` | 25/50/75/100 | GA4, Clarity |

- **Clarity:**
  - Carregar só se `location.hostname` não for `localhost` / `127.0.0.1` / `*.vercel.app` (preview).
  - `clarity('set','page','kids')` e `clarity('set','variant', …)`.
  - Isso resolve o item 04 do plano do diagnóstico.
- **Google Ads:**
  - A conversão do lead já tem label no código.
  - `[CONFIRMAR]` que a ação de conversão está **ativa e como primária** na conta. O diagnóstico
    diz 0 conversões na história.
  - Pedir ao Adryan a tag `google-ads` no GHL (fora do código; vai para o checklist).
- **CAPI:** copiar `api/capi.ts` da OCJ se o Adryan quiser (`[CONFIRMAR]`; precisa do token na
  Vercel). Se não, Pixel só no navegador, como a `/` hoje.

---

## 19. SEO / SCHEMA

- `kids/index.html`:
  - `<title>`: "Kids Jiu-Jitsu in Framingham, MA · Ages 4 to 13 · Holanda BJJ Academy".
  - `description`: o sub do hero, até 155 caracteres.
  - canonical `https://lp.holandabjjacademy.com/kids`.
  - OG/Twitter com `kids/og.jpg`.
  - `theme-color` = mat.
- **JSON-LD:**
  - `SportsActivityLocation` (dados do `site.ts`, sem `aggregateRating`: mesma razão da `/`,
    Google ignora self-serving).
  - `FAQPage` só com as perguntas renderizadas.
  - `Course`/`Offer` NÃO (sem preço confirmado).
- `sitemap.xml`: acrescentar `/kids` (prioridade 0.9). `/kids/b` e `/kids/c` com `noindex` e fora
  do sitemap.
- `robots.txt` já permite.

---

## 20. DADOS PENDENTES

| # | Item | Status | Responsável | Impacto se faltar |
|---|---|---|---|---|
| 1 | Vídeo campeão do anúncio Kids (MP4 9:16) | 🔴 | Cliente / Adryan | VSL fica com a aula kids de 30 s |
| 2 | **Autorização de imagem dos responsáveis** (crianças nas fotos e vídeos) | 🔴 | Cliente | **Trava a campanha paga** |
| 3 | NAGA: evento, data e "overall team" | 🔴 | Cliente | Proof Ribbon cai para a versão sem título; coach perde o stat |
| 4 | Turmas e idades exatas | ✅ | CRM | Confirmado na API de programas em 09/10: Kids BJJ (Ages 4-6) seg/qua/sex 17h · Kids BJJ (Ages 7-13) seg/qua/qui 18h · Kids No-Gi (Ages 7-13) ter 18h |
| 5 | Grade kids em texto (dia e horário) | 🔴 | Cliente | Pergunta do FAQ não sai |
| 6 | Grau da faixa e anos de tatame do Diego, desde quando ensina criança, equipe | 🟡 | Cliente | Stats do Coach vazios |
| 7 | Sistema de graus kids | 🟡 | Cliente | Item "stripes" sai |
| 8 | Módulo anti-bullying (existe? frequência?) | 🟡 | Cliente | A frase pendente sai; o item fica |
| 9 | Tipo de tatame e nº de professores na aula kids | 🟡 | Cliente | Regra 5 da Safety sai |
| 10 | Duração da aula kids | 🟡 | Cliente | Frase do passo 4 sai |
| 11 | Contrato e cancelamento | 🟡 | Cliente | Trecho da resposta de preço sai |
| 12 | Desconto irmão/família | 🟡 | Cliente | Pergunta sai |
| 13 | Kimono emprestado para kids no dia 1 | 🟡 | Cliente | Chip "Kimono on loan" e passo 2 mudam para "wear a t-shirt and shorts" |
| 14 | Aula em inglês + Diego fala português | 🟡 | Cliente | Linha opcional sai |
| 15 | Ponto de referência e estacionamento | 🟡 | Cliente | Linha do rodapé sai |
| 16 | Contagem atual de reviews (35) | 🟡 | Adryan | Reconferir no dia do deploy |
| 17 | 2 reviews novas de pais (escola, timidez, tela) | 🟡 | Cliente | Seção fica com 3 |
| 18 | Hex exato do vermelho | 🟡 | Cliente | Fica `#C8161D` |
| 19 | Fotos novas: pódio NAGA, Diego ensinando criança, pais assistindo | 🟡 | Cliente | Maior salto de qualidade disponível |
| 20 | GHL aceita lead sem e-mail e sem `child_name` | 🔴 | Adryan | Se não, e-mail volta opcional |
| 21 | Conversão do Ads ativa/primária + tag `google-ads` no GHL | 🔴 | Adryan | O Ads continua cego (P9) |
| 22 | CAPI sim/não (+ token na Vercel) | 🟡 | Adryan | Pixel só no navegador |
| 23 | Kids No-Gi 7-13 como alternativa no agendamento | 🟡 | Adryan | Só gi |

---

## 21. CHECKLIST

### Antes (F0, obrigatório, antes de qualquer código)
- [ ] Ler `copy-kids.md` inteira e este PRD inteiro.
- [ ] Abrir o CÓDIGO das duas referências (8.10) e ler `KidsPage.tsx`, `kids.css`, `parts.tsx`,
      `motion.ts` (Dárcio) e `useReveal.ts`, `FirstDay.tsx`, `ClassPreview.tsx` (Satori).
- [ ] **Prints novos com Playwright**, no MEIO de cada mecanismo, em 1440 e 390:
  - Dárcio `/kids`: hero, cortina, cartas, relógio;
  - Satori `/kids`: hero, trilha, ESA, cortina final.
  - Salvar em `memory/prints/ref-*.png` (pasta no `.gitignore`; fora de `public/` para não ir ao ar). Nunca usar prints antigos.
- [ ] Registrar em `memory/design-decisions.md` (seção HOLK-001) a espinha herdada e o que muda.
- [ ] `npm view` das versões e instalar: `gsap@3.14`, `@base-ui/react`,
      `@fontsource-variable/shantell-sans`, `@fontsource-variable/lexend`. Gerar o woff2 da 9.2.

### Durante
- [ ] F4: hero em 2–3 direções e as 3 fontes, em `/kids?dir=a|b|c` local. Prints 1440 e 390.
      **PARAR e mostrar ao Adryan.**
- [ ] Cada seção: arquétipo e mecanismo da tabela da Seção 7, e nada além.
- [ ] Nenhum hex fora do bloco de tokens; nenhuma copy no TSX.
- [ ] Toda pendência com flag e testada nos dois modos.

### Depois (F7)
- [ ] `tsc -b` e `npm run build` sem erro; `dist/kids/index.html` tem o H1 no HTML.
- [ ] A `/` intacta: mesmo HTML, mesmo bundle (comparar `dist/assets` antes e depois), form
      funcionando.
- [ ] Rolar devagar em 1440 e 390 sem tela vazia; sem rolagem horizontal em 390.
- [ ] **Medir no celular emulado:** 390×844, conferir que o form IV começa antes de 2.400px.
- [ ] Reduced-motion: página completa, nada a .4, nada escondido.
- [ ] Teste de INP da 15.2 com números.
- [ ] Envio real de teste no GHL (com o nome "TESTE NOVO DASH", e avisar o Adryan para apagar):
      lead criado, `source` = Landing Page - Kids, `audience` = kids, agendamento no calendário
      certo.
- [ ] Greps da Seção 16.
- [ ] Lighthouse mobile da 15.1.
- [ ] Rodar o **finalizador de página** (ETAPA 3).
- [ ] `memory/*.md` atualizados (Seção 3). README com a seção "Rota /kids".

---

## 22. TIMELINE

| Dia | Entrega |
|---|---|
| D1 | F0 (refs, prints) + F1 (entrada MPA, tokens, fontes) + F2 (átomos) |
| D2 | F3 (dados, form, tracking, prerender) + **F4 design pass do hero, PARADA** |
| D3 | F5: I a VI (o primeiro terço inteiro, incluindo o form funcionando) |
| D4 | F5: VII a XII + footer + sticky |
| D5 | F6 composição, celular, reduced-motion, INP |
| D6 | F7 qualidade, envio de teste, finalizador, memory |

---

## 23. REGISTRO DA EXECUÇÃO (09/10/2026)

- **F4, escolhas do Adryan:** fonte **Shantell Sans**; hero **direção B, "Mural"** (torii cheio
  atrás da VSL). Comparativos em `brand/kids-font-options.png` e `brand/kids-hero-directions.png`.
- **Pendência #4 resolvida pelo CRM:** turmas 4-6 e 7-13 (ver §20).
- **Desvios do PRD e medições:** `memory/design-decisions.md`, seção HOLK-001, §6 e §7.
- **Meta não cumprida, registrada:** formulário a 2.894 px no celular (23% da página; a regra do
  diagnóstico, "acima de 37%", está cumprida). Para chegar a 2.400 px é preciso tirar a VSL do
  primeiro terço no celular. Decisão do Adryan.
- **Ainda não feito:** envio real de teste no GHL (precisa do OK do Adryan para criar e apagar
  o contato); finalizador (ETAPA 3); deploy.

