import { base, door, ladder, object, platform } from '../components.mjs';

export default {
  ...base(),
  name: 'A chuva que puxa',
  spawn: { x: 45, y: 340 },
  platforms: [
    platform(30, 340, 180), platform(30, 250, 70), platform(135, 250, 75),
    platform(30, 160, 180), platform(30, 70, 180),
  ],
  ladders: [ladder(55, 250, 340), ladder(178, 160, 250), ladder(55, 70, 160)],
  droplets: [
    { id: 'drop-a', x: 102, y: 105, speed: 86, drift: 8, phase: 0 },
    { id: 'drop-b', x: 150, y: 20, speed: 104, drift: 11, phase: 1.3 },
    { id: 'drop-c', x: 74, y: 12, speed: 96, drift: 7, phase: 2.5 },
  ],
  objects: [object('spikes', 92, 250, { w: 15 })],
  door: door(115, 70),
};
