import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { GameMark } from '../components/GameMark'
import { Surface } from '../components/Surface'
import { useGenerala } from '../games/generala/useGenerala'
import { useTally } from '../games/tally/useTally'
import {
  CHAMPION_THRESHOLD,
  getChampion,
  getStandings,
  useHistoryVersion,
  type GameId,
} from '../lib/history'

interface Door {
  id: 'generala' | 'rummy' | 'chinchon'
  to: string
  name: string
  blurb: string
}

const DOORS: Door[] = [
  { id: 'generala', to: '/generala', name: 'Generala', blurb: '5 dados · 11 juegos' },
  { id: 'rummy', to: '/rummy', name: 'Rummy', blurb: 'mano a mano' },
  { id: 'chinchon', to: '/chinchon', name: 'Chinchón', blurb: 'a 100 · gana el menor' },
]

export function Home() {
  const generala = useGenerala()
  const rummy = useTally('rummy')
  const chinchon = useTally('chinchon')

  const inProgress: Partial<Record<GameId, boolean>> = {
    generala: !!generala.game && !generala.game.finishedAt && generala.game.history.length > 0,
    rummy: !!rummy.game && !rummy.game.finishedAt && rummy.game.rounds.length > 0,
    chinchon: !!chinchon.game && !chinchon.game.finishedAt && chinchon.game.rounds.length > 0,
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
            {/* Crown, not trophy: the trophy icon is El General's in the
                cabinet, and the two are not the same title. */}
            <Icon name="crown" size={22} />
            <div className="champion-banner__text">
              <strong>{champion.name.toUpperCase()}</strong> es Campeón Supremo
              <span>{champion.points} puntos · retirá el certificado</span>
            </div>
            <Icon name="forward" size={18} />
          </Link>
        )}

        <nav className="doors">
          {DOORS.map((door) => (
            <Link key={door.id} to={door.to} className="door" data-game={door.id}>
              <div className="door__mark">
                <GameMark game={door.id} />
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
                Va ganando <strong>{leader.name}</strong> — {leader.points} de {CHAMPION_THRESHOLD}
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
