import { useSyncExternalStore } from 'react'
import { sendKidsBooking, sendKidsLead } from '@/booking/webhook'
import { track, trackLead } from '@/lib/track'
import { loadKidsPrograms, programFor, type KidsProgram } from './programs'
import { afterPaint } from './motion'
import { quickCheck } from '../data/kids'

/**
 * O estado do formulário da Kids (PRD §11), UM só para a página inteira.
 *
 * O mesmo formulário aparece em dois lugares: em linha, no primeiro terço da
 * página (seção IV), e na folha inferior que os botões abaixo dela abrem. Os
 * dois leem e escrevem aqui, então nada é preenchido duas vezes, e quem começa
 * a digitar no inline e abre a folha encontra o que já digitou.
 *
 * As afirmações marcadas no Quick-check também moram aqui: elas viajam no lead
 * como `notes`.
 */

type Step = 1 | 2 | 3
type ProgramsState = 'idle' | 'loading' | 'ready' | 'error'
type Errors = Partial<Record<'name' | 'phone' | 'age' | 'day' | 'time', string>>

type BookingState = {
  step: Step
  name: string
  phone: string
  age: number | null
  /** A turma escolhida no passo 2. Nulo = a de kimono da idade. */
  calendarId: string | null
  day: string | null
  time: string | null
  honey: string
  errors: Errors
  booked: boolean
  programsState: ProgramsState
  programs: KidsProgram[]
  notes: string[]
  /** A mãe tocou na lista? Até lá as marcas são do preenchimento automático
      (a animação), e NÃO vão no lead. */
  notesTouched: boolean
  variant: string
}

let state: BookingState = {
  step: 1,
  name: '',
  phone: '',
  age: null,
  calendarId: null,
  day: null,
  time: null,
  honey: '',
  errors: {},
  booked: false,
  programsState: 'idle',
  programs: [],
  notes: [],
  notesTouched: false,
  variant: 'a',
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function setBooking(patch: Partial<BookingState>) {
  state = { ...state, ...patch }
  emit()
}

export function useBooking() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}

/** Formata enquanto digita: (508) 361-7778. */
export function formatPhone(raw: string) {
  const d = raw
    .replace(/\D/g, '')
    .replace(/^1(?=\d{10})/, '')
    .slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/* Primeiro toque no formulário: começa o relógio do anti-spam e o evento. */
let startedAt = 0
export function markStarted() {
  if (startedAt) return
  startedAt = Date.now()
  afterPaint(() => track('form_start'))
  void prefetchPrograms()
}

export function prefetchPrograms() {
  if (state.programsState === 'loading' || state.programsState === 'ready') return
  setBooking({ programsState: 'loading' })
  return loadKidsPrograms()
    .then((programs) => setBooking({ programs, programsState: 'ready' }))
    .catch(() => setBooking({ programsState: 'error' }))
}

export function toggleNote(id: string) {
  const notes = state.notes.includes(id) ? state.notes.filter((n) => n !== id) : [...state.notes, id]
  setBooking({ notes, notesTouched: true })
}

/** O preenchimento automático da lista (animação). Só enquanto a mãe não
    mexeu nela: depois do primeiro toque, a lista é dela. */
export function autoFillNotes(count: number) {
  if (state.notesTouched) return
  const ids = quickCheck.items.slice(0, count).map((i) => i.id)
  if (ids.length !== state.notes.length) setBooking({ notes: ids })
}

function notesText() {
  /* Marcas que vieram só da animação não são resposta da mãe. */
  if (!state.notesTouched) return ''
  return quickCheck.items
    .filter((i) => state.notes.includes(i.id))
    .map((i) => i.text)
    .join(' | ')
}

export function currentProgram() {
  if (!state.age) return null
  const chosen = state.calendarId && state.programs.find((p) => p.calendarId === state.calendarId)
  return chosen || programFor(state.programs, state.age)
}

/** Uma tentativa a cada 30 s por sessão (PRD §11.2). */
function rateLimited() {
  try {
    const last = Number(sessionStorage.getItem('hk_sent') || 0)
    if (Date.now() - last < 30_000) return true
    sessionStorage.setItem('hk_sent', String(Date.now()))
  } catch {
    /* sem storage, sem limite: melhor um lead a mais que um a menos */
  }
  return false
}

export function submitStep1(errors: { name: string; phone: string; age: string }) {
  const e: Errors = {}
  if (state.name.trim().length < 2) e.name = errors.name
  if (state.phone.replace(/\D/g, '').length !== 10) e.phone = errors.phone
  if (!state.age) e.age = errors.age
  if (Object.keys(e).length) {
    setBooking({ errors: e })
    return false
  }

  /* Robô: campo-armadilha preenchido ou envio em menos de 3 s. Ele "passa",
     para não aprender a contornar, e nada é enviado. */
  const bot = state.honey !== '' || (startedAt && Date.now() - startedAt < 3000)

  setBooking({ errors: {}, step: 2 })
  void prefetchPrograms()

  if (bot || rateLimited()) return true

  const program = currentProgram()
  afterPaint(() => {
    sendKidsLead({
      name: state.name,
      phone: state.phone,
      childAge: state.age!,
      program: program?.name ?? `Kids (age ${state.age})`,
      notes: notesText(),
      variant: state.variant,
    })
    trackLead({ audience: 'kids', child_age: state.age ?? undefined })
  })
  return true
}

export function submitStep2(errors: { day: string; time: string }) {
  const program = currentProgram()
  if (!program) return
  const e: Errors = {}
  if (!state.day) e.day = errors.day
  else if (!state.time) e.time = errors.time
  if (Object.keys(e).length) {
    setBooking({ errors: e })
    return
  }
  setBooking({ errors: {}, step: 3, booked: true })
  if (state.honey !== '') return
  afterPaint(() => {
    sendKidsBooking({
      name: state.name,
      phone: state.phone,
      childAge: state.age!,
      program: program.name,
      notes: notesText(),
      variant: state.variant,
      calendarId: program.calendarId,
      date: state.day!,
      time: state.time!,
    })
    track('trial_booked', { audience: 'kids', child_age: state.age ?? undefined, program: program.name })
  })
}

/** Sem horário (API fora ou turma cheia): conclui como lead, a academia liga. */
export function finishWithoutDay() {
  setBooking({ errors: {}, step: 3, booked: false })
}
