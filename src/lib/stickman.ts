/**
 * The little figure that stands next to a player's total.
 *
 * It is a skeleton driven by joint angles, not a set of CSS keyframes. A move
 * is a short list of poses and the engine interpolates between them, which is
 * why forty of them fit in one readable file instead of forty blocks of
 * hand-written keyframes that all end up looking the same.
 *
 * Angles are in degrees. The convention is the same everywhere and it is what
 * makes the poses writable by hand:
 *
 *   0 points DOWN, and a positive angle turns a limb OUTWARDS, away from the
 *   body — for both sides. So `armR: [90, 0]` and `armL: [90, 0]` together are
 *   arms straight out sideways, and 180 on either arm is straight up.
 *
 * The torso is the exception: 0 is upright and positive leans to the right of
 * the screen. Arms hang from the torso and inherit its lean; legs hang from the
 * hip and do not, so the figure can bend forward with its feet planted.
 */

export interface Pose {
  /** Hip offset from where it rests. Negative y is up — a jump. */
  x?: number
  y?: number
  /** 0 upright, positive leans right. */
  torso?: number
  /** Relative to the torso. */
  head?: number
  /** [shoulder, elbow]. The elbow is relative to the upper arm. */
  armL?: [number, number]
  armR?: [number, number]
  /** [hip, knee]. The knee is relative to the thigh. */
  legL?: [number, number]
  legR?: [number, number]
  /** Horizontal squash, 1 facing us and -1 turned around. Fakes a spin. */
  flip?: number
  /**
   * Rotation of the whole body about the hip, in degrees. This is what makes a
   * cartwheel or a somersault possible at all: no arrangement of joint angles
   * can turn a figure upside down.
   */
  roll?: number
  /**
   * Whole-body scale about the hip. A figure turning over sweeps a circle the
   * radius of its own height, which no sensible viewBox can hold; tucking in as
   * it goes is both how the box stays tight and how a real cartwheel works.
   */
  scale?: number
}

/** Every pose is merged over this one, so a pose only states what it changes. */
export const REST: Required<Pose> = {
  x: 0,
  y: 0,
  torso: 0,
  head: 0,
  armL: [9, 5],
  armR: [9, 5],
  legL: [6, 0],
  legR: [6, 0],
  flip: 1,
  roll: 0,
  scale: 1,
}

export type Ease = 'smooth' | 'snap' | 'bounce'

export interface Move {
  id: string
  /** One loop in ms. The engine repeats it until the turn is used up. */
  cycle: number
  ease: Ease
  /** Drawn on the face while this move runs. */
  tear?: boolean
  poses: Pose[]
}

export type Mood = 'dance' | 'sad' | 'idle'

/* ------------------------------------------------------------------ skeleton */

const HEAD_R = 8.5
const NECK = 30
const THIGH = 20
const SHIN = 19
const UPPER_ARM = 15
const FOREARM = 14

/**
 * How thick each limb is at [root, joint, tip].
 *
 * Tapering is not decoration: a limb of one width has no knee and no ankle, so
 * a bent leg reads as a folded pipe. These are the radii the outline is built
 * from, and the joint radius is shared by both halves so they meet cleanly.
 */
const LEG_R: [number, number, number] = [4.8, 3.7, 2.9]
const ARM_R: [number, number, number] = [3.6, 2.9, 2.3]
/** Torso radius at [hip, shoulders]. Wider up top, which is where arms hang from. */
const TORSO_R: [number, number] = [6.1, 7.4]

/**
 * The whole figure lives in here, with room to jump and to throw its arms out.
 * Measured, not guessed: `scripts` in the pose check walk every pose and flag
 * anything that lands outside this box, because clipping is silent on screen.
 */
export const VIEW_BOX = '-46 -72 92 120'

/** Width to height of VIEW_BOX, so a caller can size the figure by height. */
export const ASPECT = 92 / 120

type Point = [number, number]

/** Walks `len` from a point at `deg`, where 0 is down and 90 is screen-right. */
function tip([x, y]: Point, len: number, deg: number): Point {
  const r = (deg * Math.PI) / 180
  return [x + len * Math.sin(r), y + len * Math.cos(r)]
}

const path = (points: Point[]) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

