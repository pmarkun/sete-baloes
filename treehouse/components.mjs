// Shared building blocks. Coordinates use a 240 × 360 world, y downward.
export const platform = (x, y, w, requires = null) => ({ x, y, w, requires });
export const ladder = (x, top, bottom, requires = null) => ({ x, top, bottom, requires });
export const key = (x, y, extra = {}) => ({ type: 'key', x, y, ...extra });
export const lever = (x, y, target) => ({ type: 'lever', x, y, target });
export const door = (x, y, requires = []) => ({ x, y, requires });
export const object = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
export const base = () => ({
  spawn: { x: 110, y: 340 },
  physics: { gravity: 430, jumpSpeed: 175 },
  platforms: [platform(30,340,180),platform(30,250,180),platform(30,160,180),platform(30,70,180)],
  ladders: [ladder(175,250,340),ladder(65,160,250),ladder(175,70,160)],
  objects: [], door: door(115,70),
});
