import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PlayerNames } from '../../components/PlayerNames'
import { Surface } from '../../components/Surface'
import { TopBar } from '../../components/TopBar'
import type { TallyVariant, WinnerIs } from '../../games/tally/rules'
import { useTally } from '../../games/tally/useTally'
import { GAME_NAMES } from '../../lib/history'

const TARGETS = [50, 100, 150, 200]

export function TallySetup({ variant }: { variant: TallyVariant }) {
  const { game, preset, start } = useTally(variant)
  const [names, setNames] = useState<string[]>(['', ''])
  const [target, setTarget] = useState<number | null>(preset.target)
  const [winnerIs, setWinnerIs] = useState<WinnerIs>(preset.winnerIs)
  const navigate = useNavigate()

  const filled = names.map((n) => n.trim()).filter(Boolean)
  const canStart = filled.length >= 2
  const inProgress = game && !game.finishedAt && game.rounds.length > 0

  return (
    <Surface game={variant}>
      <TopBar title={GAME_NAMES[variant]} />

      <div className="scroll-body">
        {inProgress && (
          <button type="button" className="resume" onClick={() => navigate(`/${variant}/partida`)}>
            <div className="resume__text">
              <div className="resume__title">SEGUIR LA PARTIDA</div>
              <div className="resume__who">
                {game.players.map((p) => p.name).join(' · ')} — {game.rounds.length} manos
              </div>
            </div>
            <Icon name="forward" size={18} />
          </button>
        )}

        <div className="card">
          <div className="card__frame" />
          <div className="card__body">
            <div className="field-label">¿QUIÉNES JUEGAN?</div>
            <PlayerNames names={names} onChange={setNames} min={2} max={6} />
          </div>
        </div>

        <div className="card">
          <div className="card__frame" />
          <div className="card__body">
            <div className="field-label">SE JUEGA A</div>
            <div className="pill-row">
              {TARGETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`pill${target === value ? ' pill--on' : ''}`}
                  onClick={() => setTarget(value)}
                >
                  {value}
                </button>
              ))}
              <button
                type="button"
                className={`pill${target === null ? ' pill--on' : ''}`}
                onClick={() => setTarget(null)}
              >
                Libre
              </button>
            </div>

            <div className="field-label">GANA EL QUE</div>
            <div className="pill-row">
              <button
                type="button"
                className={`pill pill--wide${winnerIs === 'lowest' ? ' pill--on' : ''}`}
                onClick={() => setWinnerIs('lowest')}
              >
                Menos suma
              </button>
              <button
                type="button"
                className={`pill pill--wide${winnerIs === 'highest' ? ' pill--on' : ''}`}
                onClick={() => setWinnerIs('highest')}
              >
                Más suma
              </button>
            </div>

            <p className="field-note">{preset.note}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="big-btn"
        disabled={!canStart}
        onClick={() => {
          start(filled, target, winnerIs)
          navigate(`/${variant}/partida`)
        }}
      >
        COMENZAR
      </button>
    </Surface>
  )
}
