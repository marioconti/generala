/**
 * Player tokens.
 *
 * These used to be painted wooden counters — dusty terracotta, slate blue,
 * olive — with a darker rim of the same paint so each one read as a solid
 * object with a lip. The palette was the problem. Six low-saturation earth
 * tones on cream paper is the colour scheme of a board-game box that has been
 * in a cupboard since 1974, and next to the emoji faces on the totals row it
 * looked like a different, older application.
 *
 * So: full chroma, one flat coat each, and the ink keyline in Chip.tsx doing
 * the work the darker rim used to do. Six hues spread right around the wheel,
 * because the token's whole job is telling six people apart at 26 px across a
 * table.
 *
 * ORDER IS NOT DECORATIVE. Players take these in turn, so the first two have
 * to be the furthest apart — most nights are two-handed — and every colour
 * added after that has to stay clear of the ones already on the sheet.
 *
 * `letter` is the initial's colour, and it is per-token on purpose. One letter
 * colour cannot serve this palette: cream on the amber is 1.7:1, which is
 * unreadable, and ink on the blue is 2.5:1, which is no better. Each token
 * carries whichever of the two its own fill can hold, so the bright ones stay
 * bright instead of being darkened until a pale letter works on them. Every
 * pairing below is at or above 4.6:1.
 */

/** The keyline. Deliberately the same ink the faces are drawn with. */
export const CHIP_INK = '#3a2a1e'

const CREAM = '#fff6ec'

export const CHIPS = [
  { fill: '#cf3719', letter: CREAM, name: 'red' },
  { fill: '#3569b8', letter: CREAM, name: 'blue' },
  { fill: '#4cb063', letter: CHIP_INK, name: 'green' },
  { fill: '#f5b234', letter: CHIP_INK, name: 'amber' },
  { fill: '#b3468a', letter: CREAM, name: 'magenta' },
  { fill: '#22b0bf', letter: CHIP_INK, name: 'teal' },
]
