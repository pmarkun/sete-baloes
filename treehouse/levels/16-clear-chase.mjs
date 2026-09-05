import { base, door, platform } from '../components.mjs';

export default {
  ...base(),
  name: 'Corra para o claro',
  spawn: { x: 70, y: 340 },
  platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 180), platform(30, 70, 180)],
  chaser: { triggerY: 340, spawn: { x: 38, y: 340 }, speed: 38 },
  door: door(195, 340),
};
