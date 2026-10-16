import { useEffect, useId, useRef } from 'react'
import { site } from '@/data/site'
import { form } from '../data/kids'
import {
  currentProgram,
  finishWithoutDay,
  formatPhone,
  markStarted,
  setBooking,
  submitStep1,
  submitStep2,
  useBooking,
} from '../lib/booking-kids'
import {
  dayNum,
  icsHref,
  longDate,
  month,
  openDays,
  programsFor,
  shortName,
  timeLabel,
  weekday,
} from '../lib/programs'
import { Alert, Calendar, Phone } from './icons'
import { Button } from './parts'

const ADDRESS = `${site.address.line1}, ${site.address.line2} ${site.address.zip ?? ''}`.trim()

/**
 * O formulário da Kids. Roda em dois lugares (inline e na folha), com o
 * MESMO estado (lib/booking-kids.ts). `where` só serve para os ids e para o
 * tracking saber de onde veio o envio.
 */
export function BookingForm({ where }: { where: 'inline' | 'sheet' }) {
  const s = useBooking()
  const uid = useId()
  const id = (k: string) => `${uid}-${where}-${k}`
  const headRef = useRef<HTMLHeadingElement>(null)
  const prevStep = useRef(s.step)

  /* A cada troca de passo, o foco vai para o título do passo: quem usa leitor
     de tela ouve onde está, e no celular o teclado fecha. */
  useEffect(() => {
    if (prevStep.current !== s.step) headRef.current?.focus({ preventScroll: false })
    prevStep.current = s.step
  }, [s.step])

  const err = (k: keyof typeof s.errors) =>
    s.errors[k] ? (
      <p className="hk-field__err" id={id(`${k}-err`)} role="alert">
        <Alert />
        {s.errors[k]}
      </p>
    ) : null

  if (s.step === 3) {
    const program = currentProgram()
    return (
      <div className="hk-form hk-form--done" aria-live="polite">
        <h3 className="hk-type-h2" tabIndex={-1} ref={headRef}>
          {form.thanks.title}
        </h3>
        <p className="hk-type-body">{form.thanks.text}</p>
        {s.booked && s.day && s.time && program && (
          <div className="hk-form__ticket">
            <p className="hk-micro">{program.name}</p>
            <p className="hk-type-h3">
              {longDate(s.day)} · {timeLabel(s.time)}
            </p>
            <p className="hk-micro">{ADDRESS}</p>
            <a
              className="hk-link"
              href={icsHref(s.day, s.time, ADDRESS)}
              download="holanda-kids-free-class.ics"
            >
              <Calendar />
              {form.thanks.calendar}
            </a>
          </div>
        )}
        <p className="hk-kid hk-form__kids">{form.thanks.kids}</p>
      </div>
    )
  }

  if (s.step === 2) {
    const program = currentProgram()
    const days = program ? openDays(program) : []
    const times = s.day && program ? (program.slots[s.day] ?? []) : []
    const loading = s.programsState === 'loading' || s.programsState === 'idle'
    const failed = s.programsState === 'error' || (s.programsState === 'ready' && (!program || !days.length))

    return (
      <form
        className="hk-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submitStep2({ day: form.errors.day, time: form.errors.time })
        }}
      >
        <h3 className="hk-form__step" tabIndex={-1} ref={headRef}>
          <span className="hk-form__n" aria-hidden="true">
            2/2
          </span>
          {form.fields.day.label}
        </h3>

        {/* SÓ TURMAS KIDS em que a criança cabe (a de kimono marcada). Com uma
            só, ela aparece como rótulo; com mais (7 a 13: gi e no-gi), vira
            escolha. A turma escolhida é a que vai no agendamento. */}
        {program && s.age && (
          <fieldset className="hk-fieldset">
            <legend className="hk-field__label">{form.fields.program.label}</legend>
            <div className="hk-progs" role="radiogroup">
              {programsFor(s.programs, s.age).map((p) => (
                <label key={p.calendarId} className="hk-prog">
                  <input
                    type="radio"
                    name={id('program')}
                    value={p.calendarId}
                    checked={program.calendarId === p.calendarId}
                    onChange={() =>
                      setBooking({ calendarId: p.calendarId, day: null, time: null, errors: {} })
                    }
                  />
                  <span>
                    <b>{shortName(p)}</b>
                    <small>{form.fields.program.ages(p.min, p.max)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {loading && (
          <div className="hk-days" aria-busy="true" aria-label={form.loadingDays}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="hk-day hk-day--ghost" />
            ))}
          </div>
        )}

        {failed && (
          <div className="hk-form__fallback">
            <p className="hk-type-body">{s.programsState === 'error' ? form.noApi : form.noDays}</p>
            <Button block onClick={finishWithoutDay}>
              {form.sendWithoutDay}
            </Button>
          </div>
        )}

        {!loading && !failed && (
          <>
            <fieldset className="hk-fieldset">
              <legend className="sr-only">{form.fields.day.label}</legend>
              <div
                className="hk-days"
                role="radiogroup"
                aria-describedby={s.errors.day ? id('day-err') : undefined}
              >
                {days.map((d) => (
                  <label key={d.key} className="hk-day">
                    <input
                      type="radio"
                      name={id('day')}
                      value={d.key}
                      checked={s.day === d.key}
                      onChange={() =>
                        setBooking({
                          day: d.key,
                          /* Uma aula por dia é o caso comum: o horário já vem
                             escolhido e o passo vira um toque só. */
                          time: d.times.length === 1 ? d.times[0] : null,
                          errors: {},
                        })
                      }
                    />
                    <span className="hk-day__w">{weekday(d.key)}</span>
                    <span className="hk-day__n">{dayNum(d.key)}</span>
                    <span className="hk-day__m">{month(d.key)}</span>
                  </label>
                ))}
              </div>
              {err('day')}
            </fieldset>

            {s.day && (
              <fieldset className="hk-fieldset">
                <legend className="hk-field__label">{longDate(s.day)}</legend>
                <div className="hk-times" role="radiogroup">
                  {times.map((t) => (
                    <label key={t} className="hk-time">
                      <input
                        type="radio"
                        name={id('time')}
                        value={t}
                        checked={s.time === t}
                        onChange={() => setBooking({ time: t, errors: {} })}
                      />
                      <span>{timeLabel(t)}</span>
                    </label>
                  ))}
                </div>
                {err('time')}
              </fieldset>
            )}

            <Button type="submit" block>
              {form.step2}
            </Button>
          </>
        )}

        <button type="button" className="hk-form__back" onClick={() => setBooking({ step: 1, errors: {} })}>
          {form.back}
        </button>
      </form>
    )
  }

  return (
    <form
      className="hk-form"
      noValidate
      onFocus={markStarted}
      onSubmit={(e) => {
        e.preventDefault()
        submitStep1({ name: form.errors.name, phone: form.errors.phone, age: form.errors.age })
      }}
    >
      <div className="hk-field">
        <label className="hk-field__label" htmlFor={id('name')}>
          {form.fields.name.label}
        </label>
        <input
          id={id('name')}
          className="hk-input"
          type="text"
          autoComplete="name"
          placeholder={form.fields.name.placeholder}
          value={s.name}
          aria-invalid={!!s.errors.name || undefined}
          aria-describedby={s.errors.name ? id('name-err') : undefined}
          onChange={(e) => setBooking({ name: e.target.value })}
        />
        {err('name')}
      </div>

      <div className="hk-field">
        <label className="hk-field__label" htmlFor={id('phone')}>
          {form.fields.phone.label}
        </label>
        <input
          id={id('phone')}
          className="hk-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(508) 555-0123"
          value={s.phone}
          aria-invalid={!!s.errors.phone || undefined}
          aria-describedby={`${id('phone-help')}${s.errors.phone ? ` ${id('phone-err')}` : ''}`}
          onChange={(e) => setBooking({ phone: formatPhone(e.target.value) })}
        />
        <p className="hk-field__help" id={id('phone-help')}>
          {form.fields.phone.help}
        </p>
        {err('phone')}
      </div>

      <fieldset className="hk-fieldset">
        <legend className="hk-field__label">{form.fields.age.label}</legend>
        <div
          className="hk-ages"
          role="radiogroup"
          aria-describedby={s.errors.age ? id('age-err') : undefined}
        >
          {form.ages.map((a) => (
            <label key={a} className="hk-age">
              <input
                type="radio"
                name={id('age')}
                value={a}
                checked={s.age === a}
                aria-label={`${a} years old`}
                onChange={() => setBooking({ age: a, calendarId: null, day: null, time: null, errors: {} })}
              />
              <span aria-hidden="true">{a}</span>
            </label>
          ))}
        </div>
        {err('age')}
      </fieldset>

      {/* Campo-armadilha: invisível para gente, irresistível para robô. */}
      <div className="hk-honey" aria-hidden="true">
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={s.honey}
            onChange={(e) => setBooking({ honey: e.target.value })}
          />
        </label>
      </div>

      <Button type="submit" block>
        {form.step1}
      </Button>
      <p className="hk-micro hk-form__under">{form.under}</p>
      <p className="hk-micro hk-form__call">
        <Phone />
        {form.orCall} <a href={site.phoneHref}>{site.phone}</a>
      </p>
    </form>
  )
}
