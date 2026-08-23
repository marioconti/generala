import { Navigate, useNavigate } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { Felt } from '../components/Felt'
import { WinnerCard } from '../components/WinnerCard'
import { useGame } from '../game/useGame'

/** A few chips and dice strewn on the felt behind the card. */
function Scatter() {
  return (
    <>
      <div className="scatter" style={{ top: 96, left: 14, transform: 'rotate(-18deg)', opacity: 0.3 }}>
        <Chip chip={1} size={46} />
      </div>
      <div className="scatter" style={{ top: 62, right: 66, transform: 'rotate(8deg)', opacity: 0.22 }}>
        <Chip chip={4} size={34} />
      </div>
      <div className="scatter" style={{ bottom: 208, right: 16, transform: 'rotate(-30deg)', opacity: 0.3 }}>
        <Chip chip={5} size={42} />
      </div>
    </>
  )
}

export function Result() {
  const { game, rematch, reset } = useGame()
  const navigate = useNavigate()

  if (!game) return <Navigate to="/" replace />
  if (!game.finishedAt) return <Navigate to="/partida" replace />

  return (
    <Felt>
      <Scatter />
      <div className="stack">
        <div className="rule-line">FIN DE LA PARTIDA</div>

        <WinnerCard game={game} />

        <div className="winner__actions">
          <button
            type="button"
            className="btn-gold"
            style={{ fontSize: 18, letterSpacing: '2.5px' }}
            onClick={() => {
              rematch()
              navigate('/partida')
            }}
          >
            REVANCHA
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              reset()
              navigate('/')
            }}
          >
            NUEVA
            <br />
            PARTIDA
          </button>
        </div>
      </div>
    </Felt>
  )
}
