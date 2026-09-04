type Tick = (now: number) => void

const listeners = new Set<Tick>()
let frame = 0

function loop(now: number) {
  for (const listener of listeners) listener(now)
  frame = requestAnimationFrame(loop)
}

/**
 * One animation frame for every face on screen, rather than one each. With six
 * players that is one callback instead of six, and they stay in step with each
 * other.
 */
export function onFrame(listener: Tick): () => void {
  listeners.add(listener)
  if (!frame) frame = requestAnimationFrame(loop)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}
