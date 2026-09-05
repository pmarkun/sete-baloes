import { base, object, platform, ladder, door } from '../components.mjs';
export default {
  ...base(), name:'Uma escada viva',
  platforms:[platform(30,340,180),platform(30,250,180),platform(30,180,60),
    platform(100,155,35),platform(150,130,35),platform(95,105,35),platform(30,70,180)],
  objects:[object('seed',45,235),object('pot',65,250)],
  ladders:[ladder(175,250,340),{...ladder(65,180,250,'grown'),vine:true},ladder(110,70,105)],
  door:door(115,70,['grown']),
};
