import { useCallback, useEffect, useRef, useState } from 'react'
import { POINTS_PER_FRIEND, RANKING_URL, REWARDS, type Reward } from '../referral/data'

/**
 * /ranking's data layer: reads the n8n board, orders it, and works out what the TV should CELEBRATE.
 *
 * The n8n only answers the present ({ name, validated, pending } per member), so everything that is about
 * change (who climbed, who just brought a friend) is worked out here, against the last board this screen
 * saw. That memory lives in localStorage so a TV that reloads (every 6 hours, or a power cut) does not
 * replay old news or miss what happened while it was off. No storage (private window, blocked): the board
 * still works, it just has no arrows and no celebrations until the second read.
 *
 * `?demo` swaps the n8n for invented members and invents a referral every few seconds, so the board can be
 * shown (and approved) while the real one is still almost empty. Demo never touches the stored memory.
 */

export type Referrer = { name: string; validated: number; pending: number }
type Raw = { updatedAt: string; referrers: Referrer[] }

export type Entry = Referrer & {
  /** name + occurrence: two "John S." stay two rows */
  id: string
  pts: number
  /** positions gained (+) or lost (-) in the last 24 hours; 0 shows nothing */
  move: number
}

export type Board = { updatedAt: string; entries: Entry[] }

export type Moment =
  | { kind: 'joined'; key: string; name: string; friends: number; pts: number; unlocked?: Reward }
  | { kind: 'sent'; key: string; name: string; friends: number }

const KEY = 'holanda-ranking-v1'
const DAY = 24 * 60 * 60_000

type Memory = {
  ranks: Record<string, number>
  moves: Record<string, { d: number; at: number }>
  seen: Record<string, { v: number; p: number }>
}

const read = (): Memory | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Memory) : null
  } catch {
    return null
  }
}
const write = (m: Memory) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    /* no storage: the board still renders */
  }
}

/** The highest prize a score has reached, or undefined below the first one. */
export const reached = (pts: number) => [...REWARDS].reverse().find((w) => pts >= w.pts)
/** The next prize a score is going for, or undefined when every prize is in. */
export const nextPrize = (pts: number) => REWARDS.find((w) => w.pts > pts)

function build(raw: Raw, mem: Memory | null, now: number): { board: Board; moments: Moment[]; mem: Memory } {
  // Joined friends first, then friends on the way; the n8n order breaks the rest of the ties.
  const sorted = raw.referrers
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.validated - a.r.validated || b.r.pending - a.r.pending || a.i - b.i)
    .map(({ r }) => r)

  const count: Record<string, number> = {}
  const next: Memory = { ranks: {}, moves: { ...(mem?.moves ?? {}) }, seen: {} }
  const moments: Moment[] = []

  const entries = sorted.map((r, i) => {
    count[r.name] = (count[r.name] ?? 0) + 1
    const id = count[r.name] > 1 ? `${r.name}#${count[r.name]}` : r.name
    const rank = i + 1
    const pts = r.validated * POINTS_PER_FRIEND

    if (mem) {
      const was = mem.ranks[id]
      if (was !== undefined && was !== rank) next.moves[id] = { d: was - rank, at: now }

      // A member the screen never saw counts as zero, so their first referral is news too.
      const seen = mem.seen[id] ?? { v: 0, p: 0 }
      const joined = r.validated - seen.v
      const sent = r.validated + r.pending - (seen.v + seen.p)
      if (joined > 0) {
        const before = seen.v * POINTS_PER_FRIEND
        const unlocked = [...REWARDS].reverse().find((w) => w.pts > before && w.pts <= pts)
        moments.push({ kind: 'joined', key: `${id}:v${r.validated}`, name: r.name, friends: joined, pts, unlocked })
      } else if (sent > 0) {
        moments.push({ kind: 'sent', key: `${id}:s${r.validated + r.pending}`, name: r.name, friends: sent })
      }
    }

    next.ranks[id] = rank
    next.seen[id] = { v: r.validated, p: r.pending }
    const m = next.moves[id]
    return { ...r, id, pts, move: m && now - m.at < DAY ? m.d : 0 }
  })

  // forget arrows older than a day, so the stored memory does not grow forever
  for (const [id, m] of Object.entries(next.moves)) if (now - m.at >= DAY) delete next.moves[id]

  return { board: { updatedAt: raw.updatedAt, entries }, moments, mem: next }
}

/* ── demo ─────────────────────────────────────────────────────────────────── */

const DEMO: Referrer[] = [
  { name: 'Marcus T.', validated: 6, pending: 1 },
  { name: 'Ana P.', validated: 4, pending: 2 },
  { name: 'Rafael C.', validated: 3, pending: 0 },
  { name: 'Jordan B.', validated: 2, pending: 3 },
  { name: 'Kevin L.', validated: 2, pending: 0 },
  { name: 'Sofia M.', validated: 1, pending: 1 },
  { name: 'Bruno A.', validated: 1, pending: 0 },
  { name: 'Tyler R.', validated: 0, pending: 2 },
  { name: 'Camila D.', validated: 0, pending: 1 },
]

