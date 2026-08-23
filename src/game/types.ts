export type CategoryId =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'straight'
  | 'full'
  | 'poker'
  | 'generala'
  | 'doubleGenerala'

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6

/** A number row: the score is (how many dice showed that face) x (the face). */
export interface NumberCategory {
  id: CategoryId
  label: string
  kind: 'number'
  face: DieFace
}

/**
 * A combination row. `made` is the score when built over two or three rolls,
 * `served` when it came up on the first roll. When both are equal the row has
 * no served bonus and the UI offers a single button instead of two.
 */
export interface SpecialCategory {
  id: CategoryId
  label: string
  kind: 'special'
  made: number
  served: number
}

export type Category = NumberCategory | SpecialCategory

/** A filled-in cell. `scratched` is the deliberate zero — the crossed-out row. */
export type Score =
  | { kind: 'scratched' }
  | { kind: 'number'; count: number; points: number }
  | { kind: 'special'; served: boolean; points: number }

export interface Player {
  id: string
  name: string
  /** Index into CHIPS — the poker chip colour that identifies the player. */
  chip: number
}

export interface Game {
  players: Player[]
  /** playerId -> categoryId -> score. A missing key is an empty cell. */
  scores: Record<string, Partial<Record<CategoryId, Score>>>
  /** Index into players — whose turn the sheet suggests. Never enforced. */
  turn: number
  startedAt: string
  finishedAt: string | null
  /** Every cell filled, newest last. Drives undo. */
  history: { playerId: string; categoryId: CategoryId }[]
}
