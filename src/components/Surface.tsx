import { useEffect, useId, type ReactNode } from 'react'
import type { GameId } from '../lib/history'

export type SurfaceId = GameId | 'home'

/**
 * Wood table, felt mat, and whatever the game puts on top.
 *
 * The mat is inset so the wood shows around all four edges — that gap is what
 * makes it read as cloth laid on a table rather than a coloured background.
 *
 * The grain is an SVG turbulence stretched hard along one axis
 * (baseFrequency="0.014 0.7"): low frequency across, high frequency down, which
 * is what makes noise look like wood instead of static.
 */
function WoodGrain() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="surface__wood" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.7" numOctaves="4" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

/** Fine, even grain: felt rather than timber. */
function FeltGrain() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="surface__felt-grain" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

/**
 * A soft motif stitched into each mat. Rounded shapes only — no hard geometry,
 * nothing that reads as a casino.
 */
function Motif({ game }: { game: SurfaceId }) {
  const id = useId().replace(/:/g, '')
  const spec = PATTERNS[game]

  return (
    <svg className="surface__motif" aria-hidden="true">
      <defs>
        <pattern id={id} width={spec.size} height={spec.size} patternUnits="userSpaceOnUse">
          {spec.draw}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const LINE = 'rgba(255,255,255,.42)'

const PATTERNS: Record<SurfaceId, { size: number; draw: ReactNode }> = {
  // Soft dots, like pips worn into the cloth.
  generala: {
    size: 52,
    draw: (
      <>
        <circle cx="13" cy="13" r="2.6" fill={LINE} />
        <circle cx="39" cy="39" r="2.6" fill={LINE} />
      </>
    ),
  },
  // Gentle waves — the weave of a well-used cloth.
  truco: {
    size: 44,
    draw: (
      <path d="M0 22 Q11 14 22 22 T44 22" fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
    ),
  },
  // Rounded leaves.
  rummy: {
    size: 50,
    draw: (
      <path
        d="M25 12 Q37 25 25 38 Q13 25 25 12 Z"
        fill="none"
        stroke={LINE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  // Soft rings.
  chinchon: {
    size: 48,
    draw: <circle cx="24" cy="24" r="11" fill="none" stroke={LINE} strokeWidth="1.5" />,
  },
  // Scattered dots for the menu.
  home: {
    size: 46,
    draw: (
      <>
        <circle cx="12" cy="12" r="2.2" fill={LINE} />
        <circle cx="34" cy="30" r="2.2" fill={LINE} />
      </>
    ),
  },
}

export function Surface({ game, children }: { game: SurfaceId; children: ReactNode }) {
  // Stamped on <html> too, so the colour behind the notch and under an iOS
  // rubber-band scroll is the table, not a default.
  useEffect(() => {
    document.documentElement.dataset.game = game
  }, [game])

  return (
    <div className="surface" data-game={game}>
      <WoodGrain />
      <div className="surface__mat">
        <FeltGrain />
        <Motif game={game} />
      </div>
      <div className="surface__inner">{children}</div>
    </div>
  )
}

/** The paper grain inside a sheet. Fainter than the felt. */
export function PaperGrain() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="sheet__grain" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}
