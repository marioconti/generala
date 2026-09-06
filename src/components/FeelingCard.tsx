import { Chip } from './Chip'
import { Face } from './Face'
import { Sheet } from './Sheet'

interface Props {
  name: string
  chip: number
  /** The same -1..+1 the face on the sheet is drawn from. */
  mood: number
  seed: string
  line: string
  /** Brushing you off for asking again inside the minute. */
  nagged: boolean
  onClose: () => void
}

/**
 * What a player's face has to say, when you tap it.
 *
 * The face is drawn again here at a size it never gets on the sheet, which is
 * half the reason to open the panel at all: at 31px in a six-player column the
 * tears and the star eyes are a smudge, and this is where they are actually
 * legible.
 *
 * The line and the expression come from the same mood, so they cannot
 * contradict each other. Being brushed off only changes the label above the
 * line — the face keeps saying what it was already saying, because a player
 * annoyed at being poked twice is still losing or still winning.
 */
export function FeelingCard({ name, chip, mood, seed, line, nagged, onClose }: Props) {
  return (
    <Sheet label={`Cómo se siente ${name}`} onClose={onClose}>
      <div className="feeling">
        <Face mood={mood} size={132} seed={seed} />

        <div className="feeling__who">
          <Chip chip={chip} initial={name.charAt(0)} size={26} />
          <span className="feeling__name">{name.toUpperCase()}</span>
        </div>

        <p className="feeling__line">{line}</p>

        {nagged && <p className="feeling__hint">Contesta una vez por minuto.</p>}

        <button type="button" className="btn-gold" onClick={onClose}>
          CERRAR
        </button>
      </div>
    </Sheet>
  )
}
