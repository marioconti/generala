/**
 * What the filed games know about the two people on the closing card.
 *
 * The card used to be able to talk only about the game just played — the
 * margin, the scratches, the names. Everything it could say about a rivalry it
 * had to invent, so it said nothing. All of this comes off the history that is
 * already on the phone, so a line built from it is as true as the sheet.
 *
 * TWO RULES CARRIED OVER FROM verdicts.ts, and one new one:
 *
 *  1. It has to be true. Every number here is counted, never estimated.
 *  2. A DRAW IS NOT A WIN. `recordGame` files every tied name under `winners`
 *     and credits none of them, so a tie has to break a streak rather than
 *     extend it — otherwise the card congratulates somebody for a game nobody
 *     won.
 *  3. Only games of the SAME kind count. "Hace cuatro partidas que no gana" has
 *     to mean four generalas, not four nights of assorted card games, or it is
 *     a sentence that sounds precise and is not.
 */

import { getHistory, normalize, type FinishedGame, type GameId } from './history'

export interface HistoryFacts {
  /** Games of this kind that this pair of names has on record. 0 for a new table. */
  filed: number
  /** Games the winner played since they last won one. 0 = they won the last one too. */
  winnerDrought: number | null
  /** True when the winner has never won one of these before. */
  winnerFirstWin: boolean
  /** Wins in a row for the winner, ending with this game. Always at least 1. */
  winnerStreak: number
  /** Games the runner-up has played since they last won. */
  loserDrought: number | null
  /** True when the runner-up has never won one of these. */
  loserNeverWon: boolean
  /** The pair's record BEFORE this game, when they have played each other. */
  h2h: { wins: number; losses: number } | null
}

const EMPTY: HistoryFacts = {
  filed: 0,
  winnerDrought: null,
  winnerFirstWin: false,
  winnerStreak: 1,
  loserDrought: null,
  loserNeverWon: false,
  h2h: null,
}

const playedIn = (entry: FinishedGame, who: string) =>
  entry.players.some((p) => normalize(p.name) === who)

/** A draw is filed with every tied name in `winners` and is not a win. */
const wonBy = (entry: FinishedGame, who: string) =>
  entry.winners.length === 1 && normalize(entry.winners[0]) === who

/**
 * `excludeId` is the game being shown. It is already filed by the time the card
 * renders, so without this every drought would be zero and every card would
 * announce that the winner is on a streak of one.
 */
export function historyFactsOf(
  game: GameId,
  winnerName: string,
  loserName: string,
  excludeId?: string,
): HistoryFacts {
  const winner = normalize(winnerName)
  const loser = normalize(loserName)
  if (!winner) return EMPTY

  // Oldest first on disk; newest first is the order every question below wants.
  const past = getHistory()
    .filter((e) => e.game === game && e.id !== excludeId)
    .reverse()

  const winnerGames = past.filter((e) => playedIn(e, winner))
  const loserGames = loser ? past.filter((e) => playedIn(e, loser)) : []

  const droughtOf = (games: FinishedGame[], who: string) => {
    const since = games.findIndex((e) => wonBy(e, who))
    return since === -1 ? (games.length > 0 ? games.length : null) : since
  }

  let streak = 1
  for (const entry of winnerGames) {
    if (!wonBy(entry, winner)) break
    streak += 1
  }

  const together = loser ? winnerGames.filter((e) => playedIn(e, loser)) : []
  const h2h =
    together.length > 0
      ? {
          wins: together.filter((e) => wonBy(e, winner)).length,
          losses: together.filter((e) => wonBy(e, loser)).length,
        }
      : null

  return {
    filed: past.length,
    winnerDrought: droughtOf(winnerGames, winner),
    winnerFirstWin: winnerGames.length > 0 && !winnerGames.some((e) => wonBy(e, winner)),
    winnerStreak: streak,
    loserDrought: loser ? droughtOf(loserGames, loser) : null,
    loserNeverWon: loserGames.length > 0 && !loserGames.some((e) => wonBy(e, loser)),
    h2h,
  }
}
