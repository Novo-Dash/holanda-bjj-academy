import type { Reason } from '@/data/site'

/**
 * Ícones dos diferenciais. Traço de 1,5, canto macio e nenhum preenchimento:
 * é o mesmo desenho da marca e da seta do botão, e não um set de biblioteca
 * com peso próprio entrando de carona na página.
 *
 * Um por diferencial, e cada um diz literalmente do que se trata: faixa para o
 * jiu-jitsu autêntico, porta para quem nunca treinou, duas figuras para o
 * ambiente familiar, apito para o corpo técnico.
 */
export function ReasonIcon({ name, className }: { name: Reason['icon']; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === 'belt' && (
        <>
          {/* Faixa amarrada: a tira atravessa e o nó fica no centro. */}
          <path d="M2.5 10.5h6M15.5 10.5h6" />
          <rect x="8.5" y="7.5" width="7" height="6" rx="1.2" />
          <path d="M9.5 13.5 8 20.5M14.5 13.5 16 20.5" />
        </>
      )}

      {name === 'door' && (
        <>
          <path d="M4 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 16 5v15.5" />
          <path d="M2.5 20.5h19" />
          <circle cx="13" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
          <path d="M19 9.5v5M21.5 12h-5" />
        </>
      )}

      {name === 'family' && (
        <>
          <circle cx="8.5" cy="6.5" r="2.8" />
          <path d="M3.5 20.5v-2.2a5 5 0 0 1 10 0v2.2" />
          <circle cx="17" cy="9" r="2" />
          <path d="M14 20.5v-3a3 3 0 0 1 6 0v3" />
        </>
      )}

      {name === 'whistle' && (
        <>
          <path d="M9 7.5h11.5a1 1 0 0 1 1 1v2a5.5 5.5 0 1 1-11 0Z" />
          <circle cx="8.5" cy="12" r="1.6" />
          <path d="M9 7.5 6 4.5M4.5 9h-2" />
        </>
      )}
    </svg>
  )
}

/**
 * A estrela da nota. Cheia, sem contorno: estrela contornada em 14px vira uma
 * mancha ambígua, e a única coisa que ela precisa comunicar é "cheia".
 */
export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9Z" />
    </svg>
  )
}

/** Telefone. Usado na barra fixa do topo e na barra de ação do celular, que é
    o motivo de ele viver aqui e não desenhado duas vezes. */
export function Phone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </svg>
  )
}

/** Seta para a direita. O sinal de avanço da página inteira. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** A seta na diagonal, apontando para cima e para a direita. É o sinal de
    "isto abre", e por isso ela é DIFERENTE da `Arrow` horizontal dos botões:
    aquela diz "avance nesta direção", esta diz "vai sair daqui". Usar a mesma
    seta nas duas funções apaga a distinção que a pessoa lê sem pensar. */
export function ArrowDiagonal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 16 16 8M9 8h7v7" />
    </svg>
  )
}
