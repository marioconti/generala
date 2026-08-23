import { useState } from 'react'
import { Chip } from '../../components/Chip'
import { Icon } from '../../components/Icon'
import { Keypad } from '../../components/Keypad'
import { Sheet } from '../../components/Sheet'
import { CHINCHON_CLOSE, type TallyPlayer, type TallyVariant } from '../../games/tally/rules'

interface Props {
  variant: TallyVariant
  players: TallyPlayer[]
  /** 0-based; only used for the title. */
  roundIndex: number
  /** Existing scores when editing an old hand, null when adding a new one. */
  initial: Record<string, number> | null
  onSave: (scores: Record<string, number>) => void
  onDelete?: () => void
  onClose: () => void
}

export function RoundSheet({ variant, players, roundIndex, initial, onSave, onDelete, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      players.map((p) => [p.id, initial?.[p.id] !== undefined ? String(initial[p.id]) : '']),
    ),
  )
  const [active, setActive] = useState(players[0].id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activeIndex = players.findIndex((p) => p.id === active)
  const isLast = activeIndex === players.length - 1

  const save = () => {
    // A blank counts as zero: a player who scored nothing this hand is normal,
    // and making them tap "0" every round would be friction for no gain.
    onSave(Object.fromEntries(players.map((p) => [p.id, Number(values[p.id]) || 0])))
  }

  return (
    <Sheet label={`Mano ${roundIndex + 1}`} onClose={onClose}>
      <div className="round-sheet">
        <div className="round-sheet__head">
          <span className="round-sheet__title">MANO {roundIndex + 1}</span>
          {onDelete &&
            (confirmDelete ? (
              <div className="confirm confirm--inline">
                <button type="button" className="confirm__no" onClick={() => setConfirmDelete(false)}>
                  No
                </button>
                <button type="button" className="confirm__yes" onClick={onDelete}>
                  Borrar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="round-sheet__delete"
                onClick={() => setConfirmDelete(true)}
              >
                <Icon name="trash" size={16} />
                Borrar mano
              </button>
            ))}
        </div>

        <div className="round-sheet__players">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              className={`round-player${player.id === active ? ' round-player--on' : ''}`}
              onClick={() => setActive(player.id)}
            >
              <Chip chip={player.chip} initial={player.name.charAt(0)} size={26} dim={player.id !== active} />
              <span className="round-player__name">{player.name}</span>
              <span className="round-player__value">{values[player.id] || '—'}</span>
            </button>
          ))}
        </div>

        {variant === 'chinchon' && (
          <button
            type="button"
            className="close-hand"
            onClick={() =>
              setValues((current) => ({ ...current, [active]: String(CHINCHON_CLOSE) }))
            }
          >
            <span>CORTÓ LA MANO</span>
            <strong>{CHINCHON_CLOSE}</strong>
          </button>
        )}

        <Keypad
          value={values[active] ?? ''}
          onChange={(next) => setValues((current) => ({ ...current, [active]: next }))}
        />

        <button
          type="button"
          className="big-btn big-btn--flat"
          onClick={() => (isLast ? save() : setActive(players[activeIndex + 1].id))}
        >
          {isLast ? 'GUARDAR MANO' : `SIGUIENTE · ${players[activeIndex + 1].name.toUpperCase()}`}
        </button>
      </div>
    </Sheet>
  )
}
