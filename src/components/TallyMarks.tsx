/**
 * Truco marks, the way they go on paper: groups of five — four strokes crossed
 * by a diagonal. Verified against the rules, 2026-08-23.
 *   https://trucogame.com/pages/reglamento-de-truco-argentino
 *
 * Strokes are nudged off true by a fixed per-index amount so a full row does
 * not read as a printed barcode. Deterministic, not random — the same score
 * always draws the same marks.
 */

const W = 46
const H = 54
const X = [8, 17, 26, 35]

/** Small, repeatable wobble so the strokes look written rather than printed. */
function skew(seed: number, spread = 1.6): number {
  return ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * spread
}

function Group({ filled, index }: { filled: number; index: number }) {
  const strokes = X.slice(0, Math.min(filled, 4))
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="tally__group">
      {strokes.map((x, i) => {
        const wobble = skew(index * 7 + i)
        return (
          <path
            key={x}
            d={`M${x + wobble} 6 L${x - wobble} ${H - 6}`}
            stroke="currentColor"
            strokeWidth="3.1"
            strokeLinecap="round"
            fill="none"
          />
        )
      })}
      {filled >= 5 && (
        <path
          d={`M3 ${H - 5} L${W - 3} 5`}
          stroke="currentColor"
          strokeWidth="3.1"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}

interface Props {
  count: number
  /** How many points this half of the sheet holds — 15 for truco. */
  capacity: number
}

export function TallyMarks({ count, capacity }: Props) {
  const groups = Math.ceil(capacity / 5)
  return (
    <div className="tally">
      {Array.from({ length: groups }, (_, i) => {
        const filled = Math.max(0, Math.min(5, count - i * 5))
        return <Group key={i} filled={filled} index={i} />
      })}
    </div>
  )
}
