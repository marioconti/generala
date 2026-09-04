import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ASPECT,
  build,
  HEAD_RADIUS,
  onFrame,
  poseAt,
  resolve,
  restingMotion,
  settle,
  turnLength,
  VIEW_BOX,
  type Mood,
  type Move,
  type Pose,
} from '../lib/stickman'
import { characterFor, type Character, type Ink, type Shape } from '../lib/characters'
import { DANCES, IDLE, SHOCKS, SORROWS } from '../lib/stickman-moves'

interface Props {
  mood: Mood
  /** Height in px. The figure keeps its proportions. */
  size: number
  /** Picks the character and offsets the loop, so no two move in unison. */
  seed: string
  /**
   * Bump this to make the figure react to something. Any new value interrupts
   * whatever it was doing for one dramatic move, then hands it back.
   */
  shock?: number
}

const POOLS: Record<Mood, Move[]> = { dance: DANCES, sad: SORROWS, idle: IDLE }

/** How long a reaction holds the stage before the mood takes over again. */
const SHOCK_MS = 2600

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

type Limb = 'armL' | 'armR' | 'legL' | 'legR'
const LIMBS: Limb[] = ['armL', 'armR', 'legL', 'legR']

type Joint = 'handL' | 'handR' | 'footL' | 'footR'
const JOINTS: Joint[] = ['handL', 'handR', 'footL', 'footR']

type Sleeve = 'sleeveL' | 'sleeveR'

/**
 * The outline every part is drawn over.
 *
 * The first version of these had none, and the arms disappeared into the
 * torso: same weight of colour, no edge between them, so a figure waving read
 * as a figure standing still. Since the dances are almost entirely arms, that
 * was not a polish problem — it was the whole thing not working. A dark edge
 * on every piece is what a small drawing needs to stay legible, and it is why
 * every cartoon ever made has one.
 */
const OUTLINE = '#3a2a1e'

interface Parts {
  upper: Record<Limb, SVGPathElement[]>
  lower: Record<Limb, SVGPathElement[]>
  knee: Record<Limb, SVGCircleElement[]>
  torso: SVGPathElement[]
  joints: Record<Joint, SVGCircleElement[]>
  sleeves: Record<Sleeve, SVGPolylineElement[]>
  heads: SVGGElement[]
  body: SVGGElement
  tear: SVGGElement
}

/** Resolves a character's colour slots. `dark` is for glasses and outlines. */
function ink(character: Character, slot: Ink | undefined, fallback: string): string {
  switch (slot) {
    case 'skin':
      return character.skin
    case 'hair':
      return character.hair
    case 'shirt':
      return character.shirt
    case 'shorts':
      return character.shorts
    case 'shoes':
      return character.shoes
    case 'dark':
      return '#2b1d14'
    case 'paper':
      return 'var(--paper)'
    default:
      return fallback
  }
}

