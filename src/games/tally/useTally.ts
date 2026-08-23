import { amendGame, recordGame } from '../../lib/history'
import { makeId } from '../../lib/storage'
import { createStore, useStore } from '../../lib/store'
import {
  isComplete,
  PRESETS,
  ranking,
  winnerNames,
  type TallyGame,
  type TallyVariant,
} from './rules'

function isTally(value: unknown): boolean {
  const g = value as TallyGame | null
  return !!g && Array.isArray(g.players) && g.players.length > 0 && Array.isArray(g.rounds)
}

// Rummy and Chinchón are separate tables — a game of one does not disturb the other.
const stores: Record<TallyVariant, ReturnType<typeof createStore<TallyGame>>> = {
  rummy: createStore<TallyGame>('anotador.rummy.v1', isTally),
  chinchon: createStore<TallyGame>('anotador.chinchon.v1', isTally),
}

export function useTally(variant: TallyVariant) {
  const store = stores[variant]
  const game = useStore(store)

  const start = (names: string[]) => {
    const preset = PRESETS[variant]
    store.set({
      variant,
      players: names.map((name, i) => ({ id: makeId('p'), name: name.trim(), chip: i })),
      rounds: [],
      target: preset.target,
      winnerIs: preset.winnerIs,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    })
  }

  /** Closes the game if this hand pushed someone over the target. */
  const settle = (next: TallyGame): TallyGame => {
    if (!isComplete(next)) return { ...next, finishedAt: null }
    if (next.finishedAt) return next

    const standings = ranking(next).map((r) => ({ name: r.player.name, score: r.total }))
    const winners = winnerNames(next)
    // A game reopened by an edit keeps its history entry and corrects it,
    // so one game never counts twice toward the championship.
    if (next.recordId) amendGame(next.recordId, standings, winners)
    const entry = next.recordId ? null : recordGame(variant, standings, winners)
    return {
      ...next,
      finishedAt: new Date().toISOString(),
      recordId: next.recordId ?? entry?.id,
    }
  }

  const addRound = (scores: Record<string, number>) =>
    store.update((current) => settle({ ...current, rounds: [...current.rounds, scores] }))

  /**
   * Editing a past hand recomputes everything after it, which can un-finish a
   * game that had ended. Reopening is the point — a mistyped score should be
   * fixable even after the last hand.
   */
  const editRound = (index: number, scores: Record<string, number>) =>
    store.update((current) => {
      const rounds = current.rounds.map((round, i) => (i === index ? scores : round))
      return settle({ ...current, rounds, finishedAt: null })
    })

  const removeRound = (index: number) =>
    store.update((current) =>
      settle({
        ...current,
        rounds: current.rounds.filter((_, i) => i !== index),
        finishedAt: null,
      }),
    )

  const renamePlayer = (id: string, name: string) =>
    store.update((current) => ({
      ...current,
      players: current.players.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    }))

  /** Same players, blank sheet. */
  const rematch = () =>
    store.update((current) => ({
      ...current,
      rounds: [],
      startedAt: new Date().toISOString(),
      finishedAt: null,
    }))

  const reset = () => store.set(null)

  return {
    game,
    preset: PRESETS[variant],
    start,
    addRound,
    editRound,
    removeRound,
    renamePlayer,
    rematch,
    reset,
  }
}
