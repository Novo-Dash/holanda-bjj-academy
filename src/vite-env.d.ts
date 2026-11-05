/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'client' esconde os marcadores de pendência; ausente = modo prospect. */
  readonly VITE_UX_MODE?: string
  /** Inbound Webhook do workflow Referral no GHL (/referral). Ausente = a URL real em src/pages/referral/data.ts. */
  readonly VITE_REFERRAL_WEBHOOK_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
