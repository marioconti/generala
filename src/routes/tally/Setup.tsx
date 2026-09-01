import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PlayerNames } from '../../components/PlayerNames'
import { Surface } from '../../components/Surface'
import { TopBar } from '../../components/TopBar'
import type { TallyVariant } from '../../games/tally/rules'
import { useTally } from '../../games/tally/useTally'
import { GAME_NAMES } from '../../lib/history'

export function TallySetup({ variant }: { variant: TallyVariant }) {
  const { game, preset, start } = useTally(variant)
  const [names, setNames] = useState<string[]>([])
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

        {/* The rules are fixed, so they are stated rather than chosen. */}
        <div className="rules-note">
          <Icon name="scroll" size={17} />
          <p>{preset.note}</p>
        </div>
      </div>

      <button
        type="button"
        className="big-btn"
        disabled={!canStart}
        onClick={() => {
          start(filled)
          navigate(`/${variant}/partida`)
        }}
      >
        COMENZAR
      </button>
    </Surface>
  )
}
