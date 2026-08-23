import { Fragment } from 'react'
import { CATEGORIES, FIRST_SPECIAL, scoreOf, totalFor } from '../game/rules'
import type { CategoryId, Game } from '../game/types'
import { Chip } from './Chip'
import { Die } from './Die'
import { PaperGrain } from './Felt'

/**
 * Column widths and type sizes shrink with the player count so the whole sheet
 * always fits an iPhone 13 without scrolling in either direction. At six
 * players the category column is narrow enough that the die carries the label.
 */
function sizesFor(players: number) {
  if (players <= 2) return { catW: '96px', cell: '20px', name: '11px', chip: 30, catFont: '9.5px', catTrack: '1px' }
  if (players === 3) return { catW: '92px', cell: '19px', name: '10px', chip: 28, catFont: '9.5px', catTrack: '.8px' }
  if (players === 4) return { catW: '86px', cell: '17px', name: '9px', chip: 26, catFont: '9px', catTrack: '.6px' }
  if (players === 5) return { catW: '78px', cell: '16px', name: '8.5px', chip: 25, catFont: '8.5px', catTrack: '.4px' }
  return { catW: '74px', cell: '15px', name: '8px', chip: 24, catFont: '8px', catTrack: '.2px' }
}

function Strike() {
  return (
    <svg className="cell__strike" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
      <path d="M20 40 L80 10" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

interface Props {
  game: Game
  onPick: (playerId: string, categoryId: CategoryId) => void
}

export function ScoreGrid({ game, onPick }: Props) {
  const size = sizesFor(game.players.length)

  return (
    <div className="sheet">
      <PaperGrain />
      <div
        className="grid"
        style={
          {
            '--players': game.players.length,
            '--cat-w': size.catW,
            '--cell-size': size.cell,
            '--name-size': size.name,
            '--cat-font': size.catFont,
            '--cat-track': size.catTrack,
          } as React.CSSProperties
        }
      >
        <div className="grid__corner">JUEGO</div>

        {game.players.map((player, i) => (
          <div key={player.id} className={`head${i === game.turn ? ' head--turn' : ''}`}>
            <Chip chip={player.chip} initial={player.name.charAt(0)} size={size.chip} dim={i !== game.turn} />
            <div className="head__name">{player.name.toUpperCase()}</div>
          </div>
        ))}

        {CATEGORIES.map((category) => {
          const first = category.id === FIRST_SPECIAL
          return (
            <Fragment key={category.id}>
              <div className={`catcell${first ? ' catcell--first-special' : ''}`}>
                {category.kind === 'number' && <Die face={category.face} size={15} />}
                <span style={category.id === 'doubleGenerala' ? { color: 'var(--gold-ink)' } : undefined}>
                  {category.label}
                </span>
              </div>

              {game.players.map((player, i) => {
                const score = scoreOf(game, player.id, category.id)
                const className = [
                  'cell',
                  i === game.turn ? 'cell--turn' : '',
                  first ? 'cell--first-special' : '',
                  score ? '' : 'cell--open',
                ]
                  .filter(Boolean)
                  .join(' ')

                if (!score) {
                  return (
                    <button
                      key={player.id + category.id}
                      type="button"
                      className={className}
                      aria-label={`Anotar ${category.label} de ${player.name}`}
                      onClick={() => onPick(player.id, category.id)}
                    >
                      <span className="cell__dot" />
                    </button>
                  )
                }

                return (
                  <div key={player.id + category.id} className={className}>
                    {score.kind === 'scratched' ? <Strike /> : score.points}
                  </div>
                )
              })}
            </Fragment>
          )
        })}

        <div className="catcell catcell--total">TOTAL</div>
        {game.players.map((player, i) => (
          <div
            key={`total-${player.id}`}
            className={`cell cell--total${i === game.turn ? ' cell--turn' : ''}`}
          >
            {totalFor(game, player.id)}
          </div>
        ))}
      </div>
    </div>
  )
}
