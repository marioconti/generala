import type { DieFace } from '../games/generala/types'

/** Pip centres on the die's 20x20 viewBox — the standard layout for each face. */
const PIPS: Record<DieFace, [number, number][]> = {
  1: [[10, 10]],
  2: [
    [6, 6],
    [14, 14],
  ],
  3: [
    [6, 6],
    [10, 10],
    [14, 14],
  ],
  4: [
    [6, 6],
    [14, 6],
    [6, 14],
    [14, 14],
  ],
  5: [
    [6, 6],
    [14, 6],
    [10, 10],
    [6, 14],
    [14, 14],
  ],
  6: [
    [6, 6],
    [6, 10],
    [6, 14],
    [14, 6],
    [14, 10],
    [14, 14],
  ],
}

interface Props {
  face: DieFace
  size?: number
}

/**
 * The die doubles as the label for its number row, which is why the category
 * column can shrink to 74px at six players and still be readable.
 */
export function Die({ face, size = 17 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect
        x="1.5"
        y="1.5"
        width="17"
        height="17"
        rx="3.5"
        fill="#fbf7ec"
        stroke="#1d3557"
        strokeWidth="1.3"
      />
      {PIPS[face].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="#1d3557" />
      ))}
    </svg>
  )
}
