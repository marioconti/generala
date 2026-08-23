import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameMenu } from '../../components/GameMenu'
import { Icon } from '../../components/Icon'
import { Suit } from '../../components/Suit'
import { PaperGrain, Surface } from '../../components/Surface'
import { TallyMarks } from '../../components/TallyMarks'
import { TopBar } from '../../components/TopBar'
import { HALF, split, TARGET, useTruco } from '../../games/truco/useTruco'

const HAND_VALUES = [1, 2, 3, 4]

export function TrucoBoard() {
  const { game, start, add, undo, rename, rematch, reset } = useTruco()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Truco has no setup screen on purpose: it is the most informal game at the
  // table and nobody wants to type two names before the first hand. It opens
  // as Nosotros vs Ellos and the names are editable from the menu.
  useEffect(() => {
    if (!game) start(['Nosotros', 'Ellos'])
  }, [game, start])

  useEffect(() => {
    if (game?.finishedAt) navigate('/truco/resultado', { replace: true })
  }, [game?.finishedAt, navigate])

  if (!game) return null

  return (
    <Surface game="truco">
      <TopBar
        title="Truco"
        actions={
          <>
            <button
              type="button"
              className="round-btn"
              onClick={undo}
              disabled={game.history.length === 0}
              aria-label="Deshacer"
            >
              <Icon name="undo" size={19} />
            </button>
            <button type="button" className="round-btn" onClick={() => setMenuOpen(true)} aria-label="Opciones">
              <Icon name="menu" size={20} />
            </button>
          </>
        }
      />

      <div className="sheet truco-sheet">
        <PaperGrain />
        <div className="truco-grid">
          {([0, 1] as const).map((team) => {
            const { malas, buenas } = split(game.points[team])
            return (
              <div key={team} className="truco-col">
                <div className="truco-col__head">
                  <Suit suit={team === 0 ? 'espada' : 'basto'} size={16} />
                  <span>{game.names[team].toUpperCase()}</span>
                </div>

                <div className="truco-half">
                  <span className="truco-half__label">MALAS</span>
                  <TallyMarks count={malas} capacity={HALF} />
                </div>

                <div className="truco-divider" />

                <div className="truco-half">
                  <span className="truco-half__label">BUENAS</span>
                  <TallyMarks count={buenas} capacity={HALF} />
                </div>

                <div className="truco-col__score">{game.points[team]}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="truco-pads">
        {([0, 1] as const).map((team) => (
          <div key={team} className="truco-pad">
            <div className="truco-pad__who">{game.names[team].toUpperCase()}</div>
            <div className="truco-pad__keys">
              {HAND_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="truco-key"
                  onClick={() => add(team, value)}
                  aria-label={`Sumar ${value} a ${game.names[team]}`}
                >
                  +{value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="truco-note">Se juega a {TARGET}: 15 malas y 15 buenas.</p>

      {menuOpen && (
        <GameMenu
          players={[
            { id: '0', name: game.names[0] },
            { id: '1', name: game.names[1] },
          ]}
          onRename={(id, name) => rename(Number(id) as 0 | 1, name)}
          onRestart={rematch}
          onExit={reset}
          onClose={() => setMenuOpen(false)}
          restartLabel="Borrar los palitos y empezar de nuevo"
        />
      )}
    </Surface>
  )
}
