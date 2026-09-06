import { base, door, platform, object } from '../components.mjs';

export default {
  ...base(),
  name: 'A fuga do guaxinim',
  theme: 'sunrise',
  spawn: { x: 85, y: 340 },
  platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 180), platform(30, 70, 180)],
  chaser: { triggerX:110, triggerY:340, spawn:{x:42,y:340}, speed:68, climbSpeed:68, chargeSpeed:135 },
  objects: [object('spikes',110,250,{w:14})],
  lures: [
    { x:175,y:250,flag:'bellA',duration:3,cooldown:6 },
    { x:65,y:160,flag:'bellB',duration:3,cooldown:6 },
  ],
  door: door(115, 70, ['bellA','bellB']),
};
