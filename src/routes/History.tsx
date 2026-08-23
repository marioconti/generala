import { useState } from 'react'
import { Chip } from '../components/Chip'
import { Icon } from '../components/Icon'
import { playedOn } from '../components/ResultCard'
import { Surface } from '../components/Surface'
import { TopBar } from '../components/TopBar'
import {
  CHAMPION_THRESHOLD,
  clearHistory,
  GAME_NAMES,
  getHistory,
  getStandings,
} from '../lib/history'

export function History() {
  // A counter, not state: bumping it re-reads localStorage after a wipe.
  const [version, setVersion] = useState(0)
  const [confirming, setConfirming] = useState(false)

  const standings = getStandings()
  const history = [...getHistory()].reverse()
  void version

  return (
    <Surface game="home">
      <TopBar title="Historial" />

      <div className="scroll-body">
        {standings.length === 0 ? (
          <p className="empty-note">
            Todavía no terminaron ninguna partida.
            <br />
            Cuando cierren la primera, aparece acá.
          </p>
        ) : (
          <>
            <div className="card">
              <div className="card__frame" />
              <div className="card__body">
                <div className="field-label">CAMINO AL HELADO</div>
                {standings.map((s, i) => (
                  <div key={s.name} className="stand">
                    <Chip chip={i} initial={s.name.charAt(0)} size={30} />
                    <div className="stand__body">
                      <div className="stand__top">
                        <span className="stand__name">{s.name}</span>
                        <span className="stand__count">
                          {s.wins}
                          <em>/{CHAMPION_THRESHOLD}</em>
                        </span>
                      </div>
                      <div className="stand__track">
                        <div
                          className="stand__fill"
                          style={{ width: `${Math.min(100, (s.wins / CHAMPION_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                      <div className="stand__sub">{s.played} partidas jugadas</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__frame" />
              <div className="card__body">
                <div className="field-label">ÚLTIMAS PARTIDAS</div>
                <div className="log">
                  {history.slice(0, 30).map((entry) => (
                    <div key={entry.id} className="log-row">
                      <span className="log-row__game">{GAME_NAMES[entry.game]}</span>
                      <span className="log-row__who">
                        {entry.winners.length > 1 ? `empate: ${entry.winners.join(' y ')}` : entry.winners[0]}
                      </span>
                      <span className="log-row__when">{playedOn(entry.finishedAt)}</span>
                    </div>
                  ))}
                </div>
                {history.length > 30 && (
                  <p className="field-note">Se muestran las últimas 30 de {history.length}.</p>
                )}
              </div>
            </div>

            {confirming ? (
              <div className="confirm confirm--wide">
                <span className="confirm__text">Se borra todo el historial.</span>
                <button type="button" className="confirm__no" onClick={() => setConfirming(false)}>
                  No
                </button>
                <button
                  type="button"
                  className="confirm__yes"
                  onClick={() => {
                    clearHistory()
                    setConfirming(false)
                    setVersion((v) => v + 1)
                  }}
                >
                  Sí, borrar
                </button>
              </div>
            ) : (
              <button type="button" className="ghost-btn ghost-btn--tall" onClick={() => setConfirming(true)}>
                <Icon name="trash" size={17} />
                BORRAR HISTORIAL
              </button>
            )}
          </>
        )}
      </div>
    </Surface>
  )
}
