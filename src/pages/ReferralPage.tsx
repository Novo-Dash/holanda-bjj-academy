import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { client } from '@/nd/config'
import { formatPhone, prefillFromUrl, toE164 } from '@/nd/attribution'
import { adsConversion, fbTrack, gaTrack, identify } from '@/nd/tracking'
import { Button } from '@/components/ui/button'
import { SectionHead } from '@/components/paper'
import { Reveal } from '@/components/reveal'
import { Phone } from '@/components/icons'
import { Wordmark } from '@/components/mark'
import { site } from '@/data/site'
import { cn } from '@/lib/utils'
import { FINAL_PHOTO, FLYER_PHOTO, GALLERY, REFERRAL_WEBHOOK, REWARDS, RULES, TOP_POINTS, type Reward } from './referral/data'
import './referral/referral.css'

/**
 * /referral (05/11/2026): the fleet's referral page (GB Melbourne's, in the same order 2002 Jiu Jitsu
 * got it: nav, hero + photo strip, flyer + form, rewards, rules, closing call, footer), in Holanda's
 * identity. Built from the main page's own parts (SectionHead, Button, Reveal, Wordmark, the pill nav,
 * the footer's markup), so the two pages read as one academy.
 *
 * What is Holanda's own: the rewards in the approved flyer's pictures and order (four tiers, then the
 * two big prizes), each with its points counting up and a bar for where it sits on the way to 1,500.
 * Since 05/11 (Adryan) the hero, the form, the rewards and the rules are white, and the hero has no
 * points card: the copy, centred, over the photo strip.
 *
 * The form follows the fleet's referral contract (GB Charleston's form): ONE POST, JSON, to the
 * Inbound Webhook of the "Referral" workflow in Holanda's GHL (REFERRAL_WEBHOOK in ./referral/data),
 * with exactly 11 keys: source "Referral", referrer_name, referrer_email, name, email, phone (E.164) and
 * the five utm_* read from the URL when the page loads ("" when absent). Only when GHL answers 2xx do
 * the conversions fire, and they identify the REFERRED FRIEND (the lead in the CRM), not the referrer:
 * Lead (Pixel + CAPI), generate_lead and the Ads Lead. No Supabase, no second webhook.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const toForm = () => document.getElementById('referral-form')?.scrollIntoView({ behavior: 'smooth' })
const toRewards = () => document.getElementById('rewards')?.scrollIntoView({ behavior: 'smooth' })
const fmt = (n: number) => n.toLocaleString('en-US')
const EASE = [0.22, 1, 0.36, 1] as const

/* ── one number that runs up to its value the first time it is seen ── */
function useCountUp(target: number, ms = 1400) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // 0 on the server and on the first client frame alike (prerender); the effect jumps to the target when motion is off
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) { setN(target); return }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.max(0, Math.min(1, (t - t0) / ms))
        setN(Math.round(target * (1 - Math.pow(1 - k, 3))))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [target, ms, reduce])
  return [ref, n] as const
}

/* ── the pill of the nav (nav.tsx's Pill: the ink disc rises from below and the label rolls up) ── */
function Pill({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      {...(href ? { href } : { type: 'button' as const, onClick })}
      className="group/pill label relative isolate flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-paper px-5 text-ink no-underline"
    >
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 -z-10 block aspect-square w-[220%] -translate-x-1/2 translate-y-1/2 scale-0 rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:scale-100 group-focus-visible/pill:scale-100 motion-reduce:transition-none" />
      <span className="relative block overflow-hidden">
        <span className="flex items-center gap-2 transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:-translate-y-full group-focus-visible/pill:-translate-y-full motion-reduce:transition-none">{children}</span>
        <span aria-hidden="true" className="absolute inset-0 flex translate-y-full items-center gap-2 text-paper transition-transform duration-500 ease-[var(--ease-club)] group-hover/pill:translate-y-0 group-focus-visible/pill:translate-y-0 motion-reduce:transition-none">{children}</span>
      </span>
    </Tag>
  )
}

