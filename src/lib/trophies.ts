import type { IconName } from '../components/Icon'
import {
  GAME_NAMES,
  getHistory,
  getStandings,
  normalize,
  type FinishedGame,
  type GameId,
} from './history'

/**
 * The trophy cabinet.
 *
 * Everything here is derived from the filed games — nothing extra is stored.
 * Most trophies read only the scores, so they count every game ever played;
 * the four marked `young` read the per-player counters, which only exist on
 * games filed since the cabinet was built. Those older games cannot be made to
 * count: the sheet is thrown away when a game is filed, so nobody knows how
 * many generalas were cantadas in them.
 */

export interface TrophyHolder {
  name: string
  value: number
}

export interface Trophy {
  id: string
  name: string
  /** What it takes to hold it, in one line. */
  blurb: string
  icon: IconName
  /** Everyone tied at the top. Empty means nobody has earned it yet. */
  holders: TrophyHolder[]
  /** How the number reads: [singular, plural]. */
  unit: [string, string]
  /** Counts only games filed since the cabinet existed. */
  young?: boolean
}

type Counter = Map<string, TrophyHolder>

function bump(counter: Counter, name: string, by = 1): void {
  const key = normalize(name)
  if (!key) return
  const current = counter.get(key) ?? { name, value: 0 }
  // Keep the most recent spelling, the way the standings do.
  current.name = name
  current.value += by
  counter.set(key, current)
}

/** Records a one-off figure — a margin, a streak — keeping the best seen. */
function keep(counter: Counter, name: string, value: number, direction: 'max' | 'min'): void {
  const key = normalize(name)
  if (!key) return
  const current = counter.get(key)
  if (!current) {
    counter.set(key, { name, value })
    return
  }
  current.name = name
  if (direction === 'max' ? value > current.value : value < current.value) current.value = value
}

/** Everyone tied at the top. Nobody holds a trophy standing at zero. */
function leaders(counter: Counter, direction: 'max' | 'min' = 'max'): TrophyHolder[] {
  const rows = [...counter.values()].filter((h) => h.value > 0)
  if (rows.length === 0) return []
  const values = rows.map((r) => r.value)
  const best = direction === 'max' ? Math.max(...values) : Math.min(...values)
  return rows.filter((r) => r.value === best)
}

/**
 * How far ahead the winner finished.
 *
 * `players` is filed in ranking order — winner first — whichever way the game
 * is won, so the gap to second place is the margin in Generala and in Chinchón
 * alike. Null when somebody played alone.
 */
function marginOf(entry: FinishedGame): number | null {
  if (entry.players.length < 2) return null
  return Math.abs(entry.players[0].score - entry.players[1].score)
}

export function getTrophies(): Trophy[] {
  // Streaks need the games in the order they were played, not the order they
  // happen to sit in storage.
  const byDate = [...getHistory()].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))

  const wins: Counter = new Map()
  const played: Counter = new Map()
  const blowout: Counter = new Map()
  const photo: Counter = new Map()
  const streak: Counter = new Map()
  const generalas: Counter = new Map()
  const doubles: Counter = new Map()
  const served: Counter = new Map()
  const scratched: Counter = new Map()

  /** Wins in a row, live. A loss or a draw sets yours back to zero. */
  const running = new Map<string, number>()

  for (const entry of byDate) {
    // A draw credits nobody, the way the championship counts it.
    const winner = entry.winners.length === 1 ? entry.winners[0] : null

    for (const player of entry.players) bump(played, player.name)

    if (winner) {
      bump(wins, winner)
      const margin = marginOf(entry)
      if (margin !== null && margin > 0) {
        keep(blowout, winner, margin, 'max')
        keep(photo, winner, margin, 'min')
      }
    }

    for (const player of entry.players) {
      const key = normalize(player.name)
      if (!key) continue
      const next = winner && normalize(winner) === key ? (running.get(key) ?? 0) + 1 : 0
      running.set(key, next)
      keep(streak, player.name, next, 'max')
    }

    for (const [name, counters] of Object.entries(entry.feats ?? {})) {
      bump(generalas, name, counters.generala ?? 0)
      bump(doubles, name, counters.doubleGenerala ?? 0)
      bump(served, name, counters.served ?? 0)
      bump(scratched, name, counters.scratched ?? 0)
    }
  }

  return [
    {
      id: 'general',
      name: 'El General',
      blurb: 'Más victorias en la mesa',
      icon: 'trophy',
      unit: ['victoria', 'victorias'],
      holders: leaders(wins),
    },
    {
      id: 'racha',
      name: 'En Racha',
      blurb: 'Más victorias seguidas, sin perder en el medio',
      icon: 'flame',
      unit: ['seguida', 'seguidas'],
      holders: leaders(streak),
    },
    {
      id: 'paliza',
      name: 'La Paliza',
      blurb: 'Ganó por la diferencia más grande',
      icon: 'bolt',
      unit: ['punto', 'puntos'],
      holders: leaders(blowout),
    },
    {
      id: 'filo',
      name: 'Al Filo',
      blurb: 'Ganó por la diferencia más chica',
      icon: 'target',
      unit: ['punto', 'puntos'],
      holders: leaders(photo, 'min'),
    },
    {
      id: 'constante',
      name: 'El Constante',
      blurb: 'El que más veces se sentó a jugar',
      icon: 'scroll',
      unit: ['partida', 'partidas'],
      holders: leaders(played),
    },
    {
      id: 'generalas',
      name: 'Generalas',
      blurb: 'Generalas cantadas',
      icon: 'dice',
      unit: ['generala', 'generalas'],
      holders: leaders(generalas),
      young: true,
    },
    {
      id: 'doble',
      name: 'Doble o Nada',
      blurb: 'Dobles generalas — la jugada que casi no sale',
      icon: 'medal',
      unit: ['doble', 'dobles'],
      holders: leaders(doubles),
      young: true,
    },
    {
      id: 'servida',
      name: 'Servida',
      blurb: 'Escaleras, fulls y pókers que salieron de primer tiro',
      icon: 'check',
      unit: ['servida', 'servidas'],
      holders: leaders(served),
      young: true,
    },
    {
      id: 'tachador',
      name: 'El Tachador',
      blurb: 'El que más casilleros se comió tachados',
      icon: 'close',
      unit: ['tachón', 'tachones'],
      holders: leaders(scratched),
      young: true,
    },
  ]
}

/**
 * Whether the trophies that need counters have anything to count yet.
 * Only Generala fills them in, so only Generala games are worth reporting on.
 */
export function getFeatsCoverage(): { counted: number; total: number } {
  const generala = getHistory().filter((entry) => entry.game === 'generala')
  return { counted: generala.filter((entry) => entry.feats).length, total: generala.length }
}

export interface King {
  game: GameId
  label: string
  /** Null while nobody has won one of these yet. */
  name: string | null
  wins: number
}

/**
 * Who owns each game. A tie falls to whoever stands higher overall, since the
 * standings arrive already sorted by total wins.
 */
export function getKings(): King[] {
  const standings = getStandings()

  return (Object.keys(GAME_NAMES) as GameId[]).map((game) => {
    let best: { name: string; wins: number } | null = null
    for (const player of standings) {
      const wins = player.byGame[game]
      if (wins > 0 && (best === null || wins > best.wins)) best = { name: player.name, wins }
    }
    return { game, label: GAME_NAMES[game], name: best?.name ?? null, wins: best?.wins ?? 0 }
  })
}
