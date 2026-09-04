import { moodsOf } from '../../lib/mood'
import type { Band } from '../../lib/verdicts'
import type { Category, CategoryId, Game, Player, Score } from './types'

/**
 * Scoring for the Argentine game of Generala.
 *
 * Sources (checked 2026-08-22):
 *  - Reglamento Ruibal Games
 *    https://ruibalgames.com/wp-content/uploads/2015/11/Reglamento-Generala.pdf
 *  - https://juegos.dinamicasgrupales.com.ar/como-jugar-a-la-generala/
 *
 * Two deliberate departures from those sources, both house rules confirmed by
 * the players:
 *  1. A served Generala does NOT win the game outright. It scores 50 and play
 *     continues, so `generala` has no served bonus.
 *  2. Doble Generala is played, and is worth 100.
 */

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6

export const CATEGORIES: Category[] = [
  { id: 'ones', label: 'UNOS', kind: 'number', face: 1 },
  { id: 'twos', label: 'DOSES', kind: 'number', face: 2 },
  { id: 'threes', label: 'TRESES', kind: 'number', face: 3 },
  { id: 'fours', label: 'CUATROS', kind: 'number', face: 4 },
  { id: 'fives', label: 'CINCOS', kind: 'number', face: 5 },
  { id: 'sixes', label: 'SEISES', kind: 'number', face: 6 },
  { id: 'straight', label: 'ESCALERA', kind: 'special', made: 20, served: 25 },
  { id: 'full', label: 'FULL', kind: 'special', made: 30, served: 35 },
  { id: 'poker', label: 'PÓKER', kind: 'special', made: 40, served: 45 },
  { id: 'generala', label: 'GENERALA', kind: 'special', made: 50, served: 50 },
  { id: 'doubleGenerala', label: 'DOBLE', kind: 'special', made: 100, served: 100 },
]

/** The first special row — the sheet draws a heavier rule above it. */
export const FIRST_SPECIAL: CategoryId = 'straight'

export { CHIPS } from '../../lib/chips' 

export function categoryById(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown category: ${id}`)
  return found
}

/** True when the row's served score is the same as its made score. */
export function hasServedBonus(category: Category): boolean {
  return category.kind === 'special' && category.served !== category.made
}

export function scorePoints(score: Score): number {
  return score.kind === 'scratched' ? 0 : score.points
}

export function scoreOf(game: Game, playerId: string, categoryId: CategoryId): Score | undefined {
  return game.scores[playerId]?.[categoryId]
}

export function totalFor(game: Game, playerId: string): number {
  const sheet = game.scores[playerId]
  if (!sheet) return 0
  return Object.values(sheet).reduce<number>((sum, score) => sum + scorePoints(score), 0)
}

export function filledCount(game: Game, playerId: string): number {
  return Object.keys(game.scores[playerId] ?? {}).length
}

export function scratchedCount(game: Game, playerId: string): number {
  const sheet = game.scores[playerId] ?? {}
  return Object.values(sheet).filter((s) => s.kind === 'scratched').length
}

/** The sheet is done when every player has filled every row. */
export function isComplete(game: Game): boolean {
  return game.players.every((p) => filledCount(game, p.id) === CATEGORIES.length)
}

export interface RankEntry {
  player: Player
  total: number
}

/** Highest first. Ties keep the seating order. */
export function ranking(game: Game): RankEntry[] {
  return game.players
    .map((player) => ({ player, total: totalFor(game, player.id) }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Which pool of closing lines this game earned. Generala runs to a few hundred
 * points, so the bands are wide — 40 points apart is not a close game here.
 */
export function bandFor(margin: number, tied: boolean): Band {
  if (tied) return 'tied'
  if (margin >= 80) return 'blowout'
  if (margin >= 40) return 'comfortable'
  if (margin >= 10) return 'close'
  return 'photo'
}

/**
 * How each player is doing, by seating order, from -1 to +1.
 *
 * Generala is won by the highest score, so the sign needs no flipping here —
 * unlike chinchón, where it does.
 */
export function moods(game: Game): number[] {
  return moodsOf(game.players.map((p) => totalFor(game, p.id)), 'generala', 'highest')
}
