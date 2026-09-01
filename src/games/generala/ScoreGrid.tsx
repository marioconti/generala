import { Fragment, useEffect, useRef } from 'react'
import { CATEGORIES, FIRST_SPECIAL, moods, scoreOf, totalFor } from './rules'
import type { CategoryId, Game } from './types'
import { Chip } from '../../components/Chip'
import { Die } from '../../components/Die'
import { PaperGrain } from '../../components/Surface'
import { StickMan } from '../../components/StickMan'
import { ASPECT } from '../../lib/stickman'

/**
 * Column widths and type sizes shrink with the player count so the whole sheet
 * always fits an iPhone 13 without scrolling in either direction. At six
 * players the category column is narrow enough that the die carries the label.
 */
function sizesFor(players: number) {
  if (players <= 2) return { catW: '96px', cell: '20px', name: '11px', chip: 30, catFont: '9.5px', catTrack: '1px', figure: 84 }
  if (players === 3) return { catW: '92px', cell: '19px', name: '10px', chip: 28, catFont: '9.5px', catTrack: '.8px', figure: 78 }
  if (players === 4) return { catW: '86px', cell: '17px', name: '9px', chip: 26, catFont: '9px', catTrack: '.6px', figure: 66 }
  if (players === 5) return { catW: '78px', cell: '16px', name: '8.5px', chip: 25, catFont: '8.5px', catTrack: '.4px', figure: 58 }
  return { catW: '74px', cell: '15px', name: '8px', chip: 24, catFont: '8px', catTrack: '.2px', figure: 52 }
}

/** Where the ink flies when a row is crossed out, as [dx, dy, final scale]. */
const SPLATTER: [number, number, number][] = [
  [-15, 9, 0.5],
  [13, 11, 0.7],
  [-9, -13, 0.4],
  [17, -6, 0.55],
  [-18, -3, 0.35],
  [6, 15, 0.45],
  [1, -16, 0.6],
]

/**
 * The crossed-out row.
 *
 * No viewBox and no `preserveAspectRatio="none"`: that pair scaled the stroke
 * with the column, so the line came out a different weight at two players than
 * at six, and on a short phone the round cap pushed 5px past the bottom of its
 * own cell into the row below. Percentages keep the line inside the box at any
 * size, and the stroke width is now the same everywhere.
 *
 * `pathLength={1}` normalises the line so one dash covers it whatever the cell
 * measures, which is what lets it draw itself in.
 */
function Strike({ fresh }: { fresh: boolean }) {
  return (
    <>
      <svg className={`cell__strike${fresh ? ' cell__strike--fresh' : ''}`} aria-hidden="true">
        <line x1="14%" y1="79%" x2="86%" y2="21%" pathLength={1} />
      </svg>
      {fresh && (
        <span className="splat" aria-hidden="true">
          {SPLATTER.map(([dx, dy, scale], i) => (
            <i
              key={i}
              style={
                {
                  '--dx': `${dx}px`,
                  '--dy': `${dy}px`,
                  '--s': scale,
                  '--delay': `${i * 16}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      )}
    </>
  )
}

interface Props {
  game: Game
  /** The row crossed out a moment ago, if any. Drives the whole performance. */
  drama: { playerId: string; categoryId: CategoryId; at: number } | null
  onPick: (playerId: string, categoryId: CategoryId) => void
}

export function ScoreGrid({ game, drama, onPick }: Props) {
  const size = sizesFor(game.players.length)
  const mood = moods(game)
  const sheet = useRef<HTMLDivElement>(null)

  /**
   * The shake is driven by hand rather than by a class in the render, because a
   * CSS animation does not restart when a class it already carries is set
   * again — and two rows crossed out inside half a second is exactly when the
   * second one has to land. Re-keying the sheet would restart it too, but it
   * would also tear down and rebuild every figure on the board.
   */
  useEffect(() => {
    const el = sheet.current
    if (!drama || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.classList.remove('sheet--shake')
    void el.offsetWidth // reflow, so the animation is allowed to start over
    el.classList.add('sheet--shake')

    const done = () => el.classList.remove('sheet--shake')
    el.addEventListener('animationend', done, { once: true })
    return () => {
      el.removeEventListener('animationend', done)
      el.classList.remove('sheet--shake')
    }
  }, [drama?.at, drama])

  return (
    <div className="sheet" ref={sheet}>
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
            '--figure-w': `${Math.round(size.figure * ASPECT)}px`,
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

                // Filled cells are buttons too: tapping one reopens it, which is
                // how a mistyped score gets corrected.
                return (
                  <button
                    key={player.id + category.id}
                    type="button"
                    className={className}
                    aria-label={
                      score
                        ? `Corregir ${category.label} de ${player.name}`
                        : `Anotar ${category.label} de ${player.name}`
                    }
                    onClick={() => onPick(player.id, category.id)}
                  >
                    {!score && <span className="cell__dot" />}
                    {score?.kind === 'scratched' && (
                      <Strike
                        fresh={
                          drama?.playerId === player.id && drama?.categoryId === category.id
                        }
                      />
                    )}
                    {score && score.kind !== 'scratched' && score.points}
                  </button>
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
            <StickMan
              mood={mood[i]}
              size={size.figure}
              seed={player.id}
              shock={drama?.playerId === player.id ? drama.at : undefined}
            />
            <span className="cell__total-num">{totalFor(game, player.id)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
