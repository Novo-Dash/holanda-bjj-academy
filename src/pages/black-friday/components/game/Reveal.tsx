import { useEffect, useState, type FormEvent, type RefObject } from 'react'
import { BookingForm } from '@/nd'
import { ACADEMY, RESERVE_HOURS, SOURCE, type Prize } from '@/pages/black-friday/data/campaign'
import { bookingFor, formatUSPhone, isValidUSPhone, submitClaim, type Contact } from '@/pages/black-friday/lib/lead'
import type { Reservation } from '@/pages/black-friday/lib/reservation'

interface Props {
  prize: Prize
  reservation: Reservation
  headingRef: RefObject<HTMLHeadingElement | null>
}

function useCountdown(deadline: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const total = Math.max(0, Math.floor((deadline - now) / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  const parts = [
    { v: pad(Math.floor(total / 3600)), u: 'Hours' },
    { v: pad(Math.floor((total % 3600) / 60)), u: 'Min' },
    { v: pad(total % 60), u: 'Sec' },
  ]
  return { parts, expired: total === 0 }
}

const ARROW = 'M5 12h14M13 6l6 6-6 6'

// A gift voucher torn from the same red paper as the box, joined by a perforated
// edge to the claim form. Once claimed, that stub turns into the main LP's booking
// (class, day, time; no checkout here) so the visitor leaves with a class on the calendar.
export default function Reveal({ prize, reservation, headingRef }: Props) {
  const clock = useCountdown(reservation.expiresAt)
  const [contact, setContact] = useState<Contact | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Add your name to claim the gift.')
    if (!isValidUSPhone(phone)) return setError('Add a 10-digit mobile number so we can text you.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Add a valid email address.')
    setError('')
    setContact(
      submitClaim({
        name: name.trim(),
        phone,
        email: email.trim(),
        who: reservation.who,
        answer: reservation.answer,
        prize,
        expiresAt: reservation.expiresAt,
      }),
    )
  }

  const booking = bookingFor(reservation.who, reservation.answer)
  const first = contact ? contact.fullName.split(' ')[0] : ''

  return (
    <div className={`step reveal${contact ? ' is-booking' : ''}`}>
      <div className="voucher">
        <span className="voucher-ribbon" aria-hidden="true" />
        <svg className="voucher-bow" viewBox="0 0 120 80" aria-hidden="true">
          <defs>
            <linearGradient id="vbS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#d6cfc3" />
            </linearGradient>
          </defs>
          <path d="M55 44 L44 76 L52 72 L58 78 Z M65 44 L76 76 L68 72 L62 78 Z" fill="#e9e3da" />
          <path d="M60 40 C48 14, 12 6, 8 26 C4 44, 40 52, 60 40 Z" fill="url(#vbS)" />
          <path d="M60 40 C72 14, 108 6, 112 26 C116 44, 80 52, 60 40 Z" fill="url(#vbS)" />
          <rect x="51" y="31" width="18" height="18" rx="6" fill="#fff" />
        </svg>

        <p className="voucher-for">{contact ? `Reserved for ${first}` : prize.pickedFor}</p>
        <h3 className="voucher-title" ref={headingRef} tabIndex={-1}>
          {prize.title}
        </h3>
        <p className="voucher-detail">{prize.detail}</p>

        <div className={`voucher-timer${clock.expired ? ' is-expired' : ''}`}>
          <p className="voucher-timer-label">
            {clock.expired ? 'Reservation expired' : 'Reserved for you for'}
          </p>
          <div className="voucher-clock" role="timer">
            {clock.parts.map((p, i) => (
              <span key={p.u} className="voucher-unit">
                {i > 0 && (
                  <span className="voucher-colon" aria-hidden="true">
                    :
                  </span>
                )}
                <span className="voucher-cell">
                  <b>{p.v}</b>
                  <small>{p.u}</small>
                </span>
              </span>
            ))}
          </div>
        </div>
        <p className="voucher-next">
          {contact ? 'Last step: book your first class' : 'Fill out the form to receive your gift'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ARROW} />
          </svg>
        </p>
        <p className="voucher-stamp">Black Friday ’26 · {ACADEMY.short}</p>
      </div>

      {contact ? (
        <div className="claim nd bf-book">
          <BookingForm
            contact={contact}
            leadSent
            source={SOURCE}
            audience={booking.audience}
            filter={booking.filter}
            leadExtra={{ campaign: 'black-friday-2026' }}
            copy={{
              formTitle: 'Book your first class',
              formText: `${first}, your gift is saved. Pick the class, then the day and time you’ll come in.`,
            }}
          />
        </div>
      ) : (
        <form className="claim" onSubmit={submit} noValidate>
          <p className="claim-title">Claim your gift</p>
          <p className="claim-lead">
            To receive your gift, fill out the form below. Next, you’ll pick the day of your first class.
          </p>
          <div className="field">
            <label htmlFor="c-name">Full name</label>
            <input id="c-name" autoComplete="name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="c-phone">Mobile number</label>
            <input
              id="c-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={ACADEMY.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(formatUSPhone(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input
              id="c-email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="claim-error" role="alert">{error}</p>
          <button className="btn claim-btn" type="submit" disabled={clock.expired}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="9" width="17" height="11" rx="1" />
              <path d="M2.5 9h19M12 9v11M12 9c-2-4-6-4-6-1.5S12 9 12 9zM12 9c2-4 6-4 6-1.5S12 9 12 9z" />
            </svg>
            Claim my gift
          </button>
          <p className="claim-fine">
            One gift per mobile number. Reserved for {RESERVE_HOURS} hours from the moment you opened it; the
            clock doesn’t restart.
          </p>
        </form>
      )}
    </div>
  )
}
