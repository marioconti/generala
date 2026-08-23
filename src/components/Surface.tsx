import { useEffect, useId, type ReactNode } from 'react'
import type { GameId } from '../lib/history'

export type SurfaceId = GameId | 'home'

/**
 * The table each game is played on.
 *
 * Same recipe every time — a radial gradient lit from above, grained with SVG
 * turbulence so it reads as cloth — over a per-game palette set in tokens.css.
 * On top of that each game gets its own quiet motif, so the four screens feel
 * like four tables in the same club rather than one screen recoloured.
 */
function Motif({ game }: { game: SurfaceId }) {
  const id = useId().replace(/:/g, '')

  if (game === 'home') return null

  return (
    <svg className="surface__motif" aria-hidden="true">
      <defs>
        <pattern id={id} width={PATTERNS[game].size} height={PATTERNS[game].size} patternUnits="userSpaceOnUse">
          {PATTERNS[game].draw}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const STROKE = 'rgba(255,255,255,.5)'

const PATTERNS: Record<Exclude<SurfaceId, 'home'>, { size: number; draw: ReactNode }> = {
  // Dice pips, scattered on a grid.
  generala: {
    size: 46,
    draw: (
      <>
        <circle cx="10" cy="10" r="1.6" fill={STROKE} />
        <circle cx="33" cy="24" r="1.6" fill={STROKE} />
        <circle cx="17" cy="36" r="1.6" fill={STROKE} />
      </>
    ),
  },
  // Diamonds — the English deck.
  rummy: {
    size: 40,
    draw: <path d="M20 6 L28 20 L20 34 L12 20 Z" fill="none" stroke={STROKE} strokeWidth="1.1" />,
  },
  // Concentric rings, after the "oros" of the Spanish deck.
  chinchon: {
    size: 44,
    draw: (
      <>
        <circle cx="22" cy="22" r="9" fill="none" stroke={STROKE} strokeWidth="1.1" />
        <circle cx="22" cy="22" r="3.2" fill="none" stroke={STROKE} strokeWidth="1" />
      </>
    ),
  },
  // Ruled lines: the scrap of paper on the bar table.
  truco: {
    size: 26,
    draw: <path d="M0 25 H26" stroke={STROKE} strokeWidth="1" />,
  },
}

export function Surface({ game, children }: { game: SurfaceId; children: ReactNode }) {
  const noiseId = useId().replace(/:/g, '')

  // Stamped on <html> too, so the colour behind the notch and under an iOS
  // rubber-band scroll matches the table instead of flashing the default green.
  useEffect(() => {
    document.documentElement.dataset.game = game
  }, [game])

  return (
    <div className="surface" data-game={game}>
      <svg className="surface__grain" aria-hidden="true">
        <filter id={noiseId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
      </svg>
      <Motif game={game} />
      <div className="surface__vignette" />
      <div className="surface__inner">{children}</div>
    </div>
  )
}

/** The paper grain inside a sheet. Much fainter than the cloth. */
export function PaperGrain() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="sheet__grain" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}
