// Coordinates use a 240 × 360 logical world; y grows downward.
export const platform = (x, y, w, requires = null) => ({ x, y, w, requires });
export const ladder = (x, top, bottom, requires = null) => ({ x, top, bottom, requires });
export const key = (x, y) => ({ type: 'key', x, y });
export const lever = (x, y, target) => ({ type: 'lever', x, y, target });
export const door = (x, y, requires = []) => ({ x, y, requires });
const base = () => ({
  spawn: { x: 110, y: 340 },
  platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 180), platform(30, 70, 180)],
  ladders: [ladder(175, 250, 340), ladder(65, 160, 250), ladder(175, 70, 160)],
  objects: [], door: door(115, 70),
});
export const levels = [
  { ...base(), name: 'Primeiros galhos', hint: 'Encontre as escadas. Suba até a porta e use ↑ ou AÇÃO.' },
  { ...base(), name: 'Uma pequena chave', hint: 'Pegue a chave dourada para destrancar a porta.', objects: [key(180, 145)], door: door(115, 70, ['key']) },
  { ...base(), name: 'Entre dois galhos', hint: 'Use AÇÃO na alavanca para estender a ponte.',
    platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 65), platform(95, 160, 60, 'bridge'), platform(155, 160, 55), platform(30, 70, 180)],
    objects: [lever(190, 250, 'bridge')], door: door(115, 70, ['bridge']) },
  { ...base(), name: 'O segredo do alçapão', hint: 'Pule no apoio. Acione a alavanca para abrir o alçapão.',
    platforms: [...base().platforms, platform(95, 220, 45)],
    objects: [lever(115, 220, 'hatch')], hatch: { x: 65, y: 160, requires: 'hatch' },
    ladders: [ladder(175, 250, 340), ladder(65, 160, 250, 'hatch'), ladder(175, 70, 160)], door: door(115, 70, ['hatch']) },
  { ...base(), name: 'Um lugar lá no alto', hint: 'Pule para pegar a chave. Abra o alçapão e alcance o alto!',
    platforms: [...base().platforms, platform(100, 220, 45)],
    objects: [key(120, 205), lever(45, 160, 'hatch')], hatch: { x: 175, y: 70, requires: 'hatch' },
    ladders: [ladder(175, 250, 340), ladder(65, 160, 250), ladder(175, 70, 160, 'hatch')], door: door(115, 70, ['key', 'hatch']) },
];
