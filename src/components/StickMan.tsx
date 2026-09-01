import { useCallback, useEffect, useRef, useState } from 'react'
import {
  blend,
  build,
  HEAD_RADIUS,
  onFrame,
  poseAt,
  resolve,
  REST,
  turnLength,
  VIEW_BOX,
  ASPECT,
  type Mood,
  type Move,
  type Pose,
} from '../lib/stickman'
import { DANCES, IDLE, SORROWS } from '../lib/stickman-moves'

interface Props {
  mood: Mood
  /** Height in px. The figure keeps its proportions. */
  size: number
  /** Distinguishes one figure from another so they never move in unison. */
  seed: string
}

const POOLS: Record<Mood, Move[]> = { dance: DANCES, sad: SORROWS, idle: IDLE }

/** How long it takes to melt from one move into the next. */
const BLEND_MS = 320

/**
 * A per-figure offset into the loop. Two players who happen to draw the same
 * dance at the same moment would otherwise move as one puppet, which reads as
 * a bug rather than a coincidence.
 */
function phaseOffset(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % 1200
}

function shuffled(moves: Move[]): Move[] {
  const out = [...moves]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

interface Parts {
  torso: SVGPolylineElement
  armL: SVGPolylineElement
  armR: SVGPolylineElement
  legL: SVGPolylineElement
  legR: SVGPolylineElement
  head: SVGGElement
  body: SVGGElement
  tear: SVGGElement
}

/**
 * The figure standing next to a player's total.
 *
 * It animates by writing straight to the SVG attributes on a shared animation
 * frame, never through React state: six of these re-rendering a component tree
 * sixty times a second would make the sheet stutter on the phone this is meant
 * to be used on, and nothing above needs to know which pose it is in. Every
 * facial feature stays mounted for the same reason — swapping them on a mood
 * change would hand the running animation a detached node.
 *
 * Moves rotate. One holds for whole loops adding up to 5-10 seconds, then the
 * next from a shuffled deck takes over, so all twenty come up before any
 * repeats.
 */
export function StickMan({ mood, size, seed }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const parts = useRef<Parts | null>(null)
  const moodRef = useRef(mood)
  moodRef.current = mood
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = svg.current
    if (!root) return
    const find = (name: string) => root.querySelector(`[data-part="${name}"]`)
    parts.current = {
      torso: find('torso') as SVGPolylineElement,
      armL: find('armL') as SVGPolylineElement,
      armR: find('armR') as SVGPolylineElement,
      legL: find('legL') as SVGPolylineElement,
      legR: find('legR') as SVGPolylineElement,
      head: find('head') as SVGGElement,
      body: find('body') as SVGGElement,
      tear: find('tear') as SVGGElement,
    }
  }, [])

  const draw = useCallback((pose: Required<Pose>) => {
    const p = parts.current
    if (!p) return
    const bones = build(pose)
    p.torso.setAttribute('points', bones.torso)
    p.armL.setAttribute('points', bones.armL)
    p.armR.setAttribute('points', bones.armR)
    p.legL.setAttribute('points', bones.legL)
    p.legR.setAttribute('points', bones.legR)
    p.head.setAttribute('transform', bones.head)
    // A spin is the whole body squashing through zero, so it scales the group
    // rather than any single bone.
    p.body.setAttribute('transform', `scale(${pose.flip.toFixed(3)} 1)`)
  }, [])

  // Someone who asked their system for less motion gets a figure that simply
  // stands there in the pose of the mood, and no animation frames at all.
  useEffect(() => {
    if (!reduced) return
    draw(resolve(POOLS[mood][0].poses[0]))
    parts.current?.tear.setAttribute('opacity', mood === 'sad' ? '1' : '0')
  }, [reduced, mood, draw])

  useEffect(() => {
    if (reduced) return

    let deck = shuffled(POOLS[moodRef.current])
    let next = 0
    let move = deck[next++]
    let started = false
    let startedAt = 0
    let endsAt = 0
    let from: Required<Pose> = { ...REST }
    let blendUntil = 0
    let shownMood = moodRef.current
    let current: Required<Pose> = { ...REST }

    const offset = phaseOffset(seed)

    const take = (candidate: Move, now: number, previous: Required<Pose>) => {
      move = candidate
      startedAt = now - offset
      endsAt = now + turnLength(candidate)
      started = true
      from = previous
      blendUntil = now + BLEND_MS
      parts.current?.tear.setAttribute('opacity', candidate.tear ? '1' : '0')
    }

    return onFrame((now) => {
      if (!started) take(move, now, current)

      // A change of mood cuts in at once — the whole point of the figure is to
      // say who is winning right now — but it still eases out of wherever the
      // last move left the body.
      if (moodRef.current !== shownMood) {
        shownMood = moodRef.current
        deck = shuffled(POOLS[shownMood])
        next = 0
        take(deck[next++], now, current)
      } else if (now >= endsAt) {
        if (next >= deck.length) {
          deck = shuffled(deck)
          next = 0
        }
        take(deck[next++], now, current)
      }

      const target = poseAt(move, now - startedAt)
      current =
        now < blendUntil
          ? blend(from, target, (now - (blendUntil - BLEND_MS)) / BLEND_MS)
          : target

      draw(current)
    })
  }, [reduced, seed, draw])

  return (
    <svg
      ref={svg}
      className={`stickman stickman--${mood}`}
      viewBox={VIEW_BOX}
      height={size}
      width={size * ASPECT}
      aria-hidden="true"
      focusable="false"
    >
      <g
        data-part="body"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline data-part="legL" points="" />
        <polyline data-part="legR" points="" />
        <polyline data-part="torso" points="" />
        <polyline data-part="armL" points="" />
        <polyline data-part="armR" points="" />

        <g data-part="head">
          <circle cx="0" cy="0" r={HEAD_RADIUS} strokeWidth="3.6" />
          <path className="face face--happy" d="M-4 1.5 Q0 5.5 4 1.5" strokeWidth="2.2" />
          <path className="face face--sad" d="M-4 4 Q0 0.5 4 4" strokeWidth="2.2" />
          <path className="face face--flat" d="M-3.5 2.6 L3.5 2.6" strokeWidth="2.2" />
          <g className="face face--sad" data-part="tear" opacity="0">
            <path d="M3.2 0.8 L3.2 6.6" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  )
}
