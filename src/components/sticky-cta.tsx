import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Phone } from '@/components/icons'
import { offer, site } from '@/data/site'

/**
 * Barra fixa de ação, só no celular.
 *
 * Aparece depois de 600px de rolagem, que é mais ou menos onde o hero saiu da
 * tela: antes disso ela cobriria o botão principal com uma cópia dele.
 *
 * Some enquanto o modal está aberto. Barra fixa por baixo de uma folha modal é
 * a coisa que fica encostando no polegar de quem está preenchendo o formulário.
 *
 * Duas ações e não uma: o botão da oferta e o telefone. Quem está com o celular
 * na mão e decidiu ligar não deveria precisar rolar até o rodapé para achar o
 * número.
 */
export function StickyCTA({ onBook, hidden }: { onBook: () => void; hidden: boolean }) {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          initial={reduce ? false : { y: 80 }}
          animate={{ y: 0 }}
          exit={reduce ? undefined : { y: 80 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-paper/97 px-4 py-3 md:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3">
            <a
              href={site.phoneHref}
              aria-label={`Call ${site.name} at ${site.phone}`}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-plate border border-line-strong text-ink"
            >
              <Phone className="h-5 w-5" />
            </a>
            <Button size="lg" onClick={onBook} className="flex-1">
              {offer.label}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