function Nav() {
  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-4 z-50 px-4 sm:px-5 lg:top-5"
    >
      <div className="flex items-center justify-between gap-2.5 lg:mx-auto lg:w-max lg:justify-center">
        <a href="/" aria-label={`${site.name}, main page`} className="block h-[4.5rem] w-[4.5rem] shrink-0">
          <img src="/logo-160.webp" srcSet="/logo-160.webp 160w, /logo.webp 512w" sizes="72px" alt="" width={512} height={512} className="h-full w-full select-none object-contain" draggable={false} />
        </a>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden rounded-full bg-ink p-[3px] shadow-lift sm:block">
            <Pill href={site.phoneHref}><Phone className="h-4 w-4" /><span className="tnum">{site.phone}</span></Pill>
          </div>
          <div className="rounded-full bg-ink p-[3px] shadow-lift">
            <Pill onClick={toForm}>Refer a friend</Pill>
          </div>
        </div>
      </div>
    </motion.header>
  )
}


/* ── the form ── */
type Values = { referrer_name: string; referrer_email: string; name: string; email: string; phone: string }
type Status = { kind: 'idle' | 'pending' | 'success' | 'error'; message: string }
const EMPTY: Values = { referrer_name: '', referrer_email: '', name: '', email: '', phone: '' }

function Field({ id, label, value, onChange, error, type = 'text', autoComplete, inputMode, placeholder, maxLength }: {
  id: keyof Values; label: string; value: string; onChange: (v: string) => void; error?: string; type?: string
  autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; placeholder?: string; maxLength?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`rf-${id}`} className="label text-ink-soft">{label}</label>
      <input
        id={`rf-${id}`} name={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder} maxLength={maxLength}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `rf-${id}-error` : undefined}
        className={cn(
          'h-14 w-full rounded-inner border bg-paper px-4 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/50',
          'focus:border-red focus:shadow-[0_0_0_4px_rgb(var(--accent-rgb)/0.12)]',
          error ? 'border-red' : 'border-line-strong hover:border-ink-soft/60'
        )}
      />
      {error ? <p id={`rf-${id}-error`} className="text-[0.82rem] font-medium text-red">{error}</p> : null}
    </div>
  )
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-3">
      <span className="tnum rounded-inner bg-red px-2 py-1 font-sans text-[0.62rem] font-bold leading-none tracking-[0.08em] text-paper">{children === 'Your details' ? 'I' : 'II'}</span>
      <span className="label text-ink">{children}</span>
      <span className="h-px flex-1 bg-line-strong" />
    </p>
  )
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
type Utms = Record<(typeof UTM_KEYS)[number], string>
/** The five UTMs as the page loaded with them; "" when one is missing, never undefined or null. */
function readUtms(): Utms {
  let q: URLSearchParams
  try { q = new URLSearchParams(window.location.search) } catch { q = new URLSearchParams() }
  return Object.fromEntries(UTM_KEYS.map((k) => [k, q.get(k) ?? ''])) as Utms
}

