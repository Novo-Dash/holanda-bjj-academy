import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './kids.css'
import './kids-sections.css'
import KidsApp from './KidsApp'
import type { Variant } from './data/kids'

/* A variante de headline vem do HTML prerenderizado (`<html data-variant>`),
   e não da URL lida pelo React: assim o servidor e o cliente renderizam a
   MESMA coisa e a hidratação não tem mismatch. Em dev, `?v=b|c`. */
const params = new URLSearchParams(window.location.search)
const fromHtml = document.documentElement.dataset.variant as Variant | undefined
const variant: Variant =
  fromHtml ??
  (import.meta.env.DEV && /^[abc]$/.test(params.get('v') ?? '') ? (params.get('v') as Variant) : 'a')

function boot() {
  const root = document.getElementById('root')!
  const app = (
    <StrictMode>
      <KidsApp variant={variant} />
    </StrictMode>
  )
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

boot()
