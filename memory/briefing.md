# briefing.md — HOL-001

## Cliente

**Holanda BJJ Academy** — academia de jiu-jitsu brasileiro em
**47 Franklin Street, Framingham, MA 01702**. Telefone **(913) 963-3160**,
Instagram **@holanda.bjjacademy**. Responsável: **Diego do Nascimento Holanda**
(nome confirmado via Smoothcomp; faixa e linhagem ainda não).

Ambiente descrito no briefing como limpo, organizado e acolhedor,
family-friendly, para todos os níveis. **Não tem site hoje** — só o Instagram.
Esta é a primeira presença própria da academia na web.

## Origem do projeto

Pedido do Adryan: uma LP nova, em pasta própria, preset **old school**, base
preto e branco com acento vermelho, **aprendendo com a Collective Jiu-Jitsu** —
que foi a última página entregue e voltou do cliente com zero alterações. A
instrução de tipografia foi literal: *"fonte QUERO SIMILAR NO CASO CONDENSED,
PORÉM MINIMALISTA E SOFT"*. E *"algo de alto nível, de atenção aos detalhes de
toda seção"*.

O que isso virou na prática está em `design-decisions.md`: a arquitetura, os
mecanismos e a disciplina de dado vieram da Collective; a tipografia, a paleta,
o letreiro, a marca e cinco das nove seções são outros.

## A oferta

Uma só: **a primeira aula é grátis**. Sem preço na página enquanto a tabela não
vier do cliente, e sem mecanismo de escassez — a academia já está aberta, e
contador regressivo aqui seria invenção.

## Público e programas

Quatro programas: **Beginners** (adulto que nunca treinou, o público do
anúncio), **Advanced**, **Kids 7 a 15** e **No-Gi**.

Duas campanhas com públicos distintos:

- **A — a mãe (primária, campanha de kids).** 26 a 50, filho de 7 a 15. Compra
  disciplina, confiança, foco e ambiente seguro.
- **B — o adulto (campanha de adultos).** 18 a 50, fitness, defesa pessoal ou
  interesse em luta. Compra "não precisa de experiência".
- **C — o praticante.** No-gi e avançado. Compra autenticidade e o professor.

A jornada da página serve os dois primeiros sem se dividir em duas páginas: os
quatro programas aparecem lado a lado, e quem clica no cartão de kids cai no
formulário já com a turma escolhida e com os campos da criança abertos.

## Aquisição

**Google Ads Performance Max**, 500 dólares por mês, teste de 15 dias. Meta Ads
em preparação. Por isso três coisas não são detalhe nesta página:

1. a **conversão do Google Ads** disparando no envio do lead;
2. a captura de `gclid`, **`gbraid` e `wbraid`** na primeira visita da sessão —
   os dois últimos são o que o Pmax entrega em iOS, e sem eles metade do tráfego
   pago chega no CRM como "direct";
3. a CSP liberando os domínios das tags, senão elas funcionam no `dev` e morrem
   em produção sem erro visível.

## Tese da página

"Jiu-jitsu de verdade, com porta fácil." A academia é séria e brasileira, e a
primeira aula não custa nada nem exige experiência. Por isso a VSL do Diego
ocupa metade da primeira tela: numa academia quem assina é a pessoa, e o anúncio
não consegue apresentar ninguém.

## Limpeza de template

O planejamento estratégico que originou o PRD foi montado sobre um template
reciclado e carregava headlines de OUTRO cliente ("Join Stance Jiu Jitsu").
Nada disso entrou: o grep por "Stance" no projeto devolve zero.

## Estado

Roda (`npm install && npm run dev`), passa no `tsc -b` e no `npm run build` sem
erro. Verificada em 1440px e em 390px (emulação de aparelho por CDP, não só
janela redimensionada): sem rolagem horizontal em nenhum dos dois.

Falta o conteúdo real do cliente e os identificadores do CRM. A lista completa,
com onde cada item entra, está no `README.md`.
