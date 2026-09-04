import { useEffect, useMemo, useRef, useState } from 'react'
import { characterFor, type Character, type Ink, type Shape } from '../lib/characters'
import { onFrame } from '../lib/ticker'

interface Props {
  /** -1 buried, 0 level, +1 running away with it. See lib/mood.ts. */
  mood: number
  /** Height in px. The face is square. */
  size: number
  /** Picks which of the ten characters this is, and offsets the idle bob. */
  seed: string
}

/**
 * The face beside a player's total.
 *
 * This replaced a full dancing figure, and the reason is a measurement: at the
 * 52 px this occupies with six players, a whole body — even one animated by a
 * professional — is a smudge. A face is one big shape with three small ones on
 * it, which is exactly what survives being shrunk.
 *
 * NOTHING HERE IS A STATE. There is no happy face and no sad face to cut
 * between: every feature is a function of one number, so the expression slides
 * the whole way from destroyed to radiant and lands anywhere in between. That
 * is what lets it say *by how much* someone is winning, which three states
 * never could, and it is why getting overtaken looks right for free — the
 * number crosses zero and the face falls through neutral on the way down.
 *
 * Drawn in the same units as the old head, radius 8.5 at the origin, so every
 * hairstyle and hat in characters.ts is reused untouched.
 */

/** Chases the target so a change of fortune lands with weight, not a jump. */
const FOLLOW = { freq: 7.5, damp: 0.62 }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

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

const OUTLINE = '#3a2a1e'

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

function offsetOf(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return (h % 1000) / 1000
}

interface Parts {
  root: SVGGElement
  mouth: SVGPathElement
  brows: SVGGElement
  browL: SVGPathElement
  browR: SVGPathElement
  eyeL: SVGCircleElement
  eyeR: SVGCircleElement
  blush: SVGGElement
  shine: SVGGElement
  tear: SVGPathElement
}

