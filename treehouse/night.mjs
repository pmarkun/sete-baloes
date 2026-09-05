// The light clock belongs to the simulation: pausing also freezes the hunter.
export function lightState(level,time) {
  const l=level.lighting;
  if(l?.mode!=='cycle')return {dark:false,opacity:0};
  const phase=time%(l.lightSeconds+l.darkSeconds),dark=phase>=l.lightSeconds;
  const fade=l.fade||.35;
  const opacity=dark?1:Math.max(0,1-phase/fade,(phase-(l.lightSeconds-fade))/fade);
  return {dark,opacity};
}
export function failAttempt(game, event='caught') {
  if(game.hazardRetry)return;
  game.hazardRetry=.8;game.player.moving=false;game.emit(event);
}
function pursuitTarget(game,h) {
  const p=game.player;
  if(Math.abs(h.y-p.y)<2)return {x:p.x,y:h.y};
  const up=p.y<h.y;
  const climbing=game.level.ladders.find(l=>Math.abs(h.x-l.x)<.5&&h.y>l.top+.5&&h.y<l.bottom-.5);
  if(climbing)return {x:climbing.x,y:up?climbing.top:climbing.bottom};
  const ladder=game.level.ladders.filter(l=>Math.abs((up?l.bottom:l.top)-h.y)<1).sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x))[0];
  if(!ladder)return null;
  return Math.abs(h.x-ladder.x)>.5?{x:ladder.x,y:h.y}:{x:ladder.x,y:up?ladder.top:ladder.bottom};
}
export function updateNight(game,dt) {
  const p=game.player;
  for(const o of game.level.objects)if(o.type==='spikes'&&p.x+5>o.x&&p.x-5<o.x+o.w&&p.y>o.y-8&&p.y-28<o.y)failAttempt(game);
  const config=game.level.hunter;
  if(!config)return;
  if(!game.hunter&&p.y<=config.triggerY){
    game.hunter={...config.spawn,facing:1,moving:false};
    game.time=0;game.emit('creature');
  }
  const dark=lightState(game.level,game.time).dark;
  if(dark!==game.lastDark){game.lastDark=dark;game.emit(dark?'powerOff':'powerOn');}
  const h=game.hunter;
  if(!h)return;
  h.moving=false;
  if(dark){
    const target=pursuitTarget(game,h);
    if(target){const dx=target.x-h.x,dy=target.y-h.y,d=Math.hypot(dx,dy),step=Math.min(d,config.speed*dt);
      if(d){h.x+=dx/d*step;h.y+=dy/d*step;h.moving=true;if(dx)h.facing=Math.sign(dx);}
    }
    if(Math.abs(h.x-p.x)<13&&Math.abs(h.y-p.y)<25)failAttempt(game);
  }
}
