import { useEffect } from 'react'
import { categoryById, hasServedBonus, scoreOf } from './rules'
import type { CategoryId, Game, Score } from './types'
import { Chip } from '../../components/Chip'
import { Die } from '../../components/Die'

interface Props {
  game: Game
  playerId: string
  categoryId: CategoryId
  onConfirm: (score: Score) => void
  /** Empties the cell. Only offered when it already holds a score. */
  onClear: () => void
  onClose: () => void
}

/** A number row can only ever be worth these six values. */
const DICE = [0, 1, 2, 3, 4, 5]

function ScratchButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn-scratch" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M5 19L19 5" />
      </svg>
      TACHAR
    </button>
  )
}

/**
 * Slides up from the bottom so everything sits in the thumb's reach.
 *
 * Every row offers the same thing: the scores that row can actually hold, one
 * tap each. A number row is worth 0, 1, 2, 3, 4 or 5 dice times its face, so
 * those six totals are the buttons — the dice under each are the reminder of
 * what they mean, not a sum to work out. Combinations offer made / served.
 */
export function ScoreEntry({ game, playerId, categoryId, onConfirm, onClear, onClose }: Props) {
  const existing = scoreOf(game, playerId, categoryId)
  const category = categoryById(categoryId)
  const player = game.players.find((p) => p.id === playerId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!player) return null

  const scratch = () => onConfirm({ kind: 'scratched' })

  // Doble Generala without a Generala above it is unusual but not forbidden —
  // house rules vary, so this warns and lets it through.
  const warnDouble =
    categoryId === 'doubleGenerala' && !scoreOf(game, playerId, 'generala')

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="entry" role="dialog" aria-modal="true" aria-label={`Anotar ${category.label}`}>
        <button type="button" className="entry__grip" onClick={onClose} aria-label="Cerrar" />

        <div className="entry__head">
          <Chip chip={player.chip} initial={player.name.charAt(0)} size={28} />
          <div className="entry__who">{player.name.toUpperCase()}</div>
          <div className="entry__cat">
            {category.kind === 'number' && <Die face={category.face} size={18} />}
            {category.label}
          </div>
        </div>

        {warnDouble && <div className="entry__note">Ojo: todavía no anotaste Generala.</div>}

        {existing && (
          <button type="button" className="entry__clear" onClick={onClear}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </svg>
            Vaciar esta casilla
          </button>
        )}

        {category.kind === 'number' ? (
          <>
            <div className="entry__label">¿CUÁNTO ANOTÁS EN {category.label}?</div>
            <div className="pts-grid">
              {DICE.map((dice) => {
                const points = dice * category.face
                const on = existing?.kind === 'number' && existing.points === points
                return (
                  <button
                    key={dice}
                    type="button"
                    className={`pts${on ? ' pts--on' : ''}`}
                    aria-label={`${points} puntos, ${dice} ${dice === 1 ? 'dado' : 'dados'}`}
                    onClick={() => onConfirm({ kind: 'number', count: dice, points })}
                  >
                    <span className="pts__value">{points}</span>
                    <span className="pts__dice">
                      {dice === 0 ? (
                        <span className="pts__none">ninguno</span>
                      ) : (
                        Array.from({ length: dice }, (_, i) => (
                          <Die key={i} face={category.face} size={10} />
                        ))
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="special-row">
            <button
              type="button"
              className="btn-special"
              onClick={() => onConfirm({ kind: 'special', served: false, points: category.made })}
            >
              <span className="btn-special__label">
                {hasServedBonus(category) ? 'ARMADA' : 'LA HICE'}
              </span>
              <span className="btn-special__points">{category.made}</span>
            </button>

            {hasServedBonus(category) && (
              <button
                type="button"
                className="btn-special btn-special--served"
                onClick={() => onConfirm({ kind: 'special', served: true, points: category.served })}
              >
                <span className="btn-special__label">SERVIDA</span>
                <span className="btn-special__points">{category.served}</span>
              </button>
            )}
          </div>
        )}

        <div className="entry__actions">
          <ScratchButton onClick={scratch} />
          <button type="button" className="btn-gold" onClick={onClose}>
            VOLVER
          </button>
        </div>
      </div>
    </>
  )
}
