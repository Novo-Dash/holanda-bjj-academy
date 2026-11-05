// Prerender da /referral. Roda depois do `vite build` e do build SSR da página
// (vite.ssr.referral.config.ts). Mesmo desenho do prerender-main.mjs: grava a árvore
// dentro do <div id="root"> do dist/referral/index.html, embute o CSS da página no
// <head> e o src/pages/referral-main.tsx hidrata em vez de pintar do zero.
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr-referral/entry-server-referral.js')).href)
const file = 'dist/referral/index.html'
const template = readFileSync(file, 'utf-8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error(`marcador ausente em ${file}: ${marker}`)

let body = await ssr.render()
const hints = []
body = body.replace(/^(?:<link [^>]*\/>)+/, (m) => (hints.push(m), ''))

for (const must of ['<h1', 'id="referral-form"', 'id="rewards"', 'id="rules"', 'iPhone 18 Pro']) {
  if (!body.includes(must)) throw new Error(`prerender da /referral sem ${must}`)
}

// O CSS da página (referral-*.css: tokens, fontes, Tailwind e o referral.css) entra embutido,
// desde que nenhum JS o referencie (senão desceria duas vezes).
let inlined = 0
const withCss = template.replace(/<link rel="stylesheet" crossorigin href="\/(assets\/referral-[^"]+\.css)">/g, (_, css) => {
  for (const js of readdirSync('dist/assets').filter((f) => f.endsWith('.js'))) {
    if (readFileSync(`dist/assets/${js}`, 'utf-8').includes(css.slice('assets/'.length))) {
      throw new Error(`${css} é referenciado por ${js}: embutir faria o CSS descer duas vezes`)
    }
  }
  inlined++
  return `<style>${readFileSync(`dist/${css}`, 'utf-8')}</style>`
})
if (inlined !== 1) throw new Error(`esperava embutir 1 CSS (referral), embutiu ${inlined}`)

const html = withCss
  .replace(marker, `<div id="root">${body}</div>`)
  .replace('</head>', `${hints.join('')}</head>`)
writeFileSync(file, html)
console.log(`prerender: ${file} (${(body.length / 1024).toFixed(0)} KB de HTML)`)

rmSync('dist-ssr-referral', { recursive: true, force: true })
