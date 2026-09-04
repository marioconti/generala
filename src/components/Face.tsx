import { useEffect, useRef, useState } from 'react'
import { onFrame } from '../lib/ticker'

interface Props {
  /** -1 buried, 0 level, +1 running away with it. See lib/mood.ts. */
  mood: number
  /** Height in px. The face is square. */
  size: number
  /** Only offsets the idle motion, so six faces do not breathe in unison. */
  seed: string
}

/**
 * The face beside a player's total.
 *
 * WHAT THE PREVIOUS VERSION GOT WRONG, and it was not a detail: it drew a
 * portrait. Each player had skin, hair and a hat, and the emotion was a few
 * degrees of eyebrow over the top. At 52 px the hair and the hat won — they
 * are the biggest shapes on a head — and the expression, which is the entire
 * point, lost. Dark skin made it worse: the features had nothing to sit
 * against.
 *
 * So this is an emoji, not a person. One warm yellow for everybody, no hair,
 * no hat, nothing on the face that is not saying how it is going. Whose column
 * it is, is already written at the top of it in their own name; the face has
 * one job and now it has the whole head to do it with.
 *
 * FIVE FACES, NOT A DIAL. The version before slid a single mouth curve across
 * the range, and it was too quiet to read across a table. These are five drawn
 * expressions — wrecked, down, level, pleased, ecstatic — and the mood
 * cross-fades between the two it falls between. Drawn poses can be exaggerated
 * in ways an interpolated one cannot: star eyes, a bawling open mouth, tears
 * that actually fall. The blend keeps the change smooth, so being overtaken
 * still slides down through the middle instead of cutting.
 */

const SKIN = '#f2c14e'
const SKIN_DEEP = '#e0a92e'
const INK = '#3a2a1e'
const BLUE = '#5b9bc4'

/** The five faces, worst to best. Mood -1 lands on 0 and +1 on 4. */
const STEPS = 5

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

