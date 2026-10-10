import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/* Build SSR só do prerender da /kids. Config própria (e não um merge da
   principal) porque a principal tem duas entradas HTML, e aqui a entrada é um
   módulo. O CSS é ignorado: quem o injeta é o build do cliente. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    ssr: fileURLToPath(new URL('./src/kids/entry-server.tsx', import.meta.url)),
    outDir: 'dist-ssr',
    emptyOutDir: true,
  },
})
