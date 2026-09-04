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

export interface Skeleton {
  torso: string
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

  return {
    torso: path([hip, neck]),
    // Arms hang off the neck and follow the torso's lean.
    armL: armL.points,
    armR: armR.points,
    // Legs hang off the hip and stay put when the torso bends.
    legL: legL.points,
    legR: legR.points,
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
type PairChannel = (pose: Required<Pose>) => [number, number]

/**
 * How far behind the hips each part runs, as a fraction of one loop.
 *
 * Real bodies do not move all at once: the hips lead, the shoulders follow,
 * the head arrives last. Sampling the same animation a few milliseconds late
 * for the parts further from the ground buys that overlap for nothing — no
 * pose had to be rewritten, and every move in the file got looser at once.
 */
const LAG = {
  torso: 0.03,
  arms: 0.07,
  head: 0.11,
} as const

/**
 * The pose a move is in at `elapsed` ms, looping.
 *
 * Poses share the cycle evenly and the loop is closed, so the last one flows
 * back into the first. `snap` keeps the old stepped interpolation on purpose:
 * it is what makes the robot read as a robot, and smoothing it would cost the
 * joke.
 */
export function poseAt(move: Move, elapsed: number): Required<Pose> {
  const poses = move.poses
  if (poses.length === 1) return resolve(poses[0])

  const resolved = poses.map(resolve)
  const n = resolved.length
  const cycle = move.cycle
  const stepped = move.ease === 'snap' || n < 3

  /** Samples one channel at a phase of its own, so parts can lag behind. */
  const at = (lag: number) => {
    const phase = (((elapsed - lag * cycle) % cycle) + cycle) % cycle
    const step = cycle / n
    const index = Math.floor(phase / step)
    const raw = (phase - index * step) / step

    if (stepped) {
      const t = EASES[move.ease](raw)
      return (get: Channel) => lerp(get(resolved[index]), get(resolved[(index + 1) % n]), t)
    }

    // Wrapping the neighbours is what keeps the seam between the last pose and
    // the first as smooth as every other joint in the loop.
    const p0 = resolved[(index - 1 + n) % n]
    const p1 = resolved[index]
    const p2 = resolved[(index + 1) % n]
    const p3 = resolved[(index + 2) % n]
    return (get: Channel) => spline(get(p0), get(p1), get(p2), get(p3), raw)
  }

  const body = at(0)
  const torso = at(LAG.torso)
  const arms = at(LAG.arms)
  const head = at(LAG.head)

  const pair = (sample: ReturnType<typeof at>, get: PairChannel): [number, number] => [
    sample((p) => get(p)[0]),
    sample((p) => get(p)[1]),
  ]

  return {
    x: body((p) => p.x),
    y: body((p) => p.y),
    roll: body((p) => p.roll),
    scale: body((p) => p.scale),
    flip: body((p) => p.flip),
    // Legs drive the body, so they stay on the beat with the hips.
    legL: pair(body, (p) => p.legL),
    legR: pair(body, (p) => p.legR),
    torso: torso((p) => p.torso),
    armL: pair(arms, (p) => p.armL),
    armR: pair(arms, (p) => p.armR),
    head: head((p) => p.head),
  }
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
