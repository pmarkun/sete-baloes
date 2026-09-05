import { levels } from './levels.mjs';
import { thiefPose, pastSelfPose, PORTAL_X, LEDGE_Y } from './temporal.mjs';
export const WIDTH = 240, HEIGHT = 360;
export class Game {
  constructor(index = 0) { this.load(index); }
  load(index) {
    this.index = Math.max(0, Math.min(levels.length - 1, index));
    this.level = structuredClone(levels[this.index]);
    this.player = { ...this.level.spawn, vy: 0, grounded: true, climbing: false, facing: 1, moving: false };
    this.flags = {}; this.complete = false; this.message = ''; this.time = 0;
    this.events = []; this.sequence = []; this.timer = 0;
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
    this.message = 'É você lá embaixo! Pegue a chave com AÇÃO e volte ao portal!';
    this.emit('portal');
  }
  leavePast() {
    const saved = this.returnState;
    this.load(saved.index); this.level = saved.level; this.flags = {...saved.flags,timeKey:true};
    this.player = {...saved.player,x:PORTAL_X-22}; this.time = saved.time;
    this.message = 'A figura de manto era você. A chave abriu o caminho adiante.';
    this.emit('portal');
  }
  updateTemporal(dt) {
    if (this.inPast) {
      this.temporalClock += dt; this.pastSelf = pastSelfPose(this.temporalClock);
      if (this.temporalClock > 10 || (Math.abs(this.player.x-this.pastSelf.x)<12 && Math.abs(this.player.y-this.pastSelf.y)<20)) {
        this.retryDelay = 1.5; this.message = 'Seu passado alcançou você! O portal vai tentar de novo…'; this.emit('caught');
      }
    } else if (this.level.paradox) {
      if (this.theftClock === null && this.player.y <= 255) {
        this.theftClock = 0; this.message = 'Um portal?! Quem é essa figura de manto?'; this.emit('portal');
      }
      if (this.theftClock !== null) {
        this.theftClock += dt; this.ghost = thiefPose(this.theftClock);
        const key = this.level.objects.find(o=>o.type==='exitKey');
        if (this.theftClock >= 1.4 && !key.collected) {
          key.collected = true; this.emit('key');
          this.message = 'A figura roubou a chave da SAÍDA! Só resta continuar subindo.';
        }
      }
    }
  }
  interact() {
    const p = this.player;
    const portal = this.level.portal;
    if (portal && Math.abs(p.x-portal.x)<19 && Math.abs(p.y-portal.y)<20) {
      if (this.inPast) {
        if (this.flags.stolenKey) this.leavePast(); else this.message = 'A chave da SAÍDA está à esquerda. Pegue-a com AÇÃO!';
        return;
      }
      if (this.flags.cloak && !this.flags.timeKey) { this.enterPast(); return; }
    }
    const interactables = ['lever','crate','bell','pot','cloak','exitKey'];
    const o = this.level.objects.filter(o=>interactables.includes(o.type)&&!o.collected&&Math.abs(p.x-o.x)<23&&Math.abs(p.y-o.y)<23)
      .sort((a,b)=>Math.abs(p.x-a.x)-Math.abs(p.x-b.x))[0];
    if (o) {
      if (o.type === 'lever') {
        if (o.target==='timer') { this.timer=12;this.flags.timer=true;this.message='Passagem aberta: 12 segundos!';this.emit('lever');this.emit('hatch'); }
        else if (!this.flags[o.target]) {
          this.flags[o.target] = true; this.emit('lever');
          if(o.target==='hatch')this.emit('hatch');
          this.message = o.target === 'bridge' ? 'A ponte está pronta!' : 'O alçapão está aberto!';
        }
      } else if (o.type==='crate') {
        o.x = Math.max(45,Math.min(195,o.x+p.facing*18));this.emit('crate');
        const plate=this.level.objects.find(o=>o.type==='plate');
        this.flags.weight=Math.abs(o.x-plate.x)<12;
        this.message=this.flags.weight?'Contrapeso encaixado. A escada foi liberada!':'Mais um empurrão. A marca dourada espera a caixa.';
      } else if (o.type==='bell') {
        if(!this.flags.song){this.emit('bell',o.note);this.sequence.push(o.note);
          if(this.sequence.some((n,i)=>n!==this.level.melody[i])) {this.sequence=[];this.message='Quase! Recomece a melodia: 2 → 1 → 3.';}
          else if(this.sequence.length===this.level.melody.length){this.flags.song=true;this.emit('unlock');this.message='A árvore reconheceu a melodia!';}
          else this.message=`Notas tocadas: ${this.sequence.join(' → ')}. Continue!`;
        }
      } else if (o.type==='pot') {
        if(this.flags.seed&&!this.flags.grown){this.flags.grown=true;this.emit('grow');this.message='Uma escada de folhas! Pode subir.';}
        else if(!this.flags.seed)this.message='Falta uma semente. Procure à esquerda.';
      } else if (o.type==='cloak') {
        o.collected=true;this.flags.cloak=true;this.emit('portal');this.message='Seu rosto sumiu sob o manto. Use AÇÃO no portal à direita.';
      } else if(o.type==='exitKey'&&this.inPast) {
        o.collected=true;this.flags.stolenKey=true;this.emit('key');this.message='Chave na mão! Corra ao portal à direita e use AÇÃO!';
      }
      return;
    }
    if(this.level.falseExit&&Math.abs(p.x-this.level.falseExit.x)<20&&Math.abs(p.y-160)<20){
      this.message=this.inPast?'Não é por essa porta. Fuja pelo portal!':'SAÍDA trancada. Levaram sua chave… continue pela escada.';return;
    }
    const d = this.level.door;
    if (Math.abs(p.x - d.x) < 23 && Math.abs(p.y - d.y) < 15) {
      if(this.inPast){this.message='Volte pelo portal do passado!';return;}
      if (d.requires.every(flag => this.flags[flag])) {this.complete = true;this.emit('door');}
      else this.message = d.requires.includes('key') && !this.flags.key ? 'Falta encontrar a chave.' : 'Explore o andar e acione a alavanca.';
    }
  }
  step(dt, input = {}) {
    if (this.complete) return;
    if(this.retryDelay>0){this.retryDelay-=dt;if(this.retryDelay<=0){const snapshot=this.returnState;this.load(3);this.inPast=true;this.returnState=snapshot;this.flags={hatch:true,cloak:true};this.player={...this.player,x:PORTAL_X,y:LEDGE_Y};this.message='Tente de novo: AÇÃO na chave, depois AÇÃO no portal!';this.emit('portal');}return;}
    dt = Math.min(dt, 1 / 30); this.time += dt;
    if(this.timer>0){this.timer=Math.max(0,this.timer-dt);if(!this.timer){this.flags.timer=false;this.emit('hatch');this.message='O tempo acabou. A alavanca pode abrir de novo.';}}
    const p = this.player, previousY = p.y;
    const axis = Number(!!input.right) - Number(!!input.left);
    p.x = Math.max(37, Math.min(203, p.x + axis * 76 * dt));
    p.moving = !!axis;
    if (axis) p.facing = axis;
    const near = this.level.ladders.find(l => Math.abs(p.x - l.x) < 10 && p.y >= l.top - 1 && p.y <= l.bottom + 2);
    const vertical = Number(!!input.down) - Number(!!input.up);
    // A closed ascent gate must never strand someone above it when a timer expires.
    const canClimb = near && (!near.requires || this.flags[near.requires] || input.down);
    p.climbing = !!(canClimb && (vertical || p.climbing) && !axis);
    if (input.jump && (p.grounded || p.climbing)) { p.vy = -175; p.grounded = false; p.climbing = false; this.emit('jump'); }
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
    for (const o of this.level.objects) if (['key','seed','crystal'].includes(o.type) && !o.collected && Math.abs(p.x - o.x) < 13 && Math.abs(p.y - 12 - o.y) < 16) {
      o.collected = true; this.emit('key');
      if(o.type==='crystal'){this.flags.crystalCount=(this.flags.crystalCount||0)+1;this.flags.crystals=this.flags.crystalCount===3;this.message=`Cristais: ${this.flags.crystalCount} / 3.`;}
      else {this.flags[o.type] = true; this.message=o.type==='seed'?'Semente encontrada. Leve-a ao vaso!':'Chave encontrada!';}
    }
    if (input.action) this.interact();
    if(!this.complete)this.updateTemporal(dt);
  }
}
