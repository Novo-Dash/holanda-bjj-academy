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

/* Confirmados. Os dois saem da mesma URL que o operador entrega
   (https://services.leadconnectorhq.com/hooks/<location>/webhook-trigger/<uuid>),
   e o `location_id` foi conferido contra o cadastro: bate com
   "Holanda BJJ - Framingham MA". Esse cross-check é o que impede o pior erro
   possível aqui, que é o lead cair na sub-account de outra academia sem nada
   quebrar.

   Anotados como `string` e não deixados inferir o literal: com o literal o
   TypeScript conclui que a comparação com PLACEHOLDER em `isConfigured()` nunca
   é verdadeira e reprova o arquivo. A guarda existe para o próximo clone deste
   módulo, que nasce com os dois em PLACEHOLDER. */
const GHL_LOCATION_ID: string = 'umbThmlnc77LC745O8FF'
const LEAD_WEBHOOK_UUID: string = 'ESLBfsTWuNBfFiKrha6G'

/** Fixo em todas as unidades. Nunca parametrizar. */
const N8N_BOOKING_URL = 'https://n8n.novodash.com/webhook/landing-page-booking'

export const SOURCE_LABEL = 'Landing Page - Free Trial'

/** [CONFIRMAR] um calendário por programa.
 *
 *  A chave `advanced` estava aqui e NÃO existe em `programs` do site.ts; a que
 *  faltava era `adults`. Do jeito antigo, um agendamento de "Adults Jiu-Jitsu"
 *  saía com `calendar_id: undefined` e o fluxo do n8n quebrava sem ninguém ver.
 *
 *  OS CINCO CALENDÁRIOS DA ACADEMIA JÁ EXISTEM E TÊM HORÁRIO (um `get_programs`
 *  na location devolve Adults BJJ All Levels, Adults No-Gi All Levels, Kids BJJ
 *  4-6, Kids BJJ 7-13 e Kids No-Gi 7-13, todos com slots e no grupo certo).
 *  Eles continuam PLACEHOLDER aqui porque as quatro turmas desta página NÃO
 *  casam uma a uma com os cinco do CRM: a página tem "Beginners", que não é
 *  calendário nenhum, e tem uma turma de kids só, contra três lá. Escolher o
 *  par no chute manda gente para a aula errada.
 *
 *  A saída certa é a da spec: a lista de turmas vem do `get_programs` em
 *  runtime e este mapa deixa de existir. Enquanto isso não acontece, o envio ao
 *  fluxo de agendamento fica travado pela guarda em `sendBooking`. */
const PROGRAM_CALENDAR_ID: Record<string, string> = {
  beginners: PLACEHOLDER,
  adults: PLACEHOLDER,
  kids: PLACEHOLDER,
  nogi: PLACEHOLDER,
}

/** adults | kids, por turma. O `[ND] Primary Workflow` é o MESMO para todas as
 *  academias, e é este campo que a Condition dele usa para rotear. Sem ele o
 *  lead cai no branch `None` e não é classificado: não ganha tag, não abre
 *  oportunidade. Estava faltando no payload. */
const PROGRAM_AUDIENCE: Record<string, 'adults' | 'kids'> = {
  beginners: 'adults',
  adults: 'adults',
  kids: 'kids',
  nogi: 'adults',
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
      audience: PROGRAM_AUDIENCE[d.programId] ?? 'adults',
      submittedAt: new Date().toISOString(),
      source: SOURCE_LABEL,
      ...getAttribution(),
    }
  )

  /* O FLUXO COMPARTILHADO SÓ RECEBE QUANDO EXISTE CALENDÁRIO DE VERDADE.

     Sem esta guarda, ligar os dois identificadores do lead ligava os DOIS
     envios de uma vez, e o segundo caía no n8n de produção, que é compartilhado
     com todas as academias, carregando `calendar_id: "PLACEHOLDER"`. Do outro
     lado isso é um `No active calendar with id` e uma execução vermelha por
     lead, num fluxo que não é só desta unidade.

     A guarda é o próprio dado e não uma bandeira à parte: no dia em que os ids
     entrarem no mapa acima, o envio religa sozinho. */
  const calendarId = PROGRAM_CALENDAR_ID[d.programId]
  if (!calendarId || calendarId === PLACEHOLDER) {
    console.info(
      '[booking] lead enviado; agendamento NÃO enviado porque o programa ainda não tem calendar_id. Ver src/booking/webhook.ts'
    )
    return
  }

  /* Schema do fluxo compartilhado. Contrato crítico: não acrescentar campos. */
  post(N8N_BOOKING_URL, {
    parent_name: `${d.firstName.trim()} ${d.lastName.trim()}`.trim(),
    ...(child ? { child_name: child } : {}),
    email: d.email.trim(),
    phone: d.phone.trim(),
    calendar_id: calendarId,
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
