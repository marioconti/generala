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

/** Poker chip colours, in the order players are handed one. */
export const CHIPS = [
  { fill: '#b03a3a', name: 'rojo' },
  { fill: '#2f5d8a', name: 'azul' },
  { fill: '#33383d', name: 'negro' },
  { fill: '#3d7a55', name: 'verde' },
  { fill: '#6b4a86', name: 'violeta' },
  { fill: '#c06b2a', name: 'naranja' },
]

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
 * The headline on the winner card. Reads the margin between first and second,
 * so it says something true about the game that was actually played.
 */
export function verdict(margin: number, tied: boolean): string {
  if (tied) return 'EMPATE'
  if (margin >= 80) return 'PALIZA'
  if (margin >= 40) return 'GANÓ CÓMODO'
  if (margin >= 10) return 'PARTIDO PAREJO'
  return 'POR UN PELO'
}

export function verdictNote(margin: number, tied: boolean, scratched: number): string {
  if (tied) return 'Definan a los gritos.'
  const lead = `Le sacó ${margin}.`
  if (scratched === 0) return `${lead} No tachó ni una vez.`
  if (scratched === 1) return `${lead} Tachó una sola vez.`
  return `${lead} Y eso que tachó ${scratched} veces.`
}
