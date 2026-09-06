import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import { tick,jumpTo } from './test-helpers.mjs';
import { rhythmPattern,RHYTHM_TICK } from './rhythm.mjs';
import { levels } from './levels.mjs';
test('moon jumps last longer and heavy jumps are shorter than normal',()=>{
  const flight=index=>{const g=new Game(index);g.level.platforms=g.level.platforms.filter(s=>s.y===340);tick(g,{jump:true});let frames=1;while(!g.player.grounded&&frames<300){tick(g);frames++;}return frames;};
  assert.ok(flight(4)>flight(0)*2);assert.ok(flight(5)<flight(0));
});
test('falling props use the same per-floor gravity as the player',()=>{
  const drop=index=>{const g=new Game(index);g.level.platforms=[];g.level.objects=[{type:'key',x:45,y:20,vy:0,falling:true}];tick(g,{},12);return g.level.objects[0].y;};
  assert.ok(drop(4)<drop(0));assert.ok(drop(5)>drop(0));
});
test('three heavy landings release the suspended key; walking cannot release or collect it',()=>{
  const g=new Game(5),key=g.level.objects.find(o=>o.type==='key');
  tick(g,{},180);assert.equal(key.impacts,0);assert.equal(g.flags.key,undefined);
  for(let i=1;i<=3;i++){jumpTo(g,110,340);assert.equal(key.impacts,i);assert.equal(key.suspended,i<3);}
  assert.ok(g.shake>0);assert.ok(g.drainEvents().filter(e=>e.type==='impact').length===3);
  tick(g,{},120);assert.equal(key.y,238);assert.equal(key.falling,false);
});
test('background beat encodes the exact bell solution, separated by rests',()=>{
  const level=levels[6],pattern=rhythmPattern(level.music.rhythm),groups=[];let hits=0;
  for(const hit of pattern){if(hit)hits++;else if(hits){groups.push(hits);hits=0;}}
  assert.deepEqual(groups,level.melody);assert.deepEqual(groups,[1,3,2]);
  assert.ok(pattern.slice(-9).every(hit=>!hit));assert.ok(9*RHYTHM_TICK>2.5);
});