/**
 * A limb segment as a tapered capsule: the outline of the two circles at its
 * ends, joined by their common tangents.
 *
 * A stroked polyline cannot make a limb. Its width is the same at the hip and
 * at the ankle, and the corner at the knee is a mitre — which is exactly what
 * a hose looks like when you bend it, and exactly what these looked like. A
 * real leg is thick at the top and thin at the bottom, and its knee is round.
 * Drawing each bone between two radii and dropping a circle at the joint gives
 * both, and the joint circle means the two halves meet with no seam at all.
 */
export function taper(a: Point, b: Point, ra: number, rb: number): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  // Degenerate segments happen mid-blend; a bare circle is the honest answer.
  if (len < 0.01) {
    const r = Math.max(ra, rb)
    return `M${a[0]} ${a[1] - r} a${r} ${r} 0 1 0 0.01 0 Z`
  }

  // The tangents are only parallel to the segment when the radii match; the
  // angle below is what keeps the outline touching both circles when they do
  // not, which is the difference between a taper and a wedge with steps in it.
  const ux = dx / len
  const uy = dy / len
  const dr = ra - rb
  const cos = dr / len
  const sin = Math.sqrt(Math.max(0, 1 - cos * cos))

  const p = (cx: number, cy: number, r: number, s: 1 | -1): string => {
    const nx = ux * cos - s * uy * sin
    const ny = uy * cos + s * ux * sin
    return `${(cx + r * nx * -1 + 0).toFixed(2)} ${(cy + r * ny * -1).toFixed(2)}`
  }

  const a1 = p(a[0], a[1], ra, 1)
  const b1 = p(b[0], b[1], rb, 1)
  const b2 = p(b[0], b[1], rb, -1)
  const a2 = p(a[0], a[1], ra, -1)

  return (
    `M${a1} L${b1} A${rb.toFixed(2)} ${rb.toFixed(2)} 0 0 0 ${b2} ` +
    `L${a2} A${ra.toFixed(2)} ${ra.toFixed(2)} 0 0 0 ${a1} Z`
  )
}

export interface Skeleton {
  torso: string
  /** The torso as a shape: narrower at the hip, wider at the shoulders. */
  torsoShape: string
  armL: string
  armR: string
  legL: string
  legR: string
  /** Transform for the head group, so the face turns with the head. */
  head: string
  /**
   * Where the joints ended up, in the body's own coordinates — before the
   * flip and roll the drawing applies to the whole group.
   *
   * A figure made of plain strokes does not need these. One with hands, shoes
   * and sleeves does: those are shapes that have to sit exactly on the end of
   * a bone, and recomputing the kinematics in the component to find them would
   * be the same maths written twice, drifting apart the first time either copy
   * is touched.
   */
  joints: {
    hip: Point
    neck: Point
    handL: Point
    handR: Point
    footL: Point
    footR: Point
    elbowL: Point
    elbowR: Point
  }
  /** Each limb as two tapered halves plus the circle that joins them. */
  shapes: Record<
    'armL' | 'armR' | 'legL' | 'legR',
    { upper: string; lower: string; joint: Point; jointR: number }
  >
}

/** Forward kinematics: joint angles in, the five polylines to draw out. */
export function build(pose: Required<Pose>): Skeleton {
  const hip: Point = [pose.x, pose.y]
  const neck = tip(hip, NECK, 180 + pose.torso)
  const headAngle = pose.torso + pose.head
  const headCentre = tip(neck, HEAD_R + 2.5, 180 + headAngle)

  const limb = (
    root: Point,
    [upper, lower]: [number, number],
    side: -1 | 1,
    upperLen: number,
    lowerLen: number,
    base: number,
  ) => {
    const upperDeg = base + side * upper
    const joint = tip(root, upperLen, upperDeg)
    const end = tip(joint, lowerLen, upperDeg + side * lower)
    return { points: path([root, joint, end]), joint, end }
  }

  const armL = limb(neck, pose.armL, -1, UPPER_ARM, FOREARM, pose.torso)
  const armR = limb(neck, pose.armR, 1, UPPER_ARM, FOREARM, pose.torso)
  const legL = limb(hip, pose.legL, -1, THIGH, SHIN, 0)
  const legR = limb(hip, pose.legR, 1, THIGH, SHIN, 0)

  const shape = (
    root: Point,
    l: { joint: Point; end: Point },
    [r0, r1, r2]: [number, number, number],
  ) => ({
    upper: taper(root, l.joint, r0, r1),
    lower: taper(l.joint, l.end, r1, r2),
    joint: l.joint,
    jointR: r1,
  })

  return {
    torso: path([hip, neck]),
    torsoShape: taper(hip, neck, TORSO_R[0], TORSO_R[1]),
    // Arms hang off the neck and follow the torso's lean.
    armL: armL.points,
    armR: armR.points,
    // Legs hang off the hip and stay put when the torso bends.
    legL: legL.points,
    legR: legR.points,
    shapes: {
      armL: shape(neck, armL, ARM_R),
      armR: shape(neck, armR, ARM_R),
      legL: shape(hip, legL, LEG_R),
      legR: shape(hip, legR, LEG_R),
    },
    head: `translate(${headCentre[0].toFixed(1)} ${headCentre[1].toFixed(1)}) rotate(${headAngle.toFixed(1)})`,
    joints: {
      hip,
      neck,
      handL: armL.end,
      handR: armR.end,
      footL: legL.end,
      footR: legR.end,
      elbowL: armL.joint,
      elbowR: armR.joint,
    },
  }
}

