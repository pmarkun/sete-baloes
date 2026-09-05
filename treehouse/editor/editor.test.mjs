import test from 'node:test';
import assert from 'node:assert/strict';
import { componentCatalog } from '../components.mjs';
import { Game } from '../engine.mjs';
import { levels } from '../levels.mjs';
import { addComponent, blankLevel, cloneLevel, exportableLevel, parseLevel, serializeLevel, validateLevel } from './model.mjs';

test('o catálogo cria todos os componentes documentados', () => {
  const expected = ['platform', 'ladder', 'door', 'key', 'lever', 'crate', 'plate', 'bell', 'seed', 'pot', 'cloak', 'crystal', 'lantern', 'spikes', 'mirror', 'exitKey', 'portal', 'falseExit', 'hatch'];
  assert.deepEqual(componentCatalog.map(item => item.type), expected);
  const level = blankLevel();
  for (const type of expected) addComponent(level, type, 120, 180);
  assert.equal(level.platforms.length, 5);
  assert.equal(level.ladders.length, 4);
  assert.equal(level.objects.length, 13);
  assert.ok(level.door && level.portal && level.falseExit && level.hatch);
});

test('a validação bloqueia componentes fora do mundo 240 × 360', () => {
  const level = blankLevel();
  level.spawn = { x: 241, y: 360 };
  level.platforms[0] = { x: 230, y: 340, w: 20, requires: null };
  level.ladders[0] = { x: 20, top: 300, bottom: 370, requires: null };
  const result = validateLevel(level);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.path === 'spawn.x'));
  assert.ok(result.errors.some(item => item.path === 'platforms[0].w'));
  assert.ok(result.errors.some(item => item.path === 'ladders[0].bottom'));
});

test('requisitos são flags e o JSON faz round-trip sem perder propriedades', () => {
  const level = blankLevel('Sala do espelho');
  level.platforms[0].requires = 'bridge';
  level.door.requires = ['mirror', 'key'];
  level.entryFlags = { lantern: true };
  level.objects.push({ type: 'mirror', x: 120, y: 250, custom: { glow: true } });
  const parsed = parseLevel(serializeLevel(level));
  assert.equal(parsed.errors.length, 0);
  assert.deepEqual(parsed.level, exportableLevel(level));
  level.door.requires = ['unknown reference is allowed as a flag'];
  assert.equal(validateLevel(level).valid, true);
});

test('a validação impede combinações de componentes que quebrariam a prévia', () => {
  const level = blankLevel();
  level.objects.push({ type: 'bell', x: 120, y: 250, note: 1 }, { type: 'crate', x: 100, y: 340 });
  const result = validateLevel(level);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.path === 'melody'));
  assert.ok(result.errors.some(item => item.path === 'objects'));
});

test('duplicar uma fase existente cria uma cópia independente', () => {
  const copy = cloneLevel(levels[12]);
  copy.name = `${levels[12].name} · cópia`;
  copy.platforms[0].x = 35;
  assert.notEqual(copy, levels[12]);
  assert.notEqual(copy.platforms, levels[12].platforms);
  assert.notEqual(copy.platforms[0], levels[12].platforms[0]);
  assert.equal(levels[12].platforms[0].x, 30);
});

test('todas as fases oficiais passam pelo mesmo validador do editor', () => {
  for (const [index, level] of levels.entries()) assert.equal(validateLevel(level).valid, true, `fase oficial ${index + 1}`);
});

test('Game executa uma fase customizada sem tocar na lista oficial', () => {
  const custom = blankLevel('Teste customizado');
  custom.door = { x: custom.spawn.x, y: custom.spawn.y, requires: [] };
  const game = new Game(0, { levels: [custom] });
  game.player = { ...game.player, x: custom.door.x, y: custom.door.y };
  game.interact();
  assert.equal(game.complete, true);
  assert.equal(game.level.name, 'Teste customizado');
  assert.equal(levels.length, 16);
});
