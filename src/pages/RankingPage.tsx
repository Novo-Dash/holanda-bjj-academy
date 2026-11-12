import { useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { FRIEND_OFFER, POINTS_PER_FRIEND, RANKING_URL, REWARDS } from './referral/data'
import { QR_D, QR_VIEWBOX } from './ranking/qr'

/**
 * /ranking (12/11/2026): the Referral Program's live board, made for the academy's TV and for the
 * members' phones. It reads the n8n "[ND] Referral Ranking v2" (RANKING_URL) every minute and keeps the
 * last board on screen when a read fails. Points: POINTS_PER_FRIEND for every friend who joined (won in
 * GHL); friends still on the way show apart and earn nothing yet. No tracking tags here: a TV that
 * stays open all day would only inflate the page views.
 *
 * Everything is sized in em from one root size in ranking.css (.rk), which follows the viewport width,
 * so the same board fills a 1080p TV, a 4K TV and a phone.
 */

type Referrer = { name: string; validated: number; pending: number }
type Board = { updatedAt: string; referrers: Referrer[] }

const TOP = 10 // ponytail: ten rows fill a 1080p TV; past that the rest is a count, not a scroll
const fmt = (n: number) => n.toLocaleString('en-US')
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function useBoard() {
  const [board, setBoard] = useState<Board | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let alive = true
    const load = () =>
      fetch(RANKING_URL, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((b: Board) => alive && (setBoard(b), setFailed(false)))
        .catch(() => alive && setFailed(true))
    load()
    const every = setInterval(load, 60_000)
    // a TV never reloads on its own: once every 6 hours it picks up a new deploy (only when online,
    // or it would trade the board for the browser's offline page)
    const fresh = setTimeout(() => navigator.onLine && location.reload(), 6 * 60 * 60_000)
    return () => { alive = false; clearInterval(every); clearTimeout(fresh) }
  }, [])
  return { board, failed }
}

function Row({ r, rank }: { r: Referrer; rank: number }) {
  const pts = r.validated * POINTS_PER_FRIEND
  const next = REWARDS.find((w) => w.pts > pts)
  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      className="grid grid-cols-[2.6em_minmax(0,1fr)_auto] items-center gap-x-[1.1em] border-t border-paper/12 py-[0.3em] first:border-t-0"
    >
      <span className={`display text-[2.2em] tabular-nums ${rank <= 3 ? 'text-red' : 'text-paper/35'}`}>
        {String(rank).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="display truncate text-[1.9em] leading-none">{r.name}</p>
        <div className="mt-[0.4em] flex items-center gap-[0.8em]">
          <span className="block h-[0.3em] w-full max-w-[16em] overflow-hidden rounded-full bg-paper/12 max-sm:hidden">
            <span className="block h-full rounded-full bg-red" style={{ width: `${next ? (pts / next.pts) * 100 : 100}%` }} />
          </span>
          <span className="label min-w-0 truncate text-[0.75em] text-paper/55 sm:shrink-0">
            {next ? `Next: ${next.label} at ${fmt(next.pts)}` : 'Every reward unlocked'}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="display text-[2.1em] tabular-nums leading-none">
          {fmt(pts)}
          <span className="label ml-[0.35em] text-[0.3em] text-paper/55">pts</span>
        </p>
        {r.pending > 0 && (
          <p className="label mt-[0.3em] text-[0.75em] text-paper/70">
            +{r.pending}<span className="max-sm:hidden"> {r.pending === 1 ? 'friend' : 'friends'}</span> on the way
          </p>
        )}
      </div>
    </motion.li>
  )
}

