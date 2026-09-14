/**
 * Envio do lead.
 *
 * A casa posta em dois lugares: o webhook de captação do CRM da unidade e o
 * fluxo compartilhado de agendamento. Os dois dependem de identificadores que
 * só existem depois que a conta da academia é criada. Enquanto forem
 * PLACEHOLDER, este módulo NÃO dispara nada e avisa no console.
 *
 * A alternativa seria postar para uma URL inventada e ver o formulário
 * "funcionar" em teste: o lead cairia no vazio e ninguém descobriria antes de o
 * cliente reclamar que pagou anúncio e não recebeu ninguém.
 *
 * [CONFIRMAR] location_id, o uuid do webhook de lead e o calendar_id de cada
 * programa. Preenchidos, apagar o PLACEHOLDER e o envio liga sozinho.
 */

const PLACEHOLDER = 'PLACEHOLDER'

const GHL_LOCATION_ID = PLACEHOLDER
const LEAD_WEBHOOK_UUID = PLACEHOLDER

/** Fixo em todas as unidades. Nunca parametrizar. */
const N8N_BOOKING_URL = 'https://n8n.novodash.com/webhook/landing-page-booking'

export const SOURCE_LABEL = 'Landing Page - Free Trial'

/** [CONFIRMAR] um calendário por programa, na conta da academia. */
const PROGRAM_CALENDAR_ID: Record<string, string> = {
  beginners: PLACEHOLDER,
  advanced: PLACEHOLDER,
  kids: PLACEHOLDER,
  nogi: PLACEHOLDER,
}

export type BookingData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  /** Só no programa de kids. */
  childName: string
  childAge: string
  programId: string
  programLabel: string
}

export function isConfigured(): boolean {
  return GHL_LOCATION_ID !== PLACEHOLDER && LEAD_WEBHOOK_UUID !== PLACEHOLDER
}

/** Nunca lança e nunca bloqueia a interface: lead perdido é pior que lento. */
function post(url: string, payload: unknown): void {
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) console.warn(`[booking] ${url} respondeu ${res.status}`)
      })
      .catch((err) => console.warn(`[booking] falhou: ${url}`, err))
  } catch (err) {
    console.warn(`[booking] exceção ao postar: ${url}`, err)
  }
}

/** Só dígitos viram E.164; 10 dígitos assumem +1. */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

/**
 * Atribuição de campanha, guardada na PRIMEIRA visita da sessão.
 *
 * Guardar na primeira visita e não na hora do envio é o que faz o lead continuar
 * atribuído à campanha depois de a pessoa navegar, sair e voltar: os parâmetros
 * só existem na URL da primeira entrada.
 *
 * `gclid` vem do Search e do Display; `gbraid` e `wbraid` são os identificadores
 * que o Google usa quando o clique veio de iOS com restrição de cookie, e são
 * exatamente os que uma campanha Performance Max mais entrega hoje. Sem os três
 * na lista, metade do tráfego pago chegaria no CRM como "direct".
 */
export function getAttribution(): Record<string, string> {
  const KEY = 'holanda_attribution'
  const FIELDS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid',
    'campaignid',
    'adgroupid',
  ]

  try {
    const stored = sessionStorage.getItem(KEY)
    if (stored) return JSON.parse(stored) as Record<string, string>

    const params = new URLSearchParams(window.location.search)
    const out: Record<string, string> = {
      landing_url: window.location.href.slice(0, 500),
      referrer: document.referrer.slice(0, 300),
    }
    for (const key of FIELDS) {
      const value = params.get(key)
      if (value) out[key] = value.slice(0, 200)
    }
    sessionStorage.setItem(KEY, JSON.stringify(out))
    return out
  } catch {
    // Navegação privada pode recusar sessionStorage. Atribuição é opcional.
    return {}
  }
}

export function sendBooking(d: BookingData): void {
  if (!isConfigured()) {
    console.warn(
      '[booking] identificadores do CRM ainda são PLACEHOLDER, nada foi enviado. Ver src/booking/webhook.ts'
    )
    return
  }

  const isKids = d.programId === 'kids'
  const child = isKids && d.childName.trim().length >= 2 ? d.childName.trim() : null

  post(
    `https://services.leadconnectorhq.com/hooks/${GHL_LOCATION_ID}/webhook-trigger/${LEAD_WEBHOOK_UUID}`,
    {
      event: 'lead_captured',
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim(),
      name: `${d.firstName.trim()} ${d.lastName.trim()}`.trim(),
      ...(child ? { child_name: child } : {}),
      ...(isKids && d.childAge ? { child_age: d.childAge } : {}),
      email: d.email.trim(),
      phone: d.phone.trim(),
      phoneE164: toE164(d.phone),
      interest: d.programId,
      program: d.programLabel,
      submittedAt: new Date().toISOString(),
      source: SOURCE_LABEL,
      ...getAttribution(),
    }
  )

  /* Schema do fluxo compartilhado. Contrato crítico: não acrescentar campos. */
  post(N8N_BOOKING_URL, {
    parent_name: `${d.firstName.trim()} ${d.lastName.trim()}`.trim(),
    ...(child ? { child_name: child } : {}),
    email: d.email.trim(),
    phone: d.phone.trim(),
    calendar_id: PROGRAM_CALENDAR_ID[d.programId] ?? PLACEHOLDER,
    location_id: GHL_LOCATION_ID,
    /* `lead_captured` e não `appointment_selected`: a folha não marca mais
       hora. A grade de aulas nunca foi confirmada pela academia, então o
       formulário parou de oferecer horário e passou a entregar o contato para
       a academia ligar. Quem marca a hora é a ligação, e o estágio tem de dizer
       isso, senão o CRM recebe um agendamento sem agendamento. */
    stage: 'lead_captured',
    source: SOURCE_LABEL,
  })
}
