import { rainPhase } from './mechanics.mjs';

export function renderAtmosphere(ctx, game, reducedMotion) {
  const theme = game.level.theme;
  if (!theme) return;
  ctx.save();
  const wash = ctx.createLinearGradient(0,0,0,360);
  wash.addColorStop(0, theme==='rain'?'#37687955':theme==='sunrise'?'#f0b95855':'#66955744');
  wash.addColorStop(1,'#101c2c22');
  ctx.fillStyle=wash;ctx.fillRect(30,0,180,360);
  if (theme==='sunrise') {
    for(const y of [85,175,265]){
      ctx.fillStyle='#f6cf8040';ctx.beginPath();ctx.moveTo(31,y-20);ctx.lineTo(120,y+18);ctx.lineTo(120,y+40);ctx.lineTo(31,y+4);ctx.fill();
      ctx.fillStyle='#ffe1a2';ctx.fillRect(31,y-20,5,25);
      ctx.fillStyle='#593f30';ctx.fillRect(30,y-10,8,3);
    }
  } else if(theme==='rain') {
    ctx.strokeStyle='#9ac5d327';ctx.lineWidth=1;
    for(let i=0;i<22;i++){
      const x=38+(i*43)%162, y=(i*53+(reducedMotion?0:game.time*36))%360;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-2,y+7);ctx.stroke();
    }
  } else {
    for(let i=0;i<18;i++){
      const x=42+(i*47)%157, y=20+(i*71)%302;
      ctx.fillStyle=i%3?'#b7df7266':'#fbda97aa';
      ctx.fillRect(x,y+(reducedMotion?0:Math.sin(game.time*.7+i)*2),2,2);
    }
    for(const x of [32,205]){
      ctx.strokeStyle='#547542';ctx.beginPath();ctx.moveTo(x,15);ctx.bezierCurveTo(x-9,100,x+8,230,x,325);ctx.stroke();
      for(let y=22;y<320;y+=23){ctx.fillStyle=y%2?'#729951':'#496944';ctx.beginPath();ctx.ellipse(x+(y%3-1)*4,y,6,3,-.6,0,Math.PI*2);ctx.fill();}
    }
  }
  ctx.restore();
}

