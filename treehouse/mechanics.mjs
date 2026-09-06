import { failAttempt, pursuitTarget } from './night.mjs';

export function ropePose(rope, time) {
  const phase = time * rope.speed + (rope.phase || 0);
  const angle = Math.sin(phase) * rope.amplitude;
  const angularVelocity = Math.cos(phase) * rope.amplitude * rope.speed;
  return { ...rope, angle, x: rope.pivotX + Math.sin(angle) * rope.length,
    y: rope.pivotY + Math.cos(angle) * rope.length,
    vx: Math.cos(angle) * angularVelocity * rope.length,
    vy: -Math.sin(angle) * angularVelocity * rope.length };
}

export function updateRopes(game, dt, input) {
  game.ropes = (game.level.ropes || []).map(rope => ropePose(rope, game.time));
  const p = game.player;
  p.ropeCooldown = Math.max(0, (p.ropeCooldown || 0) - dt);
  if (p.rope !== null && p.rope !== undefined) {
    const rope = game.ropes[p.rope];
    if (!rope) { p.rope = null; return false; }
    p.x = rope.x; p.y = rope.y + 22;
    p.vy = 0; p.vx = 0; p.grounded = false; p.climbing = false; p.moving = true;
    if (Math.abs(rope.vx) > 2) p.facing = Math.sign(rope.vx);
    if (input.jump) {
      p.releasedRope = p.rope; p.rope = null; p.ropeCooldown = .55;
      p.vx = rope.vx; p.vy = -game.level.physics.jumpSpeed + Math.min(0, rope.vy) * .35;
      game.emit('jump');
    }
    return true;
  }
  if (p.ropeCooldown || p.hitStun || p.climbing) return false;
  const index = game.ropes.findIndex((rope,index) => index!==p.releasedRope && Math.abs(p.x - rope.x) < 17 && Math.abs(p.y - 22 - rope.y) < 24);
  const atLadder = game.level.ladders.some(l => Math.abs(p.x-l.x)<10 && p.y>=l.top && p.y<=l.bottom);
  if (index >= 0 && ((input.up && !atLadder) || input.action)) {
    p.rope = index; p.x = game.ropes[index].x; p.y = game.ropes[index].y + 22;
    p.vx = 0; p.vy = 0; p.grounded = false; p.climbing = false;
    game.emit('rope'); return true;
  }
  return false;
}

// The warning bead, burst and safe interval share the simulation clock.
export function rainPhase(emitter, time) {
  const period = emitter.period ?? 3.2;
  const phase = ((time + (emitter.phase || 0)) % period + period) % period;
  const active = emitter.active ?? .7;
  return { phase, active: phase < active, warning: phase > period - .65,
    charge: Math.max(0, (phase - (period - .65)) / .65) };
}

export function updateDroplets(game, dt) {
  for (const [index, emitter] of (game.level.droplets || []).entries()) {
    const now = rainPhase(emitter, game.time);
    const before = rainPhase(emitter, game.time - dt);
    if (now.active && (!before.active || Math.floor(now.phase / .22) !== Math.floor(before.phase / .22))) {
      game.drops.push({ x: emitter.x, y: emitter.y, speed: emitter.speed,
        direction: emitter.direction ?? -1, flowSpeed: emitter.flowSpeed ?? 60, source: index });
    }
  }
  game.splashes = game.splashes.filter(s => (s.life -= dt) > 0);
  for (const drop of game.drops) {
    const previous = drop.y;
    if (drop.surface) {
      drop.x += drop.direction * drop.flowSpeed * dt;
      drop.y = drop.surface.y - 3;
      const drain = (game.level.shelters || []).some(s => drop.x >= s.x && drop.x <= s.x+s.w && drop.surface.y-s.y>0 && drop.surface.y-s.y<55);
      if (drain) { drop.dead=true;game.splashes.push({x:drop.x,y:drop.y,life:.3});continue; }
      if (drop.x < drop.surface.x || drop.x > drop.surface.x + drop.surface.w) {
        drop.surface = null; drop.y += 6;
      }
    } else {
      drop.y += drop.speed * dt;
      const roof = (game.level.shelters || []).find(s => drop.x >= s.x && drop.x <= s.x + s.w && previous <= s.y && drop.y >= s.y);
      if (roof) { drop.dead = true; game.splashes.push({ x: drop.x, y: roof.y, life: .3 }); continue; }
      const floor = game.level.platforms.filter(s => (!s.requires || game.flags[s.requires]) && drop.x >= s.x && drop.x <= s.x + s.w && previous <= s.y && drop.y >= s.y).sort((a,b) => a.y-b.y)[0];
      if (floor) { drop.surface = floor; drop.y = floor.y - 3; game.splashes.push({ x: drop.x, y: floor.y, life: .3 }); }
    }
    const p = game.player;
    if (!p.invulnerable && !game.hazardRetry && Math.abs(drop.x - p.x) < 10 && drop.y >= p.y - 30 && drop.y <= p.y + 3) {
      p.vx = -(p.facing || 1) * 125; p.vy = 115;
      p.grounded = false; p.climbing = false; p.rope = null;
      p.hitStun = .28; p.invulnerable = 1.1; p.slipThrough = .24;
      drop.dead = true; game.shake = .17; game.emit('droplet');
    }
  }
  game.drops = game.drops.filter(d => !d.dead && d.y < 380 && d.x > 25 && d.x < 215);
}

