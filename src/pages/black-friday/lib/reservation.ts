import { RESERVE_HOURS, type Answer, type PrizeKey, type Who } from '@/pages/black-friday/data/campaign'

// Browser-side lock: once a gift is opened, the same prize and the same 48h
// deadline come back on every visit. The server-side check by phone (one gift
// per number, original deadline kept) is the source of truth; this only keeps
// the UI honest between visits.

const KEY = 'gbcbf26-reservation'

export interface Reservation {
  prize: PrizeKey
  who: Who
  answer: Answer
  openedAt: number
  expiresAt: number
}

export function loadReservation(): Reservation | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const r = JSON.parse(raw) as Reservation & { exp?: Answer }
    // Reservations saved before question 2 became the child's age kept it as `exp`.
    return { ...r, answer: r.answer ?? r.exp! }
  } catch {
    return null
  }
}

export function saveReservation(r: Pick<Reservation, 'prize' | 'who' | 'answer'>): Reservation {
  const openedAt = Date.now()
  const full = { ...r, openedAt, expiresAt: openedAt + RESERVE_HOURS * 3600_000 }
  try {
    localStorage.setItem(KEY, JSON.stringify(full))
  } catch {
    /* private mode: the reservation simply won't survive a reload */
  }
  return full
}

export function clearReservation() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