function ReferralForm({ initial }: { initial: Partial<Values> }) {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' })
  // captured once, on load; re-applied after every successful send (they never leave this state).
  // Read after mount: the prerendered HTML has them empty, and the first client render must match it.
  const [utms, setUtms] = useState<Utms>(() => Object.fromEntries(UTM_KEYS.map((k) => [k, ''])) as Utms)
  useEffect(() => { setUtms(readUtms()) }, [])
  // the member's own details from a GHL email link, once the page is in the browser
  useEffect(() => {
    const fill = Object.fromEntries(Object.entries(initial).filter(([, v]) => v)) as Partial<Values>
    if (Object.keys(fill).length) setValues((p) => ({ ...p, ...fill }))
  }, [initial])
  const set = (k: keyof Values, v: string) => setValues((p) => ({ ...p, [k]: v }))

  const validate = () => {
    const e: Partial<Record<keyof Values, string>> = {}
    if (!values.referrer_name.trim()) e.referrer_name = 'Please enter your name.'
    if (!EMAIL_RE.test(values.referrer_email.trim())) e.referrer_email = 'Please enter a valid email address.'
    if (!values.name.trim()) e.name = "Please enter your friend's name."
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Please enter a valid email address.'
    if (values.phone.replace(/\D/g, '').length !== 10) e.phone = 'Please enter a valid 10-digit US phone number.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (status.kind === 'pending' || !validate()) return
    // Fleet rule: no webhook, no send. Never post to an empty address.
    if (!REFERRAL_WEBHOOK) {
      setStatus({ kind: 'error', message: `We could not send your referral right now. Please call us at ${site.phone}.` })
      return
    }
    const phone = `+1${values.phone.replace(/\D/g, '')}`
    // the contract: these 11 keys, nothing else
    const payload = {
      source: 'Referral',
      referrer_name: values.referrer_name.trim(),
      referrer_email: values.referrer_email.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
      phone,
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: utms.utm_content,
      utm_term: utms.utm_term,
    }
    setStatus({ kind: 'pending', message: 'Sending…' })
    try {
      const res = await fetch(REFERRAL_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        setStatus({ kind: 'error', message: `Something went wrong. Please try again. (HTTP ${res.status})` })
        return
      }
      // The friend is the lead: identify them before the Lead fires (Advanced Matching, Enhanced Conversions).
      const friend = { name: payload.name, email: payload.email, phone: toE164(phone) }
      identify(friend)
      fbTrack('Lead', { content_category: 'referral' }, friend)
      gaTrack('generate_lead', { form: 'referral' })
      adsConversion(client.tracking.adsLeadLabel)
      setStatus({ kind: 'success', message: 'Thank you! Your referral was sent. Your friend will hear from us shortly.' })
      setValues(EMPTY)
      setErrors({})
    } catch {
      setStatus({ kind: 'error', message: 'Something went wrong. Please try again. (network error)' })
    }
  }

  const pending = status.kind === 'pending'
  return (
    <form onSubmit={submit} noValidate className="plate flex h-full flex-col gap-5 p-6 shadow-plate sm:p-9">
      <div>
        <h2 className="display type-section text-ink">Refer a friend</h2>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">Send us your friend&apos;s details and we&apos;ll invite them for a free trial class.</p>
      </div>
      <input type="hidden" name="source" value="Referral" />
      {UTM_KEYS.map((k) => <input key={k} type="hidden" name={k} value={utms[k]} />)}

      <Divider>Your details</Divider>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="referrer_name" label="Your name" value={values.referrer_name} onChange={(v) => set('referrer_name', v)} error={errors.referrer_name} autoComplete="name" placeholder="John Doe" />
        <Field id="referrer_email" label="Your email" type="email" value={values.referrer_email} onChange={(v) => set('referrer_email', v)} error={errors.referrer_email} autoComplete="email" inputMode="email" placeholder="john@example.com" />
      </div>

      <Divider>Friend&apos;s details</Divider>
      <Field id="name" label="Friend's name" value={values.name} onChange={(v) => set('name', v)} error={errors.name} autoComplete="off" placeholder="Mike Smith" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Friend's email" type="email" value={values.email} onChange={(v) => set('email', v)} error={errors.email} autoComplete="off" inputMode="email" placeholder="mike@example.com" />
        <Field id="phone" label="Friend's phone" type="tel" value={values.phone} onChange={(v) => set('phone', formatPhone(v))} error={errors.phone} autoComplete="off" inputMode="tel" placeholder="(555) 123-4567" maxLength={14} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full disabled:opacity-70">
        {pending ? 'Sending…' : 'Send referral'}
      </Button>

      <div aria-live="polite" role="status" className={cn(
        'rounded-inner text-[0.92rem] leading-relaxed transition-colors',
        status.kind === 'success' && 'border border-ink/10 bg-paper-2 px-4 py-3 text-ink',
        status.kind === 'error' && 'border border-red/40 bg-red-soft px-4 py-3 text-red-deep',
        (status.kind === 'idle' || status.kind === 'pending') && 'sr-only'
      )}>{status.message}</div>
    </form>
  )
}

