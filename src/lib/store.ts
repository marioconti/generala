import { useSyncExternalStore } from 'react'
import { read, write } from './storage'

/**
 * A tiny persistent store, one per game.
 *
 * Setup and Board are different routes, so plain useState in each would give
 * them separate copies. A provider per game would work but stacks four of them
 * around the app for no benefit. This keeps one value per localStorage key,
 * shared by every component that reads it and written through on each change.
 */
export interface Store<T> {
  get: () => T | null
  set: (next: T | null) => void
  update: (fn: (current: T) => T) => void
  subscribe: (listener: () => void) => () => void
}

export function createStore<T>(key: string, isValid: (value: unknown) => boolean): Store<T> {
  let current = read<T>(key, isValid)
  const listeners = new Set<() => void>()

  const set = (next: T | null) => {
    // Same reference means useSyncExternalStore skips the render, so callers
    // must always hand over a new object. update() below does that for them.
    current = next
    write(key, next)
    listeners.forEach((listener) => listener())
  }

  return {
    get: () => current,
    set,
    update: (fn) => {
      if (current === null) return
      set(fn(current))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useStore<T>(store: Store<T>): T | null {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
