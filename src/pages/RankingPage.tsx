import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Mark } from '@/components/mark'
import { FRIEND_OFFER, POINTS_PER_FRIEND, REWARDS } from './referral/data'
import { QR_D, QR_VIEWBOX } from './ranking/qr'
import { nextPrize, useBoard, type Board, type Entry, type Moment } from './ranking/board'

/**
 * /ranking: the Referral Program's live board, for the academy's TV and the members' phones.
 * Data and memory in ./ranking/board.ts; this file is only the picture.
 *
 * v3 (13/11/2026). Adryan on v2: a podium block made the top three loud and everyone else hard to see,
 * and it was badly laid out; the prizes should be a list, all six at once. So:
 * - ONE LIST, ten places, every row the same size and type. The top three are told apart by a red
 *   podium ribbon in place of the number (1ST, 2ND, 3RD) and a stronger row tile, never by scale.
 * - PRIZES AND QR IN ONE RED CARD (red is Holanda's colour for action): the six prizes as a list, top
 *   prize first, each with who unlocked it, and the QR closing the same card. Prize and way to win it
 *   read in one glance.
 * - ONE GRID. Same outer margin on every side; the list and the card start on the same line and end on
 *   the same line; the card's right edge is the header's right edge.
 * - Kept from v1: dots per friend (full = joined, hollow = on the way), arrows for 24 hours after a
 *   change, ten places always drawn ("Open spot"), the red takeover when a friend joins.
 *
 * Sizes are em from one root (.rk in ranking.css) that follows the viewport, so a 1080p TV, a 4K TV and a
 * notebook show the same composition. Below lg it becomes a plain scrolling page for phones.
 */

const SLOTS = 10
const fmt = (n: number) => n.toLocaleString('en-US')
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const ease = [0.22, 1, 0.36, 1] as const

/** Points that count up when they change, so the eye catches WHICH number moved. */
function Count({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => fmt(Math.round(v)))
  const still = useReducedMotion()
  useEffect(() => {
    if (still) {
      mv.set(value)
      return
    }
    const run = animate(mv, value, { duration: 1.4, ease })
    return () => run.stop()
  }, [mv, value, still])
  return <motion.span>{text}</motion.span>
}

/** A red wash over a row whenever its numbers change. */
function useFlash(e: Entry) {
  const [flash, setFlash] = useState(0)
  const was = useRef(`${e.validated}/${e.pending}`)
  useEffect(() => {
    const now = `${e.validated}/${e.pending}`
    if (now !== was.current) setFlash((f) => f + 1)
    was.current = now
  }, [e.validated, e.pending])
  return flash > 0 ? (
    <motion.span
      key={flash}
      aria-hidden="true"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2.6, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-red"
    />
  ) : null
}

const JOINED = 'rounded-full bg-red shadow-[0_0_0.6em_rgb(var(--accent-rgb)/0.6)]'
const WAY = 'rounded-full border-[0.14em] border-paper/55'

