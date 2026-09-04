/**
 * The ten people who show up to play.
 *
 * The figure used to be a stick: one ink-coloured line per bone and a circle
 * for a head. It read as a placeholder, which it was. These are the same
 * skeleton — every pose, every dance and every somersault still drives them
 * untouched — drawn with a body instead of a wire: a shirt, shorts, shoes,
 * hands, hair, and something on the head worth recognising.
 *
 * WHY TEN AND WHY DRAWN THIS SMALL. They stand next to a total in a column
 * that is 52 px tall when six people play. That is the real constraint and it
 * rules out faces, patterns and anything fine: what survives at 52 px is
 * silhouette and colour. So each character is a handful of flat colours and
 * one distinctive shape on the head, which is exactly what you can still tell
 * apart across a table.
 *
 * WHO GETS WHICH. Not random — assigned from the player's own id, so the same
 * person is the same character every game. Somebody who has been the one with
 * the cap for three months should not open the app one night and find
 * themselves bald.
 */

/** A colour slot, resolved per character when the figure is drawn. */
export type Ink = 'skin' | 'hair' | 'shirt' | 'shorts' | 'shoes' | 'dark' | 'paper'

export interface Shape {
  d: string
  fill?: Ink
  stroke?: Ink
  width?: number
}

export interface Character {
  id: string
  /** Only ever shown in the design sheet, never in the app. */
  label: string
  skin: string
  hair: string
  shirt: string
  shorts: string
  shoes: string
  /** Drawn inside the head group: hair first, then anything worn on top. */
  head: Shape[]
  /** Drawn over the face — glasses, a beard. Kept separate so it sits on top. */
  face?: Shape[]
}

/*
 * Head shapes live in the head's own space: the skull is a circle of radius
 * 8.5 at the origin, and because the y axis points down, hair is negative y
 * and the chin is positive.
 */

/**
 * The skullcap every hairstyle starts from.
 *
 * It stops at y = -1.5 for a reason: the eyes sit at y = 1.4 and the mouth at
 * 4.2, and the first version of these came down far enough to bury both. The
 * end points are on the circle, not near it — an arc that does not start where
 * the skull does leaves a sliver of scalp that reads as a mistake at 52 px.
 */
const CAP = 'M-8.37 -1.5 A8.5 8.5 0 0 1 8.37 -1.5 Z'
/** A fuller cap, for hair that comes down to the ears. */
const CAP_FULL = 'M-8.49 -0.3 A8.5 8.5 0 0 1 8.49 -0.3 Z'

const hair = (d: string): Shape => ({ d, fill: 'hair' })

