/**
 * How each player is doing, as one number from -1 to +1.
 *
 * The figures used to have three states — winning, losing, neither — and that
 * threw away the only thing anyone at the table actually cares about: by HOW
 * MUCH. Leading by two and leading by ninety are not the same feeling, and a
 * face that cannot tell them apart is a face saying nothing.
 *
 * So this is a scale, not a switch: 0 is level, +1 is running away with it,
 * -1 is buried. Everything the face does reads off it, which is also what
 * makes the reaction work when somebody gets overtaken — the number crosses
 * zero and the expression falls through the middle on its way down, instead of
 * flipping.
 */

import type { GameId } from './history'

/**
 * How big a gap has to be, per game, before it counts as a thrashing.
 *
 * These are not guesses: they are the margins the closing-card already treats
 * as a blowout, so the face and the verdict agree about what a big win is.
 * Generala runs to a few hundred, truco to thirty, and the hand games to a
 * hundred — one number for all four would make the face shout in one game and
 * whisper in another.
 */
const SCALE: Record<GameId, number> = {
  generala: 70,
  truco: 11,
  rummy: 26,
  chinchon: 26,
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n))

/**
 * `totals` in seating order. `winnerIs` says which direction is good, because
 * chinchón and rummy are won by the LOWEST score — without it every face at
 * those two tables would be upside down.
 *
 * Everyone still on zero gets 0: before anyone scores there is nothing to feel,
 * and a table of grinning faces before the first roll is a lie.
 */
export function moodsOf(
  totals: number[],
  game: GameId,
  winnerIs: 'highest' | 'lowest' = 'highest',
): number[] {
  if (totals.length === 0) return []
  if (totals.every((t) => t === 0)) return totals.map(() => 0)

  const scale = SCALE[game]

  return totals.map((mine, i) => {
    const others = totals.filter((_, j) => j !== i)
    if (others.length === 0) return 0

    // Measured against the best of the REST, so exactly one player can be ahead.
    // Against the field average everybody in a six-player game would look
    // roughly fine, which is not how it feels to be fourth.
    const best = winnerIs === 'highest' ? Math.max(...others) : Math.min(...others)
    const lead = winnerIs === 'highest' ? mine - best : best - mine
    return clamp(lead / scale)
  })
}
