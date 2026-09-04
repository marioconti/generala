import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Suit } from '../components/Suit'
import { Surface } from '../components/Surface'
import { useGenerala } from '../games/generala/useGenerala'
import { useTally } from '../games/tally/useTally'
import { useTruco } from '../games/truco/useTruco'
import {
  CHAMPION_THRESHOLD,
  getChampion,
  getStandings,
  useHistoryVersion,
  type GameId,
} from '../lib/history'

interface Door {
  id: GameId
  to: string
  name: string
  blurb: string
  icon: 'dice' | 'suit'
  suit?: 'spade' | 'oro' | 'espada'
}

const DOORS: Door[] = [
  { id: 'generala', to: '/generala', name: 'Generala', blurb: '5 dados · 11 juegos', icon: 'dice' },
  { id: 'truco', to: '/truco', name: 'Truco', blurb: 'palitos · a 30', icon: 'suit', suit: 'espada' },
  { id: 'rummy', to: '/rummy', name: 'Rummy', blurb: 'mano a mano', icon: 'suit', suit: 'spade' },
  { id: 'chinchon', to: '/chinchon', name: 'Chinchón', blurb: 'a 100 · gana el menor', icon: 'suit', suit: 'oro' },
]

/** Small dice glyph for the Generala door, drawn to match the Suit icons' weight. */
function DiceMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
      <circle cx="16" cy="8" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="8" cy="16" r="1.8" fill="currentColor" />
      <circle cx="16" cy="16" r="1.8" fill="currentColor" />
    </svg>
  )
}

export function Home() {
  const generala = useGenerala()
  const rummy = useTally('rummy')
  const chinchon = useTally('chinchon')
  const truco = useTruco()

  const inProgress: Partial<Record<GameId, boolean>> = {
    generala: !!generala.game && !generala.game.finishedAt && generala.game.history.length > 0,
    rummy: !!rummy.game && !rummy.game.finishedAt && rummy.game.rounds.length > 0,
    chinchon: !!chinchon.game && !chinchon.game.finishedAt && chinchon.game.rounds.length > 0,
    truco: !!truco.game && !truco.game.finishedAt && truco.game.history.length > 0,
  }

  useHistoryVersion()
  const champion = getChampion()
  const standings = getStandings()
  const leader = standings[0]

  return (
    <Surface game="home">
      <div className="home">
        <header className="home__brand">
          <div className="home__word">El Anotador</div>
          <div className="rule-line">DE LA MESA</div>
        </header>

        {champion && (
          <Link to="/certificado" className="champion-banner">
            <Icon name="trophy" size={22} />
            <div className="champion-banner__text">
              <strong>{champion.name.toUpperCase()}</strong> es Campeón Supremo
              <span>{champion.wins} victorias · retirá el certificado</span>
            </div>
            <Icon name="forward" size={18} />
          </Link>
        )}

        <nav className="doors">
          {DOORS.map((door) => (
            <Link key={door.id} to={door.to} className="door" data-game={door.id}>
              <div className="door__mark">
                {door.icon === 'dice' ? <DiceMark /> : <Suit suit={door.suit!} size={34} />}
              </div>
              <div className="door__name">{door.name}</div>
              <div className="door__blurb">{door.blurb}</div>
              {inProgress[door.id] && <span className="door__live">EN JUEGO</span>}
            </Link>
          ))}
        </nav>

        <Link to="/historial" className="home__foot">
          <Icon name="scroll" size={18} />
          <div className="home__foot-text">
            {leader ? (
              <>
                Va ganando <strong>{leader.name}</strong> — {leader.wins} de {CHAMPION_THRESHOLD}
              </>
            ) : (
              'Todavía no jugaron ninguna partida'
            )}
          </div>
          <Icon name="forward" size={16} />
        </Link>
      </div>
    </Surface>
  )
}
