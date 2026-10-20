import { captureLead, type BookingData, type Program } from '@/nd'
import { CLASS_AGES, RESERVE_HOURS, SOURCE, type Answer, type Prize, type Who } from '@/pages/black-friday/data/campaign'

export interface Claim {
  name: string
  phone: string
  email: string
  who: Who
  answer: Answer
  prize: Prize
  expiresAt: number
}

export type Contact = Pick<BookingData, 'fullName' | 'email' | 'phone'>

const audienceOf = (who: Who): BookingData['preferredAudience'] => (who === 'me' ? 'adults' : who === 'kid' ? 'kids' : '')

/**
 * The claim is the lead: Webhook 1 to GHL with the gift, then Lead on Pixel + CAPI,
 * GA4 and Ads, through the same kit call as the main LP's step 1. The booking step
 * that follows gets `leadSent`, so nothing fires twice.
 * TODO(server): one gift per phone and the original 48h deadline still live in the
 * browser only (lib/reservation.ts); the GHL workflow should check the phone too.
 */
export function submitClaim(claim: Claim): Contact {
  const contact: Contact = { fullName: claim.name, email: claim.email, phone: claim.phone }
  const data: BookingData = {
    ...contact,
    childName: '',
    calendarId: '',
    date: '',
    time: '',
    preferredAudience: audienceOf(claim.who),
  }
  const ref = new URLSearchParams(window.location.search).get('ref')
  const extra = {
    campaign: 'black-friday-2026',
    tags: ['black-friday-2026', claim.prize.tag],
    bf_prize: claim.prize.title,
    bf_prize_tag: claim.prize.tag,
    bf_who: claim.who,
    bf_answer: claim.answer,
    bf_reserved_hours: RESERVE_HOURS,
    bf_reserved_until: new Date(claim.expiresAt).toISOString(),
    ...(ref ? { ref } : {}),
  }
  // The dev server never writes to the CRM; ?test on a deployed page does (real end-to-end test).
  if (import.meta.env.DEV) console.info('[bf lead, dev: not sent]', { ...data, ...extra })
  else captureLead(data, null, SOURCE, extra)
  return contact
}

/** Classes offered after the claim: the trainee's mats, and for kids only their age group. */
export function bookingFor(who: Who, answer: Answer): { audience: 'adults' | 'kids' | null; filter?: (p: Program) => boolean } {
  if (who === 'me') return { audience: 'adults' }
  const [lo, hi] = answer.split('-').map(Number)
  // Age range of a class: CLASS_AGES (academy.ts) when its GHL name has no ages, else read from the name.
  const rangeOf = (p: Program) => {
    const key = Object.keys(CLASS_AGES).find((k) => p.name.toLowerCase().includes(k.toLowerCase()))
    const m = (key ? CLASS_AGES[key] : p.name).match(/(\d+)\s*(?:-|–|to)\s*(\d+)/)
    return m ? [Number(m[1]), Number(m[2])] : null
  }
  const fitsAge = (p: Program) => {
    const r = rangeOf(p)
    return !r || (r[0] <= hi && r[1] >= lo)
  }
  if (who === 'kid') return { audience: 'kids', filter: fitsAge }
  return { audience: null, filter: (p) => p.audience === 'adults' || fitsAge(p) }
}

export function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export function isValidUSPhone(value: string): boolean {
  return value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').length === 10
}
