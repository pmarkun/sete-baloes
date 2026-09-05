import { base, door, ladder, platform } from '../components.mjs';

export default {
  ...base(),
  name: 'O balanço dos galhos',
  spawn: { x: 48, y: 340 },
  platforms: [
    platform(30, 340, 52), platform(158, 340, 52),
    platform(30, 250, 55), platform(155, 250, 55),
    platform(78, 160, 84), platform(30, 70, 180),
  ],
  ladders: [ladder(42, 250, 340), ladder(170, 160, 250), ladder(70, 70, 160)],
  ropes: [{ id: 'first-swing', pivotX: 120, pivotY: 145, length: 80, amplitude: .68, speed: 1.7, phase: 0 }],
  door: door(115, 70),
};