export const CHARACTERS: Character[] = [
  {
    id: 'vincha',
    label: 'La de la vincha',
    skin: '#eab88f',
    hair: '#3a2a1e',
    shirt: '#9c3f4a',
    shorts: '#3f4a63',
    shoes: '#efe4cd',
    head: [
      hair(CAP_FULL),
      // The bun, pinned high at the back.
      hair('M5.6 -8.2 a3 3 0 1 0 0.1 0.1 Z'),
      // The band itself, sitting across the hairline.
      { d: 'M-8.3 -2 A8.5 8.5 0 0 1 8.3 -2 L7.6 -4 A8.5 8.5 0 0 0 -7.6 -4 Z', fill: 'shirt' },
    ],
  },
  {
    id: 'gorra',
    label: 'El de la gorra',
    skin: '#d59a68',
    hair: '#241a12',
    shirt: '#45688c',
    shorts: '#2f3a4a',
    shoes: '#d8cbb4',
    head: [
      hair(CAP),
      // Crown and peak, worn straight.
      { d: 'M-8.3 -2 A8.6 8.6 0 0 1 8.3 -2 Z', fill: 'shirt' },
      { d: 'M-8.4 -2.2 L-13.6 -0.6 L-13.4 1.2 L-8.2 -0.2 Z', fill: 'shirt' },
    ],
  },
  {
    id: 'pelado',
    label: 'El pelado con barba',
    skin: '#c98a5e',
    hair: '#2b1d14',
    shirt: '#4f7a4a',
    shorts: '#3a3f46',
    shoes: '#e6dac2',
    head: [
      // Only what is left of it, around the sides.
      hair('M-8.5 0 A8.5 8.5 0 0 1 -7 -4.8 L-5.4 -3.4 A6.8 6.8 0 0 0 -6.6 0 Z'),
      hair('M8.5 0 A8.5 8.5 0 0 0 7 -4.8 L5.4 -3.4 A6.8 6.8 0 0 1 6.6 0 Z'),
    ],
    // The beard, wrapping the jaw under the mouth.
    face: [hair('M-7.4 2.6 A8.5 8.5 0 0 0 7.4 2.6 A8 8 0 0 1 -7.4 2.6 Z')],
  },
  {
    id: 'rodete',
    label: 'La del rodete',
    skin: '#f0c39a',
    hair: '#7a5230',
    shirt: '#c99a3c',
    shorts: '#4a5a3f',
    shoes: '#efe4cd',
    head: [
      hair(CAP_FULL),
      hair('M0 -11.4 a3.3 3.3 0 1 0 0.1 0.1 Z'),
    ],
  },
  {
    id: 'jopo',
    label: 'El del jopo',
    skin: '#e0a878',
    hair: '#2b1d14',
    shirt: '#3f8a86',
    shorts: '#33404f',
    shoes: '#d8cbb4',
    head: [
      hair(CAP),
      // The quiff, pushed up and forward.
      hair('M-7.4 -4.4 Q-6 -12.8 2.8 -11.4 Q-2.6 -9 -2.2 -3.6 Z'),
    ],
  },
  {
    id: 'trenzas',
    label: 'La de las trenzas',
    skin: '#a56b45',
    hair: '#241a12',
    shirt: '#c96a4f',
    shorts: '#3f4a63',
    shoes: '#efe4cd',
    head: [
      hair(CAP_FULL),
      // One plait down each side, ending in a little tie.
      hair('M-8.2 -1 Q-10.8 4 -9.2 8.4 L-6.6 7.8 Q-7.8 3.8 -6.4 -0.6 Z'),
      hair('M8.2 -1 Q10.8 4 9.2 8.4 L6.6 7.8 Q7.8 3.8 6.4 -0.6 Z'),
      { d: 'M-9.6 8 h3.2 v1.9 h-3.2 Z', fill: 'shirt' },
      { d: 'M6.4 8 h3.2 v1.9 h-3.2 Z', fill: 'shirt' },
    ],
  },
  {
    id: 'anteojos',
    label: 'El de los anteojos',
    skin: '#f0c39a',
    hair: '#4a3222',
    shirt: '#6b6f75',
    shorts: '#2f3a4a',
    shoes: '#e6dac2',
    head: [hair(CAP)],
    // Round frames, sitting on the eyes rather than near them.
    face: [
      { d: 'M-3.1 1.4 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0', stroke: 'dark', width: 1.2 },
      { d: 'M3.1 1.4 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0', stroke: 'dark', width: 1.2 },
      { d: 'M-0.5 1.4 h1', stroke: 'dark', width: 1.2 },
      { d: 'M-5.7 1.2 L-8.3 0.4', stroke: 'dark', width: 1.2 },
      { d: 'M5.7 1.2 L8.3 0.4', stroke: 'dark', width: 1.2 },
    ],
  },
  {
    id: 'melena',
    label: 'La del pelo suelto',
    skin: '#d59a68',
    hair: '#b8823f',
    shirt: '#7a5a8c',
    shorts: '#3a4550',
    shoes: '#efe4cd',
    head: [
      hair(CAP_FULL),
      // Falls past the jaw on both sides.
      hair('M-8.5 -1.6 Q-11.4 4.6 -9.4 10 L-5.6 9 Q-7.4 4.2 -6.8 -1 Z'),
      hair('M8.5 -1.6 Q11.4 4.6 9.4 10 L5.6 9 Q7.4 4.2 6.8 -1 Z'),
    ],
  },
  {
    id: 'panuelo',
    label: 'El del pañuelo',
    skin: '#7d4e30',
    hair: '#1f1610',
    shirt: '#c97a3c',
    shorts: '#3f4a63',
    shoes: '#d8cbb4',
    head: [
      hair(CAP),
      { d: 'M-8.45 -0.9 A8.6 8.6 0 0 1 8.45 -0.9 Z', fill: 'shirt' },
      // The knot, tied off at the side.
      { d: 'M7.8 -1.8 l4.8 -1.2 l-0.8 3.6 Z', fill: 'shirt' },
    ],
  },
  {
    id: 'flequillo',
    label: 'La del flequillo',
    skin: '#eab88f',
    hair: '#2b1d14',
    shirt: '#4f7a4a',
    shorts: '#5a4030',
    shoes: '#efe4cd',
    head: [
      hair(CAP_FULL),
      // Cut straight across, just clear of the eyes.
      hair('M-8.45 -2.4 L8.45 -2.4 L8.45 -0.6 L-8.45 -0.6 Z'),
      hair('M-8.4 -1.4 Q-10.2 3 -9.2 6.6 L-6.4 5.8 Q-7.2 2.4 -6.8 -1.2 Z'),
      hair('M8.4 -1.4 Q10.2 3 9.2 6.6 L6.4 5.8 Q7.2 2.4 6.8 -1.2 Z'),
    ],
  },
]

/** Same player, same character, forever. */
export function characterFor(seed: string): Character {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return CHARACTERS[(h >>> 0) % CHARACTERS.length]
}
