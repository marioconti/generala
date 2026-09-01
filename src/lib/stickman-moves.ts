import { sit, type Move } from './stickman'

/**
 * What the figure does: twenty ways to celebrate, twenty ways to take it badly.
 *
 * Read `lib/stickman.ts` first for the angle convention — 0 is down and
 * positive turns a limb outwards on both sides, so symmetric poses are written
 * with the same numbers on both arms. Every pose is merged over REST, so a pose
 * only lists the joints it actually moves.
 *
 * `cycle` is one loop. The engine repeats a move for 5-10 seconds and then
 * rotates to the next one, so a cycle is deliberately much shorter than a turn.
 */

export const DANCES: Move[] = [
  {
    // Every joint arrives early and holds. That hold is the whole illusion.
    id: 'robot',
    cycle: 1600,
    ease: 'snap',
    poses: [
      { armR: [90, 88], head: -14 },
      { armR: [90, 88], armL: [90, 88], head: 14 },
      { armL: [90, 88], armR: [9, 5], head: -14 },
      { head: 0 },
    ],
  },
  {
    // Slides one way and back, so the loop does not teleport him home.
    id: 'moonwalk',
    cycle: 2000,
    ease: 'smooth',
    poses: [
      { x: 7, torso: -5, legR: [20, 0], legL: [-12, 34], armR: [16, 10], armL: [12, 8] },
      { x: 2, torso: -4, legR: [7, 0], legL: [4, 26] },
      { x: -3, torso: -5, legL: [20, 0], legR: [-12, 34] },
      { x: -7, torso: -4, legL: [7, 0], legR: [4, 26] },
      { x: -2, torso: -3, legL: [12, 10], legR: [8, 18] },
      { x: 3, torso: -4, legR: [14, 6], legL: [6, 12] },
    ],
  },
  {
    // The Smooth Criminal lean: the whole body tips further than it should and
    // holds there, which is why the legs stay planted while the torso goes.
    id: 'lean',
    cycle: 2600,
    ease: 'smooth',
    poses: [
      { torso: 2, armR: [14, 8], armL: [14, 8] },
      { torso: 20, armR: [18, 6], armL: [16, 6], legL: [12, 0], legR: [2, 0] },
      { torso: 29, armR: [20, 4], armL: [18, 4], legL: [14, 0], legR: [1, 0], head: -6 },
      { torso: 8, armR: [14, 8], armL: [14, 8], legL: [8, 0] },
    ],
  },
  {
    id: 'kick-spin',
    cycle: 1600,
    ease: 'smooth',
    poses: [
      { legR: [62, 12], armL: [120, 24], armR: [44, 12], torso: -9 },
      { legR: [8, 0], armL: [80, 10], flip: 0.25, head: 18 },
      { flip: -1, armR: [104, 0], armL: [104, 0] },
      { flip: 0.3, armR: [40, 10], armL: [40, 10] },
    ],
  },
  {
    // Travolta: one finger up on the diagonal, then down across the body.
    id: 'disco',
    cycle: 1400,
    ease: 'snap',
    poses: [
      { armR: [152, 12], armL: [34, 62], torso: 7, legR: [16, 0], head: 8 },
      { armR: [44, 24], armL: [104, 34], torso: -7, legL: [16, 0], head: -8 },
    ],
  },
  {
    id: 'sprinkler',
    cycle: 1800,
    ease: 'smooth',
    poses: [
      { armR: [92, 0], armL: [138, 86], legL: [10, 14], legR: [10, 14] },
      { armR: [150, 0], armL: [138, 86], legL: [6, 4], legR: [6, 4] },
      { armR: [34, 0], armL: [138, 86], legL: [10, 14], legR: [10, 14] },
      { armR: [92, 0], armL: [138, 86] },
    ],
  },
  {
    id: 'running-man',
    cycle: 900,
    ease: 'smooth',
    poses: [
      { legR: [46, 74], legL: [-16, 8], armL: [46, 74], armR: [-24, 30], torso: -4 },
      { legL: [46, 74], legR: [-16, 8], armR: [46, 74], armL: [-24, 30], torso: -4 },
    ],
  },
  {
    id: 'twist',
    cycle: 1200,
    ease: 'smooth',
    poses: [
      { flip: 0.55, torso: 9, legL: [16, 22], legR: [16, 22], armR: [56, 30], armL: [24, 40], y: 3 },
      { flip: 1, torso: 0, legL: [10, 12], legR: [10, 12], y: 0 },
      { flip: 0.55, torso: -9, legL: [16, 22], legR: [16, 22], armL: [56, 30], armR: [24, 40], y: 3 },
      { flip: 1, torso: 0, legL: [10, 12], legR: [10, 12], y: 0 },
    ],
  },
  {
    id: 'floss',
    cycle: 800,
    ease: 'snap',
    poses: [
      { armR: [64, 0], armL: [-64, 0], x: 5, torso: -8, legR: [12, 0] },
      { armR: [-64, 0], armL: [64, 0], x: -5, torso: 8, legL: [12, 0] },
    ],
  },
  {
    id: 'shuffle',
    cycle: 720,
    ease: 'snap',
    poses: [
      { legL: [30, -18], legR: [30, -18], armR: [26, 16], armL: [26, 16], y: -2 },
      { legL: [2, 6], legR: [2, 6], armR: [12, 8], armL: [12, 8], y: 1 },
    ],
  },
  {
    // Runs up one arm, across, and out the other.
    id: 'wave',
    cycle: 1700,
    ease: 'smooth',
    poses: [
      { armR: [96, 60], armL: [12, 6], torso: 5 },
      { armR: [150, 10], armL: [40, 40], torso: 2 },
      { armR: [96, 20], armL: [96, 60], torso: -2 },
      { armR: [40, 40], armL: [150, 10], torso: -5 },
      { armR: [12, 6], armL: [96, 20], torso: 0 },
    ],
  },
  {
    id: 'jump-clap',
    cycle: 1000,
    ease: 'bounce',
    poses: [
      { y: -15, armR: [132, 12], armL: [132, 12], legL: [16, 26], legR: [16, 26] },
      { ...sit(38, -34), armR: [30, 8], armL: [30, 8], torso: 4 },
      { y: 0, armR: [70, 20], armL: [70, 20] },
    ],
  },
  {
    id: 'charleston',
    cycle: 1200,
    ease: 'smooth',
    poses: [
      { legR: [30, -26], legL: [4, 8], armL: [66, 26], armR: [-16, 18], torso: 5 },
      { legL: [30, -26], legR: [4, 8], armR: [66, 26], armL: [-16, 18], torso: -5 },
    ],
  },
  {
    id: 'pogo',
    cycle: 700,
    ease: 'bounce',
    poses: [
      { y: -17, legL: [8, 18], legR: [8, 18], armR: [124, 12], armL: [124, 12] },
      { ...sit(34, -30), armR: [104, 22], armL: [104, 22] },
    ],
  },
  {
    id: 'hip-swing',
    cycle: 1500,
    ease: 'smooth',
    poses: [
      { x: 7, torso: -8, legR: [18, 4], legL: [-2, 6], armR: [26, 14], armL: [16, 10] },
      { x: -7, torso: 8, legL: [18, 4], legR: [-2, 6], armL: [26, 14], armR: [16, 10] },
    ],
  },
  {
    id: 'air-guitar',
    cycle: 1000,
    ease: 'snap',
    poses: [
      { armL: [104, 74], armR: [58, 46], torso: -8, head: -12, legR: [22, 8] },
      { armL: [104, 74], armR: [22, 74], torso: -4, head: 8, legR: [22, 8] },
      { armL: [104, 74], armR: [70, 30], torso: -10, head: -14, legR: [26, 12] },
    ],
  },
  {
    id: 'two-step',
    cycle: 1300,
    ease: 'smooth',
    poses: [
      { x: 6, legR: [26, 0], legL: [4, 6], armR: [138, 66], armL: [20, 14], head: 8 },
      { x: 0, legR: [8, 0], legL: [8, 0], armR: [110, 40], armL: [24, 16] },
      { x: -6, legL: [26, 0], legR: [4, 6], armL: [138, 66], armR: [20, 14], head: -8 },
      { x: 0, legL: [8, 0], legR: [8, 0], armL: [110, 40], armR: [24, 16] },
    ],
  },
  {
    // A full turn, faked by squashing him flat and back out the other side.
    id: 'spin',
    cycle: 1400,
    ease: 'smooth',
    poses: [
      { flip: 1, armR: [88, 0], armL: [88, 0], legR: [10, 0] },
      { flip: 0.05, armR: [92, 0], armL: [92, 0], y: -4 },
      { flip: -1, armR: [88, 0], armL: [88, 0] },
      { flip: -0.05, armR: [92, 0], armL: [92, 0], y: -4 },
    ],
  },
  {
    id: 'ymca',
    cycle: 2600,
    ease: 'snap',
    poses: [
      { armR: [148, 22], armL: [148, 22] },
      { armR: [96, 84], armL: [50, 96], torso: 4 },
      { armR: [116, 62], armL: [150, 50] },
      { armR: [162, 4], armL: [40, 84], torso: -4 },
    ],
  },
  {
    id: 'strut',
    cycle: 1400,
    ease: 'smooth',
    poses: [
      { legR: [34, 56], legL: [-8, 4], armL: [52, 66], armR: [-16, 20], torso: 3, head: 6 },
      { legL: [34, 56], legR: [-8, 4], armR: [52, 66], armL: [-16, 20], torso: -3, head: -6 },
    ],
  },
]

