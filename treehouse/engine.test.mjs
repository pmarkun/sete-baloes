import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
const tick=(g,input,n=1)=>{for(let i=0;i<n;i++)g.step(1/60,input);};
function walk(g,x){for(let i=0;i<300&&Math.abs(g.player.x-x)>1.3;i++)tick(g,{[g.player.x<x?'right':'left']:true});}
function climb(g,x,y){walk(g,x);for(let i=0;i<300&&Math.abs(g.player.y-y)>.1;i++)tick(g,{[g.player.y>y?'up':'down']:true});assert.ok(Math.abs(g.player.y-y)<1,`ladder ${x}: ${g.player.y} != ${y}`);}
test('vertical movement requires a ladder; jumping and landing work',()=>{const g=new Game();tick(g,{up:true},60);assert.equal(g.player.y,340);tick(g,{jump:true});assert.ok(g.player.y<340);tick(g,{},120);assert.equal(g.player.y,340);climb(g,175,250);climb(g,175,340);});
test('locked exit and hatch cannot be bypassed',()=>{const g=new Game(1);g.player={...g.player,x:115,y:70};g.interact();assert.equal(g.complete,false);const h=new Game(3);h.player={...h.player,x:65,y:250};tick(h,{up:true},120);assert.equal(h.player.y,250);});
for(let index=0;index<5;index++)test(`floor ${index+1} is solvable by walking, climbing and jumping`,()=>{
  const g=new Game(index);climb(g,175,250);
  if(index===2){walk(g,190);g.interact();assert.ok(g.flags.bridge);}
  if(index===3||index===4){walk(g,120);tick(g,{jump:true});tick(g,{},48);assert.equal(g.player.y,220);if(index===3){g.interact();assert.ok(g.flags.hatch);}else assert.ok(g.flags.key);walk(g,65);tick(g,{},50);}
  climb(g,65,160);
  if(index===1){walk(g,180);assert.ok(g.flags.key);}
  if(index===4){walk(g,45);g.interact();assert.ok(g.flags.hatch);}
  climb(g,175,70);walk(g,115);g.interact();assert.ok(g.complete);
});
test('reload resets puzzles and completion',()=>{const g=new Game(4);g.flags.key=true;g.complete=true;g.load(0);assert.deepEqual(g.flags,{});assert.equal(g.complete,false);assert.equal(g.player.y,340);});
