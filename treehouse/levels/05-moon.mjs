import { base, platform, ladder, key, door } from '../components.mjs';
export default {
  ...base(), name: 'Suspenso', physics:{gravity:110,jumpSpeed:118},
  platforms:[platform(30,340,180),platform(145,280,65),platform(50,230,70),
    platform(150,180,60),platform(50,125,75),platform(30,70,180)],
  ladders:[ladder(175,280,340),ladder(75,70,125)],
  objects:[key(95,180,{falling:true,vy:0})], door:door(115,70,['key']),
};