export function renderMechanisms(ctx, game, sprite, label, reducedMotion) {
  ctx.save();
  for(const [index,rope] of game.ropes.entries()){
    const attached=game.player.rope===index;
    // A faint arc shows the physical travel envelope.
    ctx.strokeStyle='#eed79922';ctx.setLineDash([2,5]);ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(rope.pivotX,rope.pivotY,rope.length,Math.PI/2-rope.amplitude,Math.PI/2+rope.amplitude);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#362921';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(rope.pivotX,rope.pivotY);ctx.lineTo(rope.x,rope.y);ctx.stroke();
    ctx.strokeStyle=attached?'#ffe296':'#bca06b';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#7e9b52';ctx.fillRect(rope.pivotX-8,rope.pivotY-4,16,5);
    ctx.fillStyle=attached?'#fbd779':'#d9cc9b';ctx.fillRect(rope.x-7,rope.y-2,14,4);
    if(attached)label('PULAR',rope.x,rope.y-12);
    else if(Math.abs(game.player.x-rope.x)<25&&Math.abs(game.player.y-22-rope.y)<28)label('↑ / AÇÃO',rope.x,rope.y-14);
  }
  for(const shelter of game.level.shelters||[]){
    ctx.fillStyle='#2b4739';ctx.fillRect(shelter.x,shelter.y,shelter.w,5);
    ctx.fillStyle='#96bd78';ctx.fillRect(shelter.x,shelter.y,shelter.w,2);
    ctx.fillStyle='#405c43';ctx.fillRect(shelter.x+3,shelter.y+5,2,22);ctx.fillRect(shelter.x+shelter.w-5,shelter.y+5,2,22);
  }
  for(const emitter of game.level.droplets||[]){
    const state=rainPhase(emitter,game.time);
    ctx.strokeStyle='#617f88';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(emitter.direction===1?30:210,emitter.y-9);ctx.lineTo(emitter.x,emitter.y-9);ctx.lineTo(emitter.x,emitter.y-1);ctx.stroke();
    ctx.strokeStyle='#a9c6c3';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=state.warning?'#ffd181':state.active?'#c5f1f0':'#69858c';
    ctx.beginPath();ctx.ellipse(emitter.x,emitter.y+2,2+state.charge*2,3+state.charge*4,0,0,Math.PI*2);ctx.fill();
    if(state.warning)label('!',emitter.x+11,emitter.y+4,'#ffd181');
  }
  for(const drop of game.drops){
    ctx.fillStyle='#b9edec';
    if(drop.surface){
      ctx.fillRect(drop.x-6,drop.y-1,12,3);
      ctx.strokeStyle='#f5ffff';ctx.beginPath();ctx.moveTo(drop.x-drop.direction*8,drop.y-2);ctx.lineTo(drop.x,drop.y-2);ctx.stroke();
    } else {
      ctx.strokeStyle='#abd9e088';ctx.beginPath();ctx.moveTo(drop.x,drop.y-12);ctx.lineTo(drop.x,drop.y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(drop.x,drop.y-5);ctx.quadraticCurveTo(drop.x+6,drop.y+4,drop.x,drop.y+6);ctx.quadraticCurveTo(drop.x-6,drop.y+4,drop.x,drop.y-5);ctx.fill();
    }
  }
  for(const s of game.splashes){
    ctx.strokeStyle='#c2eff1';ctx.beginPath();ctx.moveTo(s.x-6,s.y-4);ctx.lineTo(s.x-3,s.y-1);ctx.moveTo(s.x+3,s.y-1);ctx.lineTo(s.x+6,s.y-4);ctx.stroke();
  }
  for(const [index,point] of (game.level.checkpoints||[]).entries()){
    const active=index<=game.checkpointIndex;
    ctx.fillStyle='#cfaa73';ctx.fillRect(point.x-13,point.y-22,2,22);
    ctx.fillStyle=active?'#a6d97c':'#817659';ctx.beginPath();ctx.moveTo(point.x-11,point.y-22);ctx.lineTo(point.x+1,point.y-18);ctx.lineTo(point.x-11,point.y-14);ctx.fill();
    if(active){ctx.strokeStyle='#bce89e66';ctx.strokeRect(point.x-16,point.y-1,30,3);}
  }
  for(const [index,lure] of (game.level.lures||[]).entries()){
    const cooling=(game.lureCooldowns[index]||0)>0;
    sprite('bell',lure.x-8,lure.y-28,16,25);
    ctx.fillStyle=game.flags[lure.flag]?'#a6d97c':'#f2c571';ctx.fillRect(lure.x-3,lure.y-34,6,3);
    if(cooling){ctx.strokeStyle='#f8d18288';ctx.beginPath();ctx.arc(lure.x,lure.y-19,13+(reducedMotion?0:Math.sin(game.time*5)*2),-.8,.8);ctx.stroke();}
    if(Math.abs(game.player.x-lure.x)<22&&Math.abs(game.player.y-lure.y)<20)label(cooling?'…':'AÇÃO',lure.x,lure.y-40);
  }
  const c=game.chaser;
  if(c){
    if(c.state==='windup'){
      ctx.fillStyle='#ed9b4933';ctx.fillRect(c.facing>0?c.x:c.x-70,c.y-5,70,5);
      label('!',c.x,c.y-44,'#ffce82');
    }else if(c.state==='recover')label('…',c.x,c.y-43,'#a6d97c');
    else if(c.state==='distracted')label('♪',c.x,c.y-43,'#a6d97c');
    else if(c.state==='waking')label('?!',c.x,c.y-43);
  }
  if(game.level.chaser){
    const d=game.level.door;
    for(const [i,flag] of d.requires.entries()){
      ctx.fillStyle=game.flags[flag]?'#bce898':'#7f5148';ctx.fillRect(d.x-5+i*7,d.y-39,4,4);
    }
    if(!c){sprite('hunter',game.level.chaser.spawn.x-13,game.level.chaser.spawn.y-32,26,32);label('z',game.level.chaser.spawn.x,game.level.chaser.spawn.y-40);}
  }
  ctx.restore();
}
