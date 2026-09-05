import { base, object, key, ladder, door } from '../components.mjs';
export default {
  ...base(), name:'O peso de uma ideia', physics:{gravity:850,jumpSpeed:190,impactThreshold:150},
  objects:[object('crate',110,250),object('plate',182,250),
    key(125,195,{suspended:true,impacts:0,releaseAfter:3,vy:0})],
  ladders:[ladder(175,250,340),ladder(65,160,250,'weight'),ladder(175,70,160)],
  door:door(115,70,['weight','key']),
};
