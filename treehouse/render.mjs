const regions = {
  idle: [.04,.12,.17,.34], walk: [.29,.12,.19,.34], climb: [.54,.12,.19,.35],
  key: [.80,.15,.14,.27], door: [.015,.51,.245,.37], lever: [.28,.59,.19,.25],
  platform: [.50,.68,.27,.13], ladder: [.80,.50,.15,.38],
};
export async function loadArt() {
  const images = await Promise.all(['tree','sprites'].map(name => new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Arte indisponível: ${name}`)); img.src = `assets/${name}.png`;
  })));
  return { background: images[0], sprites: images[1] };
}
export function render(ctx, game, art) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(art.background, 0, 0, 240, 360);
  const sprite = (name,x,y,w,h,flip=false) => {
    const r=regions[name], img=art.sprites;
    ctx.save(); ctx.translate(Math.round(x + (flip ? w : 0)),Math.round(y)); if(flip) ctx.scale(-1,1);
    ctx.drawImage(img,r[0]*img.width,r[1]*img.height,r[2]*img.width,r[3]*img.height,0,0,w,h); ctx.restore();
  };
  for(const l of game.level.ladders) {
    // The physical top remains closed until the matching hatch is opened.
    for(let y=l.top;y<l.bottom;y+=30) sprite('ladder',l.x-7,y,14,Math.min(32,l.bottom-y));
  }
  for(const p of game.level.platforms) {
    if(p.requires && !game.flags[p.requires]) { ctx.save();ctx.setLineDash([2,3]);ctx.strokeStyle='#b68c6870';ctx.strokeRect(p.x,p.y,p.w,5);ctx.restore();continue; }
    for(let x=p.x;x<p.x+p.w;x+=30) sprite('platform',x,p.y,Math.min(31,p.x+p.w-x),11);
  }
  const d=game.level.door; sprite('door',d.x-12,d.y-34,24,35);
  if(d.requires.every(f=>game.flags[f])) {ctx.fillStyle='#efc878';ctx.fillRect(d.x+5,d.y-17,2,2);}
  for(const o of game.level.objects) {
    if(o.type==='key'&&!o.collected) sprite('key',o.x-5,o.y-10,10,19);
    if(o.type==='lever') { sprite('lever',o.x-8,o.y-21,16,22,!!game.flags[o.target]); if(game.flags[o.target]){ctx.fillStyle='#b5ca83';ctx.fillRect(o.x-2,o.y-24,4,2);} }
  }
  const hatch=game.level.hatch;
  if(hatch&&!game.flags[hatch.requires]) sprite('platform',hatch.x-13,hatch.y-3,26,8);
  const p=game.player;
  sprite(p.climbing&&!p.grounded?'climb':p.moving&&Math.floor(game.time*9)%2?'walk':'idle',p.x-10,p.y-32,20,33,p.facing<0);
}
