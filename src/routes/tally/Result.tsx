import { Navigate, useNavigate } from 'react-router-dom'
import { playedOn, ResultCard, type Placing } from '../../components/ResultCard'
import { Surface } from '../../components/Surface'
import { ranking, type TallyVariant } from '../../games/tally/rules'
import { useTally } from '../../games/tally/useTally'
import { GAME_NAMES } from '../../lib/history'
import { historyFactsOf } from '../../lib/verdict-facts'
import { pickVerdict, type Band } from '../../lib/verdicts'

/**
 * These games are played to 100, not to a few hundred like generala, so the
 * bands sit much closer together than generala's.
 */
function bandFor(margin: number, tied: boolean): Band {
  if (tied) return 'tied'
  if (margin >= 60) return 'blowout'
  if (margin >= 25) return 'comfortable'
  if (margin >= 8) return 'close'
  return 'photo'
}

export function TallyResult({ variant }: { variant: TallyVariant }) {
  const { game, rematch, reset } = useTally(variant)
  const navigate = useNavigate()

  if (!game) return <Navigate to={`/${variant}`} replace />
  if (!game.finishedAt) return <Navigate to={`/${variant}/partida`} replace />

  const table = ranking(game)
  const best = table[0].total
  const winners = table.filter((r) => r.total === best)
  const rest = table.filter((r) => r.total !== best)
  const margin = rest.length > 0 ? Math.abs(rest[0].total - best) : 0
  const { verdict, note } = pickVerdict(bandFor(margin, winners.length > 1), {
    ...historyFactsOf(
      variant,
      winners[0].player.name,
      rest[0]?.player.name ?? '',
      game.recordId,
    ),
    margin,
    winner: winners[0].player.name,
    loser: rest[0]?.player.name ?? '',
    winnersCount: winners.length,
    players: game.players.length,
    // Nothing to scratch in these games — null, not 0, or the card would
    // congratulate the winner for never doing something impossible here. The
    // same goes for every generala row below: these games have none.
    scratched: null,
    winnerScore: best,
    loserScore: rest[0]?.total ?? 0,
    generalas: null,
    doble: false,
    served: null,
    loserGeneralas: null,
    loserScratched: null,
    seed: game.finishedAt ?? '',
  })

  const toPlacing = (r: (typeof table)[number]): Placing => ({
    name: r.player.name,
    chip: r.player.chip,
    score: r.total,
  })

  return (
    <Surface game={variant}>
      <div className="stack">
        <div className="rule-line">{GAME_NAMES[variant].toUpperCase()} · FIN DE LA PARTIDA</div>

        <ResultCard
          winners={winners.map(toPlacing)}
          rest={rest.map(toPlacing)}
          verdict={verdict}
          note={note}
          date={playedOn(game.finishedAt)}
        />

        <div className="row-actions">
          <button
            type="button"
            className="big-btn"
            onClick={() => {
              rematch()
              navigate(`/${variant}/partida`)
            }}
          >
            REVANCHA
          </button>
          <button
            type="button"
            className="ghost-btn ghost-btn--tall"
            onClick={() => {
              reset()
              navigate('/')
            }}
          >
            SALIR
          </button>
        </div>
      </div>
    </Surface>
  )
}
