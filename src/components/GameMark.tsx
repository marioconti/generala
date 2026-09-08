interface Props {
  game: 'generala' | 'rummy' | 'chinchon' | 'domino'
  size?: number
}

/**
 * The illustration on each door of the home screen.
 *
 * WHAT THESE REPLACED: a single naked pip. Generala got an outlined die, rummy
 * a spade, chinchón a filled circle for the oro — the suit symbol on its own,
 * with nothing around it. Three abstract glyphs of the same weight, and the
 * chinchón one in particular was a plain gold disc that could have meant
 * anything. The door is the biggest thing on the home screen and the mark on
 * it was the smallest possible answer to what the game is.
 *
 * Each door now shows what is actually on the table for that game: the shaker
 * and the dice, a hand of cards, cards with the chips that count to a hundred,
 * two tiles laid across each other.
 *
 * SIZE IS THE REASON THIS WORKS AT ALL. The old marks were drawn at 34px, and
 * a tipped shaker with two dice tumbling out of it is a smudge at 34px — the
 * same thing that went wrong with the faces on the totals row. These are drawn
 * at 68px, which is what the composition needs and what the 168px-wide door
 * can afford.
 *
 * Everything is stroked in `currentColor` so the door's own accent drives it,
 * with `--mark-fill` behind the shapes that need to sit in front of each other
 * — a card in a fan is only legible if it covers the one behind it.
 */
