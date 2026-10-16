# REGRAS CLAUDE CODE — HOL-001

STACK: React 19 + Vite 8 + Tailwind 4 + `motion`. Sem GSAP, sem biblioteca de
componentes. Preset OLD SCHOOL em leitura minimalista e soft.

## DADOS CONFIRMADOS (nunca marcar como pendência)
- Marca: **Holanda BJJ Academy**, jiu-jitsu brasileiro em Framingham, MA
- Responsável: **Diego do Nascimento Holanda** (faixa e linhagem NÃO confirmadas)
- Endereço: **47 Franklin Street, Framingham, MA 01702**
  (o briefing dizia 10702, que não é CEP de Massachusetts; o Google geocodifica
  este endereço exato como 01702)
- Telefone: **(508) 361-7778** · Instagram **@holanda.bjjacademy**
- Programas: Beginners · Adults · Kids **4 a 13** · No-Gi
- Oferta: **primeira aula grátis**, foco das campanhas
- Aquisição: Google Ads Pmax (500/mês, teste de 15 dias) e Meta em preparação

## PENDENTE DO CLIENTE (a página imprime o marcador, nunca inventa)
VSL · faixa e linhagem do Diego · logo SVG e hex do vermelho · grade de horários
· preços · identificadores do CRM · domínio · fotos reais · avaliações reais ·
nota real do Google (hoje 5.0/100, provisória) · e-mail · Pixel/GTM/GA4

## AS REGRAS QUE NÃO SE NEGOCIAM
1. **Nada inventado.** Faixa de professor, nota, horário e depoimento não se
   preenchem com placeholder plausível. Plausível é o que ninguém confere.
2. **Nenhuma foto de banco de imagens.** Slot vazio é uma placa DESENHADA com a
   marca vazada e o briefing do que entra ali, nunca uma caixa cinza. Nos
   cartões de programa, o vazio é preenchido com os pontos reais do programa.
3. **Zero travessão** em texto que o visitante lê (copy, microcopy, aria-label,
   title, meta, JSON-LD). Em comentário de código pode.
4. **Zero "Stance"** no output. O planejamento tinha resíduo de outro cliente.
5. **Nenhum hex fora de `src/index.css`**, sombra colorida inclusive (é para
   isso que existe o token `--accent-rgb`).
6. **Escala fluida nunca se chama `text-*`** e textura nunca se chama `bg-*`: o
   `cn()` é tailwind-merge e engole as duas em silêncio.
7. **`main.tsx` importa `@fontsource-variable/archivo/wdth.css`**, e não o
   padrão. Só esse arquivo tem o eixo de largura; com o padrão o
   `font-stretch: 68%` é ignorado sem erro e a página perde o sotaque inteiro.
8. **Gesto de entrada nunca recorta.** Nada de `clip-path` escondendo conteúdo:
   se o observador não disparar, a seção vira um retângulo em branco.
9. **Tag nova = domínio novo no `vercel.json`** (script-src e connect-src), no
   mesmo commit. Senão funciona no `dev` e morre em produção, sem erro visível.
10. **Duas inversões escuras na página, e nenhuma a mais.** O professor e o
    pedido.
11. **No máximo dois CTAs por seção**, e o segundo costuma ser o telefone.
12. Alvo de toque mínimo 44px (os botões têm 48).

## ONDE MEXER
`src/data/site.ts` é o contrato. Publicar é trocar valores lá, não componente.
Ver `README.md` (o que falta) e `design-decisions.md` (o porquê de cada escolha).

---

## Rota /kids (HOLK-001)

Segunda entrada do Vite (`kids/index.html` → `src/kids/main.tsx`), prerender
em `scripts/prerender-kids.mjs`. Não usa Tailwind, `motion` nem GSAP.

1. **A `/` não muda.** O CSS da `/` foi conferido byte a byte contra a linha de
   base (`@source not "./kids"` no index.css existe para isso). Nada de import
   da `/` dentro de `src/kids` além de `site.ts`, `track.ts`, `webhook.ts` e
   `torii.ts`.
2. **Copy só em `src/kids/data/kids.ts`; hex só no bloco de tokens de
   `src/kids/kids.css`.** `kids-sections.css` não tem hex nenhum.
3. **Pendência:** `pending` imprime a pastilha em prospect; `gated` some em
   client. Nunca placeholder plausível. O título do NAGA é `gated`.
4. **Estado-base = estado final.** Todo efeito (portão, palavras que acendem,
   portões da primeira aula, ✓ das regras, cor do coach) parte do CSS pronto e
   o JS só anima até ele. Reduced-motion e sem-JS mostram a página inteira.
5. **Toque em CSS** (`:active`), trabalho depois da pintura (`afterPaint`).
   Nada de `offsetWidth` para reiniciar animação: Web Animations.
6. **Grade de uma coluna = `minmax(0, 1fr)`** (regra na base do kids.css): a
   trilha `auto` empurrava a página para fora da tela no celular.
7. **Em dev o formulário NÃO envia** (vai para o console). `?send=1` envia de
   verdade; avisar o Adryan para apagar o contato de teste no GHL.
8. **Variantes de headline:** `/kids` (A), `/kids/b`, `/kids/c`. b e c são
   `noindex` com canonical para `/kids`. Em dev, `?v=b`.
9. **Fonte:** `public/fonts/shantell-kids.woff2` é um CORTE da Shantell Sans
   (SPAC 0, wght 600 a 800, INFM e BNCE). Atualizar a fonte = refazer o corte
   (comando em design-decisions.md), nunca trocar pela folha do fontsource.
