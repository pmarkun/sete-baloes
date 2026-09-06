import { base, door, ladder, platform, key } from '../components.mjs';

export default {
  ...base(),
  name: 'As calhas da árvore',
  theme: 'rain',
  recovery: true,
  spawn: { x: 45, y: 340 },
  platforms: [
    platform(30, 340, 180), platform(30, 250, 75), platform(135, 250, 75),
    platform(30, 160, 75), platform(135, 160, 75), platform(30, 70, 180),
  ],
  ladders: [ladder(55, 250, 340), ladder(178, 160, 250), ladder(55, 70, 160)],
  droplets: [
    { id: 'lower-gutter', x: 150, y: 205, speed: 150, direction: -1, flowSpeed: 55, period: 3.8, active: .66, phase: 1 },
    { id: 'upper-gutter', x: 90, y: 112, speed: 150, direction: 1, flowSpeed: 55, period: 3.4, active: .66, phase: 1.7 },
    { id: 'last-gutter', x: 145, y: 22, speed: 170, direction: -1, flowSpeed: 70, period: 4.2, active: .44, phase: .8 },
  ],
  shelters: [{ x:30,y:208,w:43 },{ x:165,y:208,w:45 },{ x:30,y:118,w:40 },{ x:165,y:118,w:45 },{ x:30,y:28,w:43 },{ x:170,y:28,w:40 }],
  checkpoints: [{ x:180,y:250 },{ x:55,y:160 }],
  objects: [key(115,58)],
  door: door(187, 70, ['key']),
};
