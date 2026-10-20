import { toE164 } from './attribution'
import { client } from './config'
import type { Program } from './programs'
import { adsConversion, fbTrack, gaTrack, identify } from './tracking'
import type { Client } from './types'
import { sendLead, type BookingData } from './webhook'

/**
 * Webhook 1, then Lead (Pixel + CAPI), generate_lead and Ads Lead. Step 1 calls it; a page that
 * collects the contact itself calls it too and passes leadSent to the form.
 */
export function captureLead(data: BookingData, program: Program | null, source: string, extra?: Record<string, unknown>, c: Client = client) {
  const user = { name: data.fullName.trim(), email: data.email.trim(), phone: toE164(data.phone, c.academy.country) }
  const who = program?.audience ?? data.preferredAudience
  // Identify before the Lead fires, or Advanced Matching and Enhanced Conversions miss it.
  identify(user, c.tracking)
  sendLead(data, program, source, extra, c)
  fbTrack('Lead', { content_category: who }, user, c.tracking)
  gaTrack('generate_lead', { audience: who }, c.tracking)
  adsConversion(c.tracking.adsLeadLabel, c.tracking)
}
