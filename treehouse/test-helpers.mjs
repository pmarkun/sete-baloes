import assert from 'node:assert/strict';
export const tick=(g,input={},n=1)=>{for(let i=0;i<n;i++)g.step(1/60,input);};
export const action=g=>tick(g,{action:true});
export function walk(g,x){for(let i=0;i<300&&Math.abs(g.player.x-x)>1.3;i++)tick(g,{[g.player.x<x?'right':'left']:true});assert.ok(Math.abs(g.player.x-x)<2);}
export function climb(g,x,y){walk(g,x);for(let i=0;i<300&&Math.abs(g.player.y-y)>.1;i++)tick(g,{[g.player.y>y?'up':'down']:true});assert.ok(Math.abs(g.player.y-y)<1,`floor ${g.index+1}: ladder ${x}: y ${g.player.y} expected ${y}`);}
export function jumpTo(g,x,y){
  tick(g,{jump:true,[g.player.x<x?'right':'left']:Math.abs(g.player.x-x)>1.3});
  for(let i=0;i<300&&!g.player.grounded;i++)tick(g,Math.abs(g.player.x-x)>1.3?{[g.player.x<x?'right':'left']:true}:{});
  assert.ok(g.player.grounded&&Math.abs(g.player.y-y)<1,`floor ${g.index+1}: jump landed ${g.player.x},${g.player.y}, expected ${x},${y}`);
}
