import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import { levels } from './levels.mjs';
import { destinationAfterExit } from './finale.mjs';
import {tick,walk,climb,jumpTo,action} from './test-helpers.mjs';
function finish(g){climb(g,65,160);climb(g,175,70);walk(g,115);action(g);assert.ok(g.complete);}

test('proximity and UP do not activate a lever; ACTION emits effects only once',()=>{
  const g=new Game(2);climb(g,175,250);walk(g,190);g.drainEvents();tick(g,{up:true},120);
  assert.equal(g.flags.bridge,undefined);assert.equal(g.drainEvents().length,0);
  action(g);assert.ok(g.flags.bridge);assert.deepEqual(g.drainEvents().map(e=>e.type),['lever']);
  action(g);assert.equal(g.drainEvents().length,0);
});
test('floor 6: push the crate onto the counterweight and finish',()=>{
  const g=new Game(5);climb(g,175,250);
  for(let i=0;i<4;i++){const crate=g.level.objects.find(o=>o.type==='crate');walk(g,crate.x-14);tick(g,{right:true});action(g);}
  assert.ok(g.flags.weight);walk(g,125);for(let i=0;i<3;i++)jumpTo(g,125,250);tick(g,{},60);assert.ok(g.flags.key);finish(g);
});
test('floor 7: wrong bell resets the sequence; correct melody unlocks exit',()=>{
  const g=new Game(6);climb(g,175,250);walk(g,120);action(g);assert.deepEqual(g.sequence,[]);
  for(const x of [65,185,120]){walk(g,x);action(g);}
  assert.ok(g.flags.song);finish(g);
});
test('floor 8: seed and explicit planting grow a climbable vine',()=>{
  const g=new Game(7);climb(g,175,250);walk(g,45);assert.ok(g.flags.seed);walk(g,65);
  tick(g,{up:true},30);assert.equal(g.flags.grown,undefined);action(g);assert.ok(g.flags.grown);climb(g,65,180);walk(g,80);jumpTo(g,115,155);walk(g,120);jumpTo(g,160,130);walk(g,155);jumpTo(g,115,105);climb(g,110,70);walk(g,115);action(g);assert.ok(g.complete);
});
test('floor 4: threshold opens portal, hooded self steals key and false exit stays shut',()=>{
  const g=new Game(3);assert.equal(g.ghost,null);climb(g,175,250);assert.ok(g.ghost);
  tick(g,{},230);assert.equal(g.ghost,null);assert.ok(g.level.objects.find(o=>o.type==='exitKey').collected);
  assert.equal(g.message,undefined);assert.equal(g.complete,false);
});
test('floor 9: equip cloak, return to same floor 4, steal key and escape to preserved floor 9',()=>{
  const g=new Game(8);climb(g,175,250);walk(g,115);tick(g,{up:true},30);assert.equal(g.flags.cloak,undefined);
  action(g);assert.ok(g.flags.cloak);walk(g,190);action(g);
  assert.ok(g.inPast);assert.equal(g.index,3);assert.deepEqual(g.level.platforms,levels[3].platforms);
  assert.ok(g.pastSelf);action(g);assert.ok(g.inPast,'cannot escape without the key');
  walk(g,125);action(g);assert.ok(g.flags.stolenKey);walk(g,190);action(g);
  assert.equal(g.inPast,false);assert.equal(g.index,8);assert.ok(g.flags.timeKey);assert.ok(g.flags.cloak);
  finish(g);
});
test('being caught retries only the past encounter and restores its key',()=>{
  const g=new Game(8);g.flags.cloak=true;g.enterPast();tick(g,{},650);
  assert.ok(g.inPast);assert.equal(g.index,3);assert.ok(g.returnState);assert.ok(g.temporalClock<3);
  assert.equal(g.flags.stolenKey,undefined);assert.equal(g.level.objects.find(o=>o.type==='exitKey').collected,undefined);
});
test('floor 10: gather crystals and beat the timed hatch',()=>{
  const g=new Game(9);walk(g,45);climb(g,175,250);walk(g,190);climb(g,65,160);walk(g,45);
  assert.equal(g.flags.crystalCount,3);walk(g,110);action(g);assert.ok(g.timer>11);
  climb(g,175,70);walk(g,115);action(g);assert.ok(g.complete);
});
test('expired timed hatch can be descended and reopened, without a softlock',()=>{
  const g=new Game(9);climb(g,175,250);climb(g,65,160);walk(g,110);action(g);climb(g,175,70);
  tick(g,{},800);assert.equal(g.flags.timer,false);climb(g,175,160);walk(g,110);action(g);assert.ok(g.flags.timer);
});
test('mirror floor reverses both axes and is the new final floor',()=>{
  const g=new Game(12);climb(g,175,250);
  while(!g.flags.mirror)tick(g,{left:true});
  assert.deepEqual(g.drainEvents().map(e=>e.type),['mirror']);
  const x=g.player.x;tick(g,{right:true},10);assert.ok(g.player.x<x,'right moves left after touching the mirror');
  while(Math.abs(g.player.x-65)>1.3)tick(g,{right:true});
  while(Math.abs(g.player.y-160)>.1)tick(g,{down:true});
  while(Math.abs(g.player.x-175)>1.3)tick(g,{left:true});
  while(Math.abs(g.player.y-70)>.1)tick(g,{down:true});
  while(Math.abs(g.player.x-115)>1.3)tick(g,{right:true});
  g.interact();assert.ok(g.complete);
});
test('only the last new floor leads to the canopy now',()=>{
  assert.equal(levels.length,16);assert.equal(destinationAfterExit(4,levels.length),'complete');
  assert.equal(destinationAfterExit(14,levels.length),'complete');assert.equal(destinationAfterExit(15,levels.length),'finale');
});
test('accepted jumps and an opened hatch emit their distinct sound events',()=>{
  const g=new Game(3);tick(g,{jump:true});assert.ok(g.drainEvents().some(e=>e.type==='jump'));
  tick(g,{jump:true});assert.ok(!g.drainEvents().some(e=>e.type==='jump'));
  tick(g,{},120);climb(g,175,250);walk(g,120);tick(g,{jump:true});tick(g,{},48);g.drainEvents();
  action(g);assert.deepEqual(g.drainEvents().map(e=>e.type),['lever','hatch']);
  action(g);assert.equal(g.drainEvents().length,0);
});