function offsetOf(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return ((h % 1000) / 1000) * Math.PI * 2
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

/** 0 — wrecked. Eyes screwed shut, mouth wide open, tears coming down. */
function Wrecked() {
  return (
    <g>
      {/*
        Eyes squeezed shut UPWARDS and brows with their inner ends HIGH. Both
        were the other way round at first and the face came out furious: inner
        ends low is anger, and it does not matter what the mouth is doing.
      */}
      {/*
        Three things have to agree or the face lies. Brows with their inner
        ends HIGH — inner ends low is anger. Eyes squeezed shut DOWNWARDS —
        the upward arc is the smiling-eyes shape and it fights everything else.
        And an open howling mouth: a curve with its control point below is a
        grin no matter what the brows are doing, which is exactly the mistake
        that had this face beaming while its owner lost by two hundred.
      */}
      <path d="M-6 -1.4 Q-3.6 1.7 -1.2 -1.4" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M1.2 -1.4 Q3.6 1.7 6 -1.4" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M-7.4 -2.8 L-2.2 -5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M7.4 -2.8 L2.2 -5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="5.4" rx="3.5" ry="3.1" fill={INK} />
      <path d="M-2.4 6 Q0 4.4 2.4 6" fill="#c4626b" />
      {/* Their own group, so they can actually fall rather than hang there. */}
      <g data-part="tears" fill={BLUE}>
        <path d="M-5.6 0.6 q1.7 3.2 0 4.7 q-1.7 -1.5 0 -4.7 Z" />
        <path d="M5.6 0.6 q1.7 3.2 0 4.7 q-1.7 -1.5 0 -4.7 Z" />
      </g>
    </g>
  )
}

/** 1 — down. Sorry brows, and a small unhappy mouth. */
function Down() {
  return (
    <g>
      <circle cx="-3.7" cy="-0.4" r="2.1" fill={INK} />
      <circle cx="3.7" cy="-0.4" r="2.1" fill={INK} />
      <circle cx="-3.1" cy="-1.1" r="0.75" fill="#fff8e8" />
      <circle cx="4.3" cy="-1.1" r="0.75" fill="#fff8e8" />
      <path d="M-6.6 -3.1 L-1.7 -4.8" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M6.6 -3.1 L1.7 -4.8" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M-3.6 6.6 Q0 3.6 3.6 6.6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** 2 — level. Nothing to report. */
function Level() {
  return (
    <g>
      <circle cx="-3.7" cy="-0.6" r="2.2" fill={INK} />
      <circle cx="3.7" cy="-0.6" r="2.2" fill={INK} />
      <circle cx="-3.1" cy="-1.3" r="0.8" fill="#fff8e8" />
      <circle cx="4.3" cy="-1.3" r="0.8" fill="#fff8e8" />
      <path d="M-3 5 L3 5" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** 3 — pleased. Arched eyes, a real grin, a bit of colour. */
function Pleased() {
  return (
    <g>
      <ellipse cx="-6" cy="3.4" rx="2.2" ry="1.5" fill="#e08a7a" opacity="0.8" />
      <ellipse cx="6" cy="3.4" rx="2.2" ry="1.5" fill="#e08a7a" opacity="0.8" />
      <path d="M-6 -0.6 Q-3.7 -4 -1.4 -0.6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M1.4 -0.6 Q3.7 -4 6 -0.6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-4.6 3.2 Q0 8.2 4.6 3.2" stroke={INK} strokeWidth="2.1" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** 4 — ecstatic. Star eyes and a mouth wide open. */
function Ecstatic() {
  const star = (cx: number) =>
    `M${cx} -4.8 L${cx + 1.2} -1.8 L${cx + 4.2} -1.4 L${cx + 2} 0.7 ` +
    `L${cx + 2.6} 3.7 L${cx} 2.2 L${cx - 2.6} 3.7 L${cx - 2} 0.7 ` +
    `L${cx - 4.2} -1.4 L${cx - 1.2} -1.8 Z`
  return (
    <g>
      <ellipse cx="-6.6" cy="4.6" rx="2.3" ry="1.6" fill="#e0705f" opacity="0.9" />
      <ellipse cx="6.6" cy="4.6" rx="2.3" ry="1.6" fill="#e0705f" opacity="0.9" />
      <path d={star(-4.1)} fill={INK} />
      <path d={star(4.1)} fill={INK} />
      <path d="M-4.8 3.4 Q0 10 4.8 3.4 Q0 6.4 -4.8 3.4 Z" fill={INK} />
      <path d="M-2.6 6.2 Q0 8.8 2.6 6.2 Q0 7.4 -2.6 6.2 Z" fill="#c4626b" />
    </g>
  )
}

const FACES = [Wrecked, Down, Level, Pleased, Ecstatic]

export function Face({ mood, size, seed }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const target = useRef(mood)
  target.current = mood
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = svg.current
    if (!root) return

    const layers = [...root.querySelectorAll('[data-face]')] as SVGGElement[]
    const body = root.querySelector('[data-part="body"]') as SVGGElement
    const rays = root.querySelector('[data-part="rays"]') as SVGGElement
    const tears = [...root.querySelectorAll('[data-part="tears"]')] as SVGGElement[]
    const cheek = root.querySelector('[data-part="cheek"]') as SVGCircleElement
    const phase = offsetOf(seed)

    const paint = (m: number, now: number) => {
      const good = clamp01(m)
      const bad = clamp01(-m)

      // Where the mood lands among the five, and how far between two of them.
      const pos = ((m + 1) / 2) * (STEPS - 1)
      const i = Math.min(STEPS - 2, Math.floor(pos))
      const t = Math.min(1, Math.max(0, pos - i))
      layers.forEach((layer, k) => {
        const on = k === i ? 1 - t : k === i + 1 ? t : 0
        layer.setAttribute('opacity', on.toFixed(3))
      })

      const time = now / 1000

      /*
       * The movement is the loud part, on purpose. A face that only changes
       * shape reads as a set of icons; one that bounces when it is winning and
       * shivers when it is losing reads as somebody having a night.
       */
      const bounce = -Math.abs(Math.sin(time * 4.4)) * good * 2.8
      const shiver = Math.sin(time * 26) * bad * 0.6
      const breathe = Math.sin(time * 2 + phase) * 0.3
      const sink = bad * 1.5
      const scale = 1 + good * 0.1 - bad * 0.06
      body.setAttribute(
        'transform',
        `translate(${shiver.toFixed(2)} ${(bounce + sink + breathe).toFixed(2)}) ` +
          `scale(${scale.toFixed(3)})`,
      )

      rays.setAttribute('opacity', clamp01((good - 0.3) / 0.4).toFixed(2))
      rays.setAttribute('transform', `rotate(${((time * 42) % 360).toFixed(1)})`)
      cheek.setAttribute('opacity', (clamp01((good - 0.15) / 0.5) * 0.3).toFixed(2))

      // Tears fall on a loop rather than hanging off the cheek forever.
      const fall = (time * 1.6) % 1
      tears.forEach((g) => {
        g.setAttribute('transform', `translate(0 ${(fall * 5.6).toFixed(2)})`)
        g.setAttribute('opacity', (1 - fall).toFixed(2))
      })
    }

    if (reduced) {
      paint(target.current, 0)
      return
    }

    let shown = target.current
    let vel = 0
    let last = 0

    return onFrame((now) => {
      if (!last) last = now
      const dt = Math.min(now - last, 34) / 1000
      last = now

      // Loose enough to overshoot on purpose: when somebody is overtaken the
      // face swings past neutral on its way down and comes back, which is the
      // "everything falls out of their hands" moment rather than a silent swap.
      const freq = 6.5
      const damp = 0.5
      vel += (freq * freq * (target.current - shown) - 2 * damp * freq * vel) * dt
      shown += vel * dt

      paint(Math.max(-1, Math.min(1, shown)), now)
    })
  }, [reduced, seed])

  return (
    <svg
      ref={svg}
      className="face-figure"
      viewBox="-15 -15 30 30"
      height={size}
      width={size}
      aria-hidden="true"
      focusable="false"
    >
      <g data-part="body">
        <g data-part="rays" opacity="0" stroke="#e8a33c" strokeWidth="1.9" strokeLinecap="round">
          <path d="M0 -12.4 v-2.3" />
          <path d="M0 12.4 v2.3" />
          <path d="M-12.4 0 h-2.3" />
          <path d="M12.4 0 h2.3" />
          <path d="M8.8 -8.8 l1.7 -1.7" />
          <path d="M-8.8 -8.8 l-1.7 -1.7" />
          <path d="M8.8 8.8 l1.7 1.7" />
          <path d="M-8.8 8.8 l-1.7 1.7" />
        </g>

        <circle cx="0" cy="0" r="11" fill={SKIN} stroke={INK} strokeWidth="1.7" />
        {/* A warmer rim along the bottom, so the head reads as round, not flat. */}
        <path d="M-10.4 3.4 A11 11 0 0 0 10.4 3.4 A11 11 0 0 1 -10.4 3.4 Z" fill={SKIN_DEEP} opacity="0.5" />
        {/* Flushes as things go well. */}
        <circle data-part="cheek" cx="0" cy="0" r="11" fill="#d4553f" opacity="0" />

        {FACES.map((Item, i) => (
          <g key={i} data-face={i} opacity={i === 2 ? 1 : 0}>
            <Item />
          </g>
        ))}
      </g>
    </svg>
  )
}
