import { Navigate, useNavigate } from 'react-router-dom'
import { playedOn, ResultCard, type Placing } from '../../components/ResultCard'
import { Surface } from '../../components/Surface'
import { ranking, scratchedCount, verdict, verdictNote } from '../../games/generala/rules'
import { useGenerala } from '../../games/generala/useGenerala'

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
          verdict={verdict(margin, tied)}
          note={verdictNote(margin, tied, scratchedCount(game, table[0].player.id))}
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
