import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Mark } from '@/components/mark'
import { Pending } from '@/components/paper'
import { offer, programs, schedule, schedulePending, site } from '@/data/site'
import { sendBooking } from '@/booking/webhook'
import { track, trackLead } from '@/lib/track'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

/** Tempo mínimo entre abrir a folha e mandar. Um humano leva mais que isto para
    escolher programa, digitar nome, e-mail e telefone e ainda escolher um
    horário; um script leva 200ms. É a metade barata do anti-spam, e a outra
    metade é o campo-armadilha logo abaixo. */
const MIN_FILL_MS = 5000

/**
 * Próximos dias com aula do programa escolhido, montados a partir da grade da
 * parede. Enquanto o calendário do CRM não existe, a disponibilidade real vem
 * daqui: é o mesmo dado que a página já mostra, então o formulário nunca
 * oferece um horário que a grade não tem.
 */
function nextDays(programId: string) {
  const out: { iso: string; weekday: string; label: string; times: string[] }[] = []
  const today = new Date()

  /* Que aulas da grade servem para cada programa. A turma aberta ("All levels")
     conta para iniciante e para avançado; a de no-gi não conta para nenhum dos
     dois, senão alguém que pediu aula de kimono apareceria de bermuda. */
  const ACCEPTS: Record<string, string[]> = {
    beginners: ['Adults · Beginners', 'Adults · All levels'],
    advanced: ['Adults · Advanced', 'Adults · All levels'],
    kids: ['Kids'],
    nogi: ['Adults · No-Gi'],
  }
  const accepted = ACCEPTS[programId] ?? ['Adults']

  for (let i = 1; i <= 12 && out.length < 6; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
    const day = schedule.find((d) => d.day === weekday)
    if (!day) continue

    const times = day.slots
      .filter((s) => accepted.some((prefix) => s.program.startsWith(prefix)))
      .map((s) => s.time)
    if (!times.length) continue

    out.push({
      iso: date.toISOString().slice(0, 10),
      weekday: weekday.slice(0, 3),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      times,
    })
  }
  return out
}

type Details = {
  firstName: string
  lastName: string
  email: string
  phone: string
  childName: string
  childAge: string
}

const EMPTY: Details = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  childName: '',
  childAge: '',
}

/**
 * Reserva da aula grátis, em quatro passos numa folha só.
 *
 * A ORDEM IMPORTA. Programa primeiro, porque é a pergunta mais fácil e porque é
 * ela que decide o resto (a turma do filho pede o nome e a idade da criança, e
 * os horários oferecidos mudam). Contato em segundo, e agenda em terceiro:
 * pedir a agenda antes do contato faz o lead sumir se a pessoa desistir no
 * meio, e o contato é o que o cliente precisa mesmo quando a marcação não se
 * completa.
 *
 * Quem abre o modal por um cartão de programa já chega com o passo 1 respondido
 * e cai direto no 2. Perguntar de novo o que a pessoa acabou de clicar é o jeito
 * mais rápido de perder alguém na primeira tela do formulário.
 */