export const HEAD_RADIUS = HEAD_R

const rad = (deg: number) => (deg * Math.PI) / 180

/** How far below the hip a leg reaches at these angles. */
function legReach(thigh: number, knee: number): number {
  return THIGH * Math.cos(rad(thigh)) + SHIN * Math.cos(rad(thigh + knee))
}

/** Standing on the rest pose. Anything lower has to be paid for in hip drop. */
const STANDING_REACH = legReach(REST.legL[0], REST.legL[1])

/**
 * Sitting, crouching, kneeling — with the feet left on the floor.
 *
 * Dropping the hip with `y` alone does not sit anybody down: the legs are still
 * their full length, so the whole figure sinks through the ground. Folding the
 * legs shortens their reach, and this returns the exact hip drop that folding
 * buys, so the feet land where they were standing.
 *
 *   sit(90, -90)  thighs out flat, shins straight down — sat on a chair
 *   sit(70, -140) knees up in front — sat on the floor
 */
export function sit(thigh: number, knee: number): Required<Pick<Pose, 'y' | 'legL' | 'legR'>> {
  return {
    y: STANDING_REACH - legReach(thigh, knee),
    legL: [thigh, knee],
    legR: [thigh, knee],
  }
}

/** Where a pose puts the hands and the feet. Used by the pose checks. */
export function landmarks(pose: Required<Pose>) {
  // The body group is drawn as scale(flip) rotate(roll), so a point goes
  // through the rotation first and the flip second. Without this the pose
  // check would wave a cartwheel straight through.
  const spun = ([x, y]: Point): Point => {
    const r = (pose.roll * Math.PI) / 180
    const rx = x * Math.cos(r) - y * Math.sin(r)
    const ry = x * Math.sin(r) + y * Math.cos(r)
    return [rx * pose.flip * pose.scale, ry * pose.scale]
  }

  const hip: Point = [pose.x, pose.y]
  const neck = tip(hip, NECK, 180 + pose.torso)
  const headCentre = tip(neck, HEAD_R + 2.5, 180 + pose.torso + pose.head)

  const end = (
    root: Point,
    [upper, lower]: [number, number],
    side: -1 | 1,
    a: number,
    b: number,
    base: number,
  ) => {
    const deg = base + side * upper
    return tip(tip(root, a, deg), b, deg + side * lower)
  }

  return {
    head: spun(headCentre),
    handL: spun(end(neck, pose.armL, -1, UPPER_ARM, FOREARM, pose.torso)),
    handR: spun(end(neck, pose.armR, 1, UPPER_ARM, FOREARM, pose.torso)),
    footL: spun(end(hip, pose.legL, -1, THIGH, SHIN, 0)),
    footR: spun(end(hip, pose.legR, 1, THIGH, SHIN, 0)),
    floor: STANDING_REACH,
  }
}

/* --------------------------------------------------------------- easing */

const EASES: Record<Ease, (t: number) => number> = {
  smooth: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
  // Arrives early and holds, which is what makes a movement read as mechanical.
  snap: (t) => (t >= 0.62 ? 1 : 1 - (1 - t / 0.62) ** 3),
  bounce: (t) => 1 - (1 - t) ** 2,
}

