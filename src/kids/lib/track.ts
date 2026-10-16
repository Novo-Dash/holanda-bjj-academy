import { client } from '@/nd/config'
import { adsConversion, fbTrack, gaTrack, identify, type User } from '@/nd/tracking'

/**
 * Tracking da Kids, sobre o KIT PADRÃO da Novo Dash (src/nd), o mesmo que a
 * `/` usa desde o merge de 10/10. As tags (Pixel, GA4, Ads, Clarity) carregam
 * no bloco `nd:tracking` do kids/index.html; aqui só os eventos.
 *
 * Os eventos do funil são os MESMOS do formulário do kit (src/nd/Booking.tsx):
 *  - lead:      identify + Pixel `Lead` (com CAPI) + GA4 `generate_lead` + conversão de lead do Ads
 *  - agendou:   Pixel `Schedule` (com CAPI) + GA4 `trial_booked` + conversão de agendamento do Ads
 * Todo evento leva `page: 'kids'` e a variante da headline.
 */

type Params = Record<string, unknown>
let context: Params = {}

export function setTrackContext(params: Params) {
  context = { ...context, ...params }
}

/** Evento próprio da página (clique, toque, FAQ, VSL): só GA4. */
export function track(event: string, params: Params = {}) {
  gaTrack(event, { ...context, ...params })
}

export function trackView() {
  fbTrack('ViewContent', { content_name: 'Kids Program', ...context })
  gaTrack('view_content', { content_name: 'Kids Program', ...context })
}

export function trackLead(user: User, params: Params = {}) {
  /* identify pede e-mail; o formulário da Kids não pede (copy de 4 campos),
     então vai vazio e o Pixel casa por telefone e nome. */
  identify({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '' })
  fbTrack('Lead', { content_category: 'kids', ...context, ...params }, user)
  gaTrack('generate_lead', { audience: 'kids', ...context, ...params })
  adsConversion(client.tracking.adsLeadLabel)
}

export function trackBooked(user: User, params: Params = {}) {
  fbTrack('Schedule', { content_category: 'kids', ...context, ...params }, user)
  gaTrack('trial_booked', { audience: 'kids', ...context, ...params })
  adsConversion(client.tracking.adsBookedLabel)
}
