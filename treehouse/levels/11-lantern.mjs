import { base, platform, ladder, object, key, door } from '../components.mjs';
export default {
  ...base(),name:'O que a chama alcança',entryFlags:{lantern:true},
  lighting:{mode:'lantern',radius:52},
  platforms:[platform(30,340,180),platform(30,250,90),platform(160,250,50),
    platform(30,160,70),platform(140,160,70),platform(30,70,180)],
  ladders:[ladder(175,250,340),ladder(65,160,250),ladder(175,70,160)],
  objects:[object('spikes',123,340,{w:14}),object('spikes',85,250,{w:14}),key(180,145)],
  door:door(115,70,['key']),
};
