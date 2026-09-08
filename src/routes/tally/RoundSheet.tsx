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

/**
 * One hand, entered.
 *
 * TWO SHAPES OF HAND LIVE HERE, and the difference is the game's, not the
 * screen's. In rummy and chinchón everybody writes a number every hand, so the
 * sheet walks the players one by one and the last tap saves. In dominó only
 * one player scores — the winner takes what is left in everybody else's hands
 * and the rest write nothing — so walking the table would mean tapping through
 * two or three people to confirm a zero that could not have been anything else.
 *
 * So dominó asks the two questions it actually has: who won, and for how much.
 * The player row stops being a cursor and becomes the answer to the first one,
 * which is why picking somebody there moves the number onto them and off
 * everybody else: a dominó hand with two numbers on it is not a hand anybody
 * played.
 */
export function RoundSheet({ variant, players, roundIndex, initial, onSave, onDelete, onClose }: Props) {
  const isDomino = variant === 'domino'

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      players.map((p) => [p.id, initial?.[p.id] !== undefined ? String(initial[p.id]) : '']),
    ),
  )
  /**
   * In rummy and chinchón this is the cursor and starts on the first player.
   * In dominó it is the winner, so it starts on NOBODY when the hand is new:
   * pre-selecting seat one would put a name on a hand before anyone said who
   * took it. Reopening an old hand selects whoever holds its number.
   */
  const [active, setActive] = useState<string | null>(() => {
    if (!isDomino) return players[0].id
    return players.find((p) => (initial?.[p.id] ?? 0) !== 0)?.id ?? null
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activeIndex = players.findIndex((p) => p.id === active)
  const isLast = activeIndex === players.length - 1

  const pick = (id: string) => {
    setActive(id)
    if (!isDomino) return
    /*
     * Dominó: exactly one player can hold a number, so choosing a winner takes
     * it off whoever had it — and HANDS IT OVER rather than throwing it away.
     * The number is what was left on the table, and that does not change
     * because you named the wrong person first; clearing it made correcting a
     * misheard winner cost the whole count again. Nothing to move in the other
     * games, where every player keeps their own.
     */
    setValues((current) => {
      const carried = players.map((p) => current[p.id]).find((v) => v) ?? ''
      return Object.fromEntries(players.map((p) => [p.id, p.id === id ? carried : '']))
    })
  }

  const save = () => {
    // A blank counts as zero: a player who scored nothing this hand is normal,
    // and making them tap "0" every round would be friction for no gain. In
    // dominó that is every player but one, and also covers a tranca that came
    // out level, where the hand is worth nothing to anybody.
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

        {isDomino && <div className="field-label">¿QUIÉN GANÓ LA MANO?</div>}

        <div className="round-sheet__players">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              className={`round-player${player.id === active ? ' round-player--on' : ''}`}
              onClick={() => pick(player.id)}
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
              active && setValues((current) => ({ ...current, [active]: String(CHINCHON_CLOSE) }))
            }
          >
            <span>CORTÓ LA MANO</span>
            <strong>{CHINCHON_CLOSE}</strong>
          </button>
        )}

        {isDomino && (
          <div className="field-label">
            {active ? 'PUNTOS QUE SE LLEVA' : 'ELEGÍ QUIÉN GANÓ PARA ANOTAR LOS PUNTOS'}
          </div>
        )}

        <Keypad
          value={(active && values[active]) || ''}
          onChange={(next) =>
            active && setValues((current) => ({ ...current, [active]: next }))
          }
          /* Dominó counts pips left on the table. There is no negative hand. */
          allowNegative={!isDomino}
          disabled={active === null}
        />

        {isDomino ? (
          <button
            type="button"
            className="big-btn big-btn--flat"
            disabled={active === null}
            onClick={save}
          >
            GUARDAR MANO
          </button>
        ) : (
          <button
            type="button"
            className="big-btn big-btn--flat"
            onClick={() => (isLast ? save() : setActive(players[activeIndex + 1].id))}
          >
            {isLast ? 'GUARDAR MANO' : `SIGUIENTE · ${players[activeIndex + 1].name.toUpperCase()}`}
          </button>
        )}
      </div>
    </Sheet>
  )
}
