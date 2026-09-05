import { base, object, ladder, door } from '../components.mjs';
export default {
  ...base(),name:'Quem estava sob o manto?',objects:[object('cloak',115,250)],portal:{x:190,y:250},
  ladders:[ladder(175,250,340),ladder(65,160,250,'timeKey'),ladder(175,70,160)],
  door:door(115,70,['timeKey']),
};
