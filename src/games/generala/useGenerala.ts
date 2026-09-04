import { amendGame, recordGame, type Feats } from '../../lib/history'
import { makeId } from '../../lib/storage'
import { createStore, useStore } from '../../lib/store'
import { CATEGORIES, isComplete, ranking } from './rules'
import type { CategoryId, Game, Score } from './types'

function isGame(value: unknown): boolean {
  const g = value as Game | null
  return !!g && Array.isArray(g.players) && g.players.length > 0 && !!g.scores
}

const store = createStore<Game>('anotador.generala.v1', isGame)

function newGame(names: string[]): Game {
  const players = names.map((name, i) => ({ id: makeId('p'), name: name.trim(), chip: i }))
  return {
    players,
    scores: Object.fromEntries(players.map((p) => [p.id, {}])),
    turn: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    history: [],
  }
}

/**
 * What the trophy cabinet reads off a finished sheet, by player name.
 *
 * The sheet itself is not kept once a game is filed, so anything the trophies
 * want to count has to be counted here or lost. Note that GENERALA and DOBLE
 * have no served bonus at this table, so the entry screen never offers the
 * served button for them: `served` counts escaleras, fulls and pókers only.
 */
function featsOf(game: Game): Feats {
  const feats: Feats = {}

  for (const player of game.players) {
    const sheet = game.scores[player.id] ?? {}
    const counters: Record<string, number> = {}

    for (const categoryId of Object.keys(sheet) as CategoryId[]) {
      const score = sheet[categoryId]
      if (!score) continue
      if (score.kind === 'scratched') {
        counters.scratched = (counters.scratched ?? 0) + 1
      } else if (score.kind === 'special') {
        counters[categoryId] = (counters[categoryId] ?? 0) + 1
        if (score.served) counters.served = (counters.served ?? 0) + 1
      }
    }

    feats[player.name] = counters
  }

  return feats
}

export function useGenerala() {
  const game = useStore(store)

  /** Closes the sheet when every cell is filled, and records the result. */
  const settle = (next: Game): Game => {
    if (!isComplete(next)) return { ...next, finishedAt: null }
    if (next.finishedAt) return next

    const standings = ranking(next).map((r) => ({ name: r.player.name, score: r.total }))
    const best = standings[0].score
    const winners = standings.filter((s) => s.score === best).map((s) => s.name)
    const feats = featsOf(next)

    if (next.recordId) amendGame(next.recordId, standings, winners, feats)
    const entry = next.recordId ? null : recordGame('generala', standings, winners, feats)
    return {
      ...next,
      finishedAt: new Date().toISOString(),
      recordId: next.recordId ?? entry?.id,
    }
  }

  const start = (names: string[]) => store.set(newGame(names))

  /**
   * Writes a cell. Unlike the first version, this OVERWRITES: tapping a filled
   * cell reopens it, because mistyping a score and having no way back is worse
   * than any accidental edit.
   */
  const setScore = (playerId: string, categoryId: CategoryId, score: Score) =>
    store.update((current) => {
      const wasEmpty = !current.scores[playerId]?.[categoryId]
      const playerIndex = current.players.findIndex((p) => p.id === playerId)
      return settle({
        ...current,
        scores: {
          ...current.scores,
          [playerId]: { ...current.scores[playerId], [categoryId]: score },
        },
        // Only a fresh entry moves the turn along; correcting a cell leaves it.
        turn: wasEmpty ? (playerIndex + 1) % current.players.length : current.turn,
        history: wasEmpty
          ? [...current.history, { playerId, categoryId }]
          : current.history,
      })
    })

  /** Empties a cell, so a wrong score can be taken back rather than replaced. */
  const clearScore = (playerId: string, categoryId: CategoryId) =>
    store.update((current) => {
      const sheet = { ...current.scores[playerId] }
      delete sheet[categoryId]
      return settle({
        ...current,
        scores: { ...current.scores, [playerId]: sheet },
        history: current.history.filter(
          (h) => !(h.playerId === playerId && h.categoryId === categoryId),
        ),
        finishedAt: null,
      })
    })

  const undo = () =>
    store.update((current) => {
      const last = current.history[current.history.length - 1]
      if (!last) return current
      const sheet = { ...current.scores[last.playerId] }
      delete sheet[last.categoryId]
      return {
        ...current,
        scores: { ...current.scores, [last.playerId]: sheet },
        turn: current.players.findIndex((p) => p.id === last.playerId),
        history: current.history.slice(0, -1),
        finishedAt: null,
      }
    })

  const renamePlayer = (id: string, name: string) =>
    store.update((current) => ({
      ...current,
      players: current.players.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    }))

  const rematch = () =>
    store.update((current) => newGame(current.players.map((p) => p.name)))

  const reset = () => store.set(null)

  return { game, start, setScore, clearScore, undo, renamePlayer, rematch, reset }
}

export const TOTAL_CELLS = CATEGORIES.length
