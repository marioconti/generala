import type { GameId } from '../../lib/history'

/**
 * The scorer behind Rummy and Chinchón.
 *
 * Both are hand-by-hand accumulators: each round every player takes a score,
 * it adds to their running total, and the game ends when someone crosses the
 * target. The only things that differ are the target and whether the highest
 * or the lowest total wins — so both are the same engine with different knobs.
 *
 * Chinchón defaults (verified 2026-08-23):
 *   played to 100, and the LOWEST total wins — reaching the limit ends it.
 *   Closing with no cards left subtracts 10, so negative hands are normal.
 *   https://www.ludoteka.com/games/chinchon/rules
 *
 * Rummy has too many house variants to pin down, so it opens with the same
 * shape and both knobs are editable at setup. Whatever Mario and Juan play at
 * their table beats whatever a website says.
 */

export type TallyVariant = Extract<GameId, 'rummy' | 'chinchon'>
export type WinnerIs = 'lowest' | 'highest'

export interface TallyPlayer {
  id: string
  name: string
  chip: number
}

export interface TallyGame {
  variant: TallyVariant
  players: TallyPlayer[]
  /** One entry per hand played: playerId -> that hand's score. */
  rounds: Record<string, number>[]
  /** null means "play until we feel like stopping". */
  target: number | null
  winnerIs: WinnerIs
  startedAt: string
  finishedAt: string | null
  /** Id of this game's entry in the history, once it has been recorded. */
  recordId?: string
}

export interface VariantPreset {
  label: string
  target: number
  winnerIs: WinnerIs
  /** Shown under the setup toggles so the rule is visible, not assumed. */
  note: string
}

export const PRESETS: Record<TallyVariant, VariantPreset> = {
  chinchon: {
    label: 'Chinchón',
    target: 100,
    winnerIs: 'lowest',
    note: 'Se juega a 100. El que llega, pierde: gana el que menos suma.',
  },
  rummy: {
    label: 'Rummy',
    target: 100,
    winnerIs: 'lowest',
    note: 'Ajustá el objetivo y quién gana según cómo lo juegan ustedes.',
  },
}

/** Running total for one player up to and including `upTo` (default: all). */
export function totalAt(game: TallyGame, playerId: string, upTo?: number): number {
  const last = upTo === undefined ? game.rounds.length - 1 : upTo
  let sum = 0
  for (let i = 0; i <= last && i < game.rounds.length; i++) {
    sum += game.rounds[i][playerId] ?? 0
  }
  return sum
}

export function totals(game: TallyGame): Record<string, number> {
  return Object.fromEntries(game.players.map((p) => [p.id, totalAt(game, p.id)]))
}

/**
 * The game is over when someone reaches the target. Note this holds whichever
 * way the game is won: in Chinchón crossing 100 ends it and that player has
 * almost certainly lost.
 */
export function isComplete(game: TallyGame): boolean {
  if (game.target === null || game.rounds.length === 0) return false
  return Object.values(totals(game)).some((t) => t >= game.target!)
}

export interface TallyRank {
  player: TallyPlayer
  total: number
}

/** Winner first, according to the game's own direction. */
export function ranking(game: TallyGame): TallyRank[] {
  const table = totals(game)
  return game.players
    .map((player) => ({ player, total: table[player.id] ?? 0 }))
    .sort((a, b) => (game.winnerIs === 'lowest' ? a.total - b.total : b.total - a.total))
}

/** Every name tied for first — more than one means a draw. */
export function winnerNames(game: TallyGame): string[] {
  const table = ranking(game)
  if (table.length === 0) return []
  const best = table[0].total
  return table.filter((r) => r.total === best).map((r) => r.player.name)
}

/** 0 to 1, how close the closest player is to ending the game. */
export function progress(game: TallyGame): number {
  if (game.target === null) return 0
  const highest = Math.max(0, ...Object.values(totals(game)))
  return Math.min(1, highest / game.target)
}
