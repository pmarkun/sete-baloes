import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import {tick,walk,climb,jumpTo} from './test-helpers.mjs';
test('vertical movement requires a ladder; jumping and landing work',()=>{const g=new Game();tick(g,{up:true},60);assert.equal(g.player.y,340);tick(g,{jump:true});assert.ok(g.player.y<340);tick(g,{},120);assert.equal(g.player.y,340);climb(g,175,250);climb(g,175,340);});
test('locked exit and hatch cannot be bypassed',()=>{const g=new Game(1);g.player={...g.player,x:115,y:70};g.interact();assert.equal(g.complete,false);const h=new Game(3);h.player={...h.player,x:65,y:250};tick(h,{up:true},120);assert.equal(h.player.y,250);});
for(const index of [0,1,2,3,4])test(`floor ${index+1} has a physically reachable exit`,()=>{
  const g=new Game(index);
  if(index===4){climb(g,175,280);jumpTo(g,100,230);jumpTo(g,175,180);jumpTo(g,90,125);assert.ok(g.flags.key);climb(g,75,70);}
  else {
    climb(g,175,250);
    if(index===1){walk(g,166);jumpTo(g,110,250);}
    if(index===2){walk(g,190);g.interact();assert.ok(g.flags.bridge);}
    if(index===3){walk(g,120);jumpTo(g,120,220);g.interact();assert.ok(g.flags.hatch);walk(g,65);tick(g,{},50);}
    climb(g,65,160);
    if(index===1){walk(g,90);jumpTo(g,148,160);walk(g,180);assert.ok(g.flags.key);}
    if(index===2){walk(g,75);jumpTo(g,125,160);jumpTo(g,175,160);}
    climb(g,175,70);
  }
  walk(g,115);g.interact();assert.ok(g.complete);
});
test('reload resets puzzles and completion',()=>{const g=new Game(4);g.flags.key=true;g.complete=true;g.load(0);assert.deepEqual(g.flags,{});assert.equal(g.complete,false);assert.equal(g.player.y,340);});
