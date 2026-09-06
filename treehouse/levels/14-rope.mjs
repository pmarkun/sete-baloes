import { base, door, ladder, platform } from '../components.mjs';

export default {
  ...base(),
  name: 'Entre dois balanços',
  theme: 'canopy',
  recovery: true,
  spawn: { x: 55, y: 340 },
  platforms: [
    platform(30, 340, 180),
    platform(30, 260, 46), platform(164, 260, 46),
    platform(30, 140, 46), platform(164, 140, 46),
    platform(30, 60, 180),
  ],
  ladders: [ladder(55, 260, 340), ladder(185, 140, 260), ladder(55, 60, 140)],
  ropes: [
    { id: 'first-swing', pivotX: 120, pivotY: 158, length: 80, amplitude: .88, speed: 1.45, phase: -1.57 },
    { id: 'return-swing', pivotX: 120, pivotY: 38, length: 80, amplitude: .88, speed: 1.65, phase: 1.57 },
  ],
  checkpoints: [{ x:185, y:260 }, { x:55, y:140 }],
  door: door(120, 60),
};