/** One dot per friend: full for joined, hollow for on the way. Past eight, counts. */
function Dots({ joined, pending }: { joined: number; pending: number }) {
  const total = joined + pending
  const dot = 'h-[0.78em] w-[0.78em] shrink-0'
  if (total === 0) return <span className="label whitespace-nowrap text-[0.58em] text-paper/35">No friends yet</span>
  if (total > 8)
    return (
      <span className="flex items-center gap-[0.45em] whitespace-nowrap">
        <span className={`${dot} ${JOINED}`} />
        <span className="display text-[1.15em] tabular-nums leading-none">{joined}</span>
        <span className={`ml-[0.4em] ${dot} ${WAY}`} />
        <span className="display text-[1.15em] tabular-nums leading-none text-paper/60">{pending}</span>
      </span>
    )
  return (
    <span className="flex items-center gap-[0.3em]" aria-label={`${joined} joined, ${pending} on the way`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i < joined ? `j${i}` : `p${i - joined}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18, delay: i * 0.04 }}
          className={`${dot} ${i < joined ? JOINED : WAY}`}
        />
      ))}
    </span>
  )
}

function Move({ d }: { d: number }) {
  if (!d) return null
  const up = d > 0
  return (
    <span className={`label flex shrink-0 items-center gap-[0.25em] whitespace-nowrap text-[0.58em] tracking-[0.08em] ${up ? 'text-red' : 'text-paper/45'}`}>
      <svg viewBox="0 0 10 8" className={`h-[0.75em] w-[0.9em] ${up ? '' : 'rotate-180'}`} aria-hidden="true">
        <path d="M5 0 10 8H0z" fill="currentColor" />
      </svg>
      <span className="sr-only">{up ? 'up' : 'down'}</span>
      {Math.abs(d)}
    </span>
  )
}

/** "1 friend from the T-shirt": the distance to the next prize, in the unit a member can act on. */
function nextLine(pts: number) {
  const w = nextPrize(pts)
  if (!w) return 'Every prize unlocked'
  const friends = Math.ceil((w.pts - pts) / POINTS_PER_FRIEND)
  return `${plural(friends, 'friend', 'friends')} from the ${w.label}`
}

/* ── the board ───────────────────────────────────────────────────────────── */

const SUFFIX = ['st', 'nd', 'rd']

/**
 * The place. Top three: a red ribbon (a tab with a notched tail) carrying the place. From fourth on: the
 * number. Both sit in the same box, centred, so the column reads as one line of marks.
 */
function Place({ rank }: { rank: number }) {
  if (rank > 3)
    return <span className="display text-[1.6em] tabular-nums leading-none text-paper/40">{String(rank).padStart(2, '0')}</span>
  return (
    <span className="drop-shadow-[0_0.35em_0.5em_rgb(0_0_0/0.55)]" aria-label={`${rank}${SUFFIX[rank - 1]} place`}>
      <span className="textured flex h-[2.75em] w-[2.25em] flex-col items-center bg-red pt-[0.3em] [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]">
        <span className="display text-[1.4em] leading-none text-paper">{rank}</span>
        <span className="label mt-[0.15em] text-[0.45em] tracking-[0.14em] text-paper/90">{SUFFIX[rank - 1]}</span>
      </span>
    </span>
  )
}

/** The four columns, shared by the head and every row so they line up to the pixel. */
const COLS = 'grid-cols-[2.6em_minmax(0,1fr)_auto] lg:grid-cols-[3.2em_minmax(0,1fr)_10.5em_6.6em]'
const TILE = ['bg-gradient-to-r from-red/30 via-red/[0.12] to-paper/[0.03]', 'bg-paper/[0.075]', 'bg-paper/[0.075]']

function Row({ e, rank }: { e: Entry; rank: number }) {
  const flash = useFlash(e)
  return (
    <motion.li
      layout="position"
      transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      className={`relative grid items-center gap-x-[1.1em] rounded-[var(--radius-inner)] px-[1em] py-[0.3em] max-lg:py-[0.8em] ${COLS} ${TILE[rank - 1] ?? 'bg-paper/[0.03]'}`}
    >
      {flash}
      <div className="relative flex justify-center">
        <Place rank={rank} />
      </div>
      <div className="relative min-w-0">
        <div className="flex items-center gap-[0.7em]">
          <p className="display truncate text-[1.7em] leading-none">{e.name}</p>
          <Move d={e.move} />
        </div>
        <p className="label mt-[0.45em] text-[0.56em] leading-snug text-paper/50 lg:truncate">{nextLine(e.pts)}</p>
        <div className="mt-[0.55em] lg:hidden">
          <Dots joined={e.validated} pending={e.pending} />
        </div>
      </div>
      <div className="relative flex flex-col items-start gap-[0.45em] max-lg:hidden">
        <Dots joined={e.validated} pending={e.pending} />
        {e.pending > 0 && <span className="label whitespace-nowrap text-[0.55em] text-paper/55">{e.pending} on the way</span>}
      </div>
      <p className="display relative whitespace-nowrap text-right text-[1.95em] tabular-nums leading-none max-lg:text-[1.6em]">
        <Count value={e.pts} />
        <span className="label ml-[0.3em] text-[0.3em] text-paper/45">pts</span>
      </p>
    </motion.li>
  )
}

function OpenRow({ rank, first }: { rank: number; first: boolean }) {
  return (
    <li
      className={`${first ? '' : 'max-lg:hidden'} relative grid items-center gap-x-[1.1em] rounded-[var(--radius-inner)] border border-dashed border-paper/12 px-[1em] py-[0.3em] max-lg:py-[0.8em] ${COLS}`}
    >
      <div className="flex justify-center">
        {rank <= 3 ? (
          <span className="opacity-35 grayscale">
            <Place rank={rank} />
          </span>
        ) : (
          <span className="display text-[1.6em] tabular-nums leading-none text-paper/15">{String(rank).padStart(2, '0')}</span>
        )}
      </div>
      <p className="flex min-w-0 items-baseline gap-[1.2em] whitespace-nowrap">
        <span className="display text-[1.4em] leading-none text-paper/25">Open spot</span>
        {first && <span className="label truncate text-[0.56em] text-paper/45">Bring one friend and your name goes up here</span>}
      </p>
    </li>
  )
}

/* ── header ──────────────────────────────────────────────────────────────── */

function Status({ board, failed, demo, count }: { board: Board | null; failed: boolean; demo: boolean; count: number }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const live = board && !failed
  return (
    <div className="flex flex-col items-end gap-[0.6em] max-lg:items-start">
      <p className="label whitespace-nowrap text-[0.64em] text-paper/55">
        {today}
        {count > 0 && <> · {plural(count, 'member', 'members')} on the board</>}
      </p>
      <span className="label flex items-center gap-[0.6em] whitespace-nowrap rounded-full border border-paper/15 px-[0.95em] py-[0.5em] text-[0.64em] text-paper/85">
        <span className="relative flex h-[0.7em] w-[0.7em]">
          {live && <span className="absolute inset-0 animate-ping rounded-full bg-red opacity-60 motion-reduce:hidden" />}
          <span className={`relative h-full w-full rounded-full ${live ? 'bg-red' : 'bg-paper/35'}`} />
        </span>
        {!board ? (failed ? 'Reconnecting' : 'Loading') : demo ? 'Demo data' : failed ? `Reconnecting · last update ${time(board.updatedAt)}` : `Live · updated ${time(board.updatedAt)}`}
      </span>
    </div>
  )
}

/* ── prizes + QR: one red card ───────────────────────────────────────────── */

function Prizes({ entries }: { entries: Entry[] }) {
  // top prize first: the card opens on what people want most
  const list = [...REWARDS].reverse()
  return (
    <div className="textured relative flex flex-1 flex-col overflow-clip rounded-[var(--radius-plate)] bg-red px-[1.3em] pb-[1.3em] pt-[1.05em] text-paper shadow-[0_2.4em_5em_-2em_rgb(var(--accent-rgb)/0.5)] max-lg:px-4 max-lg:pb-4">
      <span aria-hidden="true" className="pointer-events-none absolute inset-[6px] rounded-[var(--radius-inner)] border border-paper/20" />
      <Mark className="pointer-events-none absolute -right-[5em] top-[6em] h-[26em] text-ink opacity-[0.07]" />

      <div className="relative flex items-baseline justify-between gap-[1em] pb-[0.7em]">
        <p className="display text-[1.6em] leading-none">The prizes</p>
        <p className="label whitespace-nowrap text-[0.56em] text-paper/80">{POINTS_PER_FRIEND} pts per friend who joins</p>
      </div>

      <ol className="relative grid flex-1 lg:grid-rows-[repeat(6,minmax(min-content,1fr))]">
        {list.map((w, n) => {
          const holders = entries.filter((e) => e.pts >= w.pts).map((e) => e.name)
          return (
            <motion.li
              key={w.pts}
              className="grid grid-cols-[3em_minmax(0,1fr)_auto] items-center gap-x-[0.95em] border-t border-paper/25 py-[0.4em]"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 + n * 0.06 }}
            >
              {/* paper tile: the gi, the rash guard and the shorts are black, and would vanish on the red */}
              <span className="relative flex aspect-square w-full items-center justify-center rounded-[var(--radius-inner)] bg-paper p-[0.28em] shadow-[0_0.7em_1.2em_-0.7em_rgb(20_18_15/0.7)]">
                <img src={w.img} alt="" width={160} height={160} className="h-full w-full object-contain" />
                {holders.length > 0 && (
                  <span className="absolute -right-[0.4em] -top-[0.4em] flex h-[1.15em] w-[1.15em] items-center justify-center rounded-full bg-ink">
                    <svg viewBox="0 0 12 12" className="h-[0.62em] w-[0.62em]" aria-hidden="true">
                      <path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="var(--color-paper)" strokeWidth="1.8" />
                    </svg>
                  </span>
                )}
              </span>
              <div className="min-w-0">
                {w.tag && <p className="label mb-[0.35em] text-[0.5em] text-ink">{w.tag}</p>}
                <p className="display truncate text-[1.4em] leading-none">{w.label}</p>
                <p className="label mt-[0.45em] truncate text-[0.52em] text-paper/80">
                  {holders.length === 0
                    ? `${plural(w.pts / POINTS_PER_FRIEND, 'friend', 'friends')} who join`
                    : `Unlocked · ${holders.slice(0, 2).join(' · ')}${holders.length > 2 ? ` +${holders.length - 2}` : ''}`}
                </p>
              </div>
              <p className="display whitespace-nowrap text-right text-[1.55em] tabular-nums leading-none">
                {fmt(w.pts)}
                <span className="label ml-[0.3em] text-[0.34em] text-paper/75">pts</span>
              </p>
            </motion.li>
          )
        })}
      </ol>

      {/* the way to win them, in the same card */}
      <div className="relative flex items-center gap-[1.1em] rounded-[var(--radius-inner)] bg-ink/25 p-[0.8em] max-lg:hidden">
        <span className="shrink-0 rounded-[var(--radius-inner)] bg-paper p-[0.5em] shadow-[0_1em_2em_-1em_rgb(20_18_15/0.7)]">
          <svg viewBox={QR_VIEWBOX} className="h-[5.6em] w-[5.6em] text-ink" shapeRendering="crispEdges" role="img" aria-label="QR code to the referral form">
            <path stroke="currentColor" d={QR_D} />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="display text-[1.9em] leading-[0.92]">
            Scan. Refer. <span className="text-ink">Win.</span>
          </p>
          <p className="mt-[0.5em] text-[0.78em] leading-snug text-paper/90">Send us a friend. {POINTS_PER_FRIEND} points when they join.</p>
          <p className="label mt-[0.55em] text-[0.52em] text-paper/80">Your friend gets {FRIEND_OFFER}</p>
        </div>
      </div>
      {/* on a phone the QR is useless (you are already on the phone): a link instead */}
      <a
        href="/referral"
        className="relative mt-3 flex items-center justify-between rounded-[var(--radius-inner)] bg-paper px-5 py-4 text-ink shadow-[0_1em_2em_-1em_rgb(20_18_15/0.7)] lg:hidden"
      >
        <span>
          <span className="display block text-2xl leading-none">Refer a friend</span>
          <span className="label mt-1.5 block text-[0.6rem] text-ink-soft">Your friend gets {FRIEND_OFFER}</span>
        </span>
        <svg viewBox="0 0 16 16" className="h-5 w-5 text-red" aria-hidden="true">
          <path d="M3 8h9M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </a>
    </div>
  )
}

/* ── moments ─────────────────────────────────────────────────────────────── */

/** A friend joined: the whole screen turns red with the name. Nine seconds, then back to the board. */
function Joined({ m }: { m: Extract<Moment, { kind: 'joined' }> }) {
  return (
    <motion.div
      role="status"
      className="textured fixed inset-0 z-50 flex items-center overflow-clip bg-red text-paper"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75, ease }}
    >
      <Mark className="pointer-events-none absolute -right-[6vw] bottom-[-14vh] h-[110vh] text-ink opacity-[0.09]" />
      <div className="relative grid w-full items-center gap-[2em] px-[3em] lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <motion.p className="label text-[0.9em] text-paper/80" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            Referral Program · {m.friends === 1 ? 'A friend just joined' : `${m.friends} friends just joined`}
          </motion.p>
          <motion.p
            className="display mt-[0.15em] break-words text-[8.5em] leading-[0.86] max-lg:text-[4.2em]"
            initial={{ opacity: 0, y: '0.3em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease }}
          >
            {m.name}
          </motion.p>
          <motion.p
            className="display mt-[0.3em] text-[3.2em] leading-[0.95] text-paper/90 max-lg:text-[1.9em]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            Brought {m.friends === 1 ? 'a friend' : `${m.friends} friends`} to the mats.{' '}
            <span className="text-ink">{fmt(m.pts)} pts</span>
          </motion.p>
        </div>
        <motion.div
          className="flex flex-col items-start gap-[0.6em] lg:items-end"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 16 }}
        >
          {m.unlocked ? (
            // the prize is the reward of the moment, so it gets a poster, not a tag: the product big
            // enough to read from across the mats
            <div className="plate flex w-[24em] flex-col p-[1.4em] text-ink shadow-[0_3em_6em_-2em_rgb(20_18_15/0.65)] max-lg:w-[15em] max-lg:p-[1em]">
              <motion.img
                src={m.unlocked.img}
                alt=""
                className="relative mx-auto aspect-square w-full object-contain drop-shadow-[0_1.2em_1.2em_rgb(20_18_15/0.3)]"
                initial={{ scale: 0.7, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.05, type: 'spring', stiffness: 160, damping: 13 }}
              />
              <div className="relative mt-[0.9em] border-t border-line pt-[0.9em]">
                <p className="label text-[0.95em] text-red max-lg:text-[0.7em]">Unlocked</p>
                <p className="display mt-[0.15em] text-[4.2em] leading-[0.9] max-lg:text-[2.4em]">{m.unlocked.label}</p>
              </div>
            </div>
          ) : (
            <p className="step-numeral step-numeral-invert display text-[9em] leading-none" data-active="false">
              +{fmt(m.friends * POINTS_PER_FRIEND)}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

/** A friend sent (not joined yet): a quiet note at the foot of the screen. */
function Sent({ m }: { m: Extract<Moment, { kind: 'sent' }> }) {
  return (
    <motion.div
      role="status"
      className="plate-dark fixed bottom-[1.4em] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[1em] whitespace-nowrap px-[1.4em] py-[0.9em] shadow-[0_1.4em_3em_-1em_rgb(0_0_0/0.8)] max-lg:w-[calc(100%-2rem)] max-lg:whitespace-normal"
      initial={{ opacity: 0, y: '1.6em' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '1.6em' }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <span className={`relative h-[1em] w-[1em] shrink-0 ${WAY}`} />
      <p className="relative">
        <span className="display text-[1.6em] leading-none">{m.name}</span>
        <span className="text-[1em] text-paper/80"> just sent {m.friends === 1 ? 'a friend' : `${m.friends} friends`}. </span>
        <span className="label text-[0.66em] text-paper/55">{POINTS_PER_FRIEND} pts when they join</span>
      </p>
    </motion.div>
  )
}

function Moments({ moments, shift }: { moments: Moment[]; shift: () => void }) {
  const m = moments[0]
  useEffect(() => {
    if (!m) return
    const t = setTimeout(shift, m.kind === 'joined' ? 9000 : 6000)
    return () => clearTimeout(t)
  }, [m, shift])
  return (
    <AnimatePresence mode="wait">
      {m && (m.kind === 'joined' ? <Joined key={m.key} m={m} /> : <Sent key={m.key} m={m} />)}
    </AnimatePresence>
  )
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function RankingPage() {
  const { board, failed, demo, moments, shift } = useBoard()
  const entries = board?.entries ?? []
  const shown = entries.slice(0, SLOTS)
  const open = Math.max(0, SLOTS - shown.length)

  return (
    <MotionConfig reducedMotion="user">
      {/* one margin on every side: 2.4em left and right, 1.6em top and bottom */}
      <main className="rk paper-grain relative flex min-h-dvh flex-col overflow-clip bg-ink px-[2.4em] py-[1.6em] text-paper max-lg:px-4 max-lg:py-5">
        {/* a low red glow behind the top of the list, where the podium is */}
        <span aria-hidden="true" className="pointer-events-none absolute left-0 top-[8em] h-[18em] w-[44em] rounded-full bg-red/[0.09] blur-[5em]" />
        <Mark className="pointer-events-none absolute -bottom-[8em] -left-[6em] h-[40em] text-paper opacity-[0.025]" />

        <header className="relative flex flex-wrap items-end justify-between gap-[1em] pb-[1em]">
          <div className="flex items-center gap-[1em]">
            <img src="/logo.webp" alt="" width={512} height={512} className="h-[3.3em] w-[3.3em] object-contain" />
            <div>
              <p className="label text-[0.64em] text-paper/55">Holanda BJJ Academy · Referral Program</p>
              <h1 className="display mt-[0.15em] text-[2.9em] leading-[0.9] max-lg:text-[2.3em]">
                Referral <span className="mark">ranking</span>
              </h1>
            </div>
          </div>
          <Status board={board} failed={failed} demo={demo} count={entries.length} />
        </header>
        <div className="rule-double-dark relative" />

        <div className="relative mt-[1.3em] grid flex-1 gap-x-[2.4em] gap-y-6 lg:grid-cols-[minmax(0,1fr)_25.5em]">
          <section aria-label="Ranking" className="flex flex-col">
            <div className={`grid items-end gap-x-[1.1em] px-[1em] pb-[0.6em] max-lg:hidden ${COLS}`}>
              <span className="label text-center text-[0.56em] text-paper/45">Rank</span>
              <span className="label text-[0.56em] text-paper/45">Member</span>
              <span className="label flex items-center gap-[0.55em] whitespace-nowrap text-[0.56em] text-paper/45">
                <span className={`h-[1em] w-[1em] ${JOINED}`} />
                Joined
                <span className={`ml-[0.5em] h-[1em] w-[1em] ${WAY}`} />
                On the way
              </span>
              <span className="label text-right text-[0.56em] text-paper/45">Points</span>
            </div>

            {board ? (
              <ol className="flex flex-1 flex-col gap-[0.3em] max-lg:gap-1.5 lg:grid lg:grid-rows-[repeat(10,minmax(min-content,1fr))]">
                {shown.map((e, n) => (
                  <Row key={e.id} e={e} rank={n + 1} />
                ))}
                {Array.from({ length: open }, (_, n) => (
                  <OpenRow key={`open-${n}`} rank={shown.length + n + 1} first={n === 0} />
                ))}
              </ol>
            ) : (
              <p className="py-[3em] text-[1.2em] text-paper/55">
                {failed ? 'We could not load the ranking. Trying again in a minute.' : 'Loading the board.'}
              </p>
            )}
          </section>

          <aside className="flex flex-col">
            <Prizes entries={entries} />
          </aside>
        </div>
        <Moments moments={moments} shift={shift} />
      </main>
    </MotionConfig>
  )
}