const find = (l: Referrer[], name: string) => l.find((r) => r.name === name)
/** a friend on the way joins (or, with nobody on the way, a friend joins straight away) */
const join = (l: Referrer[], name: string) => {
  const r = find(l, name)
  if (!r) return
  if (r.pending > 0) r.pending -= 1
  r.validated += 1
}
const send = (l: Referrer[], name: string) => {
  const r = find(l, name)
  if (r) r.pending += 1
}

/**
 * The demo opens with a fixed script, one step every DEMO_EVERY, so whoever is presenting it to the
 * academy sees every part of the board in the first minute, in this order:
 * 1. a friend joins: red takeover, T-shirt unlocked, Tyler climbs a place (arrow);
 * 2. a member sends a friend: the note at the foot, a new hollow dot;
 * 3. someone new refers for the first time: a new name enters the board, taking an open spot;
 * 4. a bigger prize: Ana's friend joins and she unlocks the Official gi;
 * 5. a climb by points: Kevin passes Jordan.
 * After that it improvises (random members, mostly the lower half, so the order keeps moving).
 */
const SCRIPT: ((l: Referrer[]) => void)[] = [
  (l) => join(l, 'Tyler R.'),
  (l) => send(l, 'Camila D.'),
  (l) => l.push({ name: 'Noah K.', validated: 0, pending: 1 }),
  (l) => join(l, 'Ana P.'),
  (l) => join(l, 'Kevin L.'),
]
/** Longer than the 9 s takeover, or the moments would pile up behind the board. */
const DEMO_EVERY = 10_000

function demoStep(list: Referrer[], step: number): Referrer[] {
  const copy = list.map((r) => ({ ...r }))
  if (step < SCRIPT.length) {
    SCRIPT[step](copy)
    return copy
  }
  const i = Math.random() < 0.6 ? 3 + Math.floor(Math.random() * (copy.length - 3)) : Math.floor(Math.random() * copy.length)
  const r = copy[i]
  if (r.pending > 0 && Math.random() < 0.55) {
    r.pending -= 1
    r.validated += 1
  } else r.pending += 1
  return copy
}

/* ── the hook ─────────────────────────────────────────────────────────────── */

export function useBoard() {
  // /ranking/demo (the address to show the academy) or ?demo (works anywhere, also in dev)
  const demo =
    typeof location !== 'undefined' &&
    (new URLSearchParams(location.search).has('demo') || /\/ranking\/demo\/?$/.test(location.pathname))
  const [board, setBoard] = useState<Board | null>(null)
  const [failed, setFailed] = useState(false)
  const [moments, setMoments] = useState<Moment[]>([])
  const mem = useRef<Memory | null | undefined>(undefined)
  const done = useRef(new Set<string>())

  useEffect(() => {
    let alive = true
    if (mem.current === undefined) mem.current = demo ? null : read()

    const take = (raw: Raw) => {
      if (!alive) return
      const out = build(raw, mem.current ?? null, Date.now())
      mem.current = out.mem
      if (!demo) write(out.mem)
      setBoard(out.board)
      setFailed(false)
      // StrictMode runs effects twice in dev: the key keeps a moment from showing up twice
      const fresh = out.moments.filter((m) => !done.current.has(m.key))
      fresh.forEach((m) => done.current.add(m.key))
      if (fresh.length) setMoments((q) => [...q, ...fresh])
    }

    if (demo) {
      let list = DEMO
      let step = 0
      take({ updatedAt: new Date().toISOString(), referrers: list })
      const every = setInterval(() => {
        list = demoStep(list, step++)
        take({ updatedAt: new Date().toISOString(), referrers: list })
      }, DEMO_EVERY)
      return () => {
        alive = false
        clearInterval(every)
      }
    }

    const load = () =>
      fetch(RANKING_URL, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((b: Raw) => take(b))
        .catch(() => alive && setFailed(true))
    load()
    const every = setInterval(load, 60_000)
    // a TV never reloads on its own: once every 6 hours it picks up a new deploy (only when online,
    // or it would trade the board for the browser's offline page)
    const fresh = setTimeout(() => navigator.onLine && location.reload(), 6 * 60 * 60_000)
    return () => {
      alive = false
      clearInterval(every)
      clearTimeout(fresh)
    }
  }, [demo])

  // stable, or the timer that dismisses a moment would restart on every board update
  const shift = useCallback(() => setMoments((q) => q.slice(1)), [])
  return { board, failed, demo, moments, shift }
}
