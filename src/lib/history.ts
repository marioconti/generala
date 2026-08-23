import { makeId, read, write } from './storage'

export type GameId = 'generala' | 'rummy' | 'chinchon' | 'truco'

export const GAME_NAMES: Record<GameId, string> = {
  generala: 'Generala',
  rummy: 'Rummy',
  chinchon: 'Chinchón',
  truco: 'Truco',
}

/** Wins needed to become Campeón Supremo del Máximo — and win the ice cream. */
export const CHAMPION_THRESHOLD = 15

export interface FinishedGame {
  id: string
  game: GameId
  finishedAt: string
  players: { name: string; score: number }[]
  /** More than one on a draw; nobody gets a win credited then. */
  winners: string[]
}

export interface Standing {
  /** Display name, as most recently typed. */
  name: string
  wins: number
  played: number
  byGame: Record<GameId, number>
}

const KEY = 'anotador.history.v1'

/** "Mario" and "mario" are the same person. */
function normalize(name: string): string {
  return name.trim().toLowerCase()
}

function isHistory(value: unknown): boolean {
  return Array.isArray(value)
}

export function getHistory(): FinishedGame[] {
  return read<FinishedGame[]>(KEY, isHistory) ?? []
}

/**
 * Records a finished game. A draw is stored with every tied name in `winners`
 * but credits no win — the ice cream is not settled by a tie.
 */
export function recordGame(
  game: GameId,
  players: { name: string; score: number }[],
  winners: string[],
): FinishedGame {
  const entry: FinishedGame = {
    id: makeId('g'),
    game,
    finishedAt: new Date().toISOString(),
    players,
    winners,
  }
  write(KEY, [...getHistory(), entry])
  return entry
}

/**
 * Rewrites an already-recorded game.
 *
 * Editing a mistyped score can reopen a finished game and change who won, so
 * the entry is corrected in place rather than appended again — otherwise one
 * game would count twice toward the ice cream.
 */
export function amendGame(
  id: string,
  players: { name: string; score: number }[],
  winners: string[],
): void {
  const history = getHistory()
  const index = history.findIndex((entry) => entry.id === id)
  if (index === -1) return
  history[index] = { ...history[index], players, winners }
  write(KEY, history)
}

export function clearHistory(): void {
  write(KEY, null)
}

export function getStandings(): Standing[] {
  const table = new Map<string, Standing>()

  for (const entry of getHistory()) {
    for (const player of entry.players) {
      const key = normalize(player.name)
      if (!key) continue
      const current =
        table.get(key) ??
        ({
          name: player.name,
          wins: 0,
          played: 0,
          byGame: { generala: 0, rummy: 0, chinchon: 0, truco: 0 },
        } satisfies Standing)

      // Keep the most recent spelling of the name.
      current.name = player.name
      current.played += 1
      // A draw credits nobody.
      if (entry.winners.length === 1 && normalize(entry.winners[0]) === key) {
        current.wins += 1
        current.byGame[entry.game] += 1
      }
      table.set(key, current)
    }
  }

  return [...table.values()].sort((a, b) => b.wins - a.wins || b.played - a.played)
}

/** The first player to reach the threshold, or null. */
export function getChampion(): Standing | null {
  return getStandings().find((s) => s.wins >= CHAMPION_THRESHOLD) ?? null
}

/**
 * Who owes the ice cream: the player this champion has beaten most often.
 * Ties on the count fall to whoever appears first in the standings.
 */
export function getNemesis(championName: string): string | null {
  const champ = normalize(championName)
  const losses = new Map<string, { name: string; count: number }>()

  for (const entry of getHistory()) {
    if (entry.winners.length !== 1) continue
    if (normalize(entry.winners[0]) !== champ) continue
    for (const player of entry.players) {
      const key = normalize(player.name)
      if (!key || key === champ) continue
      const current = losses.get(key) ?? { name: player.name, count: 0 }
      current.name = player.name
      current.count += 1
      losses.set(key, current)
    }
  }

  const worst = [...losses.values()].sort((a, b) => b.count - a.count)[0]
  return worst?.name ?? null
}

/** Names already used, most wins first — offered as suggestions on setup. */
export function getKnownPlayers(): string[] {
  return getStandings().map((s) => s.name)
}
