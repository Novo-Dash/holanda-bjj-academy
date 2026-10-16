import { useEffect, useRef } from 'react'
import { track } from '@/kids/lib/track'
import { firstClass } from '../data/kids'
import { prefersReducedMotion } from '../lib/motion'
import { Torii } from '../ui/icons'
import { Button, Eyebrow, Sticker } from '../ui/parts'
import type { Book } from '../KidsApp'

const START = firstClass.steps[0].at ?? -15
/* o minuto que a volta do ponteiro representa inteira */
const SPAN = 30

/** -15 → "-15:00"; 0 → "00:00". */
const fmt = (m: number) => `${m < 0 ? '-' : ''}${String(Math.abs(Math.round(m))).padStart(2, '0')}:00`

/**
 * VII · A primeira aula, do começo ao fim. O MECANISMO é o do Dárcio Kids
 * (pedido do Adryan, 09/10): uma espinha no meio, os passos em zigue-zague em
 * volta dela, e um relógio que desce pela espinha amarrado ao scroll e marca o
 * minuto do primeiro dia, chegando em cada passo exatamente no minuto dele.
 *
 * O VISUAL é outro: a espinha é a linha vermelha do torii, cada passo tem um
 * torii pequeno como estação (acende quando o relógio passa), e o relógio é um
 * CRONÔMETRO de esporte, com a coroa em cima e o visor embaixo. As fotos abrem
 * por um recorte redondo.
 *
 * Sem GSAP: um ouvinte passivo de scroll, ativo só com a seção na tela, lê os
 * retângulos e escreve transform e texto no mesmo quadro.
 *
 * Estado-base (sem JS, reduced-motion): tudo aceso, cronômetro no primeiro
 * passo, nada escondido.
 */
export function FirstClass({ onBook }: { onBook: Book }) {
  const ref = useRef<HTMLDivElement>(null)
  const steps = firstClass.steps

  useEffect(() => {
    const line = ref.current
    if (!line || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    const clock = line.querySelector<HTMLElement>('.fc-clock')!
    const read = line.querySelector<HTMLElement>('.fc-read')!
    const hand = line.querySelector<HTMLElement>('.fc-hand')!
    const fill = line.querySelector<HTMLElement>('.fc-fill')!
    const rows = Array.from(line.querySelectorAll<HTMLElement>('.fc-row'))
    const dots = rows.map((r) => r.querySelector<HTMLElement>('.fc-station')!)

    line.classList.add('is-live')
    let raf = 0
    let lastText = ''

    const update = () => {
      raf = 0
      /* LEITURAS primeiro, todas; escritas depois. */
      const box = line.getBoundingClientRect()
      const H = box.height
      const ys = dots.map((d) => {
        const r = d.getBoundingClientRect()
        return r.top + r.height / 2 - box.top
      })
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - box.top) / H))
      const y = p * H

      /* o minuto, interpolado entre os passos que têm minuto */
      const timed: [number, number][] = []
      steps.forEach((s, i) => {
        if (s.at !== null) timed.push([ys[i], s.at])
      })
      const lastTimedY = timed[timed.length - 1][0]
      const lastY = ys[ys.length - 1]
      let text: string
      let minute: number
      if (y >= lastY - 4) {
        text = firstClass.clock.done
        minute = START + SPAN
      } else if (y > lastTimedY + 4) {
        text = firstClass.clock.inClass
        minute = timed[timed.length - 1][1] + ((y - lastTimedY) / Math.max(1, lastY - lastTimedY)) * 15
      } else {
        const pts: [number, number][] = [[0, START], ...timed]
        minute = START
        for (let i = 1; i < pts.length; i++) {
          const [y1, m1] = pts[i]
          const [y0, m0] = pts[i - 1]
          if (y <= y1) {
            minute = m0 + ((m1 - m0) * (y - y0)) / Math.max(1, y1 - y0)
            break
          }
          minute = m1
        }
        text = fmt(minute)
      }

      clock.style.transform = `translate(-50%, ${y}px)`
      fill.style.transform = `scaleY(${p})`
      hand.style.transform = `rotate(${((minute - START) / SPAN) * 360}deg)`
      if (text !== lastText) {
        read.textContent = text
        lastText = text
      }
      rows.forEach((r, i) => r.classList.toggle('is-lit', y >= ys[i] - 4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', onScroll, { passive: true })
          onScroll()
        } else {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onScroll)
        }
      },
      { rootMargin: '20% 0px' }
    )
    io.observe(line)
    update()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      line.classList.remove('is-live')
    }
  }, [steps])

  return (
    <section id="first-class" className="hk-sec hk-first" aria-labelledby="first-title">
      <div className="hk-shell">
        <header className="hk-first__head">
          <Eyebrow>{firstClass.eyebrow}</Eyebrow>
          <h2 id="first-title" className="hk-type-h2" data-rise="">
            {firstClass.h2}
          </h2>
        </header>

        <div ref={ref} className="fc">
          <span className="fc-spine" aria-hidden="true">
            <span className="fc-fill" />
          </span>

          {/* O cronômetro que desce pela linha. */}
          <div className="fc-clock" aria-hidden="true">
            <span className="fc-watch">
              <span className="fc-crown" />
              <span className="fc-face">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />
                ))}
                <span className="fc-hand" />
                <span className="fc-pin" />
              </span>
            </span>
            <span className="fc-read">{fmt(START)}</span>
          </div>

          <ol className="fc-list">
            {steps.map((s, i) => (
              <li key={s.title} className={`fc-row ${i % 2 ? 'is-right' : 'is-left'}`}>
                <div className="fc-text">
                  <p className="fc-when">
                    <span className="fc-n">{i + 1}</span>
                    {s.at === null ? firstClass.clock.after : fmt(s.at)}
                  </p>
                  <h3 className="hk-type-h3">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <span className="fc-station" aria-hidden="true">
                  <Torii />
                </span>
                <figure className="fc-photo" data-draw="">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={`${s.img}-480.webp 480w, ${s.img}-800.webp 800w`}
                      sizes="(min-width: 960px) 34vw, 80vw"
                    />
                    <img
                      src={`${s.img}-480.webp`}
                      width={480}
                      height={360}
                      alt={s.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </figure>
              </li>
            ))}
          </ol>
        </div>

        <div className="hk-first__foot">
          <Sticker tilt={-2} onTap={() => track('sticker_tap', { id: 'first_class' })}>
            {firstClass.kidsNote}
          </Sticker>
          <Button onClick={() => onBook('first_class')}>{firstClass.cta}</Button>
        </div>
      </div>
    </section>
  )
}
