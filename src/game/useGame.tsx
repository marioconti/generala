import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CATEGORIES, isComplete } from './rules'
import type { CategoryId, Game, Score } from './types'

const STORAGE_KEY = 'generala.game.v1'

/**
 * crypto.randomUUID() only exists in a secure context. Testing on a phone over
 * the LAN (`vite --host`) is plain http, so it would be undefined there — hence
 * this small local id instead. Ids never leave the device.
 */
function makeId(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

function load(): Game | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Game
    if (!Array.isArray(parsed.players) || parsed.players.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function persist(game: Game | null): void {
  try {
    if (game) localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private browsing or a full quota — the game still works, it just won't survive a reload.
  }
}

export interface GameApi {
  game: Game | null
  start: (names: string[]) => void
  setScore: (playerId: string, categoryId: CategoryId, score: Score) => void
  undo: () => void
  rematch: () => void
  reset: () => void
}

const GameContext = createContext<GameApi | null>(null)

function newGame(names: string[]): Game {
  const players = names.map((name, i) => ({ id: makeId(), name: name.trim(), chip: i }))
  return {
    players,
    scores: Object.fromEntries(players.map((p) => [p.id, {}])),
    turn: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    history: [],
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(load)

  useEffect(() => {
    persist(game)
  }, [game])

  const start = useCallback((names: string[]) => {
    setGame(newGame(names))
  }, [])

  const setScore = useCallback((playerId: string, categoryId: CategoryId, score: Score) => {
    setGame((current) => {
      if (!current) return current
      // Filled cells are never overwritten in place — undo is the way back.
      if (current.scores[playerId]?.[categoryId]) return current

      const playerIndex = current.players.findIndex((p) => p.id === playerId)
      const next: Game = {
        ...current,
        scores: {
          ...current.scores,
          [playerId]: { ...current.scores[playerId], [categoryId]: score },
        },
        // The turn follows whoever just scored, even if they scored out of order.
        turn: (playerIndex + 1) % current.players.length,
        history: [...current.history, { playerId, categoryId }],
      }
      return isComplete(next) ? { ...next, finishedAt: new Date().toISOString() } : next
    })
  }, [])

  const undo = useCallback(() => {
    setGame((current) => {
      if (!current || current.history.length === 0) return current

      const history = current.history.slice(0, -1)
      const last = current.history[current.history.length - 1]
      const sheet = { ...current.scores[last.playerId] }
      delete sheet[last.categoryId]

      return {
        ...current,
        scores: { ...current.scores, [last.playerId]: sheet },
        // Hand the turn back to whoever's entry we just removed.
        turn: current.players.findIndex((p) => p.id === last.playerId),
        history,
        finishedAt: null,
      }
    })
  }, [])

  const rematch = useCallback(() => {
    setGame((current) => (current ? newGame(current.players.map((p) => p.name)) : current))
  }, [])

  const reset = useCallback(() => {
    setGame(null)
  }, [])

  return (
    <GameContext.Provider value={{ game, start, setScore, undo, rematch, reset }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}

export const TOTAL_CELLS = CATEGORIES.length
