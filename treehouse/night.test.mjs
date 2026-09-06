import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import { lightState } from './night.mjs';
import { tick,walk,climb,jumpTo,action } from './test-helpers.mjs';
test('floor 10 exit requires the lantern; the next floor and reload retain it',()=>{
  const g=new Game(9);g.flags={crystals:true,timer:true};g.player={...g.player,x:115,y:70};action(g);assert.equal(g.complete,false);
  walk(g,145);assert.ok(g.flags.lantern);walk(g,115);action(g);assert.ok(g.complete);
  g.load(10);assert.ok(g.flags.lantern);g.load(10);assert.ok(g.flags.lantern);
});
test('lantern parkour and spikes have a complete physical route',()=>{
  const g=new Game(10);jumpTo(g,165,340);climb(g,175,250);walk(g,166);jumpTo(g,110,250);jumpTo(g,65,250);
  climb(g,65,160);walk(g,90);jumpTo(g,148,160);walk(g,180);assert.ok(g.flags.key);
  climb(g,175,70);walk(g,115);action(g);assert.ok(g.complete);assert.equal(g.hazardRetry,0);
});
test('spikes retry only this floor and restore its lantern',()=>{
  const g=new Game(10);tick(g,{right:true},12);assert.ok(g.hazardRetry);tick(g,{},60);
  assert.equal(g.index,10);assert.equal(g.player.x,110);assert.ok(g.flags.lantern);
});
test('creature appears on second platform, freezes in light and moves only in dark',()=>{
  const g=new Game(11);assert.equal(g.hunter,null);climb(g,175,250);const x=g.hunter.x;
  tick(g,{},120);assert.equal(g.hunter.x,x);assert.equal(lightState(g.level,g.time).dark,false);
  g.time=3.6;tick(g);assert.ok(g.hunter.x<x);g.time=6.1;const frozen={x:g.hunter.x,y:g.hunter.y};tick(g,{},30);assert.deepEqual({x:g.hunter.x,y:g.hunter.y},frozen);
});
test('waiting for the hunter causes a retry, without a permanent lock',()=>{
  const g=new Game(11);climb(g,175,250);tick(g,{},230);assert.ok(g.hazardRetry);tick(g,{},60);
  assert.equal(g.index,11);assert.equal(g.hunter,null);assert.equal(g.player.y,340);
});
test('night watch can be escaped by the normal controls',()=>{
  const g=new Game(11);climb(g,175,250);climb(g,65,160);climb(g,175,70);walk(g,115);action(g);assert.ok(g.complete);
});
test('the hunter can descend stairs when the player retreats',()=>{
  const g=new Game(11);climb(g,175,250);climb(g,175,340);walk(g,110);
  for(let i=0;i<1800&&!g.hazardRetry;i++)tick(g);
  assert.ok(g.hazardRetry);assert.ok(g.hunter.y>315);
});
test('cycle is dark for 2.5 seconds, with slow transitions between intervals',()=>{
  const g=new Game(11);assert.equal(lightState(g.level,1).opacity,0);assert.equal(lightState(g.level,4).opacity,1);
  assert.equal(lightState(g.level,5.9).dark,true);assert.equal(lightState(g.level,6).dark,false);
});