export function GameMark({ game, size = 68 }: Props) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.1,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  /* The door's own background, so overlapping pieces read as stacked. */
  const solid = { fill: 'var(--mark-fill)' }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {game === 'generala' && (
        <>
          {/*
            The cubilete, tipped and pouring. Drawn upright and rotated as one
            piece: a cup built already-leaning has to have every curve redrawn
            to change the angle.

            The rotation is CLOCKWISE, and that is the whole drawing. Tipped the
            other way the mouth faces away from the dice, and what you get is a
            cup and, separately, some dice — two objects sharing a corner
            instead of one thing happening.
          */}
          <g transform="rotate(34 14 32)">
            <path d="M7 22 L10 41" {...stroke} />
            <path d="M21 22 L18 41" {...stroke} />
            <path d="M10 41 a4 1.5 0 0 0 8 0" {...stroke} />
            <ellipse cx="14" cy="22" rx="7" ry="2.6" {...solid} />
            <ellipse cx="14" cy="22" rx="7" ry="2.6" {...stroke} />
          </g>

          {/* Two dice out of the mouth, tumbling at different angles. */}
          <g transform="rotate(16 32 12)">
            <rect x="25.5" y="5.5" width="13" height="13" rx="3.2" {...solid} />
            <rect x="25.5" y="5.5" width="13" height="13" rx="3.2" {...stroke} />
            <circle cx="29.3" cy="9.3" r="1.5" fill="currentColor" />
            <circle cx="34.7" cy="14.7" r="1.5" fill="currentColor" />
          </g>
          <g transform="rotate(-20 36 27)">
            <rect x="30.5" y="21.5" width="11" height="11" rx="2.8" {...solid} />
            <rect x="30.5" y="21.5" width="11" height="11" rx="2.8" {...stroke} />
            <circle cx="33.6" cy="24.6" r="1.3" fill="currentColor" />
            <circle cx="38.4" cy="29.4" r="1.3" fill="currentColor" />
          </g>
        </>
      )}

      {game === 'rummy' && (
        <>
          {/*
            A hand fanned open. Each card is rotated about a point below the
            card itself, which is what makes a fan rather than three cards
            leaning independently.
          */}
          <g transform="rotate(-26 24 44)">
            <rect x="16.5" y="12" width="15" height="21" rx="2.6" {...solid} />
            <rect x="16.5" y="12" width="15" height="21" rx="2.6" {...stroke} />
          </g>
          <g transform="rotate(-9 24 44)">
            <rect x="16.5" y="11" width="15" height="21" rx="2.6" {...solid} />
            <rect x="16.5" y="11" width="15" height="21" rx="2.6" {...stroke} />
          </g>
          <g transform="rotate(9 24 44)">
            <rect x="16.5" y="10" width="15" height="21" rx="2.6" {...solid} />
            <rect x="16.5" y="10" width="15" height="21" rx="2.6" {...stroke} />
            {/* Only the front card carries a pip — the rest are backs. */}
            <path
              d="M24 15.5 c2.6 3 4.6 4.2 4.6 6.3 a2.3 2.3 0 0 1 -4 1.5 c.2 1.4 .6 2 1.3 2.6 h-3.8 c.7 -.6 1.1 -1.2 1.3 -2.6 a2.3 2.3 0 0 1 -4 -1.5 c0 -2.1 2 -3.3 4.6 -6.3 Z"
              fill="currentColor"
            />
          </g>
        </>
      )}

      {game === 'chinchon' && (
        <>
          {/* Two cards stepped, the front one showing the oro. */}
          <g transform="rotate(-13 21 22)">
            <rect x="10" y="7" width="15" height="21" rx="2.6" {...solid} />
            <rect x="10" y="7" width="15" height="21" rx="2.6" {...stroke} />
          </g>
          <g transform="rotate(5 24 22)">
            <rect x="17" y="8" width="15" height="21" rx="2.6" {...solid} />
            <rect x="17" y="8" width="15" height="21" rx="2.6" {...stroke} />
            <circle cx="24.5" cy="18.5" r="4.4" {...stroke} />
            <circle cx="24.5" cy="18.5" r="1.5" fill="currentColor" />
          </g>

          {/*
            The chips, because this is the game that runs to a hundred and the
            count is the whole tension of it. Drawn back to front so each one
            sits on the one below.
          */}
          <g>
            <ellipse cx="33" cy="38.5" rx="8.5" ry="3.1" {...solid} />
            <ellipse cx="33" cy="38.5" rx="8.5" ry="3.1" {...stroke} />
            <ellipse cx="33" cy="34.5" rx="8.5" ry="3.1" {...solid} />
            <ellipse cx="33" cy="34.5" rx="8.5" ry="3.1" {...stroke} />
            <ellipse cx="33" cy="30.5" rx="8.5" ry="3.1" {...solid} />
            <ellipse cx="33" cy="30.5" rx="8.5" ry="3.1" {...stroke} />
          </g>
        </>
      )}

      {game === 'domino' && (
        <>
          {/*
            THE TWO TILES CROSS. Drawn as a fan of two, the way the chinchón
            mark steps two cards, this door would have been the card door with
            a line through it — same silhouette, same overlap, at 68px the
            difference would come down to a stroke. Dominoes are laid at right
            angles to each other and cards never are, so the crossing IS the
            drawing: one tile flat, one standing on it.

            The back tile carries its divider and no pips. It is half covered,
            and pips it only shows half of read as dirt on the felt.
          */}
          <g transform="rotate(6 23 34)">
            <rect x="9.5" y="26.5" width="27" height="15" rx="3.6" {...solid} />
            <rect x="9.5" y="26.5" width="27" height="15" rx="3.6" {...stroke} />
            <path d="M23 28.5 V39.5" {...stroke} />
          </g>

          {/* The front tile is the readable one: a two over a three. */}
          <g transform="rotate(-10 30 20)">
            <rect x="22" y="6.5" width="16" height="27" rx="3.6" {...solid} />
            <rect x="22" y="6.5" width="16" height="27" rx="3.6" {...stroke} />
            <path d="M23.8 20 H36.2" {...stroke} />
            <circle cx="27" cy="10.8" r="1.35" fill="currentColor" />
            <circle cx="33" cy="16" r="1.35" fill="currentColor" />
            <circle cx="27" cy="23.5" r="1.35" fill="currentColor" />
            <circle cx="30" cy="26.75" r="1.35" fill="currentColor" />
            <circle cx="33" cy="30" r="1.35" fill="currentColor" />
          </g>
        </>
      )}
    </svg>
  )
}