/* ── the flyer panel: the program at a glance, next to the form ── */
function Flyer() {
  return (
    <aside className="relative isolate flex min-h-[34rem] flex-col justify-between lg:h-full lg:min-h-0 overflow-hidden rounded-plate bg-ink text-paper shadow-lift" aria-label="Referral program at a glance">
      <img src={FLYER_PHOTO} alt={`The ${site.name} team together outdoors`} width={640} height={1138} loading="lazy" decoding="async" className="rf-flyer__photo absolute inset-0 -z-20 h-full w-full object-cover" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/35 to-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[6px] rounded-[calc(var(--radius-plate)-4px)] border border-paper/20" />

      <div className="flex items-center justify-between p-7">
        <Wordmark invert />
        <span className="label hidden text-paper/70 min-[420px]:inline">Referral program</span>
      </div>

      <div className="p-7 pt-24">
        <p className="display text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.92]">Refer a friend.<br /><span className="mark">Earn rewards.</span></p>
        <ul className="mt-7 grid grid-cols-2 gap-x-6 border-t border-paper/20 pt-5 sm:grid-cols-3">
          {REWARDS.map((r) => (
            <li key={r.pts} className="flex flex-col gap-1 border-b border-paper/10 py-2.5">
              <span className="display text-[1.6rem] leading-none tracking-[-0.01em] text-paper">{fmt(r.pts)}<span className="label ml-1.5 text-[0.55rem] text-paper/55">pts</span></span>
              <span className="text-[0.82rem] text-paper/75">{r.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

/* ── THE PHOTO STRIP: one track, the photos twice, drifting left forever. Grab it and throw it: the drag
   moves it, the release keeps the speed and eases back into the drift. It stops under the cursor; on
   phones the swipe is horizontal only, so the page still scrolls up and down over it ── */
function PhotoStrip() {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const strip = [...GALLERY, ...GALLERY]
  useEffect(() => {
    const w = wrap.current!, el = track.current!
    const DRIFT = reduce ? 0 : -0.05 // px per ms
    let x = 0, v = 0, prev = performance.now(), raf = 0
    let drag = false, hover = false, moved = 0, lastX = 0, lastT = 0, visible = true
    const half = () => (el.scrollWidth + parseFloat(getComputedStyle(el).columnGap || '0')) / 2
    const tick = (t: number) => {
      const dt = Math.min(48, t - prev); prev = t
      if (!drag) {
        x += (v + (hover ? 0 : DRIFT)) * dt
        v *= Math.pow(0.94, dt / 16)
        if (Math.abs(v) < 0.005) v = 0
      }
      const h = half()
      if (h > 0) { while (x <= -h) x += h; while (x > 0) x -= h }
      el.style.transform = `translate3d(${x}px,0,0)`
      raf = visible ? requestAnimationFrame(tick) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) { prev = performance.now(); raf = requestAnimationFrame(tick) }
    })
    io.observe(w)
    raf = requestAnimationFrame(tick)

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      drag = true; moved = 0; v = 0; lastX = e.clientX; lastT = performance.now()
      w.classList.add('is-dragging')
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      const now = performance.now(), dx = e.clientX - lastX
      if (Math.abs(dx) > 0 && moved < 6 && Math.abs(moved + dx) >= 6) { try { w.setPointerCapture(e.pointerId) } catch { /* ok */ } }
      moved += Math.abs(dx); x += dx
      v = dx / Math.max(1, now - lastT)
      lastX = e.clientX; lastT = now
    }
    const up = () => { if (!drag) return; drag = false; w.classList.remove('is-dragging'); v = Math.max(-3, Math.min(3, v)) }
    // a drag is not a click on a photo
    const click = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation() } }
    const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hover = true }
    const leave = () => { hover = false }
    w.addEventListener('pointerdown', down)
    w.addEventListener('pointermove', move)
    w.addEventListener('pointerup', up)
    w.addEventListener('pointercancel', up)
    w.addEventListener('lostpointercapture', up)
    w.addEventListener('click', click, true)
    w.addEventListener('pointerenter', enter)
    w.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      w.removeEventListener('pointerdown', down); w.removeEventListener('pointermove', move)
      w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up)
      w.removeEventListener('lostpointercapture', up); w.removeEventListener('click', click, true)
      w.removeEventListener('pointerenter', enter); w.removeEventListener('pointerleave', leave)
    }
  }, [reduce])
  return (
    <div ref={wrap} className="rf-strip relative pb-16 md:pb-20">
      <div ref={track} className="rf-strip__track">
        {strip.map((g, i) => (
          <div key={i} className={cn('rf-strip__card', g.wide && 'rf-strip__card--wide')} aria-hidden={i >= GALLERY.length || undefined}>
            <img src={g.src} alt={i < GALLERY.length ? (g.wide ? `The ${site.name} team on the mat, photo ${i + 1}` : `Training at ${site.name}, photo ${i + 1}`) : ''} width={g.wide ? 1200 : 400} height={g.wide ? 800 : 500} loading="lazy" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── the rewards: the points lead each card, the prize stands on the flyer's beige with a soft floor
   shadow, and a bar shows how far up the 1,500 ladder it sits (it fills as the points count up) ── */
function Ladder({ n, dark = false }: { n: number; dark?: boolean }) {
  return (
    <span className="rf-ladder" aria-hidden="true" data-dark={dark || undefined}>
      <span className="rf-ladder__track"><span className="rf-ladder__fill" style={{ width: `${(n / TOP_POINTS) * 100}%` }} /></span>
    </span>
  )
}

function Tier({ r, i }: { r: Reward; i: number }) {
  const [ref, n] = useCountUp(r.pts, 1100 + i * 120)
  return (
    <Reveal gesture="settle" delay={i * 0.07} as="li" className="h-full">
      <article className="rf-tier group">
        <header className="flex items-start justify-between gap-2">
          <p className="flex items-baseline gap-1.5">
            <span ref={ref as React.RefObject<HTMLSpanElement>} className="display text-[2.4rem] leading-[0.8] tracking-[-0.01em] text-red sm:text-[3.4rem]">{fmt(n)}</span>
            <span className="label text-[0.6rem] text-ink-soft">pts</span>
          </p>
          <span className="rf-tier__no label tnum">{String(i + 1).padStart(2, '0')}</span>
        </header>
        <div className="rf-tier__stage">
          <img src={r.img} alt={`${site.name} ${r.label.toLowerCase()}`} width={460} height={315} loading="lazy" decoding="async" className="rf-tier__img" />
          <span className="rf-tier__floor" aria-hidden="true" />
        </div>
        <div className="mt-auto">
          <h3 className="display text-[1.35rem] leading-none text-ink sm:text-[1.9rem]">{r.label}</h3>
          <p className="mt-1.5 text-[0.78rem] leading-snug text-ink-soft sm:text-[0.86rem]">{r.note}</p>
          <Ladder n={n} />
        </div>
      </article>
    </Reveal>
  )
}

function BigPrize({ r, no }: { r: Reward; no: string }) {
  const [ref, n] = useCountUp(r.pts, 1500)
  const red = r.big === 'red'
  return (
    <Reveal gesture="settle" delay={red ? 0.1 : 0} as="li" className="h-full">
      <article className={cn(
        'rf-big group relative isolate grid h-full min-h-[22rem] grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] overflow-hidden rounded-plate text-paper shadow-lift',
        red ? 'rf-big--red' : 'rf-big--ink'
      )}>
        <span aria-hidden="true" className="pointer-events-none absolute inset-[6px] rounded-[calc(var(--radius-plate)-4px)] border border-paper/15" />
        <span aria-hidden="true" className="display stroke-word stroke-word-light pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] -z-10 text-[clamp(9rem,16vw,14rem)] leading-none">{no}</span>
        <div className="relative flex flex-col p-6 sm:p-8">
          <span className={cn('label self-start rounded-full px-3 py-1.5', red ? 'bg-paper text-red' : 'bg-paper text-ink')}>{no} · {r.tag}</span>
          <p className="mt-6 flex items-baseline gap-2">
            <span ref={ref as React.RefObject<HTMLSpanElement>} className="display text-[clamp(4rem,7vw,6rem)] leading-[0.8] tracking-[-0.01em]">{fmt(n)}</span>
            <span className="label text-paper/70">pts</span>
          </p>
          <h3 className="display mt-auto pt-8 text-[clamp(2.2rem,3.6vw,3.2rem)] leading-[0.9]">{r.label}</h3>
          <p className="mt-3 max-w-[26ch] text-[0.92rem] leading-relaxed text-paper/80">{r.note}</p>
          <Ladder n={n} dark />
        </div>
        <div className="relative flex items-end justify-center">
          <img src={r.img} alt={r.label} width={red ? 492 : 432} height={red ? 632 : 570} loading="lazy" decoding="async" className="rf-big__img h-auto max-h-[20rem] w-full max-w-[17rem] object-contain object-bottom transition-transform duration-700 ease-[var(--ease-club)] group-hover:-translate-y-2 group-hover:rotate-[-1.5deg]" />
        </div>
      </article>
    </Reveal>
  )
}

/* ── the rules: numbered rows on white; the open one turns red, its text white (05/11) ── */
function Rules() {
  const [open, setOpen] = useState(0)
  const uid = useId()
  return (
    <ul className="mx-auto mt-12 flex max-w-4xl flex-col gap-2">
      {RULES.map((item, i) => {
        const isOpen = open === i
        return (
          <Reveal key={item.title} gesture="rise" delay={Math.min(i, 4) * 0.05} as="li">
            <div className={cn('rf-rule overflow-hidden rounded-plate', isOpen && 'is-open')}>
              <h3 className="m-0">
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`${uid}-${i}`} className="rf-rule__head">
                  <span aria-hidden="true" className="rf-rule__no display">{String(i + 1).padStart(2, '0')}</span>
                  <span className="rf-rule__title display">{item.title}</span>
                  <span aria-hidden="true" className="rf-rule__icon">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`${uid}-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                    <p className="rf-rule__text">{item.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        )
      })}
    </ul>
  )
}

/* ── the footer: footer.tsx's markup; the "Explore" column points inside this page ── */
function Footer() {
  const links = [
    { label: 'Refer a friend', href: '#referral-form' },
    { label: 'The rewards', href: '#rewards' },
    { label: 'How it works', href: '#rules' },
    { label: 'Main site', href: '/' },
  ]
  const item = 'inline-block py-1.5 text-paper/85 no-underline hover:text-paper max-lg:inline-flex max-lg:min-h-11 max-lg:items-center'
  return (
    <footer className="bg-ink text-paper">
      <div className="shell">
        <div className="rule-double-dark" />
        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark invert />
            <p className="mt-6 max-w-[34ch] text-[0.88rem] leading-relaxed text-paper/60">
              Beginner-friendly Brazilian jiu-jitsu in the middle of {site.city}, {site.stateLong}. Bring a friend to the mats and get rewarded for it.
            </p>
          </div>
          <div>
            <p className="label text-paper/55">The program</p>
            <ul className="mt-4 flex flex-col gap-2 text-[0.88rem] text-paper/85">
              {REWARDS.map((r) => <li key={r.pts}><span className="tnum">{fmt(r.pts)}</span> pts <span className="text-paper/55">· {r.label}</span></li>)}
            </ul>
          </div>
          <div>
            <p className="label text-paper/55">Explore</p>
            <ul className="mt-3 flex flex-col text-[0.88rem]">
              {links.map((l) => <li key={l.href}><a href={l.href} className={item}>{l.label}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="label text-paper/55">Visit us</p>
            <address className="mt-4 not-italic text-[0.88rem] leading-relaxed text-paper/85">
              {site.address.line1}<br />{site.address.line2}{site.address.zip ? ` ${site.address.zip}` : ''}
            </address>
            <a href={site.mapsDirections} target="_blank" rel="noreferrer" className="label mt-3 inline-flex items-center gap-3 py-1.5 text-paper/85 no-underline hover:text-paper max-lg:min-h-11">
              Get directions<span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
            </a>
            <p className="mt-4 text-[0.88rem]">
              <a href={site.phoneHref} className={cn('tnum', item)}>{site.phone}</a><br />
              {site.email ? <a href={`mailto:${site.email}`} className={item}>{site.email}</a> : null}
            </p>
          </div>
        </div>
        <div className="rule-double-dark" />
        <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-paper/50">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5 text-[0.78rem]">
            <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="inline-block py-1.5 text-paper/60 no-underline hover:text-paper max-lg:inline-flex max-lg:min-h-11 max-lg:items-center">{site.socials.instagramHandle}</a>
            <span className="text-paper/40">Built by Novo Dash</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function ReferralPage() {
  // A member arriving from a GHL email link carries their own contact in the URL: it fills "Your
  // details", then leaves the URL (it is the member's, not something to keep in the address bar).
  const [initial, setInitial] = useState<Partial<Values>>({})
  useEffect(() => {
    try {
      const p = prefillFromUrl()
      if (p.fullName || p.email) setInitial({ referrer_name: p.fullName, referrer_email: p.email })
    } catch { /* never break the page */ }
    try {
      const u = new URL(window.location.href)
      let changed = false
      for (const k of ['full_name', 'email', 'phone']) if (u.searchParams.has(k)) { u.searchParams.delete(k); changed = true }
      if (changed) window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash)
    } catch { /* never break the page */ }
  }, [])

  // The top of this page's funnel (the denominator for the Lead fired on submit).
  useEffect(() => {
    fbTrack('ViewContent', { content_name: 'Referral' })
    gaTrack('view_content', { content_name: 'Referral' })
  }, [])

  const tiers = REWARDS.filter((r) => !r.big)
  const bigs = REWARDS.filter((r) => r.big)

  return (
    <div className="paper-grain">
      <a href="#referral-form" className="skip-link">Skip to the referral form</a>
      <Nav />

      <main>
        {/* ── HERO ── */}
        {/* white since 05/11 (Adryan): no photo behind the copy; the photos are the strip below */}
        <section id="top" className="relative isolate overflow-hidden bg-white pt-28 md:pt-32">
          <div className="shell relative">
            <div className="pb-14 pt-6 lg:pb-20">
              <div className="mx-auto max-w-4xl text-center">
                <Reveal gesture="rise">
                  <p className="label inline-flex items-center gap-2.5 text-ink-soft">
                    <span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
                    For members · Referral program
                  </p>
                </Reveal>
                <h1 className="display type-hero mt-6 text-ink">
                  <Reveal gesture="veil" as="span" className="block">Bring a friend.{' '}</Reveal>
                  <Reveal gesture="veil" delay={0.08} as="span" className="block">Earn points.{' '}</Reveal>
                  <Reveal gesture="veil" delay={0.16} as="span" className="block"><span className="mark">Get rewards.</span></Reveal>
                </h1>
                <Reveal gesture="rise" delay={0.3}>
                  <p className="type-body mx-auto mt-8 max-w-[50ch] leading-relaxed text-ink-soft">
                    Jiu-jitsu is better with someone you trust beside you on the mat. Refer a friend, earn points, and trade them for real rewards, all the way up to a new iPhone.
                  </p>
                </Reveal>
                <Reveal gesture="rise" delay={0.42}>
                  <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button size="lg" onClick={toForm}>Refer a friend</Button>
                    <Button size="lg" variant="quiet" withCaret={false} onClick={toRewards}>See the rewards</Button>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* infinite photo strip: it drifts left on its own, and can be dragged both ways */}
          <PhotoStrip />
        </section>

        {/* ── FLYER + FORM ── */}
        <section id="referral-form" className="band relative scroll-mt-6 bg-white">
          <div className="shell">
            <SectionHead stroke="Refer" title="Send us their name. We do the rest." large aside={<p className="type-body leading-relaxed text-ink-soft">Your friend gets an invitation for a free trial class. When they join, the points are yours.</p>} />
            <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
              <Reveal gesture="settle" className="h-full"><Flyer /></Reveal>
              <Reveal gesture="settle" delay={0.08} className="h-full"><ReferralForm initial={initial} /></Reveal>
            </div>
          </div>
        </section>

        {/* ── REWARDS ── */}
        <section id="rewards" className="band relative scroll-mt-6 bg-white">
          <div className="shell">
            <SectionHead stroke="Rewards" title="Earn these rewards." large aside={<p className="type-body leading-relaxed text-ink-soft">The more friends, the bigger the prize. Every friend who joins gets you closer to the next one.</p>} />
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {tiers.map((r, i) => <Tier key={r.pts} r={r} i={i} />)}
            </ul>
            <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {bigs.map((r, i) => <BigPrize key={r.pts} r={r} no={String(tiers.length + i + 1).padStart(2, '0')} />)}
            </ul>
            <p className="label mt-6 text-center text-ink-soft">Rewards subject to availability. Models may vary.</p>
          </div>
        </section>

        {/* ── RULES ── */}
        <section id="rules" className="band relative scroll-mt-6 bg-white">
          <div className="shell">
            <SectionHead stroke="Rules" title="How it works." center large />
            <Rules />
          </div>
        </section>

        {/* ── CLOSING CALL ── */}
        <section className="relative isolate overflow-hidden bg-ink py-28 text-center md:py-36">
          <img src={FINAL_PHOTO} alt="" width={1440} height={1045} loading="lazy" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-ink opacity-[0.82]" />
          <span aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-ink to-transparent" />
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
          <div className="shell">
            <Reveal gesture="veil" as="h2" className="display type-section-lg mx-auto max-w-[16ch] text-paper">
              Ready to start <span className="mark">earning?</span>
            </Reveal>
            <Reveal gesture="rise" delay={0.12}>
              <p className="type-body mx-auto mt-6 max-w-[46ch] leading-relaxed text-paper/70">Bring your friends to the mats at {site.address.line1} and get rewarded for every one who joins.</p>
            </Reveal>
            <Reveal gesture="rise" delay={0.22}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" onClick={toForm}>Refer a friend</Button>
                <span className="text-[0.9rem] text-paper/60">or call <a href={site.phoneHref} className="tnum -my-[14px] inline-block py-[14px] text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper">{site.phone}</a></span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
