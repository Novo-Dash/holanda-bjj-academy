// Campaign rules, identical in every academy. Per-academy data lives in ./academy.ts.
import { GIFT_MODE, PRIZES, SINGLE_PRIZE, type Prize } from './academy'

export { ACADEMY, CLASS_AGES, GIFTS_SUMMARY, IMAGES, KID_AGES, PRIZES, TRIAL, VSL, type Prize, type PrizeKey } from './academy'

export type Who = 'me' | 'kid' | 'both'
export type Exp = 'never' | 'little' | 'back'
/** A kids age group from academy.ts, "min-max". */
export type KidAge = string
/** Question 2: experience for an adult, the child's age for "My kid" and "Both of us". */
export type Answer = Exp | KidAge

export function pickPrize(who: Who, answer: Answer): Prize {
  if (GIFT_MODE === 'single') return PRIZES[SINGLE_PRIZE]
  if (who === 'kid') return PRIZES.kid
  if (who === 'both') return PRIZES.family
  return answer === 'back' ? PRIZES.adultBack : PRIZES.adultNew
}

export const RESERVE_HOURS = 48

/** CRM source of this page's leads (paid clicks still show as Meta / Google). */
export const SOURCE = 'Landing Page - Black Friday'
