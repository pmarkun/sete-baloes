import { base, platform, lever, object, ladder, door } from '../components.mjs';
export default {
  ...base(), name: 'Uma saída quase perfeita', paradox: true,
  platforms: [...base().platforms,platform(95,220,45)],
  objects: [lever(115,220,'hatch'),object('exitKey',125,145)],
  falseExit:{x:40,y:160}, portal:{x:190,y:160}, hatch:{x:65,y:160,requires:'hatch'},
  ladders:[ladder(175,250,340),ladder(65,160,250,'hatch'),ladder(175,70,160)],
  door:door(115,70,['hatch']),
};
