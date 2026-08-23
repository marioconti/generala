import { useId, type ReactNode } from 'react'

/**
 * The table itself: a radial gradient lit from above, grained with an SVG
 * turbulence filter so it reads as felt rather than flat green.
 */
export function Felt({ children }: { children: ReactNode }) {
  const filterId = useId().replace(/:/g, '')
  return (
    <div className="felt">
      <svg className="felt__noise" aria-hidden="true">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div className="felt__inner">{children}</div>
    </div>
  )
}

/** The paper grain inside the sheet. Much fainter than the felt. */
export function PaperGrain() {
  const filterId = useId().replace(/:/g, '')
  return (
    <svg className="sheet__noise" aria-hidden="true">
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  )
}
