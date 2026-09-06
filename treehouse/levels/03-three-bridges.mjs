import { base, platform, lever, door } from '../components.mjs';
export default {
  ...base(), name: 'Entre dois galhos',
  platforms: [platform(30,340,180),platform(30,250,180),platform(30,160,55),
    platform(110,160,30,'bridge'),platform(165,160,45),platform(30,70,180)],
  objects: [lever(190,250,'bridge')], door: door(115,70,['bridge']),
};
