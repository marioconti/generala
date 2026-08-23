import { ranking, scratchedCount, verdict, verdictNote } from '../game/rules'
import type { Game } from '../game/types'
import { Chip } from './Chip'

const MONTHS = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
]

/** Formatted here rather than with toLocaleDateString so it reads the same on every device. */
function playedOn(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} · ${MONTHS[d.getMonth()]} · ${d.getFullYear()}`
}

function CornerIndex({ corner }: { corner: 'tl' | 'br' }) {
  return (
    <div className={`winner__index winner__index--${corner}`} aria-hidden="true">
      A
      <svg width="13" height="13" viewBox="0 0 20 20">
        <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="var(--red)" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="2" fill="var(--red)" />
      </svg>
    </div>
  )
}

function Crown() {
  return (
    <svg width="42" height="26" viewBox="0 0 42 26" style={{ marginBottom: -6 }} aria-hidden="true">
      <path
        d="M3 23 L6 7 L14 15 L21 3 L28 15 L36 7 L39 23 Z"
        fill="#e0b45e"
        stroke="#a8802e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="3" r="2.2" fill="#a8802e" />
    </svg>
  )
}

export function WinnerCard({ game }: { game: Game }) {
  const table = ranking(game)
  const winner = table[0]
  const runnerUp = table[1]
  const margin = runnerUp ? winner.total - runnerUp.total : winner.total
  const tied = !!runnerUp && margin === 0

  return (
    <div className="winner">
      <div className="winner__frame" />
      <CornerIndex corner="tl" />
      <CornerIndex corner="br" />

      <div className="winner__body">
        <Crown />
        <Chip chip={winner.player.chip} initial={winner.player.name.charAt(0)} size={58} />
        <div className="winner__name">{winner.player.name}</div>

        <div className="winner__score">
          <span className="winner__points">{winner.total}</span>
          <span className="winner__unit">PUNTOS</span>
        </div>

        <div className="winner__hr" />

        <div className="winner__verdict">{verdict(margin, tied)}</div>
        <div className="winner__note">
          {verdictNote(margin, tied, scratchedCount(game, winner.player.id))}
        </div>

        {table.length > 1 && (
          <div className="winner__rest">
            {table.slice(1).map((entry) => (
              <div key={entry.player.id} className="rank-row">
                <div className="rank-row__who">
                  <Chip chip={entry.player.chip} initial={entry.player.name.charAt(0)} size={22} dim />
                  <span className="rank-row__name">{entry.player.name.toUpperCase()}</span>
                </div>
                <span className="rank-row__total">{entry.total}</span>
              </div>
            ))}
          </div>
        )}

        <div className="winner__date">{playedOn(game.finishedAt ?? game.startedAt)}</div>
      </div>
    </div>
  )
}
