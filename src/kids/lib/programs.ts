/**
 * As turmas kids e os horários abertos, ao vivo, da API de programas da Novo
 * Dash (o mesmo endpoint que o Dárcio Kids e o Satori Kids usam em produção).
 * Nada da lista é escrito à mão: turma nova, renomeada ou pausada no GHL
 * aparece no próximo carregamento.
 *
 * Em 09/10/2026 a location da Holanda devolvia três calendários kids:
 *   Kids BJJ (Ages 4-6) · Kids BJJ (Ages 7-13) · Kids No-Gi (Ages 7-13)
 * A idade da criança escolhe a turma de kimono (gi) da faixa dela. O no-gi não
 * entra na escolha automática [CONFIRMAR com o Adryan se entra como segunda
 * opção quando não houver horário no gi].
 */

const PROGRAMS_URL = 'https://clients.novodash.com/api/public/programs'
/* O mesmo id público que está em src/booking/webhook.ts. */
const LOCATION_ID = 'umbThmlnc77LC745O8FF'

export type KidsProgram = {
  calendarId: string
  /** Nome cru do GHL: é ele que viaja no lead. */
  name: string
  min: number
  max: number
  nogi: boolean
  /** "YYYY-MM-DD" -> ["HH:MM"], no fuso da academia. */
  slots: Record<string, string[]>
}

let inflight: Promise<KidsProgram[]> | null = null

/** Uma vez por sessão. Começa no ocioso depois do load, para o passo 2 abrir
    pronto. */
export function loadKidsPrograms(): Promise<KidsProgram[]> {
  inflight ??= fetchPrograms().catch((err) => {
    inflight = null
    throw err
  })
  return inflight
}

async function fetchPrograms(): Promise<KidsProgram[]> {
  const res = await fetch(`${PROGRAMS_URL}?location_id=${LOCATION_ID}`)
  if (!res.ok) throw new Error(`programs ${res.status}`)
  const data = (await res.json()) as { programs?: Array<Record<string, unknown>> }
  const out: KidsProgram[] = []
  for (const p of data.programs ?? []) {
    if (p.audience !== 'kids' || typeof p.calendar_id !== 'string' || typeof p.name !== 'string') continue
    const ages = p.name.match(/(\d+)\s*[-–]\s*(\d+)/)
    if (!ages) continue
    out.push({
      calendarId: p.calendar_id,
      name: p.name,
      min: Number(ages[1]),
      max: Number(ages[2]),
      nogi: /no[\s-]?gi/i.test(p.name),
      slots: normalize(p.slots),
    })
  }
  return out
}

/* Cada ISO traz o fuso da academia: corta o texto, nunca passa por Date
   (UTC mudaria o dia). */
function normalize(raw: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [day, value] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    const list = Array.isArray(value) ? value : (value as { slots?: unknown[] })?.slots
    if (!Array.isArray(list)) continue
    const times = list
      .filter((iso): iso is string => typeof iso === 'string' && iso.slice(0, 10) === day)
      .map((iso) => iso.slice(11, 16))
      .sort()
    if (times.length) out[day] = times
  }
  return out
}

/** A turma de kimono da idade. */
export function programFor(programs: KidsProgram[], age: number): KidsProgram | null {
  return programs.find((p) => !p.nogi && age >= p.min && age <= p.max) ?? null
}

/** Todas as turmas KIDS em que a criança cabe, a de kimono primeiro. É a
    lista que o passo 2 mostra (só turmas kids; adulto nunca aparece). */
export function programsFor(programs: KidsProgram[], age: number): KidsProgram[] {
  return programs.filter((p) => age >= p.min && age <= p.max).sort((a, b) => Number(a.nogi) - Number(b.nogi))
}

/** "Kids No-Gi (Ages 7-13)" -> "Kids No-Gi"; a idade vai à parte. */
export const shortName = (p: KidsProgram) => p.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()

/** Os próximos 14 dias com horário aberto. */
export function openDays(p: KidsProgram, limit = 14) {
  return Object.keys(p.slots)
    .sort()
    .slice(0, limit)
    .map((key) => ({ key, times: p.slots[key] }))
}

const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const weekday = (key: string) => parseKey(key).toLocaleDateString('en-US', { weekday: 'short' })
export const dayNum = (key: string) => parseKey(key).getDate()
export const month = (key: string) => parseKey(key).toLocaleDateString('en-US', { month: 'short' })
export const longDate = (key: string) =>
  parseKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
export { timeLabel } from '@/booking/webhook'

/** Arquivo .ics gerado no navegador, para o "Add to calendar" do obrigado. */
export function icsHref(dateKey: string, time: string, address: string) {
  const [h, m] = time.split(':').map(Number)
  const d = dateKey.replace(/-/g, '')
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = `${d}T${pad(h)}${pad(m)}00`
  const end = `${d}T${pad(h + 1)}${pad(m)}00`
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Holanda BJJ Academy//Kids//EN',
    'BEGIN:VEVENT',
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${end}`,
    'SUMMARY:Free kids jiu-jitsu class · Holanda BJJ Academy',
    `LOCATION:${address}`,
    'DESCRIPTION:Arrive 15 minutes early. T-shirt\\, shorts with no pockets or zippers\\, and a water bottle.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`
}
