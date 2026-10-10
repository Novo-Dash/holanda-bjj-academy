import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/* Build SSR só do prerender da /kids. Config própria (e não um merge da
   principal) porque a principal tem duas entradas HTML, e aqui a entrada é um
   módulo. O CSS é ignorado: quem o injeta é o build do cliente. */
export default defineConfig({
  plugins: [
    react(),
    /* O src/nd/tracking.ts do kit lê `window` ao carregar o módulo, o que
       derruba o Node. No prerender ele vira um stub vazio; no navegador
       roda sempre o módulo real. */
    {
      name: 'nd-tracking-ssr-stub',
      enforce: 'pre',
      resolveId(source, importer) {
        /* o alias `@/` já foi resolvido quando chega aqui: compara o caminho */
        const kit =
          /[/\\]src[/\\]nd[/\\]tracking(\.ts)?$/.test(source) ||
          source === '@/nd/tracking' ||
          (source === './tracking' && importer && /[/\\]src[/\\]nd[/\\]/.test(importer))
        if (kit) return fileURLToPath(new URL('./scripts/ssr-tracking-stub.ts', import.meta.url))
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    ssr: fileURLToPath(new URL('./src/kids/entry-server.tsx', import.meta.url)),
    outDir: 'dist-ssr',
    emptyOutDir: true,
  },
})
