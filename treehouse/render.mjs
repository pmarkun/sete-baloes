const regions = {
  idle: [.04,.12,.17,.34], walk: [.29,.12,.19,.34], climb: [.54,.12,.19,.35],
  key: [.80,.15,.14,.27], door: [.015,.51,.245,.37], lever: [.28,.59,.19,.25],
  platform: [.50,.68,.27,.13], ladder: [.80,.50,.15,.38],
};
const extras = {
  hood:[.06,.10,.135,.415],hoodWalk:[.285,.10,.17,.41],portal:[.52,.055,.20,.475],cloak:[.775,.125,.16,.355],
  crate:[.056,.598,.193,.32],bell:[.31,.58,.142,.34],pot:[.555,.633,.137,.28],crystal:[.802,.58,.11,.337],
  leaf:[.555,.633,.137,.13],
};
export async function loadArt() {
  const images = await Promise.all(['tree-outward','sprites','canopy','time-objects-alpha'].map(name => new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Arte indisponível: ${name}`)); img.src = `assets/${name}.png`;
  })));
  return { background: images[0], sprites: images[1], canopy: images[2], extras:images[3] };
}

export function renderFinale(ctx, art, pose) {
  ctx.imageSmoothingEnabled = false;
  // Extend the actual sky pixels above the background as the camera rises.
  ctx.drawImage(art.canopy, 0, 0, art.canopy.width, art.canopy.height * .15, 0, 0, 240, 120);
  ctx.drawImage(art.canopy, 0, Math.round(pose.canopyOffset), 240, 360);
  const r = regions.idle, img = art.sprites;
  ctx.drawImage(img, r[0]*img.width, r[1]*img.height, r[2]*img.width, r[3]*img.height,
    108, Math.round(pose.girlY - 39), 24, 40);
}
export function render(ctx, game, art) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(art.background, 0, 0, 240, 360);
  const sprite = (name,x,y,w,h,flip=false) => {
    const r=regions[name]||extras[name], img=regions[name]?art.sprites:art.extras;
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
  const d=game.level.door; sprite('door',d.x-12,d.y-34,24,35);
  if(d.requires.every(f=>game.flags[f])) {ctx.fillStyle='#efc878';ctx.fillRect(d.x+5,d.y-17,2,2);}
  for(const o of game.level.objects) {
    if(['key','exitKey'].includes(o.type)&&!o.collected) sprite('key',o.x-5,o.y-10,10,19);
    if(o.type==='lever') { sprite('lever',o.x-8,o.y-21,16,22,!!game.flags[o.target]); if(game.flags[o.target]){ctx.fillStyle='#b5ca83';ctx.fillRect(o.x-2,o.y-24,4,2);} }
    if(o.type==='crate')sprite('crate',o.x-10,o.y-20,20,20);
    if(o.type==='plate'){ctx.fillStyle=game.flags.weight?'#b7d895':'#e5bc69';ctx.fillRect(o.x-12,o.y-2,24,3);}
    if(o.type==='bell'){sprite('bell',o.x-8,o.y-25,16,25);label(String(o.note),o.x,o.y-30,game.sequence.includes(o.note)?'#b7d895':'#f4d9a4');}
    if(o.type==='pot')sprite('pot',o.x-9,o.y-22,18,22);
    if(o.type==='seed'&&!o.collected)sprite('pot',o.x-4,o.y-5,8,10);
    if(o.type==='crystal'&&!o.collected)sprite('crystal',o.x-5,o.y-11,10,20);
    if(o.type==='cloak'&&!o.collected)sprite('cloak',o.x-10,o.y-28,20,28);
    if(['lever','crate','bell','pot','cloak'].includes(o.type)&&!o.collected&&Math.abs(game.player.x-o.x)<23&&Math.abs(game.player.y-o.y)<23)label('AÇÃO',o.x,o.y-(o.type==='bell'?42:34));
  }
  if(game.level.falseExit){const e=game.level.falseExit;sprite('door',e.x-10,e.y-30,20,30);label('SAÍDA',e.x,e.y-35,'#b7d895');}
  if(game.level.portal&&(game.inPast||game.ghost||(game.flags.cloak&&!game.flags.timeKey))){const p=game.level.portal;sprite('portal',p.x-14,p.y-39,28,40);}
  const hatch=game.level.hatch;
  if(hatch&&!game.flags[hatch.requires]) sprite('platform',hatch.x-13,hatch.y-3,26,8);
  const p=game.player;
  const person=(p,cloak=false)=>sprite(cloak?(p.moving&&Math.floor(game.time*9)%2?'hoodWalk':'hood'):p.climbing&&!p.grounded?'climb':p.moving&&Math.floor(game.time*9)%2?'walk':'idle',p.x-10,p.y-32,20,33,p.facing<0);
  if(game.ghost)person(game.ghost,true);
  if(game.pastSelf)person(game.pastSelf);
  person(p,game.flags.cloak);
  if(game.inPast){label('ANDAR 4 · PASSADO',120,19,'#bba9ff');if(game.flags.stolenKey)sprite('key',p.x+7,p.y-24,6,12);}
  if(game.timer>0)label(`${Math.ceil(game.timer)}s`,175,36,'#b7d895');
}
