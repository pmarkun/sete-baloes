// Shared building blocks. Coordinates use a 240 × 360 world, y downward.
export const platform = (x, y, w, requires = null) => ({ x, y, w, requires });
export const ladder = (x, top, bottom, requires = null) => ({ x, top, bottom, requires });
export const key = (x, y, extra = {}) => ({ type: 'key', x, y, ...extra });
export const lever = (x, y, target) => ({ type: 'lever', x, y, target });
export const door = (x, y, requires = []) => ({ x, y, requires });
export const hatch = (x, y, requires) => ({ x, y, requires });
export const portal = (x, y) => ({ x, y });
export const falseExit = (x, y) => ({ x, y });
export const object = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
export const base = () => ({
  spawn: { x: 110, y: 340 },
  physics: { gravity: 430, jumpSpeed: 175 },
  platforms: [platform(30,340,180),platform(30,250,180),platform(30,160,180),platform(30,70,180)],
  ladders: [ladder(175,250,340),ladder(65,160,250),ladder(175,70,160)],
  objects: [], door: door(115,70),
});

// The editor palette is derived from the same factories used by level files.
// `collection` identifies where the created value belongs in a LevelDocument.
export const componentCatalog = [
  { type: 'platform', label: 'Plataforma', group: 'Estrutura', collection: 'platforms', create: (x=60, y=300) => platform(x, y, 60) },
  { type: 'ladder', label: 'Escada', group: 'Estrutura', collection: 'ladders', create: (x=175, y=250) => ladder(x, y-90, y) },
  { type: 'door', label: 'Porta', group: 'Estrutura', collection: 'door', create: (x=115, y=70) => door(x, y) },
  { type: 'key', label: 'Chave', group: 'Objetos', collection: 'objects', create: (x=120, y=240) => key(x, y) },
  { type: 'lever', label: 'Alavanca', group: 'Objetos', collection: 'objects', create: (x=120, y=240) => lever(x, y, 'switch') },
  { type: 'crate', label: 'Caixa', group: 'Objetos', collection: 'objects', create: (x=110, y=250) => object('crate', x, y) },
  { type: 'plate', label: 'Placa', group: 'Objetos', collection: 'objects', create: (x=180, y=250) => object('plate', x, y) },
  { type: 'bell', label: 'Sino', group: 'Objetos', collection: 'objects', create: (x=120, y=250) => object('bell', x, y, { note: 1 }) },
  { type: 'seed', label: 'Semente', group: 'Objetos', collection: 'objects', create: (x=45, y=235) => object('seed', x, y) },
  { type: 'pot', label: 'Vaso', group: 'Objetos', collection: 'objects', create: (x=65, y=250) => object('pot', x, y) },
  { type: 'cloak', label: 'Manto', group: 'Objetos', collection: 'objects', create: (x=115, y=250) => object('cloak', x, y) },
  { type: 'crystal', label: 'Cristal', group: 'Objetos', collection: 'objects', create: (x=120, y=240) => object('crystal', x, y) },
  { type: 'lantern', label: 'Lampião', group: 'Objetos', collection: 'objects', create: (x=145, y=58) => object('lantern', x, y) },
  { type: 'spikes', label: 'Espinhos', group: 'Objetos', collection: 'objects', create: (x=120, y=340) => object('spikes', x, y, { w: 14 }) },
  { type: 'mirror', label: 'Espelho', group: 'Objetos', collection: 'objects', create: (x=120, y=250) => object('mirror', x, y) },
  { type: 'exitKey', label: 'Chave da saída', group: 'Objetos', collection: 'objects', create: (x=125, y=145) => object('exitKey', x, y) },
  { type: 'portal', label: 'Portal', group: 'Especiais', collection: 'portal', create: (x=190, y=160) => portal(x, y) },
  { type: 'falseExit', label: 'Falsa saída', group: 'Especiais', collection: 'falseExit', create: (x=40, y=160) => falseExit(x, y) },
  { type: 'hatch', label: 'Alçapão', group: 'Especiais', collection: 'hatch', create: (x=65, y=160) => hatch(x, y, 'hatch') },
];
