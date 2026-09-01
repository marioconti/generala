import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PlayerNames } from '../../components/PlayerNames'
import { Surface } from '../../components/Surface'
import { TopBar } from '../../components/TopBar'
import { MAX_PLAYERS, MIN_PLAYERS } from '../../games/generala/rules'
import { useGenerala } from '../../games/generala/useGenerala'

export function GeneralaSetup() {
  const { game, start } = useGenerala()
  const [names, setNames] = useState<string[]>([])
  const navigate = useNavigate()

  const filled = names.map((n) => n.trim()).filter(Boolean)
  const canStart = filled.length >= MIN_PLAYERS
  const inProgress = game && !game.finishedAt && game.history.length > 0

  return (
    <Surface game="generala">
      <TopBar title="Generala" />

      <div className="scroll-body">
        {inProgress && (
          <button type="button" className="resume" onClick={() => navigate('/generala/partida')}>
            <div className="resume__text">
              <div className="resume__title">SEGUIR LA PARTIDA</div>
              <div className="resume__who">{game.players.map((p) => p.name).join(' · ')}</div>
            </div>
            <Icon name="forward" size={18} />
          </button>
        )}

        <div className="card">
          <div className="card__frame" />
          <div className="card__body">
            <div className="field-label">¿QUIÉNES JUEGAN?</div>
            <PlayerNames names={names} onChange={setNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
            <p className="field-note">
              {canStart
                ? `Hasta ${MAX_PLAYERS} jugadores. Escalera 20/25 · Full 30/35 · Póker 40/45 · Generala 50 · Doble 100.`
                : `Escribí al menos ${MIN_PLAYERS} nombres.`}
            </p>
          </div>
        </div>
      </div>

      {/* "Comenzar", not "Repartir" — nobody deals anything in Generala. */}
      <button
        type="button"
        className="big-btn"
        disabled={!canStart}
        onClick={() => {
          start(filled)
          navigate('/generala/partida')
        }}
      >
        COMENZAR
      </button>
    </Surface>
  )
}
