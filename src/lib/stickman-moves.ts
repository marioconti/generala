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
      { armR: [90, 88], head: -14, legR: [24, 0], legL: [4, 0], x: 3 },
      { armR: [90, 88], armL: [90, 88], head: 14, legR: [4, 0], legL: [24, 0], x: -3 },
      { armL: [90, 88], armR: [9, 5], head: -14, legR: [24, 0], legL: [4, 0], x: 3 },
      { head: 0, legL: [10, 0], legR: [10, 0], x: 0 },
    ],
  },
  {
    // Slides one way and back, so the loop does not teleport him home.
    id: 'moonwalk',
    cycle: 1500,
    ease: 'smooth',
    poses: [
      { x: 8, torso: -6, legR: [26, 0], legL: [-16, 48], armR: [18, 12], armL: [12, 8] },
      { x: 3, torso: -5, legR: [8, 0], legL: [2, 36] },
      { x: -3, torso: -6, legL: [26, 0], legR: [-16, 48] },
      { x: -8, torso: -5, legL: [8, 0], legR: [2, 36] },
      { x: -2, torso: -4, legL: [15, 13], legR: [10, 22] },
      { x: 4, torso: -5, legR: [17, 9], legL: [8, 15] },
    ],
  },
  {
    // The Smooth Criminal lean: the whole body tips further than it should and
    // holds there, which is why the legs stay planted while the torso goes.
    id: 'lean',
    cycle: 2600,
    ease: 'smooth',
    poses: [
      { torso: 2, armR: [14, 8], armL: [14, 8], legR: [16, 0], x: 3 },
      { torso: -5, armR: [150, 96], armL: [20, 10], head: -9, x: -4, legL: [18, 0] },
      { torso: 20, armR: [18, 6], armL: [16, 6], legL: [14, 0], legR: [2, 0], x: 2 },
      { torso: 30, armR: [20, 4], armL: [18, 4], legL: [17, 0], legR: [1, 0], head: -6, x: 5 },
      { torso: 5, armR: [44, 34], armL: [44, 34], legL: [8, 0], x: 0, y: -4 },
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
    cycle: 1250,
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
      { flip: 0.55, torso: 10, legL: [26, 30], legR: [5, 16], armR: [58, 32], armL: [24, 42], y: 4 },
      { flip: 1, torso: 0, legL: [12, 14], legR: [12, 14], y: 0 },
      { flip: 0.55, torso: -10, legL: [5, 16], legR: [26, 30], armL: [58, 32], armR: [24, 42], y: 4 },
      { flip: 1, torso: 0, legL: [12, 14], legR: [12, 14], y: 0 },
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
    cycle: 700,
    ease: 'snap',
    poses: [
      { legL: [42, -32], legR: [42, -32], armR: [36, 20], armL: [36, 20], y: -5, x: 3 },
      { legL: [-8, 32], legR: [28, 8], armR: [16, 10], armL: [48, 26], y: 3, x: -3, torso: 6 },
      { legL: [42, -32], legR: [42, -32], armR: [48, 26], armL: [16, 10], y: -5, x: -3 },
      { legL: [28, 8], legR: [-8, 32], armR: [36, 20], armL: [36, 20], y: 3, x: 3, torso: -6 },
    ],
  },
  {
    // Runs up one arm, across, and out the other.
    id: 'wave',
    cycle: 1700,
    ease: 'smooth',
    poses: [
      { armR: [96, 60], armL: [12, 6], torso: 5, legR: [20, 16], legL: [6, 2], y: 3 },
      { armR: [150, 10], armL: [40, 40], torso: 2, legR: [10, 6], legL: [10, 6], y: -4 },
      { armR: [96, 20], armL: [96, 60], torso: -2, legR: [6, 2], legL: [20, 16], y: 3 },
      { armR: [40, 40], armL: [150, 10], torso: -5, legR: [10, 6], legL: [10, 6], y: -4 },
      { armR: [12, 6], armL: [96, 20], torso: 0, legL: [15, 11], legR: [15, 11], y: 2 },
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
    cycle: 1150,
    ease: 'smooth',
    poses: [
      { torso: -13, legR: [26, 6], legL: [-5, 9], armR: [32, 18], armL: [12, 8], head: 9, y: 3 },
      { torso: 13, legL: [26, 6], legR: [-5, 9], armL: [32, 18], armR: [12, 8], head: -9, y: 3 },
    ],
  },
  {
    id: 'air-guitar',
    cycle: 900,
    ease: 'snap',
    poses: [
      { armL: [108, 78], armR: [70, 40], torso: -11, head: -22, legR: [32, 22], legL: [4, 0], y: -3 },
      { armL: [108, 78], armR: [16, 80], torso: -2, head: 18, legR: [8, 0], legL: [16, 14], y: 3 },
      { armL: [112, 86], armR: [78, 24], torso: -13, head: -26, legR: [36, 28], legL: [2, 0], y: -5 },
      { armL: [108, 78], armR: [22, 72], torso: -3, head: 14, legR: [10, 4], legL: [18, 18], y: 2 },
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
    cycle: 2100,
    ease: 'snap',
    poses: [
      { armR: [148, 22], armL: [148, 22], y: -5, legL: [14, 10], legR: [14, 10] },
      { armR: [96, 84], armL: [50, 96], torso: 4, y: 2, legL: [8, 4], legR: [20, 14] },
      { armR: [116, 62], armL: [150, 50], y: -4, legL: [16, 12], legR: [16, 12] },
      { armR: [162, 4], armL: [40, 84], torso: -4, y: 2, legL: [20, 14], legR: [8, 4] },
    ],
  },
  {
    id: 'strut',
    cycle: 1150,
    ease: 'smooth',
    poses: [
      { legR: [22, 12], legL: [-12, 6], armR: [62, 114], armL: [50, 104], torso: -8, head: 13, y: -3, x: 3 },
      { legL: [22, 12], legR: [-12, 6], armR: [50, 104], armL: [62, 114], torso: -5, head: -13, y: -1, x: -3 },
    ],
  },
  {
    // Ballet: down through a deep plie and back up, arms through the crown.
    id: 'plie',
    cycle: 1900,
    ease: 'smooth',
    poses: [
      { ...sit(58, -50), armR: [96, 30], armL: [96, 30], torso: 0, head: 6 },
      { ...sit(78, -70), armR: [150, 26], armL: [150, 26], head: -8 },
      { legL: [30, 0], legR: [30, 0], armR: [110, 16], armL: [110, 16], y: -6, head: 4 },
      { ...sit(66, -58), armR: [70, 40], armL: [70, 40] },
    ],
  },
  {
    // Down on the knees, hands there for balance, hips doing the work.
    id: 'twerk',
    cycle: 460,
    ease: 'snap',
    poses: [
      { ...sit(62, -54), torso: 26, head: -22, armR: [56, 74], armL: [56, 74] },
      { ...sit(74, -66), torso: 12, head: -12, armR: [50, 66], armL: [50, 66], y: 3 },
    ],
  },
  {
    // Grand jete: both legs thrown open in the air, arms wide.
    id: 'grand-jete',
    cycle: 1500,
    ease: 'smooth',
    poses: [
      { ...sit(54, -46), armR: [40, 20], armL: [40, 20], torso: -4 },
      { y: -16, legR: [64, 8], legL: [-58, -6], armR: [104, 8], armL: [104, 8], torso: -6 },
      { y: -14, legR: [70, 4], legL: [-64, -4], armR: [112, 4], armL: [112, 4], torso: -4 },
      { ...sit(48, -42), armR: [56, 34], armL: [56, 34], torso: 4 },
    ],
  },
  {
    // Aerobics class: star jumps, and the grin of somebody enjoying it.
    id: 'aerobics',
    cycle: 760,
    ease: 'bounce',
    poses: [
      { y: -11, legR: [34, 0], legL: [34, 0], armR: [156, 8], armL: [156, 8] },
      { ...sit(20, -18), legR: [7, 0], legL: [7, 0], armR: [10, 6], armL: [10, 6] },
    ],
  },
  {
    // Artistic gymnastics: a tuck jump, knees snapped up to the chest.
    id: 'tuck-jump',
    cycle: 1000,
    ease: 'bounce',
    poses: [
      { ...sit(52, -44), armR: [30, 16], armL: [30, 16], torso: -6 },
      { y: -18, legR: [66, -118], legL: [66, -118], armR: [66, 96], armL: [66, 96], torso: 4 },
      { y: -12, legR: [40, -80], legL: [40, -80], armR: [96, 40], armL: [96, 40] },
      { ...sit(44, -38), armR: [40, 26], armL: [40, 26], torso: -3 },
    ],
  },
  {
    // A cartwheel, which is the whole reason the rig can roll at all.
    id: 'cartwheel',
    cycle: 1600,
    ease: 'smooth',
    poses: [
      { roll: 0, legR: [26, 0], legL: [-8, 6], armR: [140, 10], armL: [40, 10], torso: 8 },
      { roll: -96, y: -2, scale: 0.71, legR: [40, 0], legL: [-40, 0], armR: [150, 0], armL: [150, 0] },
      { roll: -186, y: -4, scale: 0.72, legR: [34, 0], legL: [-34, 0], armR: [160, 0], armL: [160, 0] },
      { roll: -274, y: -2, scale: 0.71, legR: [40, 0], legL: [-40, 0], armR: [150, 0], armL: [150, 0] },
      { roll: -360, legL: [26, 0], legR: [-8, 6], armL: [140, 10], armR: [40, 10], torso: -8 },
    ],
  },
  {
    // And a somersault, tucked, which is the same trick with the knees in.
    id: 'somersault',
    cycle: 1400,
    ease: 'smooth',
    poses: [
      { ...sit(50, -44), armR: [40, 20], armL: [40, 20], roll: 0 },
      { roll: -130, y: -10, scale: 0.84, legR: [76, -150], legL: [76, -150], armR: [30, 128], armL: [30, 128] },
      { roll: -250, y: -12, scale: 0.66, legR: [80, -156], legL: [80, -156], armR: [26, 134], armL: [26, 134] },
      { roll: -360, y: -3, scale: 0.9, legR: [34, -20], legL: [34, -20], armR: [96, 40], armL: [96, 40] },
    ],
  },
]

export const SORROWS: Move[] = [
  {
    // Sat down, elbows on knees, head hanging. Only the breathing moves.
    id: 'sit-sad',
    cycle: 4200,
    ease: 'smooth',
    poses: [
      { ...sit(88, -88), torso: 8, head: 26, armL: [42, 40], armR: [42, 40] },
      { ...sit(88, -88), torso: 15, head: 33, armL: [34, 54], armR: [34, 54] },
      { ...sit(88, -88), torso: 1, head: 11, armL: [50, 28], armR: [50, 28] },
    ],
  },
  {
    id: 'cry',
    cycle: 2200,
    ease: 'smooth',
    tear: true,
    poses: [
      { armR: [154, 96], armL: [154, 96], torso: 9, head: 14, ...sit(20, -20) },
      { armR: [156, 100], armL: [156, 100], torso: 13, head: 18, ...sit(38, -38) },
    ],
  },
  {
    id: 'head-hands',
    cycle: 3400,
    ease: 'smooth',
    poses: [
      { armR: [160, 92], armL: [160, 92], torso: 5, head: 12 },
      { armR: [160, 92], armL: [160, 92], torso: -5, head: 12 },
    ],
  },
  {
    id: 'slump',
    cycle: 4400,
    ease: 'smooth',
    poses: [
      { torso: 13, head: 24, armR: [-6, 22], armL: [-6, 22], ...sit(30, -26), x: 4 },
      { torso: -7, head: 27, armR: [-9, 27], armL: [-9, 27], ...sit(36, -32), x: -4 },
    ],
  },
  {
    id: 'facepalm',
    cycle: 4000,
    ease: 'smooth',
    poses: [
      { armR: [12, 8], head: 6, torso: 3 },
      { armR: [158, 104], head: 16, torso: 8 },
      { armR: [158, 108], head: 20, torso: 10 },
    ],
  },
  {
    id: 'kick-dirt',
    cycle: 3600,
    ease: 'smooth',
    poses: [
      { legR: [8, 0], torso: 7, head: 19, armR: [-4, 14], armL: [-4, 14] },
      { legR: [46, -34], torso: 11, head: 23, x: -3, y: -2 },
      { legR: [-12, 16], torso: 5, head: 15, x: 3 },
    ],
  },
  {
    id: 'shrug',
    cycle: 3000,
    ease: 'snap',
    poses: [
      { armR: [78, 96], armL: [78, 96], head: 4, y: 0 },
      { armR: [86, 104], armL: [86, 104], head: -6, y: -3 },
    ],
  },
  {
    id: 'pace',
    cycle: 4400,
    ease: 'smooth',
    poses: [
      { x: 8, torso: 4, head: 16, legR: [24, 22], legL: [-10, 6], armR: [156, 84], armL: [156, 84] },
      { x: 0, torso: 6, head: 20, legR: [8, 4], legL: [8, 4], armR: [150, 92], armL: [150, 92] },
      { x: -8, torso: 4, head: 16, legL: [24, 22], legR: [-10, 6], armR: [156, 84], armL: [156, 84] },
      { x: 0, torso: 7, head: 21, legL: [8, 4], legR: [8, 4], armR: [150, 92], armL: [150, 92] },
    ],
  },
  {
    id: 'nail-bite',
    cycle: 4200,
    ease: 'smooth',
    poses: [
      { armR: [162, 96], armL: [-8, 26], head: -15, torso: 3 },
      { armR: [158, 103], armL: [-9, 29], head: -6, torso: 5, y: 2 },
      { armR: [160, 99], armL: [-8, 27], head: -18, torso: 4 },
    ],
  },
  {
    id: 'arms-crossed',
    cycle: 2600,
    ease: 'snap',
    poses: [
      { armR: [40, 122], armL: [40, 122], head: 11, legR: [10, 0], torso: 4 },
      { armR: [40, 122], armL: [40, 122], head: 6, legR: [28, -58], torso: 2, y: -2 },
    ],
  },
  {
    id: 'look-away',
    cycle: 4000,
    ease: 'smooth',
    poses: [
      { head: -33, torso: -7, armR: [8, 16], armL: [8, 16], x: -3 },
      { head: 8, torso: 3, armR: [15, 25], armL: [15, 25], y: 3 },
      { head: 35, torso: 6, armR: [10, 18], armL: [10, 18], x: 3 },
      { head: 4, torso: -2, armR: [17, 27], armL: [17, 27], y: 2 },
    ],
  },
  {
    // Air goes out of him, and comes back in only to go out again.
    id: 'deflate',
    cycle: 4600,
    ease: 'smooth',
    poses: [
      { y: -3, torso: 0, head: -6, armR: [16, 6], armL: [16, 6] },
      { torso: 10, head: 26, armR: [-8, 32], armL: [-8, 32], ...sit(44, -40) },
      { torso: 12, head: 28, armR: [-10, 36], armL: [-10, 36], ...sit(52, -48) },
    ],
  },
  {
    id: 'hug-knees',
    cycle: 4000,
    ease: 'smooth',
    tear: true,
    poses: [
      { ...sit(64, -136), torso: 13, head: 26, armL: [-14, -66], armR: [-14, -66] },
      { ...sit(64, -136), torso: -1, head: 29, armL: [-16, -70], armR: [-16, -70] },
    ],
  },
  {
    id: 'wipe-tear',
    cycle: 4200,
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
    cycle: 4600,
    ease: 'smooth',
    poses: [
      { torso: -15, head: -29, armR: [32, 62], armL: [10, 20], x: -3 },
      { torso: -19, head: -33, armR: [42, 72], armL: [12, 22], x: -5 },
      { torso: 17, head: 27, armR: [150, 100], armL: [-8, 30], x: 3 },
      { torso: 12, head: 23, armR: [140, 96], armL: [-6, 26], x: 1 },
    ],
  },
  {
    id: 'hands-hips',
    cycle: 3800,
    ease: 'smooth',
    poses: [
      { armR: [54, 118], armL: [54, 118], head: -26, torso: -10, y: -3 },
      { armR: [54, 118], armL: [54, 118], head: 27, torso: 11, ...sit(26, -22) },
    ],
  },
  {
    id: 'kneel',
    cycle: 4400,
    ease: 'smooth',
    poses: [
      { torso: 6, head: 16, legL: [8, 8], legR: [8, 8], armR: [-4, 18], armL: [-4, 18] },
      { y: 7.8, torso: 10, head: 22, legL: [6, 84], legR: [40, -6], armR: [-6, 24], armL: [-6, 24] },
      { y: 8.8, torso: 13, head: 26, legL: [4, 90], legR: [44, -8] },
    ],
  },
  {
    id: 'scratch-head',
    cycle: 4000,
    ease: 'smooth',
    poses: [
      { armR: [168, 74], armL: [58, 112], head: -15, torso: 5, legR: [20, 0] },
      { armR: [176, 92], armL: [58, 112], head: 9, torso: -5, legR: [6, 0] },
      { armR: [40, 30], armL: [58, 112], head: 21, torso: 9, legL: [20, 0], y: 3 },
    ],
  },
  {
    // Doing nothing, on purpose. Next to four dancers it reads as defeat.
    id: 'stare',
    cycle: 4600,
    ease: 'smooth',
    poses: [
      { head: 8, torso: 2, armR: [6, 10], armL: [6, 10], y: 1 },
      { head: 9, torso: 2, armR: [7, 11], armL: [7, 11], y: 3 },
    ],
  },
  {
    id: 'fetal',
    cycle: 4400,
    ease: 'smooth',
    tear: true,
    poses: [
      { ...sit(84, -168), torso: 31, head: 32, armL: [-26, -84], armR: [-26, -84] },
      { ...sit(84, -168), torso: -15, head: 34, armL: [-28, -88], armR: [-28, -88] },
    ],
  },
  {
    // Gets up, stands there, gives up and sits back down. The whole cycle is
    // one long shrug at the scoresheet.
    id: 'up-and-down',
    cycle: 5200,
    ease: 'smooth',
    poses: [
      { ...sit(88, -88), torso: 10, head: 26, armL: [40, 42], armR: [40, 42] },
      { ...sit(60, -54), torso: 18, head: 22, armL: [30, 60], armR: [30, 60] },
      { torso: 4, head: 12, armR: [10, 14], armL: [10, 14] },
      { torso: 7, head: 20, armR: [54, 116], armL: [54, 116] },
      { ...sit(56, -50), torso: 16, head: 24, armL: [34, 56], armR: [34, 56] },
      { ...sit(88, -88), torso: 11, head: 28, armL: [42, 40], armR: [42, 40] },
    ],
  },
  {
    // Hands behind the back, wearing a track in the floor.
    id: 'trudge',
    cycle: 5000,
    ease: 'smooth',
    poses: [
      { x: 9, torso: 8, head: 22, legR: [22, 16], legL: [-8, 8], armR: [-22, 40], armL: [-22, 40] },
      { x: 3, torso: 9, head: 24, legR: [8, 4], legL: [8, 4] },
      { x: -9, torso: 8, head: 22, legL: [22, 16], legR: [-8, 8] },
      { x: -3, torso: 10, head: 25, legL: [8, 4], legR: [8, 4] },
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

/**
 * The two and a half seconds after this player crosses a row out.
 *
 * Deliberately larger than anything else in this file — a scratched Generala is
 * the loudest thing that happens on the sheet, and the figure should look like
 * it took the news personally. These interrupt whatever the mood was and hand
 * it back afterwards.
 */
export const SHOCKS: Move[] = [
  {
    // Both hands to the head, thrown backwards. The classic NO.
    id: 'clutch',
    cycle: 1300,
    ease: 'bounce',
    poses: [
      { torso: -4, armR: [40, 20], armL: [40, 20], head: -6 },
      { torso: -26, head: -22, armR: [166, 78], armL: [166, 78], legL: [16, 0], legR: [16, 0], y: -3 },
      { torso: -20, head: -18, armR: [160, 86], armL: [160, 86], legL: [14, 0], legR: [14, 0] },
      { torso: -24, head: -20, armR: [164, 80], armL: [164, 80], legL: [16, 0], legR: [16, 0] },
    ],
  },
  {
    id: 'collapse',
    cycle: 1500,
    ease: 'smooth',
    poses: [
      { torso: -8, armR: [70, 10], armL: [70, 10], head: -10 },
      { ...sit(70, -150), torso: -14, head: -26, armR: [150, 10], armL: [150, 10] },
      { ...sit(74, -156), torso: 10, head: 24, armR: [20, 30], armL: [20, 30] },
      { ...sit(72, -152), torso: 6, head: 22, armR: [16, 34], armL: [16, 34] },
    ],
  },
  {
    id: 'stagger',
    cycle: 1100,
    ease: 'snap',
    poses: [
      { x: -6, torso: 14, armR: [80, 34], armL: [80, 34], legL: [30, 0], legR: [-6, 20], head: 10 },
      { x: 5, torso: -12, armR: [92, 24], armL: [92, 24], legR: [30, 0], legL: [-6, 20], head: -8 },
      { x: -4, torso: 9, armR: [72, 44], armL: [72, 44], legL: [24, 0], legR: [-2, 14] },
    ],
  },
  {
    // Blown clean off his feet by a piece of news.
    id: 'blown-back',
    cycle: 1400,
    ease: 'bounce',
    poses: [
      { torso: 6, armR: [20, 10], armL: [20, 10] },
      { torso: -30, y: -12, armR: [128, 0], armL: [128, 0], legL: [34, 30], legR: [10, 40], head: -20 },
      { torso: -22, y: 2, armR: [104, 20], armL: [104, 20], legL: [22, 20], legR: [8, 26], head: -14 },
      { torso: -26, y: -4, armR: [120, 10], armL: [120, 10], legL: [28, 24], legR: [9, 32], head: -18 },
    ],
  },
  {
    // Faints. Comes round. Faints again.
    id: 'faint',
    cycle: 1700,
    ease: 'smooth',
    poses: [
      { torso: -6, armR: [40, 60], armL: [40, 60], head: -14 },
      { torso: -18, armR: [120, 40], armL: [120, 40], head: -24, y: -4 },
      { ...sit(86, -172), torso: 27, head: 26, armR: [40, 90], armL: [40, 90] },
      { ...sit(88, -176), torso: 31, head: 28, armR: [30, 100], armL: [30, 100] },
    ],
  },
]
