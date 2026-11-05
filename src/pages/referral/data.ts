/* /referral content. The structure is the fleet's referral page (GB Melbourne, itself from
   GB Charleston; the same port 2002 Jiu Jitsu got): nav, hero + photo strip, flyer + form,
   rewards, rules, closing call, footer. Everything here is Holanda's own.

   The rewards are Mestre Holanda's (ClickUp "Artes para o Referral Program", 17twvjwzut5),
   and their pictures are cut from the approved A4 flyer of the same task
   (01-ReferralProgram-A4.png), so the page and the printed flyer show the same prizes. */

const r = (f: string) => `/referral/${f}`

/**
 * The Inbound Webhook trigger of the "Referral" workflow in Holanda's GHL sub-account (05/11/2026).
 * Swappable with VITE_REFERRAL_WEBHOOK_URL; the real URL stays as the fallback so a build without the
 * variable still sends. Each sub-account has its own URL: never copy this one to another academy.
 */
export const REFERRAL_WEBHOOK: string =
  import.meta.env.VITE_REFERRAL_WEBHOOK_URL ||
  'https://services.leadconnectorhq.com/hooks/umbThmlnc77LC745O8FF/webhook-trigger/AxgR3ebhbxpYSmLO7oGA'

/** The hero strip: real Holanda photos, classes and coaches (no empty mats). Since 05/11 the blurred video
 *  stills (and a repeated photo) gave way to the team photos from the client's Drive (02. Media / Foto das
 *  aulas, IMG_3043 to 3278), cropped to 3:2 and shown as wide cards between the portraits. */
export const GALLERY: { src: string; wide?: boolean }[] = [
  { src: r('strip-01.webp') },
  { src: r('team-01.webp'), wide: true },
  { src: r('strip-03.webp') },
  { src: r('team-02.webp'), wide: true },
  { src: r('strip-05.webp') },
  { src: r('team-03.webp'), wide: true },
  { src: r('strip-07.webp') },
  { src: r('team-04.webp'), wide: true },
  { src: r('strip-04.webp') },
  { src: r('team-05.webp'), wide: true },
  { src: r('strip-10.webp') },
  { src: r('team-06.webp'), wide: true },
  { src: r('strip-11.webp') },
]

/** The flyer panel: the team outdoors, the "bring a friend" picture. */
export const FLYER_PHOTO = r('flyer.webp')
export const FINAL_PHOTO = r('final.webp')

export type Reward = {
  pts: number
  label: string
  /** the line under the name (from the flyer) */
  note: string
  img: string
  /** the two big cards: ink for the grand prize, red for the top reward */
  big?: 'ink' | 'red'
  tag?: string
}

/** Ascending: the ladder, the meter and the cards all read in this order. */
export const REWARDS: Reward[] = [
  { pts: 100, label: 'T-shirt', note: 'Official Holanda BJJ tee', img: r('reward-shirt-cut.webp') },
  { pts: 200, label: 'Rash guard', note: 'Official team rash guard', img: r('reward-rashguard-cut.webp') },
  { pts: 300, label: 'No-gi shorts', note: 'Official fight shorts', img: r('reward-shorts-cut.webp') },
  { pts: 500, label: 'Official gi', note: 'The Holanda team kimono', img: r('reward-gi-cut.webp') },
  { pts: 800, label: 'PS5 or 65" TV', note: 'PlayStation 5 or a 65-inch smart TV. Your pick.', img: r('reward-ps5-tv.webp'), big: 'ink', tag: 'Grand prize' },
  { pts: 1500, label: 'iPhone 18 Pro', note: '256GB. The ultimate reward for the ultimate training partner.', img: r('reward-iphone.webp'), big: 'red', tag: 'Top reward' },
]

export const TOP_POINTS = REWARDS[REWARDS.length - 1].pts

/**
 * The fleet's referral rules (Melbourne / Charleston / 2002), TO CONFIRM with Holanda. Left out on
 * purpose, as in 2002: Melbourne's "Program Duration" (its own dates) and a reward for the new member
 * (Holanda's list has none; the flyer's "[YOUR OFFER] in the first month" is still a placeholder).
 */
export const RULES = [
  { title: 'Eligibility', text: 'All current members in good standing are eligible to participate in the referral program.' },
  { title: 'Referral verification', text: "Referrals must be verified by having the new member provide the referrer's name upon signing up, or by submitting a referral form available at the academy or online." },
  { title: 'Qualifying referral', text: 'A referral qualifies once the new member has signed up for a membership and has made their first payment.' },
  { title: 'Reward distribution', text: 'Rewards are distributed monthly. Rewards are subject to availability, and models may vary.' },
  { title: 'No limits', text: 'There are no limits to the number of referrals a current member can make, but rewards will be capped monthly.' },
  { title: 'Referral tracking', text: 'Participants are responsible for ensuring their referrals are tracked properly. The academy may provide an online dashboard or regular updates.' },
  { title: 'Fair play', text: 'Any attempts to game the system may result in disqualification from the program.' },
]
