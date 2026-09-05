import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import { levels } from './levels.mjs';
import { tick } from './test-helpers.mjs';

test('floor 14 swings on the rope and releases with momentum', () => {
  const g = new Game(13);
  tick(g);
  const first = { x: g.ropes[0].x, y: g.ropes[0].y };
  tick(g, {}, 30);
  assert.notEqual(g.ropes[0].x, first.x);
  g.player = { ...g.player, x: g.ropes[0].x, y: g.ropes[0].y + 25, grounded: false, climbing: false };
  tick(g);
  assert.equal(g.player.rope, 0);
  tick(g, { jump: true });
  assert.equal(g.player.rope, null);
  assert.ok(g.player.vy < 0);
  assert.ok(g.drainEvents().some(event => event.type === 'rope'));
});

test('floor 15 drops pull the player backwards and restart the attempt', () => {
  const g = new Game(14);
  const drop = g.level.droplets[0];
  g.player = { ...g.player, x: drop.x, y: drop.y + 20, grounded: false, climbing: false, facing: 1 };
  tick(g);
  assert.ok(g.hazardRetry > 0);
  assert.ok(g.player.x < drop.x);
  assert.ok(g.drainEvents().some(event => event.type === 'droplet'));
});

test('floor 16 chaser moves in the clear and can be outrun', () => {
  const g = new Game(15);
  tick(g, { right: true }, 10);
  assert.ok(g.chaser);
  assert.ok(g.chaser.x > g.level.chaser.spawn.x);
  assert.equal(g.hazardRetry, 0);
  const before = g.chaser.x;
  g.player.x = 190;
  tick(g);
  assert.ok(g.chaser.x > before);
  assert.equal(levels.length, 16);
});