function Status({ board, failed }: ReturnType<typeof useBoard>) {
  if (!board) return <span className="label text-[0.8em] text-paper/55">{failed ? 'Reconnecting' : 'Loading'}</span>
  return (
    <span className="label flex items-center gap-[0.6em] text-[0.8em] text-paper/70">
      <span className="relative flex h-[0.7em] w-[0.7em]">
        {!failed && <span className="absolute inset-0 animate-ping rounded-full bg-red opacity-60 motion-reduce:hidden" />}
        <span className={`relative h-full w-full rounded-full ${failed ? 'bg-paper/35' : 'bg-red'}`} />
      </span>
      {failed ? 'Reconnecting' : 'Live'} · Updated {time(board.updatedAt)}
    </span>
  )
}

export default function RankingPage() {
  const state = useBoard()
  const list = state.board?.referrers ?? []
  const rest = list.length - TOP

  return (
    <MotionConfig reducedMotion="user">
      <main className="rk min-h-dvh bg-ink px-[2.4em] py-[1.2em] text-paper max-sm:px-4">
        <header className="flex flex-wrap items-center justify-between gap-[1em] border-b border-paper/18 pb-[0.9em]">
          <div className="flex items-center gap-[1em]">
            <img src="/logo.webp" alt="" width={512} height={512} className="h-[3em] w-[3em] object-contain" />
            <div>
              <p className="label text-[0.8em] text-paper/55">Holanda BJJ Academy</p>
              <h1 className="display mt-[0.15em] text-[2.6em]">
                Referral <span className="text-red">ranking</span>
              </h1>
            </div>
          </div>
          <Status {...state} />
        </header>

        <div className="mt-[0.9em] grid gap-[2.4em] lg:grid-cols-[minmax(0,1fr)_minmax(0,22em)]">
          <section aria-label="Ranking">
            {list.length > 0 ? (
              <>
                <ol>
                  {list.slice(0, TOP).map((r, i) => <Row key={`${r.name}-${i}`} r={r} rank={i + 1} />)}
                </ol>
                {rest > 0 && (
                  <p className="label border-t border-paper/12 pt-[1em] text-[0.8em] text-paper/55">
                    And {rest} more {rest === 1 ? 'member' : 'members'} on the board
                  </p>
                )}
              </>
            ) : state.board ? (
              <div className="py-[3em]">
                <p className="display text-[4em]">The board is open.</p>
                <p className="mt-[0.6em] max-w-[30em] text-[1.2em] text-paper/70">
                  Be the first name up here: scan the code and send us a friend.
                </p>
              </div>
            ) : (
              <p className="py-[3em] text-[1.2em] text-paper/55">
                {state.failed ? 'We could not load the ranking. Trying again in a minute.' : 'Loading the board.'}
              </p>
            )}
          </section>

          <aside className="flex flex-col gap-[1.4em]">
            <div className="rounded-[var(--radius-plate)] bg-paper p-[1.2em] text-ink">
              <div className="flex items-center gap-[1.2em]">
                <svg viewBox={QR_VIEWBOX} className="h-[7.5em] w-[7.5em] shrink-0" shapeRendering="crispEdges" role="img" aria-label="QR code to the referral form">
                  <path stroke="currentColor" d={QR_D} />
                </svg>
                <div>
                  <p className="display text-[2em]">Refer a friend</p>
                  <p className="mt-[0.4em] text-[0.95em] leading-snug text-ink-soft">
                    Scan, send us their name, earn <strong className="text-red">{POINTS_PER_FRIEND} points</strong> when they join.
                  </p>
                </div>
              </div>
              <p className="label mt-[1em] border-t border-line pt-[0.9em] text-[0.75em] text-ink-soft">Your friend gets {FRIEND_OFFER}</p>
            </div>

            <div>
              <p className="label text-[0.8em] text-paper/55">Rewards</p>
              <ul className="mt-[0.6em]">
                {REWARDS.map((w) => (
                  <li key={w.pts} className="flex items-baseline justify-between gap-[1em] border-t border-paper/12 py-[0.55em]">
                    <span className="text-[1.1em]">{w.label}</span>
                    <span className="display text-[1.7em] tabular-nums">
                      {fmt(w.pts)}
                      <span className="label ml-[0.35em] text-[0.4em] text-paper/55">pts</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </MotionConfig>
  )
}
