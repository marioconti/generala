import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Chip } from '../../components/Chip'
import { GameMenu } from '../../components/GameMenu'
import { Icon } from '../../components/Icon'
import { PaperGrain, Surface } from '../../components/Surface'
import { TopBar } from '../../components/TopBar'
import { progress, ranking, totalAt, totals, type TallyVariant } from '../../games/tally/rules'
import { useTally } from '../../games/tally/useTally'
import { GAME_NAMES } from '../../lib/history'
import { RoundSheet } from './RoundSheet'

export function TallyBoard({ variant }: { variant: TallyVariant }) {
  const { game, addRound, editRound, removeRound, renamePlayer, rematch, reset } = useTally(variant)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (game?.finishedAt) navigate(`/${variant}/resultado`, { replace: true })
  }, [game?.finishedAt, navigate, variant])

  if (!game) return <Navigate to={`/${variant}`} replace />

  const running = totals(game)
  const leader = ranking(game)[0]
  const pct = progress(game)

  return (
    <Surface game={variant}>
      <TopBar
        title={GAME_NAMES[variant]}
        back={`/${variant}`}
        actions={
          <button type="button" className="round-btn" onClick={() => setMenuOpen(true)} aria-label="Opciones">
            <Icon name="menu" size={20} />
          </button>
        }
      />

      <div className="sheet sheet--tall">
        <PaperGrain />

        <div className="tally-head" style={{ '--players': game.players.length } as React.CSSProperties}>
          <div className="tally-head__corner">MANO</div>
          {game.players.map((player) => (
            <div key={player.id} className="tally-head__player">
              <Chip chip={player.chip} initial={player.name.charAt(0)} size={26} />
              <span className="tally-head__name">{player.name.toUpperCase()}</span>
            </div>
          ))}
        </div>

        <div className="tally-rows" style={{ '--players': game.players.length } as React.CSSProperties}>
          {game.rounds.length === 0 && (
            <p className="tally-empty">
              Todavía no anotaron ninguna mano.
              <br />
              Tocá <strong>+ MANO</strong> cuando termine la primera.
            </p>
          )}

          {game.rounds.map((round, index) => (
            <button
              key={index}
              type="button"
              className="tally-row"
              onClick={() => setEditing(index)}
              aria-label={`Editar la mano ${index + 1}`}
            >
              <span className="tally-row__n">{index + 1}</span>
              {game.players.map((player) => (
                <span key={player.id} className="tally-cell">
                  <span className="tally-cell__hand">{round[player.id] ?? 0}</span>
                  <span className="tally-cell__rule" />
                  <span className="tally-cell__total">{totalAt(game, player.id, index)}</span>
                </span>
              ))}
            </button>
          ))}
        </div>

        <div className="tally-foot" style={{ '--players': game.players.length } as React.CSSProperties}>
          <span className="tally-foot__label">TOTAL</span>
          {game.players.map((player) => (
            <span
              key={player.id}
              className={`tally-foot__total${leader?.player.id === player.id ? ' tally-foot__total--lead' : ''}`}
            >
              {running[player.id]}
            </span>
          ))}
        </div>
      </div>

      {game.target !== null && (
        <div className="progress" aria-hidden="true">
          <div className="progress__bar" style={{ width: `${pct * 100}%` }} />
          <span className="progress__label">
            {game.winnerIs === 'lowest' ? 'termina en' : 'se juega a'} {game.target}
          </span>
        </div>
      )}

      <button type="button" className="big-btn" onClick={() => setEditing('new')}>
        <Icon name="plus" size={20} />
        MANO
      </button>

      {editing !== null && (
        <RoundSheet
          players={game.players}
          roundIndex={editing === 'new' ? game.rounds.length : editing}
          initial={editing === 'new' ? null : game.rounds[editing]}
          onSave={(scores) => {
            if (editing === 'new') addRound(scores)
            else editRound(editing, scores)
            setEditing(null)
          }}
          onDelete={
            editing === 'new'
              ? undefined
              : () => {
                  removeRound(editing)
                  setEditing(null)
                }
          }
          onClose={() => setEditing(null)}
        />
      )}

      {menuOpen && (
        <GameMenu
          players={game.players}
          onRename={renamePlayer}
          onRestart={rematch}
          onExit={reset}
          onClose={() => setMenuOpen(false)}
          restartLabel="Borrar las manos y empezar de nuevo"
        />
      )}
    </Surface>
  )
}
