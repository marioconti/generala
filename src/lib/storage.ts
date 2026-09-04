/**
 * localStorage that never throws.
 *
 * Private browsing, a full quota or a locked-down browser all make these calls
 * raise. Nothing here is important enough to break a game over, so every access
 * degrades to "no saved data" instead.
 */

export function read<T>(key: string, isValid: (value: unknown) => boolean): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? (parsed as T) : null
  } catch {
    return null
  }
}

/**
 * Called after every successful write, with the key that changed.
 *
 * This is the single choke point for everything the app persists, which makes
 * it the one place to hang sharing off: when the build runs inside a Claude
 * artifact, `shared.ts` listens here and republishes the page so the finished
 * games travel to everyone else. On GitHub Pages nothing subscribes and the
 * call costs nothing.
 */
let listener: ((key: string) => void) | null = null

export function onWrite(fn: (key: string) => void): void {
  listener = fn
}

export function write(key: string, value: unknown): void {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The game still works; it just won't survive a reload.
  }
  try {
    listener?.(key)
  } catch {
    // Sharing is a bonus. It must never take the game down with it.
  }
}

/**
 * crypto.randomUUID() only exists in a secure context, and testing on a phone
 * over the LAN is plain http. Ids never leave the device, so this is enough.
 */
export function makeId(prefix = 'i'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
