import { failAttempt } from './night.mjs';

function ropePosition(rope, time) {
  const angle = Math.sin(time * rope.speed + (rope.phase || 0)) * rope.amplitude;
  return {
    ...rope,
    angle,
    x: rope.pivotX + Math.sin(angle) * rope.length,
    y: rope.pivotY + Math.cos(angle) * rope.length,
  };
}

export function updateRopes(game, dt, input) {
  const ropes = game.level.ropes;
  if (!Array.isArray(ropes) || !ropes.length) return false;
  game.ropes = ropes.map(rope => ropePosition(rope, game.time));
  const p = game.player;
  if (p.rope !== null && p.rope !== undefined) {
    const rope = game.ropes[p.rope];
    if (!rope) { p.rope = null; return false; }
    p.x = rope.x;
    p.y = rope.y + 25;
    p.vy = 0;
    p.grounded = false;
    p.climbing = false;
    p.moving = true;
    if (input.jump) {
      const angularVelocity = Math.cos(game.time * rope.speed + (rope.phase || 0)) * rope.speed;
      p.rope = null;
      p.vx = Math.cos(rope.angle) * angularVelocity * rope.length * .72;
      p.vy = -game.level.physics.jumpSpeed * .92;
      p.facing = p.vx < 0 ? -1 : 1;
      p.x = Math.max(37, Math.min(203, p.x + p.vx * .04));
      p.moving = true;
      game.emit('rope');
      game.emit('jump');
    }
    return true;
  }
  if (p.grounded || p.climbing) return false;
  const index = game.ropes.findIndex(rope => Math.abs(p.x - rope.x) < 15 && Math.abs(p.y - (rope.y + 25)) < 35);
  if (index >= 0) {
    p.rope = index;
    p.vx = 0;
    p.vy = 0;
    game.emit('rope');
    return true;
  }
  return false;
}

export function updateDroplets(game, dt) {
  const droplets = game.level.droplets;
  if (!Array.isArray(droplets)) return;
  for (const drop of droplets) {
    if (!Number.isFinite(drop.startY)) drop.startY = drop.y;
    if (!Number.isFinite(drop.startX)) drop.startX = drop.x;
    drop.y += drop.speed * dt;
    drop.x += Math.sin((game.time + (drop.phase || 0)) * 3.2) * (drop.drift || 0) * dt;
    if (drop.y > 375) {
      drop.y = drop.startY;
      drop.x = drop.startX;
    }
    const p = game.player;
    if (!game.hazardRetry && drop.y > p.y - 36 && drop.y < p.y + 5 && Math.abs(drop.x - p.x) < 11) {
      p.x = Math.max(37, p.x - (p.facing || 1) * 30);
      p.vy = game.level.physics.gravity * .34;
      p.grounded = false;
      p.climbing = false;
      game.shake = .2;
      failAttempt(game, 'droplet');
    }
  }
}

export function updateChaser(game, dt) {
  const config = game.level.chaser;
  if (!config) return;
  const p = game.player;
  if (!game.chaser && p.y <= (config.triggerY ?? 340)) {
    game.chaser = { ...config.spawn, facing: 1, moving: false };
    game.emit('creature');
  }
  const c = game.chaser;
  if (!c) return;
  const dx = p.x - c.x;
  const distance = Math.abs(dx);
  c.moving = distance > 1;
  if (distance > 1) {
    c.x += Math.sign(dx) * Math.min(distance, config.speed * dt);
    c.facing = Math.sign(dx) || c.facing;
  }
  if (!game.hazardRetry && Math.abs(c.x - p.x) < 13 && Math.abs(c.y - p.y) < 25) failAttempt(game);
}
