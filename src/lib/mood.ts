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
 * How big a gap has to be before it counts as a thrashing.
 *
 * THIS USED TO BE ONE FIXED NUMBER PER GAME — 70 points in generala — and it
 * was the wrong shape of answer, not just the wrong value. A gap of fifteen
 * points is a rout on the second row, when the sheet reads 8 to 23, and a
 * photo finish on the last one, when it reads 170 to 185. One constant cannot
 * mean both, so it ended up meaning neither: measured over four hundred
 * simulated games, the opening was 100% neutral faces, the middle 76%, and the
 * five expressions only separated in the closing rows. Three faces, in
 * practice, which is exactly what it looked like at the table.
 *
 * So the scale grows with the sheet. It is a fraction of what has actually
 * been scored so far, which is what makes a gap early and a gap late comparable
 * — and the floor stops the first row, where the totals are 3 and 7, from
 * reading as a massacre.
 *
 * Same four hundred games with this: opening 79% neutral and the rest mildly
 * up or down, middle spread across all five, closing rows reaching the
 * extremes about a fifth of the time.
 */

/**
 * The smallest gap that can still move the face, in each game's own points.
 * Roughly a tenth of what a finished game is worth, which is what keeps the
 * early rows quiet.
 *
 * ⚠️ Only generala is measured. The other three are scaled from it by what a
 * full game is worth (30 for truco, 100 for the hand games) and have NOT been
 * checked against real play.
 */
const FLOOR: Record<GameId, number> = {
  generala: 20,
  truco: 3,
  rummy: 10,
  chinchon: 10,
}

/**
 * How much of the average score on the sheet counts as the full range. At 0.4,
 * running away with it means being ahead of the field by roughly 40% of what a
 * player has scored so far.
 */
const SPREAD = 0.4

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

  /*
   * The yardstick, rebuilt from the sheet every time. `played` is what an
   * average player has on the board right now, so the scale is small while the
   * game is small and grows as the numbers do.
   */
  const played = totals.reduce((sum, n) => sum + n, 0) / totals.length
  const scale = Math.max(FLOOR[game], played * SPREAD)

  return totals.map((mine, i) => {
    const others = totals.filter((_, j) => j !== i)
    if (others.length === 0) return 0

    /*
     * Measured against the AVERAGE of the rest, not the leader.
     *
     * Against the leader every player who is not winning sinks: with six on
     * the sheet that put three of them on the crying face, and the person
     * lying third is not crying. The average spreads them out the way the
     * table actually feels — the leader still comes out highest, because
     * nobody can be further above the average than the person on top.
     */
    const field = others.reduce((sum, n) => sum + n, 0) / others.length
    const lead = winnerIs === 'highest' ? mine - field : field - mine
    return clamp(lead / scale)
  })
}
