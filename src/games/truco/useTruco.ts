import { amendGame, recordGame } from '../../lib/history'
import { createStore, useStore } from '../../lib/store'

/**
 * Truco, scored the way it is scored on paper.
 *
 * Verified 2026-08-23: a game runs to 30 points. The first 15 are "las malas",
 * the last 15 "las buenas", and points are marked in groups of five — four
 * strokes crossed by a diagonal.
 *   https://trucogame.com/pages/reglamento-de-truco-argentino
 *   https://www.casi.com.ar/sites/default/files/Reglamento%20Truco.pdf
 *
 * The hand values that get written down are 1 to 4 (truco 2, retruco 3,
 * vale cuatro 4), which is why the buttons stop there.
 */

export const HALF = 15
export const TARGET = 30

export interface TrucoGame {
  names: [string, string]
  points: [number, number]
  /** Every mark made, newest last. Drives undo. */
  history: { team: 0 | 1; amount: number }[]
  startedAt: string
  finishedAt: string | null
  /** Id of this game's entry in the history, once it has been recorded. */
  recordId?: string
}

function isTruco(value: unknown): boolean {
  const g = value as TrucoGame | null
  return !!g && Array.isArray(g.names) && Array.isArray(g.points)
}

const store = createStore<TrucoGame>('anotador.truco.v1', isTruco)

/** Splits a score into what shows above the line and what shows below it. */
export function split(points: number): { malas: number; buenas: number } {
  return { malas: Math.min(points, HALF), buenas: Math.max(0, points - HALF) }
}

export function useTruco() {
  const game = useStore(store)

  const start = (names: [string, string]) => {
    store.set({
      names,
      points: [0, 0],
      history: [],
      startedAt: new Date().toISOString(),
      finishedAt: null,
    })
  }

  const settle = (next: TrucoGame): TrucoGame => {
    const winnerIndex = next.points.findIndex((p) => p >= TARGET)
    if (winnerIndex === -1) return { ...next, finishedAt: null }
    if (next.finishedAt) return next

    const standings = [
      { name: next.names[0], score: next.points[0] },
      { name: next.names[1], score: next.points[1] },
    ]
    const winners = [next.names[winnerIndex]]
    // Undoing past 30 and climbing back keeps the same history entry.
    if (next.recordId) amendGame(next.recordId, standings, winners)
    const entry = next.recordId ? null : recordGame('truco', standings, winners)
    return {
      ...next,
      finishedAt: new Date().toISOString(),
      recordId: next.recordId ?? entry?.id,
    }
  }

  const add = (team: 0 | 1, amount: number) =>
    store.update((current) => {
      if (current.finishedAt) return current
      const points: [number, number] = [...current.points] as [number, number]
      // Never past 30 and never below zero — the paper has no room for either.
      points[team] = Math.max(0, Math.min(TARGET, points[team] + amount))
      return settle({
        ...current,
        points,
        history: [...current.history, { team, amount }],
      })
    })

  const undo = () =>
    store.update((current) => {
      const last = current.history[current.history.length - 1]
      if (!last) return current
      const points: [number, number] = [...current.points] as [number, number]
      points[last.team] = Math.max(0, points[last.team] - last.amount)
      return settle({
        ...current,
        points,
        history: current.history.slice(0, -1),
        finishedAt: null,
      })
    })

  const rename = (team: 0 | 1, name: string) =>
    store.update((current) => {
      const names: [string, string] = [...current.names] as [string, string]
      names[team] = name.trim() || (team === 0 ? 'Nosotros' : 'Ellos')
      return { ...current, names }
    })

  const rematch = () =>
    store.update((current) => ({
      ...current,
      points: [0, 0],
      history: [],
      startedAt: new Date().toISOString(),
      finishedAt: null,
    }))

  const reset = () => store.set(null)

  return { game, start, add, undo, rename, rematch, reset }
}
