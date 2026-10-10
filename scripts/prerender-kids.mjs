// Prerender da /kids (prd-HOLK-001 §4 e §15). Roda depois do `vite build` e
// do build SSR (vite.ssr.config.ts). Grava três páginas a partir do HTML que o
// Vite já montou (com o CSS e o JS de hash certos):
//
//   dist/kids/index.html     headline A, indexável
//   dist/kids/b/index.html   headline B, noindex, canonical para /kids
//   dist/kids/c/index.html   headline C, noindex, canonical para /kids
//
// A variante vai no <html data-variant>, e é de lá que o main.tsx a lê: o
// servidor e o cliente renderizam a mesma coisa e a hidratação não diverge.
// Cada anúncio pode apontar para uma variante sem trocar o H1 no navegador
// (o que custaria CLS e mismatch).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const ssr = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
let template = readFileSync('dist/kids/index.html', 'utf-8')

// O CSS da Kids (10 KB gzip) entra EMBUTIDO no <head>: sem a ida e volta do
// <link>, a primeira pintura não espera um arquivo bloqueante (o Lighthouse
// mediu 459 ms de atraso no LCP só por ele, e no WebView do Instagram a ida
// e volta custa mais). As url() das fontes são absolutas (/fonts/...), então
// continuam valendo dentro do <style>.
template = template.replace(
  /<link rel="stylesheet" crossorigin href="\/(assets\/kids-[^"]+\.css)">/,
  (_, file) => {
    const css = readFileSync(`dist/${file}`, 'utf-8')
    return `<style>${css}</style>`
  }
)
if (/assets\/kids-[^"]+\.css/.test(template)) throw new Error('o CSS da Kids não foi embutido')

for (const marker of ['<!--app-->', '<!--robots-->', '<!--faq-ld-->', '<html lang="en">']) {
  if (!template.includes(marker)) throw new Error(`marcador ausente em dist/kids/index.html: ${marker}`)
}

const faq = `<script type="application/ld+json">${ssr.faqJsonLd()}</script>`

for (const variant of ['a', 'b', 'c']) {
  let body = ssr.render(variant)
  // O React 19 põe as dicas de recurso (preload) no começo do HTML: elas
  // sobem para o <head>, e o #root fica só com a árvore que o cliente hidrata.
  const hints = []
  body = body.replace(/^(?:<link [^>]*\/>)+/, (m) => (hints.push(m), ''))

  const html = template
    .replace('<html lang="en">', `<html lang="en" data-variant="${variant}">`)
    .replace('<!--app-->', body)
    .replace(
      '<!--robots-->',
      variant === 'a'
        ? '<meta name="robots" content="index, follow, max-image-preview:large" />'
        : '<meta name="robots" content="noindex, follow" />'
    )
    .replace('<!--faq-ld-->', variant === 'a' ? faq : '')
    .replace('</head>', `${hints.join('')}</head>`)

  const dir = variant === 'a' ? 'dist/kids' : `dist/kids/${variant}`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/index.html`, html)
  console.log(`prerender: ${dir}/index.html (${(body.length / 1024).toFixed(0)} KB de HTML)`)
}

rmSync('dist-ssr', { recursive: true, force: true })
