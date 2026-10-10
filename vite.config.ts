import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

/* Duas entradas (MPA). A `/` é a página de sempre; a `/kids` é a LP de kids
   (prd-HOLK-001.md), com HTML, CSS, fontes e JS próprios. Ser entrada e não
   rota de router é o que garante que o bundle da `/` não mude de tamanho por
   causa da Kids, e que a Kids não carregue nada da `/` (motion, Tailwind). */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        kids: fileURLToPath(new URL('./kids/index.html', import.meta.url)),
      },
      /* O React é o que as duas páginas compartilham: num chunk com nome
         próprio, o cache do navegador serve a quem passa de uma para a outra,
         e o bundler não batiza o chunk com o nome de um módulo qualquer. */
      output: {
        advancedChunks: {
          groups: [{ name: 'react', test: /node_modules[\/](react|react-dom|scheduler)[\/]/ }],
        },
      },
    },
  },
})
