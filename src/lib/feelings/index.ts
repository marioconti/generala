/**
 * What a player's face says when you tap it.
 *
 * The five moods are the same five the face is drawn with, so the line and the
 * expression can never contradict each other — a grinning face that says it is
 * having a terrible night is the one bug this whole module has to avoid.
 *
 * NOTHING HERE QUOTES A NUMBER. These are moods, not verdicts. verdicts.ts is
 * the module that says "188 contra 96", and it can only do that because it is
 * handed the totals; a line here that guessed at a margin would be inventing.
 *
 * ASKED TWICE INSIDE A MINUTE, the face tells you to go away instead. Not a
 * lockout — an answer, in the same voice, from `nagging.ts`. Unless the mood
 * has actually moved to another face in the meantime, in which case there is
 * real news and it answers properly; see askFace.
 */
import { DOWN } from './down'
import { ECSTATIC } from './ecstatic'
import { LEVEL } from './level'
import { NAGGING } from './nagging'
import { PLEASED } from './pleased'
import { WRECKED } from './wrecked'

export type Feeling = 'wrecked' | 'down' | 'level' | 'pleased' | 'ecstatic'

const POOLS: Record<Feeling, string[]> = {
  wrecked: WRECKED,
  down: DOWN,
  level: LEVEL,
  pleased: PLEASED,
  ecstatic: ECSTATIC,
}

/** How long a face will answer properly before it starts brushing you off. */
export const COOLDOWN_MS = 60_000

/**
 * The same five steps Face.tsx draws, cut at the same thresholds.
 *
 * Deliberately duplicated rather than imported: Face.tsx works in layer indices
 * and swaps the bottom one between tears and fury on a timer, which is a
 * drawing concern. What both must agree on is where the five bands are, and
 * that is these four numbers.
 */
export function feelingOf(mood: number): Feeling {
  if (mood <= -0.75) return 'wrecked'
  if (mood <= -0.25) return 'down'
  if (mood < 0.25) return 'level'
  if (mood < 0.75) return 'pleased'
  return 'ecstatic'
}

/**
 * When each player was last given a real answer, and what they have already
 * been told.
 *
 * Module-level rather than component state on purpose: the modal unmounts
 * every time it closes, so anything held inside it would reset the cooldown
 * the moment you shut the panel — which is exactly the spamming this is here
 * to stop.
 */
const lastAnswered = new Map<string, { at: number; feeling: Feeling }>()
const recent = new Map<string, string[]>()

/**
 * Picks a line the player has not just heard.
 *
 * Plain random repeats far more than people expect — with a hundred lines a
 * repeat inside ten taps is likelier than not — and a repeat is the one thing
 * that makes a pool this size feel small. So half the pool is off limits: with
 * a hundred lines and one answer a minute that is fifty minutes of tapping the
 * same face before anything can come round again. A quarter was tried first
 * and still produced three repeats in forty draws.
 */
function freshLine(key: string, pool: string[]): string {
  const memory = Math.floor(pool.length / 2)
  const seen = recent.get(key) ?? []
  const eligible = pool.filter((line) => !seen.includes(line))
  const from = eligible.length > 0 ? eligible : pool
  const line = from[Math.floor(Math.random() * from.length)]
  recent.set(key, [...seen, line].slice(-memory))
  return line
}

export interface Reply {
  line: string
  /** True when the player is brushing you off for asking again too soon. */
  nagged: boolean
}

/**
 * `playerId` rather than the name, so renaming somebody mid-game does not hand
 * them a fresh minute. The cooldown is per player: asking Juan does not use up
 * Mario's turn to speak.
 */
export function askFace(playerId: string, mood: number, now = Date.now()): Reply {
  const feeling = feelingOf(mood)
  const last = lastAnswered.get(playerId)

  /*
   * A CHANGE OF FACE BEATS THE COOLDOWN, and this is the point of storing the
   * feeling alongside the time.
   *
   * The minute is there to stop the same answer being pulled out of somebody
   * over and over. It is not there to withhold news. Somebody scores, the face
   * on the sheet visibly drops from pleased to wrecked, you tap it BECAUSE it
   * changed — and the old version told you to go away, which is the single
   * most annoying thing this feature could do.
   *
   * It also makes the brush-offs honest: several of them say nothing changed,
   * and now that is the only situation in which they can appear.
   */
  const stale = last !== undefined && now - last.at < COOLDOWN_MS && last.feeling === feeling
  if (stale) {
    return { line: freshLine(`${playerId}:nag`, NAGGING[feeling]), nagged: true }
  }

  lastAnswered.set(playerId, { at: now, feeling })
  return { line: freshLine(`${playerId}:${feeling}`, POOLS[feeling]), nagged: false }
}

/** Test seam: the maps outlive a game otherwise, and ids are recycled by seed. */
export function resetFaceTalk(): void {
  lastAnswered.clear()
  recent.clear()
}

/** Every line the app can say, for the count in the tests. */
export const ALL_LINES = [
  ...WRECKED,
  ...DOWN,
  ...LEVEL,
  ...PLEASED,
  ...ECSTATIC,
  ...Object.values(NAGGING).flat(),
]
