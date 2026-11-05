import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/* Build SSR só do prerender da /referral (scripts/prerender-referral.mjs). Cópia da
   vite.ssr.main.config.ts com outra entrada e outra saída (dist-ssr-referral, apagada
   pelo script no fim), para que um build não mexa no outro. */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /* O src/nd/tracking.ts do kit lê `window` ao carregar o módulo, o que
       derruba o Node. No prerender ele vira um stub vazio (o mesmo da /kids);
       no navegador roda sempre o módulo real. O kit não é tocado. */
    {
      name: 'nd-tracking-ssr-stub',
      enforce: 'pre',
      resolveId(source, importer) {
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
    ssr: fileURLToPath(new URL('./src/entry-server-referral.tsx', import.meta.url)),
    outDir: 'dist-ssr-referral',
    emptyOutDir: true,
  },
})
