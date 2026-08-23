import { Chip } from './Chip'
import { Icon } from './Icon'
import { getKnownPlayers } from '../lib/history'

interface Props {
  names: string[]
  onChange: (names: string[]) => void
  min: number
  max: number
}

/**
 * Name entry for a new game.
 *
 * Offers whoever has played before as one-tap chips — by the third night nobody
 * wants to type "Mario" and "Juan" again.
 */
export function PlayerNames({ names, onChange, min, max }: Props) {
  const taken = new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean))
  const suggestions = getKnownPlayers().filter((n) => !taken.has(n.toLowerCase()))

  const setName = (index: number, value: string) =>
    onChange(names.map((n, i) => (i === index ? value : n)))

  const addName = (value = '') => {
    if (names.length >= max) return
    onChange([...names, value])
  }

  const fillFirstEmpty = (value: string) => {
    const empty = names.findIndex((n) => !n.trim())
    if (empty === -1) addName(value)
    else setName(empty, value)
  }

  return (
    <div className="names">
      <div className="names__list">
        {names.map((name, i) => (
          <div key={i} className="player-row">
            <Chip chip={i} initial={name.charAt(0) || undefined} size={34} />
            <input
              className="player-row__input"
              value={name}
              onChange={(e) => setName(i, e.target.value)}
              placeholder={`Jugador ${i + 1}`}
              maxLength={14}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={i === names.length - 1 ? 'done' : 'next'}
              aria-label={`Nombre del jugador ${i + 1}`}
            />
            {names.length > min && (
              <button
                type="button"
                className="player-row__x"
                onClick={() => onChange(names.filter((_, j) => j !== i))}
                aria-label={`Quitar jugador ${i + 1}`}
              >
                <Icon name="close" size={17} />
              </button>
            )}
          </div>
        ))}

        {names.length < max && (
          <button type="button" className="add-row" onClick={() => addName()}>
            <Chip chip={names.length} size={34} />
            <span className="add-row__grow">Agregar jugador</span>
            <Icon name="plus" size={17} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && names.length < max && (
        <div className="names__suggest">
          <div className="names__suggest-label">YA JUGARON</div>
          <div className="names__chips">
            {suggestions.slice(0, 6).map((name) => (
              <button
                key={name}
                type="button"
                className="name-chip"
                onClick={() => fillFirstEmpty(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
