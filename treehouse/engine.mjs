import { levels } from './levels.mjs';
export const WIDTH = 240, HEIGHT = 360;
export class Game {
  constructor(index = 0) { this.load(index); }
  load(index) {
    this.index = Math.max(0, Math.min(levels.length - 1, index));
    this.level = structuredClone(levels[this.index]);
    this.player = { ...this.level.spawn, vy: 0, grounded: true, climbing: false, facing: 1, moving: false };
    this.flags = {}; this.complete = false; this.message = ''; this.time = 0;
  }
  interact() {
    const p = this.player;
    for (const o of this.level.objects) {
      if (o.type === 'lever' && Math.abs(p.x - o.x) < 23 && Math.abs(p.y - o.y) < 22) {
        this.flags[o.target] = true;
        this.message = o.target === 'bridge' ? 'A ponte está pronta!' : 'O alçapão está aberto!';
      }
    }
    const d = this.level.door;
    if (Math.abs(p.x - d.x) < 23 && Math.abs(p.y - d.y) < 15) {
      if (d.requires.every(flag => this.flags[flag])) this.complete = true;
      else this.message = d.requires.includes('key') && !this.flags.key ? 'Falta encontrar a chave.' : 'Explore o andar e acione a alavanca.';
    }
  }
  step(dt, input = {}) {
    if (this.complete) return;
    dt = Math.min(dt, 1 / 30); this.time += dt;
    const p = this.player, previousY = p.y;
    const axis = Number(!!input.right) - Number(!!input.left);
    p.x = Math.max(37, Math.min(203, p.x + axis * 76 * dt));
    p.moving = !!axis;
    if (axis) p.facing = axis;
    const near = this.level.ladders.find(l => Math.abs(p.x - l.x) < 10 && p.y >= l.top - 1 && p.y <= l.bottom + 2);
    const vertical = Number(!!input.down) - Number(!!input.up);
    const canClimb = near && (!near.requires || this.flags[near.requires]);
    p.climbing = !!(canClimb && (vertical || p.climbing) && !axis);
    if (input.jump && (p.grounded || p.climbing)) { p.vy = -175; p.grounded = false; p.climbing = false; }
    else if (p.climbing) {
      p.x = near.x; p.y = Math.max(near.top, Math.min(near.bottom, p.y + vertical * 64 * dt)); p.vy = 0;
      p.grounded = p.y === near.top || p.y === near.bottom;
    }
    if (!p.climbing) {
      p.vy += 430 * dt; p.y += p.vy * dt; p.grounded = false;
      if (p.vy >= 0) for (const s of this.level.platforms) {
        if (s.requires && !this.flags[s.requires]) continue;
        if (p.x + 5 > s.x && p.x - 5 < s.x + s.w && previousY <= s.y + 0.1 && p.y >= s.y) {
          p.y = s.y; p.vy = 0; p.grounded = true; break;
        }
      }
    }
    for (const o of this.level.objects) if (o.type === 'key' && !o.collected && Math.abs(p.x - o.x) < 13 && Math.abs(p.y - 12 - o.y) < 16) {
      o.collected = true; this.flags.key = true; this.message = 'Chave encontrada!';
    }
    if (input.action || input.up) this.interact();
  }
}
