import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* A fonte vem por pacote, nunca por <link>: o CDN do Google é um terceiro no
   caminho crítico e um domínio a mais para liberar no CSP.

   São DUAS famílias, e a divisão é clara: a Sofia Sans Extra Condensed manda
   nos títulos, a Archivo no texto corrido.

   A página começou com uma família só, a Archivo puxada a 68% de largura. Caiu
   porque, estreitada, ela vira uma grotesca condensada sem sotaque — a leitura
   do cliente foi "parece Bebas, parece genérica", e é exatamente isso: o eixo
   de largura da Archivo comprime o desenho, não redesenha. A Sofia Extra
   Condensed é desenhada estreita de origem, e é aí que estão o J, o G e o R
   que a outra não tem.

   Da Archivo vem o arquivo com o eixo `wdth`, e NÃO o padrão: o corpo usa
   largura 100%, mas o `display-soft` dos depoimentos puxa 82%, e com o arquivo
   padrão `font-stretch` é silenciosamente ignorado.

   OS IMPORTS DO FONTSOURCE SAÍRAM DAQUI, e os `@font-face` passaram a ser
   declarados à mão no index.css. O motivo é medido: o CSS do pacote traz o
   arquivo com nome gerado pelo bundler (`archivo-latin-wdth-normal-DY7AcnAa.
   woff2`), e nome com hash não pode ser pré-carregado pelo index.html, porque
   ele só existe depois do build. Sem pré-carga, o navegador só descobre a fonte
   depois de baixar o CSS, casar a regra e precisar dela — e a troca da fonte de
   sistema pela real remexia a primeira tela inteira. Era 0,233 de CLS na
   medição, com a headline do hero apontada como culpada e "Web font loaded"
   como causa.

   Os dois arquivos agora moram em `public/fonts` com nome fixo, são declarados
   no index.css e pré-carregados no index.html. Os pacotes continuam no
   package.json porque é deles que os arquivos saem: atualizar a fonte é
   atualizar o pacote e copiar os dois `.woff2` de novo. */

import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
