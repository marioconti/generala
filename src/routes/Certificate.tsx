import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { playedOn } from '../components/ResultCard'
import { Surface } from '../components/Surface'
import { CHAMPION_THRESHOLD, getChampion, getHistory, getNemesis } from '../lib/history'

/** Filigree for the diploma corners — four rotations of one flourish. */
function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg className={`cert__corner cert__corner--${at}`} width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path
        d="M2 32 V10 A8 8 0 0 1 10 2 H32"
        fill="none"
        stroke="var(--accent-deep)"
        strokeWidth="1.4"
      />
      <path d="M7 32 V12 A5 5 0 0 1 12 7 H32" fill="none" stroke="var(--accent-deep)" strokeWidth="0.8" opacity=".6" />
      <circle cx="11" cy="11" r="2" fill="var(--accent-deep)" opacity=".7" />
    </svg>
  )
}

/** A wax seal, stamped rather than printed. */
function Seal({ initial }: { initial: string }) {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" className="cert__seal">
      <circle cx="38" cy="38" r="30" fill="#9c2f2f" />
      <circle cx="38" cy="38" r="30" fill="none" stroke="#7a2020" strokeWidth="2" />
      <circle cx="38" cy="38" r="24" fill="none" stroke="rgba(255,235,215,.55)" strokeWidth="1.2" strokeDasharray="3 4" />
      <text
        x="38"
        y="47"
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        fill="#ffeedd"
        fontFamily="Georgia, serif"
      >
        {initial.toUpperCase()}
      </text>
    </svg>
  )
}

export function Certificate() {
  const champion = getChampion()

  if (!champion) {
    return (
      <Surface game="home">
        <div className="stack">
          <div className="rule-line">TODAVÍA NO HAY CAMPEÓN</div>
          <p className="empty-note">
            El certificado se emite cuando alguien gana <strong>{CHAMPION_THRESHOLD} partidas</strong>.
            <br />
            Sigan jugando.
          </p>
          <Link to="/" className="ghost-btn ghost-btn--tall">
            <Icon name="home" size={18} />
            VOLVER
          </Link>
        </div>
      </Surface>
    )
  }

  const nemesis = getNemesis(champion.name)
  const history = getHistory()
  const crownedOn = history[history.length - 1]?.finishedAt ?? new Date().toISOString()

  return (
    <Surface game="home">
      <div className="stack stack--scroll">
        <div className="cert">
          <div className="cert__frame" />
          <Corner at="tl" />
          <Corner at="tr" />
          <Corner at="bl" />
          <Corner at="br" />

          <div className="cert__body">
            <div className="cert__eyebrow">SE CERTIFICA QUE</div>

            <div className="cert__name">{champion.name}</div>

            <div className="cert__title">
              Campeón Supremo
              <span>del Máximo</span>
            </div>

            <div className="cert__hr" />

            <p className="cert__text">
              habiendo alcanzado las <strong>{champion.wins} victorias</strong> sobre un total de{' '}
              {champion.played} partidas disputadas en esta mesa, queda consagrado con todos los
              honores, prerrogativas y cargadas que el título conlleva.
            </p>

            <div className="cert__prize">
              <div className="cert__prize-label">ES ACREEDOR DE</div>
              <div className="cert__prize-what">1 KG DE HELADO</div>
              <div className="cert__prize-who">
                {nemesis ? (
                  <>
                    a cargo de <strong>{nemesis}</strong>
                  </>
                ) : (
                  'a cargo del contrincante'
                )}
              </div>
            </div>

            <div className="cert__breakdown">
              {(['generala', 'truco', 'rummy', 'chinchon'] as const)
                .filter((g) => champion.byGame[g] > 0)
                .map((g) => (
                  <span key={g} className="cert__tag">
                    {g === 'chinchon' ? 'chinchón' : g} · {champion.byGame[g]}
                  </span>
                ))}
            </div>

            <div className="cert__foot">
              <Seal initial={champion.name.charAt(0)} />
              <div className="cert__sign">
                <div className="cert__sign-line" />
                <div className="cert__sign-label">{playedOn(crownedOn)}</div>
              </div>
            </div>
          </div>
        </div>

        <Link to="/" className="ghost-btn ghost-btn--tall">
          <Icon name="home" size={18} />
          VOLVER AL MENÚ
        </Link>
      </div>
    </Surface>
  )
}
