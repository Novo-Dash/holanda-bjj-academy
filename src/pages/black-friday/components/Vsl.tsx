import { useState } from 'react'
import { VSL } from '@/pages/black-friday/data/campaign'

// Vertical 9:16 player. Poster first, video only on click, so the file stays off
// the critical path. Without a source it renders nothing (no placeholder
// frame on the live page; the hero copy takes the full width).
export default function Vsl() {
  const [playing, setPlaying] = useState(false)
  if (!VSL.src) return null

  return (
    <figure className="vsl">
      <div className="vsl-frame">
        {playing ? (
          <video controls autoPlay playsInline poster={VSL.poster ?? undefined} src={VSL.src} />
        ) : (
          <button type="button" className="vsl-poster" onClick={() => setPlaying(true)}>
            {VSL.poster && <img src={VSL.poster} alt="" width="720" height="1280" decoding="async" />}
            <span className="vsl-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
            </span>
            <span className="sr-only">Play video: {VSL.label}</span>
          </button>
        )}
      </div>
      <figcaption>
        <span className="vsl-dot" aria-hidden="true" />
        {VSL.label}
      </figcaption>
    </figure>
  )
}
