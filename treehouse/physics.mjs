// Shared gravity and movable-object behavior. Coordinates use feet for actors.
export function landingSurface(level, flags, x, from, to, halfWidth=5) {
  return level.platforms.filter(s=>(!s.requires||flags[s.requires]) && x+halfWidth>s.x && x-halfWidth<s.x+s.w && from<=s.y+.1 && to>=s.y).sort((a,b)=>a.y-b.y)[0];
}
export function impact(game, speed) {
  const threshold=game.level.physics.impactThreshold;
  if(!threshold || speed<threshold)return;
  game.shake=.38;game.emit('impact');
  for(const o of game.level.objects)if(o.suspended&&!o.collected){
    o.shake=.55;o.impacts++;
    if(o.impacts>=o.releaseAfter){o.suspended=false;o.falling=true;game.emit('release');}
  }
}
export function updateObjects(game,dt) {
  game.shake=Math.max(0,(game.shake||0)-dt);
  for(const o of game.level.objects){
    o.shake=Math.max(0,(o.shake||0)-dt);
    if(!o.falling||o.collected)continue;
    const previous=o.y+12;o.vy+=game.level.physics.gravity*dt;o.y+=o.vy*dt;
    const surface=landingSurface(game.level,game.flags,o.x,previous,o.y+12,4);
    if(surface){o.y=surface.y-12;o.vy=0;o.falling=false;}
  }
}
