import { Navigate, useNavigate } from 'react-router-dom'
import { playedOn, ResultCard } from '../../components/ResultCard'
import { Surface } from '../../components/Surface'
import { HALF, useTruco } from '../../games/truco/useTruco'

export function TrucoResult() {
  const { game, rematch, reset } = useTruco()
  const navigate = useNavigate()

  if (!game) return <Navigate to="/truco" replace />
  if (!game.finishedAt) return <Navigate to="/truco" replace />

  const winnerIndex = game.points[0] >= game.points[1] ? 0 : 1
  const loserIndex = winnerIndex === 0 ? 1 : 0
  const loserPoints = game.points[loserIndex]

  // The classic taunts, and they are the whole point of writing this down.
  const verdict =
    loserPoints === 0
      ? 'LA VACA'
      : loserPoints < HALF
        ? 'GANÓ EN LAS MALAS'
        : loserPoints >= 27
          ? 'POR UN PELO'
          : 'GANÓ CÓMODO'

  const note =
    loserPoints === 0
      ? 'Cero puntos. Que no se hable más del tema.'
      : loserPoints < HALF
        ? `${game.names[loserIndex]} no llegó a las buenas.`
        : `Terminó ${game.points[winnerIndex]} a ${loserPoints}.`

  return (
    <Surface game="truco">
      <div className="stack">
        <div className="rule-line">TRUCO · SE ACABÓ</div>

        <ResultCard
          winners={[{ name: game.names[winnerIndex], chip: winnerIndex, score: game.points[winnerIndex] }]}
          rest={[{ name: game.names[loserIndex], chip: loserIndex, score: loserPoints }]}
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
              navigate('/truco')
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
