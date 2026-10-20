interface Props {
  /** Steps completed: 0–3. */
  done: number
  /** Index of the step on screen: 0–2. */
  current: number
  count: string
}

const STEPS = [
  {
    label: 'Who',
    icon: (
      <>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M14.5 20a4 4 0 0 1 6.5-3.1" />
      </>
    ),
  },
  {
    label: 'Experience',
    icon: (
      <>
        <path d="M2.5 10.5h7M14.5 10.5h7" />
        <rect x="9.5" y="8" width="5" height="5" rx="1" />
        <path d="M10.5 13l-2.5 7M13.5 13l2.5 7" />
      </>
    ),
  },
  {
    label: 'Gift',
    icon: (
      <>
        <rect x="3.5" y="9" width="17" height="11" rx="1" />
        <path d="M2.5 9h19M12 9v11M12 9c-2-4-6-4-6-1.5S12 9 12 9zM12 9c2-4 6-4 6-1.5S12 9 12 9z" />
      </>
    ),
  },
]

// Progress as a frosted pill: each answer checks its step, the current one lights up.
export default function StepTimeline({ done, current, count }: Props) {
  return (
    <div className="pill-wrap" aria-hidden="true">
      <div className="pill">
        {STEPS.map((s, i) => {
          const state = i < done ? ' is-done' : i === current ? ' is-current' : ''
          return (
            <span key={s.label} className="pill-item">
              {i > 0 && <span className={`pill-sep${i <= done ? ' is-done' : ''}`} />}
              <span className={`pill-step${state}`}>
                <span className="pill-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {i < done ? <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="2.8" /> : s.icon}
                  </svg>
                </span>
                <span className="pill-label">{s.label}</span>
              </span>
            </span>
          )
        })}
        <span className="pill-count">{count}</span>
      </div>
    </div>
  )
}
