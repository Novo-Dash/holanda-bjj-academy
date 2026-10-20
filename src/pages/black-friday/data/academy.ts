// ════════════════════════════════════════════════════════════════════
// BLACK FRIDAY — ACADEMY DATA (Holanda BJJ Academy)
// The only data file that changes from one academy to the next (with
// ../theme.css for the look). Anything not confirmed by the client stays
// as `[… — TO CONFIRM]`; search for it before going live.
// ════════════════════════════════════════════════════════════════════

export const ACADEMY = {
  name: 'Holanda BJJ Academy',
  /** Short name on the voucher stamp. */
  short: 'Holanda BJJ',
  city: 'Framingham, MA',
  address: '47 Franklin Street, Framingham, MA 01702',
  /** Second address line on the map card (plaza, suite…); '' to hide. */
  plaza: '',
  phone: '(508) 361-7778',
  phoneHref: 'tel:+15083617778',
  /** Example in the claim form's phone field: the academy's area code. */
  phonePlaceholder: '(508) 555-0123',
  // src/data/site.ts: checked on the Google profile.
  googleRating: '5.0',
  googleReviews: 35,
  // GHL: Kids BJJ (Ages 4-6), Kids BJJ (Ages 7-13), Kids No-Gi (Ages 7-13). Written
  // "4 to 13", not with a dash: the house rule for this project's copy.
  kidsAges: '4 to 13',
  kidsMin: 4,
  // GHL: Adults BJJ All Levels, Adults No-Gi All Levels (no minimum age published).
  adultsAge: 'all levels',
  // Not maps.google.com/maps?q=…&output=embed: that is a 301 with X-Frame-Options (white box).
  mapsEmbed: 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s47+Franklin+Street,+Framingham,+MA+01702!6i16',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Holanda+BJJ+Academy+47+Franklin+Street+Framingham+MA+01702',
} as const

/** Real academy photos only (never stock). Paths are in the LP's public/. */
export const IMAGES = {
  /** Full-bleed hero background; darkened by the hero overlay. The main LP's hero: the academy mat. */
  hero: { src: '/hero.webp?v=2', position: '50% 55%', positionMobile: '42% 55%' },
  /** Logo that reads on a dark background (navbar + map card): the round torii badge, white ring. */
  logo: { src: '/logo.webp', width: 512, height: 512 },
  /** Question 1 cards. */
  me: { src: '/programs/adults.webp?v=2', position: '50% 30%' },
  kid: { src: '/programs/kids.webp', position: '50% 38%' },
  both: { src: '/kids/fc-5-800.webp', position: '45% 78%' },
}

/**
 * Question 2 for "My kid" / "Both of us": the academy's kids age groups.
 * `v` is "min-max" and filters the booking to classes whose name overlaps it.
 * GHL: Kids BJJ (Ages 4-6), Kids BJJ (Ages 7-13), Kids No-Gi (Ages 7-13).
 */
export const KID_AGES: { v: string; label: string; sub: string }[] = [
  { v: '4-6', label: '4 to 6', sub: 'Kids BJJ' },
  { v: '7-13', label: '7 to 13', sub: 'Gi or No-Gi' },
]

/**
 * Only when the academy's GHL class names carry no ages ("Tiny Champs", "Juniors"):
 * part of the class name → "min-max". Classes whose name already says "(5-6 Years)"
 * need nothing here.
 */
export const CLASS_AGES: Record<string, string> = {}

/** The trial on this page (no checkout here). */
export const TRIAL = { label: 'free trial class' } as const

/** Vertical (9:16) VSL. src null = the hero renders without the video block. [Black Friday VSL — TO CONFIRM] */
export const VSL: { src: string | null; poster: string | null; label: string } = {
  src: null,
  poster: null,
  label: 'See the mat before you step on it',
}

export type PrizeKey = 'kid' | 'family' | 'adultNew' | 'adultBack'

export interface Prize {
  key: PrizeKey
  pickedFor: string
  title: string
  detail: string
  /** GHL tag sent with the lead. */
  tag: string
}

/**
 * 'match'  → prize depends on the two answers (table below).
 * 'single' → client already has one defined offer: everyone gets SINGLE_PRIZE,
 *            the questions stay (qualification + game feel), no roulette ever.
 */
export const GIFT_MODE: 'match' | 'single' = 'match'
export const SINGLE_PRIZE: PrizeKey = 'kid'

// Holanda has not defined its Black Friday gifts yet: every prize and condition is TO CONFIRM with the client.
export const PRIZES: Record<PrizeKey, Prize> = {
  kid: {
    key: 'kid',
    pickedFor: 'Picked for your child',
    title: '[Kids gift — TO CONFIRM]',
    detail: '[Redemption terms — TO CONFIRM]',
    tag: 'bf26-premio-kimono-kids',
  },
  family: {
    key: 'family',
    pickedFor: 'Picked for your family',
    title: '[Family gift — TO CONFIRM]',
    detail: '[Redemption terms — TO CONFIRM]',
    tag: 'bf26-premio-familia',
  },
  adultNew: {
    key: 'adultNew',
    pickedFor: 'Picked for first-timers',
    title: '[Membership discount — TO CONFIRM]',
    detail: '[Redemption terms — TO CONFIRM]',
    tag: 'bf26-premio-mensalidade',
  },
  adultBack: {
    key: 'adultBack',
    pickedFor: 'Picked for returning athletes',
    title: '[Returning athlete gift — TO CONFIRM]',
    detail: '[Redemption terms — TO CONFIRM]',
    tag: 'bf26-premio-kimono-adulto',
  },
}

/** FAQ answer for "What gifts can I unlock?". */
export const GIFTS_SUMMARY =
  'It depends on who is training: kids, families, first-timers and returning athletes each get their own gift. [Gift list — TO CONFIRM]'
