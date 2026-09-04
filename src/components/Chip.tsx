import { CHIPS, CHIP_INK } from '../lib/chips'

interface Props {
  /** Index into CHIPS. Wraps, so a player index is always safe to pass. */
  chip: number
  /** First letter shown in the middle. Omit for a blank token. */
  initial?: string
  size?: number
  dim?: boolean
}

/**
 * A player's token: one flat colour, one ink keyline, their initial.
 *
 * WHAT THIS REPLACED. It was a painted wooden counter: a white radial
 * gradient across the top for roundness, and a groove ring inside the rim.
 * Both had to go, for different reasons.
 *
 * The gloss is the dated part. A white highlight over a solid colour is the
 * one move that puts a screen in 2008 no matter what else is on it, and no
 * amount of repainting rescues a token that has it.
 *
 * The groove is the smaller mistake but the same kind. These are drawn at 22
 * to 34 px nearly everywhere they appear. A second ring 4 px inside the first
 * is not a groove at that size, it is a smudge, and it was competing with the
 * only thing on the token that carries meaning — the letter.
 *
 * There is also a reason to do this now rather than ever. The faces beside
 * the totals are flat colour with a heavy ink outline; the counter was a
 * simulated object with a light source. The board was speaking two design
 * languages and the counter was the one losing. It now says what the faces
 * say — fill, keyline, done — and the boldness that used to go into faking a
 * lit surface goes into the colour instead, which is the only thing that
 * still does any work at 26 px.
 */
export function Chip({ chip, initial, size = 30, dim = false }: Props) {
  const { fill, letter } = CHIPS[chip % CHIPS.length]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: dim ? 0.72 : 1 }}
    >
      {/*
        The keyline is heavy on purpose — the same fraction of the diameter the
        faces use. It is not an outline for tidiness: it is what holds the
        amber token off the cream paper, which on fill alone is 1.6:1.
      */}
      <circle cx="17" cy="17" r="15.1" fill={fill} stroke={CHIP_INK} strokeWidth="2.2" />
      {initial && (
        <text
          x="17"
          y="22.1"
          textAnchor="middle"
          fontSize="14.5"
          fontWeight="700"
          fill={letter}
          fontFamily="Fredoka, system-ui, sans-serif"
        >
          {initial.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
