import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip } from './Chip'
import { Icon } from './Icon'
import { Sheet } from './Sheet'

interface MenuPlayer {
  id: string
  name: string
  chip?: number
}

interface Props {
  players: MenuPlayer[]
  onRename: (id: string, name: string) => void
  onRestart: () => void
  onExit: () => void
  onClose: () => void
  /** Game-specific controls, e.g. the target score for Rummy. */
  extra?: ReactNode
  restartLabel?: string
}

/**
 * The controls every game needs and none of them had: rename a player mid-game,
 * wipe the sheet, walk away.
 *
 * Restart and exit both destroy a game in progress, so each asks once — inline,
 * not through a native confirm(), which on iOS blocks the page and looks like
 * the browser interrupting rather than the app asking.
 */
export function GameMenu({
  players,
  onRename,
  onRestart,
  onExit,
  onClose,
  extra,
  restartLabel = 'Reiniciar la partida',
}: Props) {
  const [confirming, setConfirming] = useState<'restart' | 'exit' | null>(null)
  const navigate = useNavigate()

  const exit = () => {
    onExit()
    navigate('/')
  }

  return (
    <Sheet label="Opciones de la partida" onClose={onClose}>
      <div className="menu">
        <div className="menu__label">JUGADORES</div>
        <div className="menu__players">
          {players.map((player) => (
            <label key={player.id} className="menu__player">
              {player.chip !== undefined && <Chip chip={player.chip} initial={player.name.charAt(0)} size={30} />}
              <input
                className="menu__input"
                defaultValue={player.name}
                maxLength={14}
                autoComplete="off"
                spellCheck={false}
                aria-label={`Nombre de ${player.name}`}
                onBlur={(e) => {
                  const next = e.target.value.trim()
                  if (next && next !== player.name) onRename(player.id, next)
                  else e.target.value = player.name
                }}
              />
              <Icon name="edit" size={16} />
            </label>
          ))}
        </div>

        {extra}

        <div className="menu__actions">
          {confirming === 'restart' ? (
            <div className="confirm">
              <span className="confirm__text">¿Borrar todo lo anotado?</span>
              <button type="button" className="confirm__no" onClick={() => setConfirming(null)}>
                No
              </button>
              <button
                type="button"
                className="confirm__yes"
                onClick={() => {
                  onRestart()
                  onClose()
                }}
              >
                Sí, reiniciar
              </button>
            </div>
          ) : (
            <button type="button" className="menu__action" onClick={() => setConfirming('restart')}>
              <Icon name="restart" size={18} />
              {restartLabel}
            </button>
          )}

          {confirming === 'exit' ? (
            <div className="confirm">
              <span className="confirm__text">Se pierde la partida.</span>
              <button type="button" className="confirm__no" onClick={() => setConfirming(null)}>
                No
              </button>
              <button type="button" className="confirm__yes" onClick={exit}>
                Sí, salir
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="menu__action menu__action--danger"
              onClick={() => setConfirming('exit')}
            >
              <Icon name="home" size={18} />
              Salir al menú
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