function Piece({ shape, character }: { shape: Shape; character: Character }) {
  return (
    <path
      d={shape.d}
      fill={shape.fill ? ink(character, shape.fill, 'none') : 'none'}
      stroke={shape.stroke ? ink(character, shape.stroke, 'none') : 'none'}
      strokeWidth={shape.width ?? 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
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
 * The body is drawn in four passes: a paper-coloured silhouette that keeps the
 * figure readable where it overlaps the total, the dark outline, the colour,
 * and the head. Limbs are tapered shapes rather than strokes — a stroke is one
 * width from hip to ankle and mitres at the knee, which is what made these
 * read as bent pipe.
 */
export function StickMan({ mood, size, seed, shock }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const parts = useRef<Parts | null>(null)
  const moodRef = useRef(mood)
  moodRef.current = mood
  const shockRef = useRef(shock)
  shockRef.current = shock
  const reduced = useReducedMotion()
  const character = useMemo(() => characterFor(seed), [seed])

  useEffect(() => {
    const root = svg.current
    if (!root) return
    const all = <T extends Element>(name: string) =>
      [...root.querySelectorAll(`[data-part="${name}"]`)] as unknown as T[]

    const per = <T extends Element>(suffix: string) =>
      Object.fromEntries(LIMBS.map((l) => [l, all<T>(l + suffix)])) as Record<Limb, T[]>

    parts.current = {
      upper: per<SVGPathElement>('-upper'),
      lower: per<SVGPathElement>('-lower'),
      knee: per<SVGCircleElement>('-knee'),
      torso: all<SVGPathElement>('torso'),
      joints: {
        handL: all<SVGCircleElement>('handL'),
        handR: all<SVGCircleElement>('handR'),
        footL: all<SVGCircleElement>('footL'),
        footR: all<SVGCircleElement>('footR'),
      },
      sleeves: {
        sleeveL: all<SVGPolylineElement>('sleeveL'),
        sleeveR: all<SVGPolylineElement>('sleeveR'),
      },
      heads: all<SVGGElement>('head'),
      body: root.querySelector('[data-part="body"]') as SVGGElement,
      tear: root.querySelector('[data-part="tear"]') as SVGGElement,
    }
  }, [])

  const draw = useCallback((pose: Required<Pose>) => {
    const p = parts.current
    if (!p) return
    const bones = build(pose)

    for (const el of p.torso) el.setAttribute('d', bones.torsoShape)
    for (const name of LIMBS) {
      const shape = bones.shapes[name]
      for (const el of p.upper[name]) el.setAttribute('d', shape.upper)
      for (const el of p.lower[name]) el.setAttribute('d', shape.lower)
      for (const el of p.knee[name]) {
        el.setAttribute('cx', shape.joint[0].toFixed(1))
        el.setAttribute('cy', shape.joint[1].toFixed(1))
      }
    }
    for (const name of JOINTS) {
      const [x, y] = bones.joints[name]
      for (const el of p.joints[name]) {
        el.setAttribute('cx', x.toFixed(1))
        el.setAttribute('cy', y.toFixed(1))
      }
    }
    // Shoulder to elbow only: the sleeve, so an arm has a shirt on it and
    // stops reading as a bare tube stuck to the body.
    const { neck, elbowL, elbowR } = bones.joints
    const seg = (a: [number, number], b: [number, number]) =>
      `${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`
    for (const el of p.sleeves.sleeveL) el.setAttribute('points', seg(neck, elbowL))
    for (const el of p.sleeves.sleeveR) el.setAttribute('points', seg(neck, elbowR))

    for (const head of p.heads) head.setAttribute('transform', bones.head)

    // A spin is the whole body squashing through zero and a cartwheel is it
    // turning over, so both belong on the group rather than on any one bone.
    p.body.setAttribute(
      'transform',
      `scale(${(pose.flip * pose.scale).toFixed(3)} ${pose.scale.toFixed(3)}) ` +
        `rotate(${pose.roll.toFixed(1)})`,
    )
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
    let shownMood = moodRef.current
    let shownShock = shockRef.current
    let reacting = false
    let last = 0

    /*
     * The body has state now: where every joint is and how fast it is going.
     * That is what removes the cross-fade this used to need between moves —
     * a spring is already somewhere, so it just starts chasing a new target
     * and gets there the way a body would, with no blend to schedule.
     */
    const motion = restingMotion()
    const offset = phaseOffset(seed)

    const take = (candidate: Move, now: number) => {
      move = candidate
      startedAt = now - offset
      endsAt = now + turnLength(candidate)
      started = true
      parts.current?.tear.setAttribute('opacity', candidate.tear ? '1' : '0')
    }

    return onFrame((now) => {
      if (!started) {
        take(move, now)
        last = now
      }

      const incoming = shockRef.current
      const newShock = incoming !== undefined && incoming !== shownShock
      shownShock = incoming

      if (newShock) {
        reacting = true
        take(SHOCKS[Math.floor(Math.random() * SHOCKS.length)], now)
        endsAt = now + SHOCK_MS
      } else if (moodRef.current !== shownMood && !reacting) {
        // A change of mood cuts in at once — the whole point of the figure is
        // to say who is winning right now — and the springs carry the body out
        // of whatever it was doing rather than snapping it.
        shownMood = moodRef.current
        deck = shuffled(POOLS[shownMood])
        next = 0
        take(deck[next++], now)
      } else if (now >= endsAt) {
        // Coming out of a reaction, pick up the mood as it stands now, which
        // may well have changed while the figure was busy reacting.
        if (reacting || moodRef.current !== shownMood) {
          reacting = false
          shownMood = moodRef.current
          deck = shuffled(POOLS[shownMood])
          next = 0
        } else if (next >= deck.length) {
          deck = shuffled(deck)
          next = 0
        }
        take(deck[next++], now)
      }

      const dt = now - last
      last = now
      draw(settle(motion, poseAt(move, now - startedAt), dt))
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
      <g data-part="body" strokeLinecap="round" strokeLinejoin="round">
        {/*
          Pass one: a paper-coloured silhouette under everything, so the figure
          stays readable where it overlaps the total it stands on.
        */}
        <g className="stickman__halo" fill="var(--paper)" stroke="var(--paper)" strokeWidth="4.6">
          {LIMBS.map((l) => (
            <g key={l}>
              <path data-part={`${l}-upper`} d="" />
              <path data-part={`${l}-lower`} d="" />
            </g>
          ))}
          <path data-part="torso" d="" strokeWidth="9" />
          <g data-part="head">
            <circle cx="0" cy="0" r={HEAD_RADIUS + 4} />
          </g>
        </g>

        {/*
          Pass two: the outline, drawn as the same shapes a little fatter. A
          stroke would thicken the taper at the wrist as much as at the
          shoulder; growing the silhouette keeps the limb's shape intact.
        */}
        <g fill={OUTLINE} stroke={OUTLINE} strokeWidth="2.6">
          {LIMBS.map((l) => (
            <g key={l}>
              <path data-part={`${l}-upper`} d="" />
              <path data-part={`${l}-lower`} d="" />
              <circle data-part={`${l}-knee`} r={l.startsWith('leg') ? 4.7 : 3.9} />
            </g>
          ))}
          <path data-part="torso" d="" strokeWidth="2.6" />
          <circle data-part="footL" r="3.5" />
          <circle data-part="footR" r="3.5" />
          <circle data-part="handL" r="3.1" />
          <circle data-part="handR" r="3.1" />
        </g>

        {/* Pass three: the colour, back to front. */}
        <g stroke="none">
          <g fill={character.shorts}>
            {(['legL', 'legR'] as const).map((l) => (
              <g key={l}>
                <path data-part={`${l}-upper`} d="" />
                <path data-part={`${l}-lower`} d="" />
                <circle data-part={`${l}-knee`} r="3.7" />
              </g>
            ))}
          </g>
          <circle data-part="footL" r="2.6" fill={character.shoes} />
          <circle data-part="footR" r="2.6" fill={character.shoes} />

          <path data-part="torso" d="" fill={character.shirt} />

          <g fill={character.skin}>
            {(['armL', 'armR'] as const).map((l) => (
              <g key={l}>
                <path data-part={`${l}-upper`} d="" />
                <path data-part={`${l}-lower`} d="" />
                <circle data-part={`${l}-knee`} r="2.9" />
              </g>
            ))}
          </g>
          {/* The sleeve, so an arm has a shirt on it down to the elbow. */}
          <polyline data-part="sleeveL" points="" fill="none" stroke={character.shirt} strokeWidth="8.4" strokeLinecap="round" />
          <polyline data-part="sleeveR" points="" fill="none" stroke={character.shirt} strokeWidth="8.4" strokeLinecap="round" />
          <circle data-part="handL" r="2.3" fill={character.skin} />
          <circle data-part="handR" r="2.3" fill={character.skin} />
        </g>

        {/* Pass four: the head, and whatever this one wears on it. */}
        <g data-part="head">
          <circle cx="0" cy="0" r={HEAD_RADIUS} fill={character.skin} stroke={OUTLINE} strokeWidth="1.6" />
          {character.head.map((shape, i) => (
            <Piece key={`h${i}`} shape={shape} character={character} />
          ))}

          <g fill={OUTLINE} stroke="none">
            <circle cx="-3.1" cy="1.4" r="1.15" />
            <circle cx="3.1" cy="1.4" r="1.15" />
          </g>

          <g fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="1.9">
            <path className="face face--happy" d="M-3.2 4 Q0 6.8 3.2 4" />
            <path className="face face--sad" d="M-3.2 6.2 Q0 3.4 3.2 6.2" />
            <path className="face face--flat" d="M-2.8 5 L2.8 5" />
            <g className="face face--sad" data-part="tear" opacity="0">
              <path d="M3.6 2.6 L3.6 7.4" stroke="#6aa6c8" strokeWidth="1.8" />
            </g>
          </g>

          {character.face?.map((shape, i) => (
            <Piece key={`f${i}`} shape={shape} character={character} />
          ))}
        </g>
      </g>
    </svg>
  )
}
