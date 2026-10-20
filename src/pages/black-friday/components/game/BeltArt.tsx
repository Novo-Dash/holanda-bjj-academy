import { useId } from 'react'

interface Props {
  belt: string
  bar?: string
  stripes?: number
}

// The end of a Jiu-Jitsu belt: woven body, rank bar, tape stripes.
export default function BeltArt({ belt, bar = '#0c0c0c', stripes = 0 }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')

  return (
    <svg viewBox="0 0 260 64" aria-hidden="true" className="belt-art">
      <defs>
        <pattern id={`w${id}`} width="8" height="4" patternUnits="userSpaceOnUse">
          <rect width="8" height="1" fill="rgba(0,0,0,.16)" />
        </pattern>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
      <g transform="translate(4 14)">
        <rect width="252" height="36" rx="4" fill={belt} />
        <rect width="252" height="36" rx="4" fill={`url(#w${id})`} />
        <rect x="150" width="66" height="36" fill={bar} />
        {Array.from({ length: stripes }, (_, i) => (
          <rect key={i} x={200 - i * 13} width="6" height="36" fill="#f3f1ec" />
        ))}
        <rect width="252" height="36" rx="4" fill={`url(#s${id})`} />
      </g>
    </svg>
  )
}
