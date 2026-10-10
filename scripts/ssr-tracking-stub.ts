// Só no build de prerender da /kids (vite.ssr.config.ts): o src/nd/tracking.ts
// do kit lê `window` ao carregar o módulo, o que derruba o Node. No navegador
// quem roda é sempre o módulo real; nada daqui vai para o bundle do site.
export type User = { name?: string; email?: string; phone?: string }
export function fbTrack(..._a: unknown[]) {}
export function gaTrack(..._a: unknown[]) {}
export function adsConversion(..._a: unknown[]) {}
export function identify(..._a: unknown[]) {}
export function startUnit(..._a: unknown[]) {}
