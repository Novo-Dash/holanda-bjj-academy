import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { form } from '../data/kids'
import { BookingForm } from './BookingForm'
import { track } from '@/kids/lib/track'
import { afterPaint } from '../lib/motion'

export type SheetHandle = { open: () => void }

/**
 * A folha de baixo: o MESMO formulário da seção IV, para quem já passou dele.
 *
 * `<dialog>` nativo e não uma biblioteca: `showModal()` já prende o foco,
 * fecha no Esc, torna o resto da página inerte e devolve o foco a quem abriu.
 * É o comportamento que o PRD pede (§12), sem um byte de JS a mais.
 *
 * O formulário só é montado na primeira abertura: duas cópias vivas desde o
 * início seriam o dobro de trabalho na hidratação.
 */
export const BookSheet = forwardRef<SheetHandle>(function BookSheet(_, ref) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [mounted, setMounted] = useState(false)

  useImperativeHandle(ref, () => ({
    open() {
      setMounted(true)
      dialog.current?.showModal()
      afterPaint(() => track('view_content', { content_name: 'Kids Booking' }))
    },
  }))

  return (
    <dialog
      ref={dialog}
      className="hk-sheet"
      aria-labelledby="sheet-title"
      onClick={(e) => {
        /* Toque no fundo escurecido fecha. */
        if (e.target === dialog.current) dialog.current?.close()
      }}
    >
      <div className="hk-sheet__in">
        <div className="hk-sheet__head">
          <h2 id="sheet-title" className="hk-type-h3">
            {form.title}
          </h2>
          <button type="button" className="hk-sheet__close" onClick={() => dialog.current?.close()}>
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>
        {mounted && <BookingForm where="sheet" />}
      </div>
    </dialog>
  )
})
