import { CATEGORIES, ranking as generalaRanking } from '../games/generala/rules'
import { useGenerala } from '../games/generala/useGenerala'
import { progress as tallyProgress, ranking as tallyRanking } from '../games/tally/rules'
import { useTally } from '../games/tally/useTally'
import { TARGET, useTruco } from '../games/truco/useTruco'
import type { GameId } from './history'

/** A game left open — started, not finished, still sitting where it was. */
export interface Pending {
  game: GameId
  /** Where SEGUIR takes you. */
  to: string
  players: string[]
  /** Who is ahead right now. Null before anyone scores, and on a tie. */
  leader: string | null
  /** 0 to 1 — how close the game is to ending. */
  progress: number
  /** One line under the name: '4 manos jugadas'. */
  detail: string
  startedAt: string
}

/**
 * The games left open on this phone, in the order the doors show them.
 *
 * There is one slot per game, so starting a new Rummy replaces whichever one
 * was open: this list never grows past four, and a game only leaves it by
 * being finished or abandoned from its own menu.
 */
export function usePending(): Pending[] {
  const generala = useGenerala()
  const truco = useTruco()
  const rummy = useTally('rummy')
  const chinchon = useTally('chinchon')

  const pending: Pending[] = []

  const sheet = generala.game
  if (sheet && !sheet.finishedAt && sheet.history.length > 0) {
    const cells = sheet.players.length * CATEGORIES.length
    const table = generalaRanking(sheet)
    const ahead = table[0].total > 0 && table[0].total !== table[1]?.total
    pending.push({
      game: 'generala',
      to: '/generala/partida',
      players: sheet.players.map((p) => p.name),
      leader: ahead ? table[0].player.name : null,
      progress: cells === 0 ? 0 : sheet.history.length / cells,
      detail: `${sheet.history.length} de ${cells} casilleros`,
      startedAt: sheet.startedAt,
    })
  }

  const bar = truco.game
  if (bar && !bar.finishedAt && bar.history.length > 0) {
    const [us, them] = bar.points
    pending.push({
      game: 'truco',
      to: '/truco/partida',
      players: [...bar.names],
      leader: us === them ? null : us > them ? bar.names[0] : bar.names[1],
      progress: Math.min(1, Math.max(us, them) / TARGET),
      detail: `${us} a ${them}, a ${TARGET}`,
      startedAt: bar.startedAt,
    })
  }

  for (const [variant, table] of [
    ['rummy', rummy.game],
    ['chinchon', chinchon.game],
  ] as const) {
    if (!table || table.finishedAt || table.rounds.length === 0) continue
    const rank = tallyRanking(table)
    // These are won by the LOWEST total, and ranking() already sorts that way.
    const ahead = rank[0].total !== rank[1]?.total
    pending.push({
      game: variant,
      to: `/${variant}/partida`,
      players: table.players.map((p) => p.name),
      leader: ahead ? rank[0].player.name : null,
      progress: tallyProgress(table),
      detail: `${table.rounds.length} ${table.rounds.length === 1 ? 'mano jugada' : 'manos jugadas'}`,
      startedAt: table.startedAt,
    })
  }

  return pending
}
