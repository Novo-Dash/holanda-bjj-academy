/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'client' esconde os marcadores de pendência; ausente = modo prospect. */
  readonly VITE_UX_MODE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
