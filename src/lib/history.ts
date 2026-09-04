import { useSyncExternalStore } from 'react'
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

/**
 * Per-player counters a finished game contributes to the trophy cabinet,
 * keyed by player name and then by counter — 'generala', 'served', 'scratched'.
 *
 * Only Generala fills this in; the other games have nothing to count that the
 * scores do not already say. It is optional because games recorded before the
 * cabinet existed have none, and there is no way to reconstruct it: the sheet
 * is thrown away when a game is filed. Those games simply do not count toward
 * the trophies that read it.
 */
export type Feats = Record<string, Record<string, number>>

export interface FinishedGame {
  id: string
  game: GameId
  finishedAt: string
  players: { name: string; score: number }[]
  /** More than one on a draw; nobody gets a win credited then. */
  winners: string[]
  feats?: Feats
  /**
   * When this entry was last written. Only used to settle which copy wins when
   * the same game arrives from two phones. Absent on games filed before the
   * table was shared — those lose to any dated copy, which is what we want.
   */
  updatedAt?: string
}

export interface Standing {
  /** Display name, as most recently typed. */
  name: string
  wins: number
  played: number
  byGame: Record<GameId, number>
}

export const HISTORY_KEY = 'anotador.history.v1'
const KEY = HISTORY_KEY

/** "Mario" and "mario" are the same person. */
export function normalize(name: string): string {
  return name.trim().toLowerCase()
}

function isHistory(value: unknown): boolean {
  return Array.isArray(value)
}

export function getHistory(): FinishedGame[] {
  return read<FinishedGame[]>(KEY, isHistory) ?? []
}

/**
 * Anyone reading the history needs to hear about it changing under them.
 *
 * Until now every change came from a tap on this phone, so re-rendering fell
 * out of navigation for free. Games can now also arrive from the shared table
 * while a screen is already open, and a standings list that quietly goes stale
 * is worse than one that was never there.
 */
const listeners = new Set<() => void>()
let version = 0

function announce(): void {
  version += 1
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Re-renders the calling component whenever the filed games change — from this
 * phone or from another one. The number itself means nothing; only that it is
 * different from last time.
 */
export function useHistoryVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  )
}

/**
 * Records a finished game. A draw is stored with every tied name in `winners`
 * but credits no win — the ice cream is not settled by a tie.
 */
export function recordGame(
  game: GameId,
  players: { name: string; score: number }[],
  winners: string[],
  feats?: Feats,
): FinishedGame {
  const entry: FinishedGame = {
    id: makeId('g'),
    game,
    finishedAt: new Date().toISOString(),
    players,
    winners,
    updatedAt: new Date().toISOString(),
    ...(feats ? { feats } : {}),
  }
  write(KEY, [...getHistory(), entry])
  announce()
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
  feats?: Feats,
): void {
  const history = getHistory()
  const index = history.findIndex((entry) => entry.id === id)
  if (index === -1) return
  // A correction can change how many generalas someone ended up with, so the
  // counters are rewritten too — but an amendment that carries none leaves the
  // ones already filed alone rather than erasing them.
  history[index] = {
    ...history[index],
    players,
    winners,
    updatedAt: new Date().toISOString(),
    ...(feats ? { feats } : {}),
  }
  write(KEY, history)
  announce()
}

/**
 * Folds games that arrived from another phone into the ones filed here.
 *
 * Games are unioned by id — two phones scoring different games never collide,
 * because each entry got its own id when it was filed. When the same game
 * arrives twice, the copy written last wins; a copy with no date loses to one
 * that has it, since only the shared build stamps them.
 *
 * Returns true when the local file actually changed, so the caller can tell a
 * real update from a no-op and avoid republishing what everyone already has.
 */
export function mergeHistory(incoming: FinishedGame[]): boolean {
  const local = getHistory()
  const byId = new Map<string, FinishedGame>()

  for (const entry of [...local, ...incoming]) {
    if (!entry || typeof entry.id !== 'string') continue
    const current = byId.get(entry.id)
    if (!current || (entry.updatedAt ?? '') > (current.updatedAt ?? '')) byId.set(entry.id, entry)
  }

  const merged = [...byId.values()].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
  if (JSON.stringify(merged) === JSON.stringify(local)) return false

  write(KEY, merged)
  announce()
  return true
}

export function clearHistory(): void {
  write(KEY, null)
  announce()
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
