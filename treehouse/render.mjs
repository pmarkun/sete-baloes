import { lightState } from './night.mjs';
const regions = {
  key: [.80,.15,.14,.27], door: [.015,.51,.245,.37], lever: [.28,.59,.19,.25],
  platform: [.50,.68,.27,.13], ladder: [.80,.50,.15,.38],
};
const extras = {
  hood:[.06,.10,.135,.415],hoodWalk:[.285,.10,.17,.41],portal:[.52,.055,.20,.475],cloak:[.775,.125,.16,.355],
  crate:[.056,.598,.193,.32],bell:[.31,.58,.142,.34],pot:[.555,.633,.137,.28],crystal:[.802,.58,.11,.337],
  leaf:[.555,.633,.137,.13],
};
const character = {idle:[.105,.12,.19,.68],walk:[.395,.13,.23,.67],climb:[.70,.16,.21,.66]};
const night = {hunter:[.03,.10,.31,.79],hunterWalk:[.375,.12,.415,.76],lantern:[.84,.56,.125,.33]};
export async function loadArt(assetBase='assets') {
  const images = await Promise.all(['tree-outward','sprites','canopy','time-objects-alpha','character-owl','night-objects'].map(name => new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Arte indisponível: ${name}`)); img.src = `${assetBase}/${name}.png`;
  })));
  return { background: images[0], sprites: images[1], canopy: images[2], extras:images[3], character:images[4],night:images[5] };
}

export function renderFinale(ctx, art, pose) {
  ctx.imageSmoothingEnabled = false;
  // Extend the actual sky pixels above the background as the camera rises.
  ctx.drawImage(art.canopy, 0, 0, art.canopy.width, art.canopy.height * .15, 0, 0, 240, 120);
  ctx.drawImage(art.canopy, 0, Math.round(pose.canopyOffset), 240, 360);
  const r = character.idle, img = art.character;
  ctx.drawImage(img, r[0]*img.width, r[1]*img.height, r[2]*img.width, r[3]*img.height,
    108, Math.round(pose.girlY - 39), 24, 40);
}
export function render(ctx, game, art, {reducedMotion=false}={}) {
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if(game.flags.mirror)ctx.filter='invert(1)';
  if(game.shake&&!reducedMotion){ctx.fillStyle='#291c20';ctx.fillRect(0,0,240,360);ctx.translate(Math.round(Math.sin(game.time*93)*game.shake*11),Math.round(Math.cos(game.time*77)*game.shake*8));}
  ctx.drawImage(art.background, 0, 0, 240, 360);
  const sprite = (name,x,y,w,h,flip=false) => {
    const r=night[name]||character[name]||regions[name]||extras[name], img=night[name]?art.night:character[name]?art.character:regions[name]?art.sprites:art.extras;
    ctx.save(); ctx.translate(Math.round(x + (flip ? w : 0)),Math.round(y)); if(flip) ctx.scale(-1,1);
    ctx.drawImage(img,r[0]*img.width,r[1]*img.height,r[2]*img.width,r[3]*img.height,0,0,w,h); ctx.restore();
  };
  const label=(text,x,y,color='#f4d9a4')=>{ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillStyle='#21151e';ctx.fillRect(x-ctx.measureText(text).width/2-2,y-8,ctx.measureText(text).width+4,11);ctx.fillStyle=color;ctx.fillText(text,x,y);};
  for(const l of game.level.ladders) {
    const locked=l.requires&&!game.flags[l.requires];
    if(locked&&l.vine)continue;
    ctx.save();if(locked)ctx.globalAlpha=.25;
    // The physical top remains closed until the matching hatch is opened.
    for(let y=l.top;y<l.bottom;y+=30) {sprite('ladder',l.x-7,y,14,Math.min(32,l.bottom-y));if(l.vine)sprite('leaf',l.x-11,y,15,12);}
    ctx.restore();
  }
  for(const p of game.level.platforms) {
    if(p.requires && !game.flags[p.requires]) { ctx.save();ctx.setLineDash([2,3]);ctx.strokeStyle='#b68c6870';ctx.strokeRect(p.x,p.y,p.w,5);ctx.restore();continue; }
    for(let x=p.x;x<p.x+p.w;x+=30) sprite('platform',x,p.y,Math.min(31,p.x+p.w-x),11);
  }
  for(const rope of (game.ropes?.length ? game.ropes : game.level.ropes) || []) {
    const current = rope;
    const bobX = current.x ?? current.pivotX;
    const bobY = current.y ?? current.pivotY + current.length;
    ctx.save();
    ctx.strokeStyle='#b98562';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(current.pivotX,current.pivotY);ctx.lineTo(bobX,bobY);ctx.stroke();
    ctx.fillStyle='#f4d9a4';ctx.fillRect(current.pivotX-3,current.pivotY-2,6,4);
    ctx.fillStyle='#75474a';ctx.beginPath();ctx.arc(bobX,bobY,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  for(const drop of game.level.droplets || []) {
    ctx.save();
    ctx.strokeStyle='#a8cbd0aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(drop.x,drop.y-18);ctx.lineTo(drop.x,drop.y+2);ctx.stroke();
    ctx.fillStyle='#b9e2df';ctx.beginPath();ctx.moveTo(drop.x,drop.y-6);ctx.quadraticCurveTo(drop.x+7,drop.y+3,drop.x,drop.y+8);ctx.quadraticCurveTo(drop.x-7,drop.y+3,drop.x,drop.y-6);ctx.fill();
    ctx.restore();
  }
  const d=game.level.door; sprite('door',d.x-12,d.y-34,24,35);
  if(d.requires.every(f=>game.flags[f])) {ctx.fillStyle='#efc878';ctx.fillRect(d.x+5,d.y-17,2,2);}
  for(const o of game.level.objects) {
    if(o.type==='lantern'&&!o.collected)sprite('lantern',o.x-5,o.y-8,10,16);
    if(o.type==='spikes')for(let x=o.x;x<o.x+o.w;x+=7){ctx.fillStyle='#c4bac8';ctx.beginPath();ctx.moveTo(x,o.y);ctx.lineTo(x+3,o.y-8);ctx.lineTo(Math.min(x+7,o.x+o.w),o.y);ctx.fill();}
    if(['key','exitKey'].includes(o.type)&&!o.collected){
      const wobble=o.shake&&!reducedMotion?Math.sin(game.time*60)*3:0;
      if(o.suspended){ctx.strokeStyle='#c6aa72';ctx.beginPath();ctx.moveTo(o.x,o.anchorY??o.y-32);ctx.lineTo(o.x+wobble,o.y-10);ctx.stroke();}
      sprite('key',o.x-5+wobble,o.y-10,10,19);
    }
    if(o.type==='lever') { sprite('lever',o.x-8,o.y-21,16,22,!!game.flags[o.target]); if(game.flags[o.target]){ctx.fillStyle='#b5ca83';ctx.fillRect(o.x-2,o.y-24,4,2);} }
    if(o.type==='crate')sprite('crate',o.x-10,o.y-20,20,20);
    if(o.type==='plate'){ctx.fillStyle=game.flags.weight?'#b7d895':'#e5bc69';ctx.fillRect(o.x-12,o.y-2,24,3);}
    if(o.type==='bell'){sprite('bell',o.x-8,o.y-25,16,25);label(String(o.note),o.x,o.y-30,game.sequence.includes(o.note)?'#b7d895':'#f4d9a4');}
    if(o.type==='pot')sprite('pot',o.x-9,o.y-22,18,22);
    if(o.type==='seed'&&!o.collected)sprite('pot',o.x-4,o.y-5,8,10);
    if(o.type==='crystal'&&!o.collected)sprite('crystal',o.x-5,o.y-11,10,20);
    if(o.type==='cloak'&&!o.collected)sprite('cloak',o.x-10,o.y-28,20,28);
    if(o.type==='mirror'){
      ctx.save();
      ctx.fillStyle='#6b4146';ctx.fillRect(o.x-13,o.y-43,26,43);
      ctx.fillStyle='#b7d8d5';ctx.fillRect(o.x-9,o.y-38,18,31);
      ctx.strokeStyle='#f4d9a4';ctx.lineWidth=1;ctx.strokeRect(o.x-10,o.y-39,20,33);
      ctx.strokeStyle='#ffffff99';ctx.beginPath();ctx.moveTo(o.x-6,o.y-34);ctx.lineTo(o.x+5,o.y-23);ctx.stroke();
      ctx.fillStyle='#422733';ctx.fillRect(o.x-16,o.y-3,32,4);
      ctx.restore();
    }
  }
  if(game.level.falseExit){const e=game.level.falseExit;sprite('door',e.x-10,e.y-30,20,30);label('SAÍDA',e.x,e.y-35,'#b7d895');}
  if(game.level.portal&&(game.inPast||game.ghost||(game.flags.cloak&&!game.flags.timeKey))){const p=game.level.portal;sprite('portal',p.x-14,p.y-39,28,40);}
  const hatch=game.level.hatch;
  if(hatch&&!game.flags[hatch.requires]) sprite('platform',hatch.x-13,hatch.y-3,26,8);
  const p=game.player;
  const person=(p,cloak=false)=>sprite(cloak?(p.moving&&Math.floor(game.time*9)%2?'hoodWalk':'hood'):p.climbing&&!p.grounded?'climb':p.moving&&Math.floor(game.time*9)%2?'walk':'idle',p.x-10,p.y-32,20,33,p.facing<0);
  if(game.ghost)person(game.ghost,true);
  if(game.pastSelf)person(game.pastSelf);
  if(game.chaser){const c=game.chaser;sprite(c.moving&&Math.floor(game.time*8)%2?'hunterWalk':'hunter',c.x-13,c.y-38,26,38,c.facing<0);}
  person(p,game.flags.cloak);
  if(game.flags.lantern)sprite('lantern',p.x+(p.facing<0?-13:5),p.y-17,8,13);
  if(game.hunter){const h=game.hunter;sprite(h.moving&&Math.floor(game.time*8)%2?'hunterWalk':'hunter',h.x-13,h.y-38,26,38,h.facing<0);}
  if(game.inPast){label('ANDAR 4 · PASSADO',120,19,'#bba9ff');if(game.flags.stolenKey)sprite('key',p.x+7,p.y-24,6,12);}
  if(game.timer>0)label(`${Math.ceil(game.timer)}s`,175,36,'#b7d895');
  const lighting=game.level.lighting;
  if(lighting?.mode==='lantern'){
    const glow=ctx.createRadialGradient(p.x,p.y-18,12,p.x,p.y-18,lighting.radius);
    glow.addColorStop(0,'rgba(0,0,0,0)');glow.addColorStop(.48,'rgba(0,0,0,.12)');glow.addColorStop(1,'#000');
    ctx.fillStyle=glow;ctx.fillRect(0,0,240,360);
  }else if(lighting?.mode==='cycle'){
    const light=lightState(game.level,game.time);
    // Reduced motion keeps the scene dim and steady; a small lamp indicates the cycle.
    ctx.fillStyle=`rgba(0,0,0,${reducedMotion?.35:light.opacity})`;ctx.fillRect(0,0,240,360);
    if(reducedMotion){ctx.fillStyle=light.dark?'#453628':'#e7c983';ctx.fillRect(116,12,8,5);}
  }
  ctx.restore();
}
