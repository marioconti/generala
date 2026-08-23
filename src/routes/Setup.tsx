import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { Felt } from '../components/Felt'
import { MAX_PLAYERS, MIN_PLAYERS } from '../game/rules'
import { useGame } from '../game/useGame'

export function Setup() {
  const [names, setNames] = useState<string[]>(['', ''])
  const { game, start } = useGame()
  const navigate = useNavigate()

  // The tag always opens "/", so a half-finished sheet has to be reachable from here.
  const inProgress = game && !game.finishedAt && game.history.length > 0

  const filled = names.map((n) => n.trim()).filter(Boolean)
  const canDeal = filled.length >= MIN_PLAYERS

  const setName = (index: number, value: string) =>
    setNames((current) => current.map((n, i) => (i === index ? value : n)))

  const remove = (index: number) =>
    setNames((current) => current.filter((_, i) => i !== index))

  const deal = () => {
    if (!canDeal) return
    start(filled)
    navigate('/partida')
  }

  return (
    <Felt>
      <div className="stack">
        <div className="brand">
          <div className="brand__word">Generala</div>
          <div className="rule-line">LA PLANILLA DE LA MESA</div>
        </div>

        {inProgress && (
          <button type="button" className="resume" onClick={() => navigate('/partida')}>
            <div className="resume__chips">
              {game.players.map((p) => (
                <Chip key={p.id} chip={p.chip} initial={p.name.charAt(0)} size={30} />
              ))}
            </div>
            <div className="resume__text">
              <div className="resume__title">SEGUIR LA PARTIDA</div>
              <div className="resume__who">{game.players.map((p) => p.name).join(' · ')}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}

        <div className="card">
          <div className="card__frame" />
          <div className="card__body">
            <div className="entry__label">¿QUIÉNES JUEGAN?</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
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
                  {names.length > MIN_PLAYERS && (
                    <button
                      type="button"
                      className="player-row__x"
                      onClick={() => remove(i)}
                      aria-label={`Quitar jugador ${i + 1}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b09a72" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {names.length < MAX_PLAYERS && (
                <button type="button" className="add-row" onClick={() => setNames((c) => [...c, ''])}>
                  <Chip chip={names.length} size={34} />
                  <span className="add-row__grow">Agregar jugador</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a6f3e" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              )}
            </div>

            <div className="hint">
              {canDeal ? `Hasta ${MAX_PLAYERS} jugadores` : `Escribí al menos ${MIN_PLAYERS} nombres`}
            </div>
          </div>
        </div>

        <button type="button" className="deal-btn" disabled={!canDeal} onClick={deal}>
          REPARTIR
        </button>
      </div>
    </Felt>
  )
}
