import { Chip } from './Chip'

const MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
]

/** Formatted here rather than with toLocaleDateString so it reads the same on every device. */
export function playedOn(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} · ${MONTHS[d.getMonth()]} · ${d.getFullYear()}`
}

function Crown() {
  return (
    <svg width="42" height="26" viewBox="0 0 42 26" style={{ marginBottom: -6 }} aria-hidden="true">
      <path
        d="M3 23 L6 7 L14 15 L21 3 L28 15 L36 7 L39 23 Z"
        fill="var(--accent)"
        stroke="var(--accent-deep)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="3" r="2.2" fill="var(--accent-deep)" />
    </svg>
  )
}

export interface Placing {
  name: string
  chip: number
  score: number
}

interface Props {
  winners: Placing[]
  rest: Placing[]
  verdict: string
  note: string
  date: string
  unit?: string
}

/**
 * The card that comes out when a game ends. Shared by every game so the moment
 * feels the same wherever it happens; only the table colour underneath changes.
 */
export function ResultCard({ winners, rest, verdict, note, date, unit = 'PUNTOS' }: Props) {
  const tied = winners.length > 1
  const headline = winners.map((w) => w.name).join(' y ')

  return (
    <div className="winner">
      <div className="winner__frame" />

      <div className="winner__body">
        <Crown />

        <div className="winner__chips">
          {winners.map((w) => (
            <Chip key={w.name} chip={w.chip} initial={w.name.charAt(0)} size={tied ? 44 : 58} />
          ))}
        </div>

        <div className={`winner__name${headline.length > 12 ? ' winner__name--long' : ''}`}>
          {headline}
        </div>

        <div className="winner__score">
          <span className="winner__points">{winners[0].score}</span>
          <span className="winner__unit">{unit}</span>
        </div>

        <div className="winner__hr" />

        <div className="winner__verdict">{verdict}</div>
        <div className="winner__note">{note}</div>

        {rest.length > 0 && (
          <div className="winner__rest">
            {rest.map((entry) => (
              <div key={entry.name} className="rank-row">
                <div className="rank-row__who">
                  <Chip chip={entry.chip} initial={entry.name.charAt(0)} size={22} dim />
                  <span className="rank-row__name">{entry.name.toUpperCase()}</span>
                </div>
                <span className="rank-row__total">{entry.score}</span>
              </div>
            ))}
          </div>
        )}

        <div className="winner__date">{date}</div>
      </div>
    </div>
  )
}
