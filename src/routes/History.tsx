import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  useHistoryVersion,
} from '../lib/history'
import { usePending } from '../lib/pending'
import { isSharing, wipeShared } from '../lib/sync'
import { getFeatsCoverage, getKings, getTrophies, type Trophy } from '../lib/trophies'

type Tab = 'podio' | 'trofeos' | 'partidas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'podio', label: 'PODIO' },
  { id: 'trofeos', label: 'TROFEOS' },
  { id: 'partidas', label: 'PARTIDAS' },
]

/** '3 generalas', '1 victoria' — the unit follows the number. */
function said(trophy: Trophy, value: number): string {
  return `${value} ${value === 1 ? trophy.unit[0] : trophy.unit[1]}`
}

function TrophyRow({ trophy }: { trophy: Trophy }) {
  const held = trophy.holders.length > 0

  return (
    <div className={`trophy${held ? '' : ' trophy--open'}`}>
      <div className="trophy__badge">
        <Icon name={trophy.icon} size={19} />
      </div>
      <div className="trophy__body">
        <div className="trophy__name">{trophy.name}</div>
        <div className="trophy__blurb">{trophy.blurb}</div>
      </div>
      <div className="trophy__who">
        {held ? (
          <>
            <span className="trophy__holder">
              {trophy.holders.map((h) => h.name).join(' y ')}
            </span>
            <span className="trophy__value">{said(trophy, trophy.holders[0].value)}</span>
          </>
        ) : (
          <span className="trophy__none">sin dueño</span>
        )}
      </div>
    </div>
  )
}

export function History() {
  // Re-renders on every change to the filed games, including ones that arrive
  // from another phone while this screen is open.
  useHistoryVersion()
  const [confirming, setConfirming] = useState(false)
  const [tab, setTab] = useState<Tab>('podio')

  const pending = usePending()
  const standings = getStandings()
  const history = [...getHistory()].reverse()
  const trophies = getTrophies()
  const kings = getKings()
  const coverage = getFeatsCoverage()

  const nothingYet = standings.length === 0
  const youngTrophies = trophies.filter((t) => t.young)
  const missing = coverage.total - coverage.counted

  return (
    <Surface game="home">
      <TopBar title="Historial" />

      <div className="scroll-body">
        {pending.length > 0 && (
          <div className="card">
            <div className="card__frame" />
            <div className="card__body">
              <div className="field-label">SIN TERMINAR</div>
              <div className="pend">
                {pending.map((game) => (
                  <Link key={game.game} to={game.to} className="pend-row">
                    <div className="pend-row__body">
                      <div className="pend-row__top">
                        <span className="pend-row__game">{GAME_NAMES[game.game]}</span>
                        <span className="pend-row__who">{game.players.join(' · ')}</span>
                      </div>
                      <div className="pend-row__track">
                        <div
                          className="pend-row__fill"
                          style={{ width: `${Math.round(game.progress * 100)}%` }}
                        />
                      </div>
                      <div className="pend-row__sub">
                        {game.detail}
                        {game.leader && <> · va ganando <strong>{game.leader}</strong></>}
                        <span className="pend-row__when">empezada el {playedOn(game.startedAt)}</span>
                      </div>
                    </div>
                    <Icon name="forward" size={17} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {nothingYet ? (
          <p className="empty-note">
            {pending.length > 0 ? (
              <>
                Todavía no cerraron ninguna partida.
                <br />
                Cuando cierren la primera aparecen el podio y los trofeos.
              </>
            ) : (
              <>
                Todavía no terminaron ninguna partida.
                <br />
                Cuando cierren la primera, aparece acá.
              </>
            )}
          </p>
        ) : (
          <>
            <div className="pill-row">
              {TABS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`pill pill--wide${tab === option.id ? ' pill--on' : ''}`}
                  onClick={() => setTab(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {tab === 'podio' && (
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
                              style={{
                                width: `${Math.min(100, (s.wins / CHAMPION_THRESHOLD) * 100)}%`,
                              }}
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
                    <div className="field-label">DUEÑO DE CADA JUEGO</div>
                    <div className="kings">
                      {kings.map((king) => (
                        <div key={king.game} className={`king${king.name ? '' : ' king--open'}`}>
                          <span className="king__game">{king.label}</span>
                          <span className="king__name">{king.name ?? 'sin dueño'}</span>
                          {king.name && <span className="king__wins">{king.wins}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === 'trofeos' && (
              <>
                <div className="card">
                  <div className="card__frame" />
                  <div className="card__body">
                    <div className="field-label">LA VITRINA</div>
                    <div className="trophies">
                      {trophies
                        .filter((t) => !t.young)
                        .map((t) => (
                          <TrophyRow key={t.id} trophy={t} />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card__frame" />
                  <div className="card__body">
                    <div className="field-label">DE LA GENERALA</div>
                    <div className="trophies">
                      {youngTrophies.map((t) => (
                        <TrophyRow key={t.id} trophy={t} />
                      ))}
                    </div>
                    {missing > 0 && (
                      <p className="field-note">
                        Estos cuatro cuentan {coverage.counted} de las {coverage.total} generalas
                        jugadas. Las {missing} anteriores no guardaron el detalle de cada casillero,
                        así que no hay forma de saber cuántas generalas se cantaron en ellas.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === 'partidas' && (
              <>
                <div className="card">
                  <div className="card__frame" />
                  <div className="card__body">
                    <div className="field-label">ÚLTIMAS PARTIDAS</div>
                    <div className="log">
                      {history.slice(0, 30).map((entry) => (
                        <div key={entry.id} className="log-row">
                          <span className="log-row__game">{GAME_NAMES[entry.game]}</span>
                          <span className="log-row__who">
                            {entry.winners.length > 1
                              ? `empate: ${entry.winners.join(' y ')}`
                              : entry.winners[0]}
                          </span>
                          <span className="log-row__when">{playedOn(entry.finishedAt)}</span>
                        </div>
                      ))}
                    </div>
                    {history.length > 30 && (
                      <p className="field-note">
                        Se muestran las últimas 30 de {history.length}.
                      </p>
                    )}
                  </div>
                </div>

                {confirming ? (
                  <div className="confirm confirm--wide">
                    <span className="confirm__text">
                      {isSharing()
                        ? 'Se borra el historial de toda la mesa, en todos los teléfonos.'
                        : 'Se borra todo el historial.'}
                    </span>
                    <button
                      type="button"
                      className="confirm__no"
                      onClick={() => setConfirming(false)}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="confirm__yes"
                      onClick={() => {
                        clearHistory()
                        // The shared table is the same record, so leaving it
                        // behind would just refill this phone on the next sync.
                        void wipeShared().catch(() => {})
                        setConfirming(false)
                      }}
                    >
                      Sí, borrar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="ghost-btn ghost-btn--tall"
                    onClick={() => setConfirming(true)}
                  >
                    <Icon name="trash" size={17} />
                    BORRAR HISTORIAL
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Surface>
  )
}
