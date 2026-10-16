# Prompt de abertura · HOLK-001 · LP Kids Holanda BJJ

## 1. Onde e como
- **Projeto:** `D:\DOCUMENTOS\NovoDash\Holanda Jiu-Jitsu` (repositório já no ar em
  `lp.holandabjjacademy.com`). A Kids é a rota `/kids`, segunda entrada do Vite.
- **Rodar:** `claude --dangerously-skip-permissions` na pasta, depois `npm install` e
  `npm run dev`.
- **Leia `prd-HOLK-001.md` inteiro e `copy-kids.md` inteira antes de qualquer código.** O PRD
  vence em ordem e mecanismo; a copy vence em texto.

## 2. O que o Adryan pediu, nas palavras dele, e onde o PRD cobre

**Nível e referências**
- "extraisse tudo que foi feito no DARCIO LIRA KIDS E SATORI KIDS, para construir o visual dessa
  lp" → PRD 8.10 (o que se herda e o que muda, com as rotas) e F0 da Seção 21 (ler o código,
  prints novos).
- "quero fonte nova como nas referencias" → PRD 8.3 e 9.2 (Shantell Sans em duas vozes + Lexend;
  teste com 3 finalistas no hero real) e a lista de fontes proibidas.

**Público e conteúdo**
- "queria criar essa lp de kids" / "uma nova página especifica para Kids e Pais, que o público que
  mais converte do Holanda BJJ Academy" → PRD 0.7, 1 (P1), 2 e 6.
- A copy da ETAPA 1 (`copy-kids.md`) → PRD 10, literal.
- "Video Ad Kids campeão para usar na LP como VSL" → PRD 0.11 e 10·I (slot pronto; provisório com
  a aula kids; pendência 🔴 #1).

**Construção**
- "insights para construção" (o diagnóstico do Clarity) → PRD 0.12, 1, 6 (form no primeiro
  terço), 14.2 (zero pin), 15.2 (orçamento de JS por causa do INP), 8.9 (nada de clique morto) e
  18 (Clarity fora do localhost).

**Formato de trabalho**
- "dps do prd execute" → execução começa logo após o PRD, no modo com aprovação: F0 a F4 e
  **parada no design pass do hero** (3 fontes, 2–3 direções), depois F5 a F7.

**Regra:** se um pedido acima não estiver coberto pelo PRD, o pedido vale e a lacuna é
registrada em `memory/design-decisions.md`.

## 3. Antes de entregar
Conferir item por item da lista acima contra o PRD e contra a página construída. O que faltar,
corrigir no PRD e no código.

## 4. Como trabalhar
- **Fases:** F0 → F7, com declaração de fase no chat.
  - F0 é ler as referências e tirar prints novos.
  - F4 é a parada obrigatória.
- **Dado que não existe:** `[CONFIRMAR]` no dado com `pending: true`. Em `client` não renderiza;
  nunca placeholder plausível.
- **A página principal `/` não pode mudar.** Comparar build antes e depois.
- **No fim:** rodar o finalizador (ETAPA 3) e atualizar `memory/*.md`.
- **Sem push e sem deploy em produção** sem o Adryan pedir.

## 5. Pronto é
1. A mãe no celular vê oferta, prova, segurança e o formulário antes de 2.400px de rolagem, e o
   form cria o lead kids no GHL e agenda no calendário da idade certa.
2. A página tem voz própria (o torii como portão, a Shantell em duas vozes) e ninguém a confunde
   com o Dárcio, o Satori ou a `/`.
3. Nenhuma interação passa de 100 ms de processamento em 4× CPU, nada fica escondido em
   reduced-motion, e nenhum dado pendente aparece no modo client.