export function Face({ mood, size, seed }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const parts = useRef<Parts | null>(null)
  const target = useRef(mood)
  target.current = mood
  const reduced = useReducedMotion()
  const character = useMemo(() => characterFor(seed), [seed])

  useEffect(() => {
    const root = svg.current
    if (!root) return
    const one = <T extends Element>(name: string) =>
      root.querySelector(`[data-part="${name}"]`) as unknown as T
    parts.current = {
      root: one<SVGGElement>('root'),
      mouth: one<SVGPathElement>('mouth'),
      brows: one<SVGGElement>('brows'),
      browL: one<SVGPathElement>('browL'),
      browR: one<SVGPathElement>('browR'),
      eyeL: one<SVGCircleElement>('eyeL'),
      eyeR: one<SVGCircleElement>('eyeR'),
      blush: one<SVGGElement>('blush'),
      shine: one<SVGGElement>('shine'),
      tear: one<SVGPathElement>('tear'),
    }
  }, [])

  useEffect(() => {
    const paint = (m: number, bob: number) => {
      const p = parts.current
      if (!p) return
      const good = clamp01(m)
      const bad = clamp01(-m)

      /*
       * The mouth is one curve with a moving control point. Positive bulges it
       * downwards into a smile, negative pulls it up into a frown, and zero is
       * a flat line — one shape doing the whole range instead of three paths
       * being swapped.
       */
      const my = lerp(4.4, m > 0 ? 3.4 : 5.8, Math.abs(m))
      const curve = m > 0 ? lerp(0, 3.8, good) : lerp(0, -3.0, bad)
      const wide = lerp(3.4, 4.4, good)
      p.mouth.setAttribute('d', `M${-wide} ${my.toFixed(2)} Q0 ${(my + curve).toFixed(2)} ${wide} ${my.toFixed(2)}`)

      /*
       * THE EYES NEVER CLOSE.
       *
       * They used to: lids slid over them at both ends of the scale, and the
       * result was a face with no eyes and two heavy brows, which reads as
       * anger no matter what the mouth is doing. At this size the eyes ARE the
       * face — so they stay, and they only change size: a little wider when
       * things are going well, a little smaller when they are not.
       */
      const eye = lerp(1.75, m > 0 ? 2.0 : 1.45, Math.abs(m))
      p.eyeL.setAttribute('r', eye.toFixed(2))
      p.eyeR.setAttribute('r', eye.toFixed(2))

      /*
       * Brows only turn up once there is something to say. Drawn at every mood
       * they sat over a neutral face looking cross, and two lines above two
       * dots is most of what a small face has — spending them on nothing was
       * what made these look angry rather than calm.
       */
      const strength = clamp01((Math.abs(m) - 0.3) / 0.7)
      p.brows.setAttribute('opacity', strength.toFixed(2))
      // Low enough to sit on skin rather than under a fringe: half the
      // characters have hair down to the brow line, and dark brows on dark
      // hair are brows nobody sees.
      const browY = -1.25 - good * 0.55
      const tilt = -m * 1.7
      p.browL.setAttribute('d', `M-5.3 ${(browY + tilt).toFixed(2)} L-1.7 ${(browY - tilt).toFixed(2)}`)
      p.browR.setAttribute('d', `M5.3 ${(browY + tilt).toFixed(2)} L1.7 ${(browY - tilt).toFixed(2)}`)

      p.blush.setAttribute('opacity', clamp01((good - 0.2) / 0.5).toFixed(2))
      p.shine.setAttribute('opacity', clamp01((good - 0.45) / 0.45).toFixed(2))
      p.tear.setAttribute('opacity', clamp01((bad - 0.45) / 0.45).toFixed(2))

      // Winning floats and swells a little; losing sinks and shrinks.
      const rise = -m * 1.4 + bob
      const scale = 1 + m * 0.05
      p.root.setAttribute(
        'transform',
        `translate(0 ${rise.toFixed(2)}) scale(${scale.toFixed(3)})`,
      )
    }

    if (reduced) {
      paint(target.current, 0)
      return
    }

    let shown = target.current
    let vel = 0
    let last = 0
    const phase = offsetOf(seed) * Math.PI * 2

    return onFrame((now) => {
      if (!last) last = now
      const dt = Math.min(now - last, 34) / 1000
      last = now

      // Same spring as the bodies used, kept for the same reason: an expression
      // that snaps to its new value reads as a sprite swap, not as somebody
      // reacting to what just happened on the sheet.
      const k = FOLLOW.freq * FOLLOW.freq
      const c = 2 * FOLLOW.damp * FOLLOW.freq
      vel += (k * (target.current - shown) - c * vel) * dt
      shown += vel * dt

      // Breathing, and a bounce that only shows up when there is something to
      // be happy about.
      const t = now / 1000
      const bob =
        Math.sin(t * 2.1 + phase) * 0.34 +
        Math.max(0, shown) * Math.abs(Math.sin(t * 3.4 + phase)) * -1.5

      paint(shown, bob)
    })
  }, [reduced, seed])

  return (
    <svg
      ref={svg}
      className="face-figure"
      viewBox="-13 -15 26 26"
      height={size}
      width={size}
      aria-hidden="true"
      focusable="false"
    >
      <g data-part="root">
        {/* Keeps the face readable where it sits over the total. */}
        <circle cx="0" cy="0" r="12.4" fill="var(--paper)" />

        {/* The rays only fade in once someone is properly winning. */}
        <g data-part="shine" opacity="0" stroke="var(--accent-deep)" strokeWidth="1.3" strokeLinecap="round">
          <path d="M0 -12.4 v-2.2" />
          <path d="M8.8 -8.8 l1.6 -1.6" />
          <path d="M-8.8 -8.8 l-1.6 -1.6" />
          <path d="M12.4 0 h2.2" />
          <path d="M-12.4 0 h-2.2" />
        </g>

        <circle cx="0" cy="0" r="8.5" fill={character.skin} stroke={OUTLINE} strokeWidth="1.5" />

        {character.head.map((shape, i) => (
          <Piece key={`h${i}`} shape={shape} character={character} />
        ))}

        <g data-part="blush" opacity="0" fill="#d1745e">
          <ellipse cx="-5.6" cy="3.4" rx="2" ry="1.3" />
          <ellipse cx="5.6" cy="3.4" rx="2" ry="1.3" />
        </g>

        <g fill={OUTLINE}>
          <circle data-part="eyeL" cx="-3.3" cy="1.5" r="1.75" />
          <circle data-part="eyeR" cx="3.3" cy="1.5" r="1.75" />
        </g>
        {/* A catchlight in each eye. Two flat dots look dead; two dots with a
            glint look like someone is in there. */}
        <g fill="#fdf8ee">
          <circle cx="-2.75" cy="0.95" r="0.6" />
          <circle cx="3.85" cy="0.95" r="0.6" />
        </g>

        <g data-part="brows" opacity="0" fill="none" stroke={OUTLINE} strokeLinecap="round" strokeWidth="1.4">
          <path data-part="browL" d="" />
          <path data-part="browR" d="" />
        </g>

        <g fill="none" stroke={OUTLINE} strokeLinecap="round">
          <path data-part="mouth" d="" strokeWidth="1.9" />
        </g>

        <path data-part="tear" d="M3.9 2.8 q1.1 2.2 0 3.3 q-1.1 -1.1 0 -3.3 Z" fill="#6aa6c8" opacity="0" />

        {character.face?.map((shape, i) => (
          <Piece key={`f${i}`} shape={shape} character={character} />
        ))}
      </g>
    </svg>
  )
}
