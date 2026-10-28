// Prerender da `/`. Roda depois do `vite build` e do build SSR da página
// principal (vite.ssr.main.config.ts). Grava o HTML da árvore inteira dentro do
// <div id="root"> do dist/index.html que o Vite já montou (com o CSS e o JS de
// hash certos), e o src/main.tsx hidrata em vez de pintar do zero.
//
// Por que existe: os crawlers de busca por IA e os scrapers de preview de link
// não executam JavaScript. Sem isto a `/` chegava para eles como uma div vazia.
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr-main/entry-server.js')).href)
const file = 'dist/index.html'
const template = readFileSync(file, 'utf-8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error(`marcador ausente em ${file}: ${marker}`)

let body = await ssr.render()
// O React 19 põe as dicas de recurso (preload) no começo do HTML: elas sobem
// para o <head>, e o #root fica só com a árvore que o cliente hidrata.
const hints = []
body = body.replace(/^(?:<link [^>]*\/>)+/, (m) => (hints.push(m), ''))

for (const must of ['<h1', 'id="programs"', 'id="faq"', '47 Franklin Street']) {
  if (!body.includes(must)) throw new Error(`prerender da / sem ${must}: alguma seção não resolveu`)
}

// O CSS da primeira tela (o da página e o do kit) entra EMBUTIDO no <head>,
// como na /kids: com o HTML já pronto, cada <link> bloqueante era uma ida e
// volta a mais antes da primeira pintura. Nenhum JS referencia esses dois
// arquivos (o build confere abaixo), então o helper de preload do Vite não
// tenta baixá-los de novo. As url() são absolutas (/fonts/...) e continuam
// valendo dentro do <style>.
let inlined = 0
const withCss = template.replace(/<link rel="stylesheet" crossorigin href="\/(assets\/(?:main|nd)-[^"]+\.css)">/g, (_, file) => {
  for (const js of readdirSync('dist/assets').filter((f) => f.endsWith('.js'))) {
    if (readFileSync(`dist/assets/${js}`, 'utf-8').includes(file.slice('assets/'.length))) {
      throw new Error(`${file} é referenciado por ${js}: embutir faria o CSS descer duas vezes`)
    }
  }
  inlined++
  return `<style>${readFileSync(`dist/${file}`, 'utf-8')}</style>`
})
if (inlined !== 2) throw new Error(`esperava embutir 2 CSS (main e nd), embutiu ${inlined}`)

const html = withCss
  .replace(marker, `<div id="root">${body}</div>`)
  .replace('</head>', `${hints.join('')}</head>`)
writeFileSync(file, html)
console.log(`prerender: ${file} (${(body.length / 1024).toFixed(0)} KB de HTML)`)

rmSync('dist-ssr-main', { recursive: true, force: true })
