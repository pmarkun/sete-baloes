import { base, object, lever, ladder, door } from '../components.mjs';
export default {
  ...base(),name:'A última constelação',
  objects:[object('crystal',45,325),object('crystal',190,235),object('crystal',45,145),lever(110,160,'timer')],
  ladders:[ladder(175,250,340),ladder(65,160,250),ladder(175,70,160,'timer')],
  hatch:{x:175,y:70,requires:'timer'},door:door(115,70,['crystals','timer']),
};
