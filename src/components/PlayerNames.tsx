import { useRef, useState } from 'react'
import { Chip } from './Chip'
import { Icon } from './Icon'
import { getKnownPlayers } from '../lib/history'

interface Props {
  /** Only real names — no blanks held open for players who may not exist. */
  names: string[]
  onChange: (names: string[]) => void
  min: number
  max: number
}

/**
 * Who is playing.
 *
 * Written as a table being set rather than a form being filled: every player is
 * a counter laid on the felt, the empty seats are drawn so the minimum is
 * visible without a sentence explaining it, and whoever has played before is
 * one tap away. There is a single line to write on, and by the third night it
 * is barely used — the counters at the bottom do the job.
 */
export function PlayerNames({ names, onChange, min, max }: Props) {
  const [draft, setDraft] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const taken = new Set(names.map((n) => n.trim().toLowerCase()))
  const suggestions = getKnownPlayers().filter((n) => !taken.has(n.toLowerCase()))
  const full = names.length >= max
  const emptySeats = Math.max(0, min - names.length)

  const add = (value: string) => {
    const name = value.trim().replace(/\s+/g, ' ')
    // Two players called the same name would be indistinguishable on the sheet.
    if (!name || full || taken.has(name.toLowerCase())) return false
    onChange([...names, name])
    return true
  }

  const remove = (index: number) => onChange(names.filter((_, i) => i !== index))

  const commitDraft = () => {
    if (add(draft)) setDraft('')
    // Focus stays put either way, so several names go in without reaching back
    // for the field between each one.
    input.current?.focus()
  }

  return (
    <div className="names">
      <div className="seats">
        {names.map((name, i) => (
          <div key={name} className="seat">
            <button
              type="button"
              className="seat__x"
              onClick={() => remove(i)}
              aria-label={`Sacar a ${name}`}
            >
              <Icon name="close" size={13} />
            </button>
            <Chip chip={i} initial={name.charAt(0)} size={54} />
            <span className="seat__name">{name}</span>
          </div>
        ))}

        {Array.from({ length: emptySeats }, (_, i) => (
          <div key={`empty-${i}`} className="seat seat--empty" aria-hidden="true">
            <div className="seat__hole" />
            <span className="seat__name">{'\u00a0'}</span>
          </div>
        ))}
      </div>

      {!full && (
        <div className="write-line">
          <input
            ref={input}
            className="write-line__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              commitDraft()
            }}
            placeholder={names.length === 0 ? 'Escribí un nombre' : 'Sumá a alguien'}
            maxLength={14}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="Nombre del jugador"
          />
          <button
            type="button"
            className="write-line__add"
            onClick={commitDraft}
            disabled={!draft.trim()}
            aria-label="Agregar jugador"
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
      )}

      {suggestions.length > 0 && !full && (
        <div className="names__suggest">
          <div className="names__suggest-label">YA JUGARON</div>
          <div className="names__chips">
            {suggestions.slice(0, 8).map((name) => (
              <button key={name} type="button" className="name-chip" onClick={() => add(name)}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
