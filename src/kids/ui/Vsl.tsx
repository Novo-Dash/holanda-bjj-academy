import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/track'
import { video } from '../data/kids'
import { afterPaint, prefersReducedMotion } from '../lib/motion'
import { Pause, Play, Replay, SoundOff } from './icons'

/**
 * A VSL vertical (PRD 10·I).
 *
 * - Baixa só perto da tela (`preload="none"` até 300px do viewport).
 * - Toca muda e em laço só enquanto visível. Com reduced-motion, não toca
 *   sozinha: mostra o poster e o botão de play.
 * - "Tap for sound" reinicia do zero COM som. O `muted` é propriedade, não
 *   atributo: o React não sincroniza o atributo depois da hidratação (lição do
 *   Dárcio e do Satori), e sem isso o autoplay é recusado.
 * - O CTA do vídeo é um botão de verdade FORA do vídeo, nunca um link
 *   invisível posicionado sobre um quadro (bug proibido 12).
 */
/** Põe o arquivo no player uma vez (antes disso ele só tem o poster). */
function load(v: HTMLVideoElement) {
  if (!v.getAttribute('src')) {
    v.preload = 'auto'
    v.src = video.src
  }
}

export function Vsl({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<'muted' | 'sound' | 'paused' | 'ended'>('muted')
  const userPaused = useRef(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    if (prefersReducedMotion()) {
      setMode('paused')
      return
    }
    /* O arquivo é posto DIRETO no elemento, e só então ele toca. Antes o src
       vinha de um estado do React, e o play() rodava no mesmo instante, com o
       player ainda vazio: no desktop, onde a VSL já está na tela ao carregar,
       o play falhava, o player caía em "pausado" e não tentava de novo. */
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0) load(v)
        if (e.intersectionRatio >= 0.5 && !userPaused.current) {
          void v.play().then(
            () => setMode((m) => (m === 'paused' ? 'muted' : m)),
            () => setMode('paused')
          )
        } else if (e.intersectionRatio < 0.5) v.pause()
      },
      { rootMargin: '300px 0px', threshold: [0, 0.5] }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const withSound = () => {
    const v = ref.current
    if (!v) return
    load(v)
    v.muted = false
    v.loop = false
    v.currentTime = 0
    userPaused.current = false
    void v.play()
    setMode('sound')
    afterPaint(() => track('vsl_sound'))
  }

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      load(v)
      userPaused.current = false
      void v.play()
      setMode(v.muted ? 'muted' : 'sound')
      afterPaint(() => track('vsl_play'))
    } else {
      userPaused.current = true
      v.pause()
      setMode('paused')
    }
  }

  return (
    <div className={`hk-vsl${className ? ` ${className}` : ''}`}>
      <video
        ref={ref}
        className="hk-vsl__video"
        poster={video.poster}
        width={video.width}
        height={video.height}
        muted
        loop={mode === 'muted'}
        playsInline
        preload="none"
        aria-label={video.label}
        onEnded={() => {
          setMode('ended')
          afterPaint(() => track('vsl_complete'))
        }}
      />
      {mode === 'muted' && (
        <button type="button" className="hk-vsl__sound" onClick={withSound}>
          <SoundOff />
          {video.sound}
        </button>
      )}
      {mode === 'ended' ? (
        <button type="button" className="hk-vsl__ctrl" onClick={withSound} aria-label={video.replay}>
          <Replay />
        </button>
      ) : (
        <button
          type="button"
          className="hk-vsl__ctrl"
          onClick={toggle}
          aria-label={mode === 'paused' ? video.play : video.pause}
        >
          {mode === 'paused' ? <Play /> : <Pause />}
        </button>
      )}
    </div>
  )
}
