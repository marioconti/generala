/**
 * Card suits, drawn rather than typed.
 *
 * Emoji and dingbat glyphs render differently on every platform and cannot be
 * recoloured reliably, so every symbol here is a path on a 24x24 grid.
 */

export type SuitName = 'spade' | 'heart' | 'diamond' | 'club' | 'oro' | 'copa' | 'espada' | 'basto'

const PATHS: Record<SuitName, string> = {
  // English deck
  spade: 'M12 3 C12 3 4 9.5 4 14.2 A4 4 0 0 0 11 16.6 L9.6 21 h4.8 L13 16.6 A4 4 0 0 0 20 14.2 C20 9.5 12 3 12 3 Z',
  heart: 'M12 21 C12 21 3.5 15 3.5 9.4 A3.9 3.9 0 0 1 12 7.2 A3.9 3.9 0 0 1 20.5 9.4 C20.5 15 12 21 12 21 Z',
  diamond: 'M12 2.5 L20 12 L12 21.5 L4 12 Z',
  club: 'M12 3.2 a3.6 3.6 0 0 1 2.9 5.7 3.6 3.6 0 1 1 1.6 6.6 3.6 3.6 0 0 1-3.1-1.8 L14.4 21 H9.6 l1-7.3 A3.6 3.6 0 0 1 7.5 15.5 3.6 3.6 0 1 1 9.1 8.9 3.6 3.6 0 0 1 12 3.2 Z',
  // Spanish deck
  oro: 'M12 2.5 A9.5 9.5 0 1 1 11.99 2.5 Z',
  copa: 'M7 4 h10 v3.5 a5 5 0 0 1-4 4.9 V17 h3.2 v3 H7.8 v-3 H11 v-4.6 A5 5 0 0 1 7 7.5 Z',
  espada: 'M12 2 L14.4 13 H9.6 Z M6.5 14 h11 v2.2 h-11 Z M11 17 h2 v5 h-2 Z',
  basto: 'M6 20 L15.5 5.5 M15.5 5.5 l1.8 -2.2 M15.5 5.5 l2.6 .9 M10.6 12.9 l-2.7 -1 M13 9.3 l2.8 1',
}

/** Suits drawn as outlines rather than filled shapes. */
const STROKED: SuitName[] = ['basto']

interface Props {
  suit: SuitName
  size?: number
  color?: string
  opacity?: number
}

export function Suit({ suit, size = 20, color = 'currentColor', opacity = 1 }: Props) {
  const stroked = STROKED.includes(suit)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, opacity }}>
      <path
        d={PATHS[suit]}
        fill={stroked ? 'none' : color}
        stroke={stroked ? color : 'none'}
        strokeWidth={stroked ? 1.9 : 0}
        strokeLinecap="round"
      />
    </svg>
  )
}

/** The suits that belong to each game's deck. */
export const DECKS = {
  rummy: ['spade', 'heart', 'diamond', 'club'] as SuitName[],
  chinchon: ['oro', 'copa', 'espada', 'basto'] as SuitName[],
  truco: ['espada', 'basto', 'oro', 'copa'] as SuitName[],
}
