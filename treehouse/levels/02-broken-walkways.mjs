import { base, platform, key, door } from '../components.mjs';
export default {
  ...base(), name: 'Entre frestas',
  platforms: [platform(30,340,180),platform(30,250,90),platform(160,250,50),
    platform(30,160,70),platform(140,160,70),platform(30,70,180)],
  objects: [key(180,145)], door: door(115,70,['key']),
};