export function BookingModal({
  open,
  initialProgram,
  onClose,
}: {
  open: boolean
  initialProgram?: string
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [programId, setProgramId] = useState(programs[0].id)
  const [details, setDetails] = useState<Details>(EMPTY)
  const [pick, setPick] = useState<{ iso: string; time: string } | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({})
  const [tooFast, setTooFast] = useState(false)

  /* Campo-armadilha. Navegador nenhum preenche um campo escondido; robô de
     formulário preenche todos. Se vier com conteúdo, a folha AGRADECE e não
     envia nada: devolver erro ensinaria o robô a contornar. */
  const [trap, setTrap] = useState('')

  const openedAt = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const days = useMemo(() => nextDays(programId), [programId])
  const program = programs.find((p) => p.id === programId) ?? programs[0]
  const isKids = programId === 'kids'

  /* Ao abrir: marca a hora, escolhe o programa que veio do cartão clicado e
     conta o início do funil. */
  useEffect(() => {
    if (!open) return
    openedAt.current = Date.now()
    const startAt = initialProgram && programs.some((p) => p.id === initialProgram) ? 2 : 1
    if (initialProgram) setProgramId(initialProgram)
    setStep(startAt as 1 | 2)
    track('begin_checkout', { program: initialProgram ?? programs[0].id })
  }, [open, initialProgram])

  /* Esc fecha, o scroll do fundo trava, e o Tab fica preso dentro da folha
     enquanto ela está aberta: sem o laço, a tabulação sai por trás do modal e
     quem navega por teclado se perde numa página que não pode tocar. */
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const sheet = sheetRef.current
      if (!sheet) return
      const focusables = sheet.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focus = window.setTimeout(() => firstFieldRef.current?.focus(), 280)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      window.clearTimeout(focus)
    }
  }, [open, onClose])

  /* Fechada, a folha volta ao início para a próxima abertura. O atraso espera a
     animação de saída: zerar na hora faz o conteúdo trocar na frente de quem
     está vendo a folha descer. */
  useEffect(() => {
    if (open) return
    const id = window.setTimeout(() => {
      setStep(1)
      setPick(null)
      setErrors({})
      setTooFast(false)
    }, 360)
    return () => window.clearTimeout(id)
  }, [open])

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof Details, string>> = {}
    if (details.firstName.trim().length < 2) next.firstName = 'Tell us your first name'
    if (details.lastName.trim().length < 2) next.lastName = 'And your last name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim())) next.email = 'Check the email'
    if (details.phone.replace(/\D/g, '').length < 10) next.phone = 'Ten digits, please'
    if (isKids) {
      if (details.childName.trim().length < 2) next.childName = 'And the name of your child'
      const age = Number(details.childAge)
      if (!details.childAge || Number.isNaN(age) || age < 4 || age > 17) {
        next.childAge = 'Age between 4 and 17'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [details, isKids])

  function submit() {
    if (!pick) return

    if (trap.trim()) {
      // Robô. A folha agradece e nada é enviado.
      setStep(4)
      return
    }
    if (Date.now() - openedAt.current < MIN_FILL_MS) {
      setTooFast(true)
      return
    }

    sendBooking({
      ...details,
      programId,
      programLabel: program.name,
      date: pick.iso,
      time: pick.time,
    })
    trackLead({ program: programId, value: 0, currency: 'USD' })
    setStep(4)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Claim your free trial class"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/70"
          />

          <motion.div
            ref={sheetRef}
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative grid max-h-[94vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-t-plate bg-paper sm:rounded-plate md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"
          >
            {/* Painel de marca. Some no celular: numa tela de 375px ele
                empurraria o primeiro campo para fora da dobra, e a folha existe
                para ser preenchida, não para ser admirada. */}
            <aside className="hidden flex-col justify-between bg-ink p-9 text-paper md:flex">
              <div>
                <Mark className="h-10 w-10 text-red" />
                {/* "Três", e não "quatro": o visitante conta o que ele
                    preenche, e o quarto estado da folha é a confirmação, que
                    ele não preenche. Prometer quatro e mostrar três chips
                    numerados é a promessa brigando com a interface. */}
                <p className="display mt-8 text-[2rem] leading-tight">
                  Three steps.
                  <br />
                  Under a minute.
                </p>
                <p className="mt-5 text-[0.9rem] leading-relaxed text-paper/60">
                  {offer.note}
                </p>
              </div>

              <dl className="mt-10 border-t border-paper/15 pt-6">
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="label text-paper/45">Trial class</dt>
                  <dd className="m-0 text-[0.95rem]">Free</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="label text-paper/45">Where</dt>
                  <dd className="m-0 text-right text-[0.95rem]">{site.address.line1}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="label text-paper/45">Questions</dt>
                  <dd className="m-0 text-[0.95rem]">
                    <a href={site.phoneHref} className="tnum text-paper no-underline">
                      {site.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>

            {/* A folha */}
            <div className="p-6 sm:p-9">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2.5">
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        'label tnum flex h-7 w-7 items-center justify-center rounded-inner border',
                        step >= n
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line-strong text-ink-soft'
                      )}
                    >
                      {n}
                    </span>
                  ))}
                  <span className="label ml-1.5 text-ink-soft">
                    {step === 1
                      ? 'Which class'
                      : step === 2
                        ? 'Your details'
                        : step === 3
                          ? 'Pick a time'
                          : 'Done'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center text-ink-soft hover:text-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="mt-7">
                {step === 1 && (
                  <div>
                    <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                      Which class do you want to try first? You can change it later.
                    </p>

                    <div className="mt-5 flex flex-col gap-2.5">
                      {programs.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProgramId(p.id)
                            setStep(2)
                          }}
                          className={cn(
                            'group flex items-center justify-between gap-4 rounded-plate border p-4 text-left transition-colors',
                            programId === p.id
                              ? 'border-red bg-red-soft'
                              : 'border-line-strong hover:border-red/50'
                          )}
                        >
                          <span className="block min-w-0">
                            <span className="display block text-[1.3rem] text-ink">{p.name}</span>
                            {/* A descrição completa da turma mora AQUI desde que
                                ela saiu do cartão de programa. É o lugar certo:
                                na vitrine ela era leitura, e neste passo ela é
                                o que decide entre uma turma e outra. */}
                            <span className="label mt-1.5 block text-[0.55rem] text-ink-soft">
                              {p.audience === 'kids' ? 'For kids' : 'For adults'} · {p.ages}
                            </span>
                            <span className="mt-2 block text-[0.84rem] leading-snug text-ink-soft">
                              {p.summary}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="block h-2 w-2 shrink-0 rotate-45 bg-red opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (validate()) setStep(3)
                    }}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="First name" error={errors.firstName}>
                        <input
                          ref={firstFieldRef}
                          value={details.firstName}
                          onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
                          className={inputClass}
                          autoComplete="given-name"
                        />
                      </Field>
                      <Field label="Last name" error={errors.lastName}>
                        <input
                          value={details.lastName}
                          onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
                          className={inputClass}
                          autoComplete="family-name"
                        />
                      </Field>
                    </div>

                    {isKids && (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.6fr_1fr]">
                        <Field label="Child's name" error={errors.childName}>
                          <input
                            value={details.childName}
                            onChange={(e) => setDetails((d) => ({ ...d, childName: e.target.value }))}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Child's age" error={errors.childAge}>
                          <input
                            inputMode="numeric"
                            value={details.childAge}
                            onChange={(e) => setDetails((d) => ({ ...d, childAge: e.target.value }))}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}

                    <Field label="Email" error={errors.email}>
                      <input
                        type="email"
                        value={details.email}
                        onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                        className={inputClass}
                        autoComplete="email"
                      />
                    </Field>

                    <Field label="Phone" error={errors.phone}>
                      <input
                        type="tel"
                        placeholder="(508) 555-0000"
                        value={details.phone}
                        onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                        className={inputClass}
                        autoComplete="tel"
                      />
                    </Field>

                    {/* O campo-armadilha. `aria-hidden` e fora da ordem de
                        tabulação: leitor de tela não o anuncia e teclado não
                        chega nele, então ele só existe para quem preenche o DOM
                        sem olhar. */}
                    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                      <label>
                        Company
                        <input
                          tabIndex={-1}
                          autoComplete="off"
                          value={trap}
                          onChange={(e) => setTrap(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="md"
                        withCaret={false}
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button type="submit" size="lg" className="flex-1">
                        Pick a time
                      </Button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <div>
                    <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                      {program.name} class, {program.ages.toLowerCase()}. Choose when you want to
                      come in.
                    </p>

                    <div className="mt-5 flex flex-col gap-4">
                      {days.map((day) => (
                        <div key={day.iso} className="border-b border-line pb-4 last:border-b-0">
                          <p className="label text-ink-soft">
                            {day.weekday} · {day.label}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {day.times.map((time) => {
                              const on = pick?.iso === day.iso && pick.time === time
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setPick({ iso: day.iso, time })}
                                  className={cn(
                                    'tnum rounded-inner border px-4 py-2.5 text-[0.85rem] transition-colors',
                                    on
                                      ? 'border-red bg-red text-paper'
                                      : 'border-line-strong text-ink hover:border-red'
                                  )}
                                >
                                  {time}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {schedulePending && <Pending>Live calendar to connect</Pending>}

                    {tooFast && (
                      <p role="alert" className="mt-4 text-[0.82rem] text-red">
                        That went through a little too fast. Give it a moment and send again.
                      </p>
                    )}

                    <div className="mt-7 flex items-center gap-3">
                      <Button variant="outline" size="md" withCaret={false} onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button size="md" className="flex-1" onClick={submit} aria-disabled={!pick}>
                        {pick ? 'Book my free class' : 'Pick a time first'}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="py-8 text-center">
                    <Mark className="mx-auto h-14 w-14 text-red" />
                    <p className="display mt-7 text-[2rem] leading-tight text-ink">You are in.</p>
                    <p className="mx-auto mt-4 max-w-[38ch] text-[0.95rem] leading-relaxed text-ink-soft">
                      We will reach out on {details.phone} to set up your free class. Come fifteen
                      minutes early and bring nothing but water.
                    </p>
                    <Button size="lg" className="mt-9" onClick={onClose} withCaret={false}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const inputClass =
  'w-full rounded-plate border border-line-strong bg-paper px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-red'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="label mb-2 block text-ink-soft">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-[0.78rem] text-red">{error}</span>}
    </label>
  )
}