/* ---------------------------------------------------------- interpolation */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function blendPair(
  a: [number, number],
  b: [number, number],
  t: number,
): [number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
}

export function blend(a: Required<Pose>, b: Required<Pose>, t: number): Required<Pose> {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    torso: lerp(a.torso, b.torso, t),
    head: lerp(a.head, b.head, t),
    armL: blendPair(a.armL, b.armL, t),
    armR: blendPair(a.armR, b.armR, t),
    legL: blendPair(a.legL, b.legL, t),
    legR: blendPair(a.legR, b.legR, t),
    flip: lerp(a.flip, b.flip, t),
    roll: lerp(a.roll, b.roll, t),
    scale: lerp(a.scale, b.scale, t),
  }
}

/** A partial pose filled in from REST. */
export const resolve = (pose: Pose): Required<Pose> => ({ ...REST, ...pose })

/**
 * Catmull-Rom through four keyframes, centred on the middle two.
 *
 * Interpolating between neighbouring poses with a cosine ease makes the speed
 * fall to zero at every keyframe; a spline carries velocity through them
 * instead. Measured on real moves, the gain is real but modest and depends on
 * the move: on a two-pose sway the cosine was already as smooth (worst
 * frame-to-frame speed change 0.27x mean vs 0.29x), while on an eight-pose
 * routine the spline cut it by about a third (0.66x to 0.46x). So this is
 * worth having for the busier moves and costs nothing on the simple ones — it
 * is not, on its own, what makes the figures look alive. The lag below does
 * more for that.
 */
function spline(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (p3 - 3 * p2 + 3 * p1 - p0) * t3)
  )
}

type Channel = (pose: Required<Pose>) => number

/**
 * The pose a move is AIMING at, at `elapsed` ms, looping.
 *
 * This is a target, not what gets drawn — `settle` below is what the body
 * actually does with it. Poses share the cycle evenly and the loop is closed,
 * so the last one flows back into the first. `snap` keeps the old stepped
 * interpolation on purpose: it is what makes the robot read as a robot, and
 * smoothing it would cost the joke.
 */
export function poseAt(move: Move, elapsed: number): Required<Pose> {
  const poses = move.poses
  if (poses.length === 1) return resolve(poses[0])

  const resolved = poses.map(resolve)
  const n = resolved.length
  const cycle = move.cycle
  const phase = ((elapsed % cycle) + cycle) % cycle
  const step = cycle / n
  const index = Math.floor(phase / step)
  const raw = (phase - index * step) / step

  let sample: (get: Channel) => number
  if (move.ease === 'snap' || n < 3) {
    const t = EASES[move.ease](raw)
    sample = (get) => lerp(get(resolved[index]), get(resolved[(index + 1) % n]), t)
  } else {
    // Wrapping the neighbours is what keeps the seam between the last pose and
    // the first as smooth as every other joint in the loop.
    const p0 = resolved[(index - 1 + n) % n]
    const p1 = resolved[index]
    const p2 = resolved[(index + 1) % n]
    const p3 = resolved[(index + 2) % n]
    sample = (get) => spline(get(p0), get(p1), get(p2), get(p3), raw)
  }

  const pair = (get: (p: Required<Pose>) => [number, number]): [number, number] => [
    sample((p) => get(p)[0]),
    sample((p) => get(p)[1]),
  ]

  return {
    x: sample((p) => p.x),
    y: sample((p) => p.y),
    roll: sample((p) => p.roll),
    scale: sample((p) => p.scale),
    flip: sample((p) => p.flip),
    torso: sample((p) => p.torso),
    head: sample((p) => p.head),
    armL: pair((p) => p.armL),
    armR: pair((p) => p.armR),
    legL: pair((p) => p.legL),
    legR: pair((p) => p.legR),
  }
}

/* ------------------------------------------------------------------ physics */

