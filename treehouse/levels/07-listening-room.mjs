import { base, object, ladder, door } from '../components.mjs';
const melody = [1,3,2];
export default {
  ...base(), name:'A árvore tem ouvidos', melody, music:{rhythm:melody},
  objects:[object('bell',65,250,{note:1}),object('bell',120,250,{note:2}),object('bell',185,250,{note:3})],
  ladders:[ladder(175,250,340),ladder(65,160,250,'song'),ladder(175,70,160)],
  door:door(115,70,['song']),
};
