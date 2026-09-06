import { base, object, door } from '../components.mjs';

export default {
  ...base(),
  name: 'O outro lado do espelho',
  objects: [object('mirror', 120, 250)],
  door: door(115, 70, ['mirror']),
};
