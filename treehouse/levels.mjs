// Coordinates use a 240 × 360 logical world; y grows downward.
export const platform = (x, y, w, requires = null) => ({ x, y, w, requires });
export const ladder = (x, top, bottom, requires = null) => ({ x, top, bottom, requires });
export const key = (x, y) => ({ type: 'key', x, y });
export const lever = (x, y, target) => ({ type: 'lever', x, y, target });
export const door = (x, y, requires = []) => ({ x, y, requires });
export const object = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
const base = () => ({
  spawn: { x: 110, y: 340 },
  platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 180), platform(30, 70, 180)],
  ladders: [ladder(175, 250, 340), ladder(65, 160, 250), ladder(175, 70, 160)],
  objects: [], door: door(115, 70),
});
export const levels = [
  { ...base(), name: 'Primeiros galhos', hint: 'Setas movem. Use AÇÃO junto à porta para passar de andar.' },
  { ...base(), name: 'Uma pequena chave', hint: 'Pegue a chave dourada para destrancar a porta.', objects: [key(180, 145)], door: door(115, 70, ['key']) },
  { ...base(), name: 'Entre dois galhos', hint: 'Use AÇÃO na alavanca para estender a ponte.',
    platforms: [platform(30, 340, 180), platform(30, 250, 180), platform(30, 160, 65), platform(95, 160, 60, 'bridge'), platform(155, 160, 55), platform(30, 70, 180)],
    objects: [lever(190, 250, 'bridge')], door: door(115, 70, ['bridge']) },
  { ...base(), name: 'Uma saída quase perfeita', hint: 'Uma SAÍDA! Pule no apoio e use AÇÃO na alavanca.', paradox: true,
    platforms: [...base().platforms, platform(95, 220, 45)],
    objects: [lever(115, 220, 'hatch'), object('exitKey',125,145)],
    falseExit: { x: 40, y: 160 }, portal: { x: 190, y: 160 },
    hatch: { x: 65, y: 160, requires: 'hatch' },
    ladders: [ladder(175, 250, 340), ladder(65, 160, 250, 'hatch'), ladder(175, 70, 160)], door: door(115, 70, ['hatch']) },
  { ...base(), name: 'Um lugar lá no alto', hint: 'Pule para pegar a chave. Abra o alçapão e alcance o alto!',
    platforms: [...base().platforms, platform(100, 220, 45)],
    objects: [key(120, 205), lever(45, 160, 'hatch')], hatch: { x: 175, y: 70, requires: 'hatch' },
    ladders: [ladder(175, 250, 340), ladder(65, 160, 250), ladder(175, 70, 160, 'hatch')], door: door(115, 70, ['key', 'hatch']) },
  { ...base(), name: 'O peso de uma ideia', hint: 'AÇÃO empurra a caixa para onde você olha. Leve-a até a marca dourada.',
    objects: [object('crate',110,250), object('plate',182,250)],
    ladders: [ladder(175,250,340),ladder(65,160,250,'weight'),ladder(175,70,160)],
    door: door(115,70,['weight']) },
  { ...base(), name: 'A árvore tem ouvidos', hint: 'Toque os sinos com AÇÃO na ordem: 2 → 1 → 3.',
    objects: [object('bell',65,250,{note:1}),object('bell',120,250,{note:2}),object('bell',185,250,{note:3})],
    melody: [2,1,3], ladders: [ladder(175,250,340),ladder(65,160,250,'song'),ladder(175,70,160)],
    door: door(115,70,['song']) },
  { ...base(), name: 'Uma escada viva', hint: 'Pegue a semente. Use AÇÃO no vaso para fazer a escada crescer.',
    objects: [object('seed',45,235),object('pot',65,250)],
    ladders: [ladder(175,250,340),{...ladder(65,160,250,'grown'),vine:true},ladder(175,70,160)],
    door: door(115,70,['grown']) },
  { ...base(), name: 'Quem estava sob o manto?', hint: 'Vista o manto com AÇÃO. O portal lembra de você.',
    objects: [object('cloak',115,250)], portal: {x:190,y:250},
    ladders: [ladder(175,250,340),ladder(65,160,250,'timeKey'),ladder(175,70,160)],
    door: door(115,70,['timeKey']) },
  { ...base(), name: 'A última constelação', hint: 'Pegue três cristais. AÇÃO na alavanca abre a passagem por 12 segundos.',
    objects: [object('crystal',45,325),object('crystal',190,235),object('crystal',45,145),lever(110,160,'timer')],
    ladders: [ladder(175,250,340),ladder(65,160,250),ladder(175,70,160,'timer')],
    hatch: {x:175,y:70,requires:'timer'}, door: door(115,70,['crystals','timer']) },
];
