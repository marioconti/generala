import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config'
import { getHistory, HISTORY_KEY, mergeHistory, type FinishedGame } from './history'
import { onWrite } from './storage'

/**
 * Keeps the finished games the same on every phone at the table.
 *
 * LOCAL FIRST. The phone stays the source the app reads from — every screen
 * still gets its games out of localStorage, synchronously, with no spinner and
 * no network. Sharing happens around that: what is here is pushed up, what is
 * up there is folded in. So the app works on the couch with no signal, in the
 * kitchen with bad wifi, and in a bar with none at all, exactly as before; the
 * table just catches up whenever there is a connection again.
 *
 * WHAT TRAVELS. Only finished games. A game in progress belongs to the phone
 * that is scoring it — one phone keeps score for the table — and syncing every
 * point would be a lot of traffic to make two people fight over the same sheet.
 *
 * CONFLICTS. Two phones scoring different games never collide: each filed game
 * carries its own id. The same game arriving twice is settled by `updatedAt`,
 * last write wins. That is enough here and a great deal simpler than anything
 * that is actually correct under concurrent edits, which this never has.
 */

const TABLE = 'games'

/** Long enough to fold a burst of writes into one request. */
const SETTLE_MS = 800

/** A quiet catch-up while a screen sits open, for the phone that is only watching. */
const POLL_MS = 45_000

type Row = {
  id: string
  game: string
  finished_at: string
  players: unknown
  winners: unknown
  feats: unknown
  updated_at: string
}

export function isSharing(): boolean {
  return SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== ''
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

function toRow(entry: FinishedGame): Row {
  return {
    id: entry.id,
    game: entry.game,
    finished_at: entry.finishedAt,
    players: entry.players,
    winners: entry.winners,
    feats: entry.feats ?? null,
    updated_at: entry.updatedAt ?? entry.finishedAt,
  }
}

function fromRow(row: Row): FinishedGame | null {
  if (!row || typeof row.id !== 'string') return null
  if (!Array.isArray(row.players) || !Array.isArray(row.winners)) return null
  return {
    id: row.id,
    game: row.game as FinishedGame['game'],
    finishedAt: row.finished_at,
    players: row.players as FinishedGame['players'],
    winners: row.winners as string[],
    updatedAt: row.updated_at,
    ...(row.feats ? { feats: row.feats as FinishedGame['feats'] } : {}),
  }
}

/** Brings down what the table has and folds it into this phone's own file. */
export async function pull(): Promise<void> {
  if (!isSharing()) return
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*`, {
    headers: headers(),
  })
  if (!response.ok) throw new Error(`pull ${response.status}`)

  const rows: unknown = await response.json()
  if (!Array.isArray(rows)) return

  const games = rows.map((row) => fromRow(row as Row)).filter((g): g is FinishedGame => g !== null)
  mergeHistory(games)
}

/**
 * Sends everything this phone has filed.
 *
 * The whole list goes up rather than a diff. At a few dozen games that is a
 * small request, and it means a phone that was offline for a week heals the
 * table on its next connection instead of quietly missing whatever it wrote
 * while it was away.
 */
export async function push(): Promise<void> {
  if (!isSharing()) return
  const games = getHistory()
  if (games.length === 0) return

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(games.map(toRow)),
  })
  if (!response.ok) throw new Error(`push ${response.status}`)
}

/** Empties the shared table. Used by "borrar historial", which now clears it for everyone. */
export async function wipeShared(): Promise<void> {
  if (!isSharing()) return
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=not.is.null`, {
    method: 'DELETE',
    headers: headers({ Prefer: 'return=minimal' }),
  })
  if (!response.ok) throw new Error(`wipe ${response.status}`)
}

let timer: ReturnType<typeof setTimeout> | null = null
let busy = false
let queued = false

function pushSoon(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void runPush()
  }, SETTLE_MS)
}

async function runPush(): Promise<void> {
  if (busy) {
    // Something changed mid-flight; send the newer state once this one lands
    // rather than dropping it.
    queued = true
    return
  }
  busy = true
  try {
    await push()
  } catch {
    // Offline, or the table is unreachable. The games are safe on the phone and
    // go up on the next change or the next visit — there is nothing to tell the
    // player about, and a red banner over a card game would be worse than the
    // delay it is warning about.
  } finally {
    busy = false
    if (queued) {
      queued = false
      pushSoon()
    }
  }
}

function catchUp(): void {
  void pull().catch(() => {
    // Same reasoning as above: a failed catch-up is invisible on purpose.
  })
}

/**
 * The first exchange of the visit: take what the table has, then hand over
 * everything this phone has filed.
 *
 * The push matters as much as the pull. Without it a phone only ever uploads
 * when it finishes a game, so one that already had a history — the phone that
 * kept score before any of this existed, or one that was offline for a week —
 * would sit on its games forever and the table would never learn about them.
 * Pull first so the merge is complete before it goes up, and push even if the
 * pull failed: being offline a moment ago is no reason to withhold them.
 */
function firstExchange(): void {
  void pull()
    .catch(() => {})
    .then(() => runPush())
}

export function startSync(): void {
  if (typeof window === 'undefined' || !isSharing()) return

  // Push whenever the filed games change here — and only then. The other keys
  // are games in progress, which stay on this phone.
  onWrite((key) => {
    if (key === HISTORY_KEY) pushSoon()
  })

  firstExchange()

  // Coming back to the tab is the moment someone is most likely to be looking
  // at a history another phone has moved on from.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') catchUp()
  })

  setInterval(() => {
    if (document.visibilityState === 'visible') catchUp()
  }, POLL_MS)
}
