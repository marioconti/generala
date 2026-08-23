import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameMenu } from '../../components/GameMenu'
import { Icon } from '../../components/Icon'
import { Suit } from '../../components/Suit'
import { PaperGrain, Surface } from '../../components/Surface'
import { TallyMarks } from '../../components/TallyMarks'
import { TopBar } from '../../components/TopBar'
import { HALF, split, TARGET, useTruco } from '../../games/truco/useTruco'

/** Pixels of drag per mark. Four points is a comfortable thumb sweep. */
const STEP = 34
/** Under this much movement the gesture counts as a tap, which scores one. */
const TAP = 8

interface Drag {
  team: 0 | 1
  startY: number
  localY: number
  delta: number
  moved: number
}

export function TrucoBoard() {
  const { game, start, add, undo, rename, rematch, reset } = useTruco()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drag, setDrag] = useState<Drag | null>(null)
  const navigate = useNavigate()

  // Truco has no setup screen on purpose: it is the most informal game at the
  // table and nobody wants to type two names before the first hand.
  useEffect(() => {
    if (!game) start(['Nosotros', 'Ellos'])
  }, [game, start])

  useEffect(() => {
    if (game?.finishedAt) navigate('/truco/resultado', { replace: true })
  }, [game?.finishedAt, navigate])

  if (!game) return null

  const down = (team: 0 | 1) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDrag({ team, startY: e.clientY, localY: e.clientY - rect.top, delta: 0, moved: 0 })
  }

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return
    const rect = e.currentTarget.getBoundingClientRect()
    // Up adds, down removes — the direction the marks themselves grow.
    const delta = Math.round((drag.startY - e.clientY) / STEP)
    if (delta !== drag.delta) {
      // Android buzzes on each mark; iOS Safari has no vibrate and just skips it.
      navigator.vibrate?.(8)
    }
    setDrag({
      ...drag,
      delta,
      localY: e.clientY - rect.top,
      moved: Math.max(drag.moved, Math.abs(drag.startY - e.clientY)),
    })
  }

  const up = () => {
    if (!drag) return
    if (drag.delta !== 0) add(drag.team, drag.delta)
    else if (drag.moved < TAP) add(drag.team, 1)
    setDrag(null)
  }

  const nothingScored = game.points[0] === 0 && game.points[1] === 0

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
            const preview = drag?.team === team ? drag.delta : 0
            const shown = Math.max(0, Math.min(TARGET, game.points[team] + preview))
            const { malas, buenas } = split(shown)
            const dragging = drag?.team === team && drag.delta !== 0

            return (
              <div
                key={team}
                className={`truco-col${dragging ? ' truco-col--dragging' : ''}`}
                onPointerDown={down(team)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={() => setDrag(null)}
                role="button"
                tabIndex={0}
                aria-label={`Anotar puntos a ${game.names[team]}. Deslizá hacia arriba para sumar, hacia abajo para restar.`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    add(team, 1)
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    add(team, -1)
                  }
                }}
              >
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

                <div className="truco-col__score">{shown}</div>

                {dragging && (
                  <span
                    className={`drag-badge${drag.delta > 0 ? '' : ' drag-badge--down'}`}
                    style={{ top: drag.localY }}
                  >
                    {drag.delta > 0 ? '+' : '−'}
                    {Math.abs(drag.delta)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="truco-note">
        {nothingScored && !drag
          ? 'Deslizá sobre el equipo para anotar · tocá para sumar uno'
          : `Se juega a ${TARGET}: 15 malas y 15 buenas.`}
      </p>

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