export const SORROWS: Move[] = [
  {
    // Sat down, elbows on knees, head hanging. Only the breathing moves.
    id: 'sit-sad',
    cycle: 2800,
    ease: 'smooth',
    poses: [
      { ...sit(88, -88), torso: 8, head: 26, armL: [42, 40], armR: [42, 40] },
      { ...sit(88, -88), torso: 11, head: 30, armL: [40, 44], armR: [40, 44] },
    ],
  },
  {
    id: 'cry',
    cycle: 1300,
    ease: 'smooth',
    tear: true,
    poses: [
      { armR: [154, 96], armL: [154, 96], torso: 9, head: 14, ...sit(20, -20) },
      { armR: [156, 100], armL: [156, 100], torso: 13, head: 18, ...sit(38, -38) },
    ],
  },
  {
    id: 'head-hands',
    cycle: 2200,
    ease: 'smooth',
    poses: [
      { armR: [160, 92], armL: [160, 92], torso: 5, head: 12 },
      { armR: [160, 92], armL: [160, 92], torso: -5, head: 12 },
    ],
  },
  {
    id: 'slump',
    cycle: 3200,
    ease: 'smooth',
    poses: [
      { torso: 7, head: 22, armR: [-6, 22], armL: [-6, 22], ...sit(30, -26) },
      { torso: 9, head: 25, armR: [-8, 26], armL: [-8, 26], ...sit(42, -38) },
    ],
  },
  {
    id: 'facepalm',
    cycle: 2400,
    ease: 'smooth',
    poses: [
      { armR: [12, 8], head: 6, torso: 3 },
      { armR: [158, 104], head: 16, torso: 8 },
      { armR: [158, 108], head: 20, torso: 10 },
    ],
  },
  {
    id: 'kick-dirt',
    cycle: 2000,
    ease: 'smooth',
    poses: [
      { legR: [8, 0], torso: 6, head: 18, armR: [-4, 14], armL: [-4, 14] },
      { legR: [30, -22], torso: 8, head: 20 },
      { legR: [-6, 10], torso: 5, head: 16 },
    ],
  },
  {
    id: 'shrug',
    cycle: 1900,
    ease: 'snap',
    poses: [
      { armR: [78, 96], armL: [78, 96], head: 4, y: 0 },
      { armR: [86, 104], armL: [86, 104], head: -6, y: -3 },
    ],
  },
  {
    id: 'pace',
    cycle: 2800,
    ease: 'smooth',
    poses: [
      { x: 8, torso: 4, head: 16, legR: [24, 22], legL: [-10, 6], armR: [10, 40], armL: [10, 40] },
      { x: 0, torso: 5, head: 18, legR: [8, 4], legL: [8, 4] },
      { x: -8, torso: 4, head: 16, legL: [24, 22], legR: [-10, 6] },
      { x: 0, torso: 5, head: 18, legL: [8, 4], legR: [8, 4] },
    ],
  },
  {
    id: 'nail-bite',
    cycle: 1500,
    ease: 'smooth',
    poses: [
      { armR: [162, 96], armL: [-8, 26], head: -14, torso: 3 },
      { armR: [164, 100], armL: [-8, 26], head: -10, torso: 4 },
    ],
  },
  {
    id: 'arms-crossed',
    cycle: 2200,
    ease: 'snap',
    poses: [
      { armR: [40, 122], armL: [40, 122], head: 8, legR: [8, 0] },
      { armR: [40, 122], armL: [40, 122], head: 8, legR: [16, -30] },
    ],
  },
  {
    id: 'look-away',
    cycle: 2900,
    ease: 'smooth',
    poses: [
      { head: -24, torso: -3, armR: [8, 16], armL: [8, 16] },
      { head: 6, torso: 2 },
      { head: 26, torso: 3 },
      { head: 6, torso: 0 },
    ],
  },
  {
    // Air goes out of him, and comes back in only to go out again.
    id: 'deflate',
    cycle: 3400,
    ease: 'smooth',
    poses: [
      { y: -3, torso: 0, head: -6, armR: [16, 6], armL: [16, 6] },
      { torso: 10, head: 26, armR: [-8, 32], armL: [-8, 32], ...sit(44, -40) },
      { torso: 12, head: 28, armR: [-10, 36], armL: [-10, 36], ...sit(52, -48) },
    ],
  },
  {
    id: 'hug-knees',
    cycle: 2800,
    ease: 'smooth',
    tear: true,
    poses: [
      { ...sit(64, -136), torso: 13, head: 26, armL: [-14, -66], armR: [-14, -66] },
      { ...sit(64, -136), torso: -1, head: 29, armL: [-16, -70], armR: [-16, -70] },
    ],
  },
  {
    id: 'wipe-tear',
    cycle: 2400,
    ease: 'smooth',
    tear: true,
    poses: [
      { armR: [10, 10], head: 12, torso: 5 },
      { armR: [150, 108], head: 6, torso: 3 },
      { armR: [150, 96], head: -4, torso: 2 },
      { armR: [12, 12], head: 14, torso: 6 },
    ],
  },
  {
    // Looks over at the sheet, then wishes he had not.
    id: 'check-sheet',
    cycle: 2700,
    ease: 'smooth',
    poses: [
      { head: -26, torso: -6, armR: [8, 12], armL: [8, 12] },
      { head: -20, torso: -4 },
      { head: 22, torso: 8, armR: [-6, 28], armL: [-6, 28] },
    ],
  },
  {
    id: 'hands-hips',
    cycle: 2600,
    ease: 'smooth',
    poses: [
      { armR: [54, 118], armL: [54, 118], head: -22, torso: -6 },
      { armR: [54, 118], armL: [54, 118], head: 20, torso: 6 },
    ],
  },
  {
    id: 'kneel',
    cycle: 3000,
    ease: 'smooth',
    poses: [
      { torso: 6, head: 16, legL: [8, 8], legR: [8, 8], armR: [-4, 18], armL: [-4, 18] },
      { y: 7.8, torso: 10, head: 22, legL: [6, 84], legR: [40, -6], armR: [-6, 24], armL: [-6, 24] },
      { y: 8.8, torso: 13, head: 26, legL: [4, 90], legR: [44, -8] },
    ],
  },
  {
    id: 'scratch-head',
    cycle: 2300,
    ease: 'smooth',
    poses: [
      { armR: [166, 76], head: -12, torso: 4 },
      { armR: [172, 88], head: -6, torso: 2 },
      { armR: [166, 76], head: -14, torso: 5 },
    ],
  },
  {
    // Doing nothing, on purpose. Next to four dancers it reads as defeat.
    id: 'stare',
    cycle: 3400,
    ease: 'smooth',
    poses: [
      { head: 8, torso: 2, armR: [6, 10], armL: [6, 10], y: 1 },
      { head: 9, torso: 2, armR: [7, 11], armL: [7, 11], y: 3 },
    ],
  },
  {
    id: 'fetal',
    cycle: 3000,
    ease: 'smooth',
    tear: true,
    poses: [
      { ...sit(78, -158), torso: 24, head: 30, armL: [-22, -76], armR: [-22, -76] },
      { ...sit(78, -158), torso: -5, head: 32, armL: [-24, -80], armR: [-24, -80] },
    ],
  },
]

/** Nobody is winning yet. Standing there, breathing. */
export const IDLE: Move[] = [
  {
    id: 'idle',
    cycle: 3600,
    ease: 'smooth',
    poses: [
      { y: 0, armR: [9, 5], armL: [9, 5], head: 0 },
      { y: 2, armR: [10, 7], armL: [10, 7], head: 2 },
    ],
  },
]
