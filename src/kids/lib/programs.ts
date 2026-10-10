import { fetchPrograms, type Program } from '@/nd/programs'

/**
 * As turmas kids e os horários abertos, ao vivo, pelo KIT da Novo Dash
 * (`fetchPrograms('kids')`, src/nd/programs.ts): a mesma API que a `/`, o
 * Dárcio Kids e o Satori Kids usam, já com os horários aposentados e as
 * turmas escondidas do client.ts aplicados. Nada da lista é escrito à mão.
 *
 * Em 09/10/2026 a location da Holanda devolvia três calendários kids:
 *   Kids BJJ (Ages 4-6) · Kids BJJ (Ages 7-13) · Kids No-Gi (Ages 7-13)
 * A idade vem do nome do calendário ("Ages 4-6").
 */

export type KidsProgram = {
  calendarId: string
  /** Nome cru do GHL: é ele que viaja no lead. */
  name: string
  min: number
  max: number
  nogi: boolean
  /** "YYYY-MM-DD" -> ["HH:MM"], no fuso da academia. */
  slots: Record<string, string[]>
  /** O objeto do kit, para o envio do agendamento (src/nd/webhook.ts). */
  raw: Program
}

let inflight: Promise<KidsProgram[]> | null = null

/** Uma vez por sessão. Começa no ocioso depois do load, para o passo 2 abrir
    pronto. */
export function loadKidsPrograms(): Promise<KidsProgram[]> {
  inflight ??= fetchPrograms('kids')
    .then((all) =>
      all.flatMap((p) => {
        const ages = p.name.match(/(\d+)\s*[-–]\s*(\d+)/)
        if (p.audience !== 'kids' || !ages) return []
        return [
          {
            calendarId: p.calendar_id,
            name: p.name,
            min: Number(ages[1]),
            max: Number(ages[2]),
            nogi: /no[\s-]?gi/i.test(p.name),
            slots: p.slots,
            raw: p,
          },
        ]
      })
    )
    .catch((err) => {
      inflight = null
      throw err
    })
  return inflight
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
export { timeLabel } from '@/nd/programs'

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