/**
 * What the body does with the pose it is aiming at.
 *
 * Reading the animation straight onto the joints is what made these look like
 * puppets: every part arrived at every keyframe at the same instant, exactly
 * as posed, and stopped dead. Nothing on a body does that. A hand thrown
 * upwards keeps going a little past where the arm meant to stop, and comes
 * back; the head arrives after the shoulders because it is being carried, not
 * driven.
 *
 * So each channel is a damped spring chasing the animation rather than obeying
 * it. That buys three things at once and none of the poses had to change: the
 * overlap between parts, the settle at the end of a movement, and the taming
 * of poses that were written for a stick figure and are too extreme for a body
 * with weight.
 *
 * The numbers are a natural frequency in rad/s and a damping ratio. Below 1
 * the channel overshoots and comes back — which is the point — and the further
 * a part is from the floor, the looser it is allowed to be.
 */
interface Tuning {
  freq: number
  damp: number
}

const TUNING: Record<keyof Required<Pose>, Tuning> = {
  // The hips carry everything else, so they track the animation almost exactly.
  x: { freq: 30, damp: 1 },
  y: { freq: 30, damp: 1 },
  legL: { freq: 24, damp: 0.95 },
  legR: { freq: 24, damp: 0.95 },
  torso: { freq: 19, damp: 0.82 },
  armL: { freq: 14, damp: 0.68 },
  armR: { freq: 14, damp: 0.68 },
  // Carried by the shoulders, so it is the last thing to arrive and settle.
  head: { freq: 11, damp: 0.6 },
  // Whole-body effects. A spin that lagged or wobbled would read as a fault.
  flip: { freq: 30, damp: 1 },
  roll: { freq: 30, damp: 1 },
  scale: { freq: 30, damp: 1 },
}

/** A pose plus the velocity every one of its channels is carrying. */
export interface Motion {
  pose: Required<Pose>
  velocity: Required<Pose>
}

export function restingMotion(): Motion {
  return {
    pose: { ...REST, armL: [...REST.armL], armR: [...REST.armR], legL: [...REST.legL], legR: [...REST.legR] },
    velocity: { x: 0, y: 0, torso: 0, head: 0, armL: [0, 0], armR: [0, 0], legL: [0, 0], legR: [0, 0], flip: 0, roll: 0, scale: 0 },
  }
}

/** One channel, one step. Semi-implicit Euler: stable at the sizes used here. */
function spring(value: number, vel: number, target: number, dt: number, t: Tuning): [number, number] {
  const k = t.freq * t.freq
  const c = 2 * t.damp * t.freq
  const nextVel = vel + (k * (target - value) - c * vel) * dt
  return [value + nextVel * dt, nextVel]
}

/**
 * Advances the body one frame towards `target`.
 *
 * `dt` is clamped because a backgrounded tab hands back a gap of seconds, and
 * an explicit integrator given a step that large does not lag — it explodes,
 * and the figure comes back inside out.
 */
export function settle(motion: Motion, target: Required<Pose>, dtMs: number): Required<Pose> {
  const dt = Math.min(dtMs, 34) / 1000
  const { pose, velocity } = motion

  const one = (key: 'x' | 'y' | 'torso' | 'head' | 'flip' | 'roll' | 'scale') => {
    const [v, vel] = spring(pose[key], velocity[key], target[key], dt, TUNING[key])
    pose[key] = v
    velocity[key] = vel
  }
  const two = (key: 'armL' | 'armR' | 'legL' | 'legR') => {
    for (const i of [0, 1] as const) {
      const [v, vel] = spring(pose[key][i], velocity[key][i], target[key][i], dt, TUNING[key])
      pose[key][i] = v
      velocity[key][i] = vel
    }
  }

  one('x')
  one('y')
  one('torso')
  one('head')
  one('flip')
  one('roll')
  one('scale')
  two('armL')
  two('armR')
  two('legL')
  two('legR')

  return pose
}

/* ------------------------------------------------------------------ ticker */

type Tick = (now: number) => void

const listeners = new Set<Tick>()
let frame = 0

function loop(now: number) {
  for (const listener of listeners) listener(now)
  frame = requestAnimationFrame(loop)
}

/**
 * One animation frame for every figure on screen, rather than one each. With
 * six players that is one callback instead of six, and the figures stay in
 * step with each other.
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

/** How long one move holds the stage: whole loops, adding up to 5-10 seconds. */
export function turnLength(move: Move): number {
  let reps = Math.max(1, Math.round(7000 / move.cycle))
  while (reps * move.cycle < 5000) reps += 1
  while (reps > 1 && reps * move.cycle > 10000) reps -= 1
  return reps * move.cycle
}
