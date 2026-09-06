import { levels } from './levels.mjs';
import { landingSurface, impact, updateObjects } from './physics.mjs';
import { updateNight } from './night.mjs';
import { ropePose, updateChaser, updateDroplets, updateRopes, updateRecovery, useLure } from './mechanics.mjs';
import { thiefPose, pastSelfPose, PORTAL_X, LEDGE_Y } from './temporal.mjs';
export const WIDTH = 240, HEIGHT = 360;
export class Game {
  constructor(index = 0, { levels: levelSource = levels } = {}) { this.levels = levelSource; this.load(index); }
  load(index) {
    this.index = Math.max(0, Math.min(this.levels.length - 1, index));
    this.level = structuredClone(this.levels[this.index]);
    this.player = { ...this.level.spawn, vy: 0, vx: 0, rope: null, grounded: true, climbing: false, facing: 1, moving: false };
    this.flags = {...this.level.entryFlags}; this.complete = false; this.time = 0;
    this.hunter=null;this.chaser=null;this.ropes=(this.level.ropes||[]).map(r=>ropePose(r,0));this.hazardRetry=0;this.lastDark=false;
    this.drops=[];this.splashes=[];this.checkpointIndex=-1;this.lureCooldowns=[];this.distraction=null;
    this.events = []; this.sequence = []; this.timer = 0; this.shake = 0;
    this.inPast = false; this.returnState = null; this.temporalClock = 0;
    this.theftClock = null; this.ghost = null; this.pastSelf = null; this.retryDelay = 0;
  }
  emit(type, value) { this.events.push({type,value}); }
  drainEvents() { return this.events.splice(0); }
  enterPast() {
    const snapshot = structuredClone({index:this.index,level:this.level,flags:this.flags,player:this.player,time:this.time});
    this.load(3); this.returnState = snapshot; this.inPast = true;
    this.flags.hatch = true; this.flags.cloak = true;
    this.player = {...this.player,x:PORTAL_X,y:LEDGE_Y,climbing:false};
    this.emit('portal');
  }
  leavePast() {
    const saved = this.returnState;
    this.load(saved.index); this.level = saved.level; this.flags = {...saved.flags,timeKey:true};
    this.player = {...saved.player,x:PORTAL_X-22}; this.time = saved.time;
    this.emit('portal');
  }
  updateTemporal(dt) {
    if (this.inPast) {
      this.temporalClock += dt; this.pastSelf = pastSelfPose(this.temporalClock);
      if (this.temporalClock > 10 || (Math.abs(this.player.x-this.pastSelf.x)<12 && Math.abs(this.player.y-this.pastSelf.y)<20)) {
        this.retryDelay = 1.5; this.emit('caught');
      }
    } else if (this.level.paradox) {
      if (this.theftClock === null && this.player.y <= 255) {
        this.theftClock = 0; this.emit('portal');
      }
      if (this.theftClock !== null) {
        this.theftClock += dt; this.ghost = thiefPose(this.theftClock);
        const key = this.level.objects.find(o=>o.type==='exitKey');
        if (this.theftClock >= 1.4 && !key.collected) {
          key.collected = true; this.emit('key');
        }
      }
    }
  }
  interact() {
    const p = this.player;
    if (useLure(this)) return;
    const portal = this.level.portal;
    if (portal && Math.abs(p.x-portal.x)<19 && Math.abs(p.y-portal.y)<20) {
      if (this.inPast) {
        if (this.flags.stolenKey) this.leavePast();
        return;
      }
      if (this.flags.cloak && !this.flags.timeKey) { this.enterPast(); return; }
    }
    const interactables = ['lever','crate','bell','pot','cloak','exitKey'];
    const o = this.level.objects.filter(o=>interactables.includes(o.type)&&!o.collected&&Math.abs(p.x-o.x)<23&&Math.abs(p.y-o.y)<23)
      .sort((a,b)=>Math.abs(p.x-a.x)-Math.abs(p.x-b.x))[0];
    if (o) {
      if (o.type === 'lever') {
        if (o.target==='timer') { this.timer=12;this.flags.timer=true;this.emit('lever');this.emit('hatch'); }
        else if (!this.flags[o.target]) {
          this.flags[o.target] = true; this.emit('lever');
          if(o.target==='hatch')this.emit('hatch');
        }
      } else if (o.type==='crate') {
        o.x = Math.max(45,Math.min(195,o.x+p.facing*18));this.emit('crate');
        const plate=this.level.objects.find(o=>o.type==='plate');
        this.flags.weight=Math.abs(o.x-plate.x)<12;
      } else if (o.type==='bell') {
        if(!this.flags.song){this.emit('bell',o.note);this.sequence.push(o.note);
          if(this.sequence.some((n,i)=>n!==this.level.melody[i])) {this.sequence=[];}
          else if(this.sequence.length===this.level.melody.length){this.flags.song=true;this.emit('unlock');}
        }
      } else if (o.type==='pot') {
        if(this.flags.seed&&!this.flags.grown){this.flags.grown=true;this.emit('grow');}
      } else if (o.type==='cloak') {
        o.collected=true;this.flags.cloak=true;this.emit('portal');
      } else if(o.type==='exitKey'&&this.inPast) {
        o.collected=true;this.flags.stolenKey=true;this.emit('key');
      }
      return;
    }
    if(this.level.falseExit&&Math.abs(p.x-this.level.falseExit.x)<20&&Math.abs(p.y-160)<20){
      return;
    }
    const d = this.level.door;
    if (Math.abs(p.x - d.x) < 23 && Math.abs(p.y - d.y) < 15) {
      if(this.inPast){return;}
      if (d.requires.every(flag => this.flags[flag])) {this.complete = true;this.emit('door');}
    }
  }
  step(dt, input = {}) {
    if (this.complete) return;
    if(this.hazardRetry>0){this.hazardRetry-=Math.min(dt,1/30);if(this.hazardRetry<=0)this.load(this.index);return;}
    if(this.retryDelay>0){this.retryDelay-=dt;if(this.retryDelay<=0){const snapshot=this.returnState;this.load(3);this.inPast=true;this.returnState=snapshot;this.flags={hatch:true,cloak:true};this.player={...this.player,x:PORTAL_X,y:LEDGE_Y};this.emit('portal');}return;}
    dt = Math.min(dt, 1 / 30); this.time += dt;
    if(this.timer>0){this.timer=Math.max(0,this.timer-dt);if(!this.timer){this.flags.timer=false;this.emit('hatch');}}
    const p = this.player, previousY = p.y;
    for(const key of ['hitStun','invulnerable','slipThrough'])p[key]=Math.max(0,(p[key]||0)-dt);
    if(p.hitStun)input={};
    const ridingRope = updateRopes(this, dt, input);
    if (!ridingRope) {
      const mirrored = !!this.flags.mirror;
      const axis = mirrored
        ? Number(!!input.left) - Number(!!input.right)
        : Number(!!input.right) - Number(!!input.left);
      p.x = Math.max(37, Math.min(203, p.x + axis * 76 * dt + p.vx * dt));
      p.vx *= Math.exp(-(p.grounded ? 14 : 2.2) * dt);
      p.moving = !!axis || Math.abs(p.vx) > 8;
      if (axis) p.facing = axis;
      const near = this.level.ladders.find(l => Math.abs(p.x - l.x) < 10 && p.y >= l.top - 1 && p.y <= l.bottom + 2);
      const vertical = mirrored
        ? Number(!!input.up) - Number(!!input.down)
        : Number(!!input.down) - Number(!!input.up);
      // A closed ascent gate must never strand someone above it when a timer expires.
      const canClimb = !p.hitStun && near && (!near.requires || this.flags[near.requires] || vertical > 0);
      p.climbing = !!(canClimb && (vertical || p.climbing) && !axis);
      if (input.jump && (p.grounded || p.climbing)) { p.vy = -this.level.physics.jumpSpeed; p.grounded = false; p.climbing = false; this.emit('jump'); }
      else if (p.climbing) {
        p.x = near.x; p.y = Math.max(near.top, Math.min(near.bottom, p.y + vertical * 64 * dt)); p.vy = 0;
        p.grounded = p.y === near.top || p.y === near.bottom;
      }
      if (!p.climbing) {
        p.vy += this.level.physics.gravity * dt; p.y += p.vy * dt; p.grounded = false;
        const s=!p.slipThrough&&p.vy>=0&&landingSurface(this.level,this.flags,p.x,previousY,p.y);
        if(s){impact(this,p.vy);p.y=s.y;p.vy=0;p.vx=0;p.grounded=true;p.releasedRope=null;}
      }
    }
    updateObjects(this,dt);
    updateDroplets(this,dt);
    const mirror = this.level.objects.find(o => o.type === 'mirror');
    if (mirror && !this.flags.mirror && Math.abs(p.x - mirror.x) < 16 && p.y > mirror.y - 38 && p.y < mirror.y + 4) {
      this.flags.mirror = true;
      this.emit('mirror');
    }
    for (const o of this.level.objects) if (['key','seed','crystal','lantern'].includes(o.type) && !o.suspended && !o.collected && Math.abs(p.x - o.x) < 13 && Math.abs(p.y - 12 - o.y) < 16) {
      o.collected = true; this.emit('key');
      if(o.type==='crystal'){this.flags.crystalCount=(this.flags.crystalCount||0)+1;this.flags.crystals=this.flags.crystalCount===3;}
      else {this.flags[o.type] = true; }
    }
    updateNight(this,dt);
    updateChaser(this,dt);
    updateRecovery(this);
    if (input.action&&!this.hazardRetry&&p.rope===null) this.interact();
    if(!this.complete)this.updateTemporal(dt);
  }
}
