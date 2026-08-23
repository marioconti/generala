/**
 * Poker chips identify players in every game, not just Generala, so the palette
 * lives here rather than inside one game's rules.
 *
 * Chips instead of card suits because there are only four suits and a sheet
 * takes up to six players.
 */
export const CHIPS = [
  { fill: '#b03a3a', name: 'rojo' },
  { fill: '#2f5d8a', name: 'azul' },
  { fill: '#33383d', name: 'negro' },
  { fill: '#3d7a55', name: 'verde' },
  { fill: '#6b4a86', name: 'violeta' },
  { fill: '#c06b2a', name: 'naranja' },
]