export function useLure(game) {
  const p = game.player;
  const index = (game.level.lures || []).findIndex(l => Math.abs(p.x-l.x)<20 && Math.abs(p.y-l.y)<20);
  if (index < 0) return false;
  if ((game.lureCooldowns[index] || 0) > 0) return true;
  const lure = game.level.lures[index];
  if (lure.flag) game.flags[lure.flag] = true;
  game.lureCooldowns[index] = lure.cooldown ?? 6;
  game.distraction = { x: lure.x, y: lure.y, remaining: lure.duration ?? 3 };
  if (game.chaser) { game.chaser.state = 'distracted'; game.chaser.remaining = 0; }
  game.emit('bell', index % 3 + 1);
  return true;
}

export function updateChaser(game, dt) {
  const config = game.level.chaser;
  if (!config) return;
  game.lureCooldowns = game.lureCooldowns.map(t => Math.max(0,t-dt));
  if (game.distraction && (game.distraction.remaining -= dt) <= 0) game.distraction = null;
  const p = game.player;
  if (!game.chaser && p.y <= (config.triggerY ?? 340) && p.x >= (config.triggerX ?? 0)) {
    game.chaser = { ...config.spawn, facing: 1, moving: false, state: 'waking', remaining: 1.2 };
    game.emit('creature');
  }
  const c = game.chaser;
  if (!c) return;
  c.moving = false;
  c.remaining = Math.max(0, c.remaining - dt);
  if (c.state === 'waking' || c.state === 'recover') {
    if (c.remaining) return;
    c.state = 'pursue';
  }
  if (c.state === 'windup') {
    if (c.remaining) return;
    c.state = 'charge'; c.remaining = .55;
  }
  if (c.state === 'charge') {
    c.x = Math.max(37, Math.min(203, c.x + c.facing * (config.chargeSpeed ?? 130) * dt));
    c.moving = true;
    if (!c.remaining || c.x === 37 || c.x === 203) { c.state = 'recover'; c.remaining = 1; }
  } else {
    const prey = game.distraction || p;
    const sameFloor = Math.abs(c.y - prey.y) < 3;
    if (!game.distraction && sameFloor && Math.abs(c.x - p.x) < 70 && Math.abs(c.x - p.x) > 20) {
      c.state = 'windup'; c.remaining = .7; c.facing = Math.sign(p.x-c.x); game.emit('charge'); return;
    }
    c.state = game.distraction ? 'distracted' : 'pursue';
    const target = pursuitTarget(game, c, prey);
    if (target) {
      const dx=target.x-c.x, dy=target.y-c.y, distance=Math.hypot(dx,dy);
      const step=Math.min(distance, (dy ? (config.climbSpeed ?? config.speed) : config.speed) * dt);
      if (distance) { c.x+=dx/distance*step; c.y+=dy/distance*step; c.moving=true; if(dx)c.facing=Math.sign(dx); }
    }
  }
  if (c.state!=='recover' && Math.abs(c.x-p.x)<12 && Math.abs(c.y-p.y)<(c.state==='charge'?18:24)) failAttempt(game);
}

export function updateRecovery(game) {
  const p = game.player;
  for (const [index, checkpoint] of (game.level.checkpoints || []).entries()) {
    if (index > game.checkpointIndex && p.grounded && Math.abs(p.x-checkpoint.x)<20 && Math.abs(p.y-checkpoint.y)<2) {
      game.checkpointIndex=index; game.emit('checkpoint');
    }
  }
  const checkpoint = game.level.checkpoints?.[game.checkpointIndex];
  if (game.level.recovery && (p.y > 385 || (checkpoint && p.grounded && p.y > checkpoint.y + 55))) {
    const spawn = checkpoint || game.level.spawn;
    Object.assign(p, spawn, { vx:0, vy:0, rope:null, climbing:false, grounded:true, moving:false, invulnerable:1, hitStun:0, slipThrough:0, ropeCooldown:.2 });
    game.emit('recover');
  }
}

export function mechanicHint(game) {
  if (game.hazardRetry) return 'Pegou! Mais uma tentativa…';
  if (game.player.hitStun) return 'Escorregou! Você ainda pode se recuperar.';
  if (game.level.ropes?.length) return game.player.rope !== null ? 'PULAR / espaço: soltar a corda.' : '↑ / AÇÃO junto à ponta: agarrar · PULAR: soltar';
  if (game.level.droplets?.length) return 'Gota crescendo: vem rajada · telhados verdes: abrigo';
  if (game.level.chaser) return game.chaser?.state === 'windup' ? 'Ele está preparando uma investida…' : game.chaser?.state === 'charge' ? 'Agora! PULE ou saia do caminho!' : 'AÇÃO / E: tocar sino · os dois sinos abrem a saída';
  return '';
}
