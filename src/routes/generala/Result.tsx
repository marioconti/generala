import { Navigate, useNavigate } from 'react-router-dom'
import { playedOn, ResultCard, type Placing } from '../../components/ResultCard'
import { Surface } from '../../components/Surface'
import { bandFor, featsOf, ranking, scratchedCount } from '../../games/generala/rules'
import { useGenerala } from '../../games/generala/useGenerala'
import { historyFactsOf } from '../../lib/verdict-facts'
import { pickVerdict } from '../../lib/verdicts'

export function GeneralaResult() {
  const { game, rematch, reset } = useGenerala()
  const navigate = useNavigate()

  if (!game) return <Navigate to="/generala" replace />
  if (!game.finishedAt) return <Navigate to="/generala/partida" replace />

  const table = ranking(game)
  const best = table[0].total
  const winners = table.filter((r) => r.total === best)
  const rest = table.filter((r) => r.total !== best)
  const margin = rest.length > 0 ? best - rest[0].total : best
  const tied = winners.length > 1

  const champion = winners[0].player
  const runnerUp = rest[0]?.player ?? null
  const mine = featsOf(game, champion.id)
  const theirs = runnerUp ? featsOf(game, runnerUp.id) : null

  const { verdict, note } = pickVerdict(bandFor(margin, tied), {
    // Everything the history knows about these two. Excludes this game, which
    // is already filed by the time the card renders.
    ...historyFactsOf('generala', champion.name, runnerUp?.name ?? '', game.recordId),
    margin,
    winner: champion.name,
    loser: runnerUp?.name ?? '',
    winnersCount: winners.length,
    players: game.players.length,
    scratched: scratchedCount(game, champion.id),
    winnerScore: best,
    loserScore: rest[0]?.total ?? 0,
    generalas: mine.generalas,
    doble: mine.doble,
    served: mine.served,
    loserGeneralas: theirs?.generalas ?? null,
    loserScratched: runnerUp ? scratchedCount(game, runnerUp.id) : null,
    seed: game.finishedAt ?? '',
  })

  const toPlacing = (r: (typeof table)[number]): Placing => ({
    name: r.player.name,
    chip: r.player.chip,
    score: r.total,
  })

  return (
    <Surface game="generala">
      <div className="stack">
        <div className="rule-line">GENERALA · FIN DE LA PARTIDA</div>

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
              navigate('/generala/partida')
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
