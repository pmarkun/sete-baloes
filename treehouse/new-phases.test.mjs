import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.mjs';
import { levels } from './levels.mjs';
import { ropePose, rainPhase } from './mechanics.mjs';
import { controls, playRopes, playRain, playChase } from './test-routes.mjs';
import { parseLevel, serializeLevel, validateLevel } from './editor/model.mjs';

for(const hz of [30,60,120]) for(const [index,route] of [[13,playRopes],[14,playRain],[15,playChase]]) {
  test('floor '+(index+1)+' is completable with public controls at '+hz+' Hz',()=>{
    const game=new Game(index), original=structuredClone(levels[index]), seen=new Set();
    route(game,hz,g=>{if(g.player.rope!==null)seen.add(g.player.rope);});
    assert.ok(game.complete);
    assert.deepEqual(levels[index],original,'simulation must not mutate official data');
    if(index===13)assert.deepEqual([...seen],[0,1],'both ropes are used');
    if(index===14)assert.ok(!game.events.some(e=>e.type==='droplet'),'a readable dry route exists');
    if(index===15)assert.ok(game.flags.bellA&&game.flags.bellB);
  });
}

test('rope release is physical, does not reattach, and a missed jump remains recoverable',()=>{
  const g=new Game(13), c=controls(g);
  c.climb(55,260);c.walk(70);c.until(()=>g.player.rope===0,{action:true});
  const pose=ropePose(g.level.ropes[0],g.time), future=ropePose(g.level.ropes[0],g.time+.0001);
  assert.ok(Math.abs(pose.vx-(future.x-pose.x)/.0001)<.03);
  c.until(()=>g.ropes[0].vx>0&&g.player.x>132);
  c.step({jump:true});assert.ok(g.player.vy<0);
  for(let i=0;i<20;i++){c.step();assert.equal(g.player.rope,null);}
  c.until(()=>g.player.grounded,{right:true});
  // Walk off the gap without a rope: return to the lower floor, never vanish.
  const missed=new Game(13),m=controls(missed);
  m.climb(55,260);m.walk(120);m.until(()=>missed.player.grounded&&missed.player.y===340);
  m.climb(55,260);assert.ok(Math.abs(missed.player.y-260)<.01);
});

test('checkpoints preserve progress after a real fall; reload clears them',()=>{
  const g=new Game(13), c=controls(g);
  c.climb(55,260);c.walk(70);c.until(()=>g.player.rope===0,{up:true});
  c.until(()=>g.ropes[0].vx>0&&g.player.x>132);c.step({jump:true});
  c.until(()=>g.player.grounded,{right:true});
  assert.equal(g.checkpointIndex,0);
  c.walk(120);c.until(()=>g.events.some(e=>e.type==='recover'));
  assert.equal(g.player.y,260);assert.equal(g.player.x,185);
  g.load(13);assert.equal(g.checkpointIndex,-1);
});

test('water hits cause visible motion and temporary immunity, not instant retry',()=>{
  const g=new Game(14), c=controls(g);
  c.climb(55,250);
  c.until(()=>{const phase=rainPhase(g.level.droplets[0],g.time).phase;return phase>=1&&phase<1.04;});
  c.walk(93);c.jump(148,250);c.until(()=>g.player.hitStun>0,{},12);
  const {x,y}=g.player;const events=g.events.filter(e=>e.type==='droplet').length;
  assert.equal(g.hazardRetry,0);c.wait(.15);
  assert.ok(g.player.x<x);assert.ok(g.player.y>y);
  assert.equal(g.events.filter(e=>e.type==='droplet').length,events);
  c.until(()=>g.player.grounded);assert.equal(g.player.y,340);
  c.climb(55,250);
});

test('rain has warnings, finite bursts, runoff and genuinely dry shelters',()=>{
  const g=new Game(14), c=controls(g);
  const emitter=g.level.droplets[0];
  assert.ok(rainPhase(emitter,emitter.period-emitter.phase-.3).warning);
  assert.ok(!rainPhase(emitter,1.1-emitter.phase).active);
  c.climb(55,250);
  let runoff=false,fallAfterEdge=false;
  for(let i=0;i<600;i++){
    c.step();runoff ||= g.drops.some(d=>d.surface);
    fallAfterEdge ||= g.drops.some(d=>d.source===0&&!d.surface&&d.y>250);
  }
  assert.ok(runoff&&fallAfterEdge);
  assert.equal(g.player.y,250);assert.ok(!g.events.some(e=>e.type==='droplet'));
  assert.ok(g.drops.length<40);
});

test('clear chase allows learning time, warns before charging, and retries on capture',()=>{
  const g=new Game(15), c=controls(g);
  c.wait(8);assert.equal(g.chaser,null);
  c.walk(112);c.until(()=>g.chaser?.state==='windup');
  const x=g.chaser.x;c.wait(.3);assert.equal(g.chaser.x,x);
  let charged=false,caught=false;
  for(let i=0;i<600;i++){
    g.step(1/60);charged ||= g.chaser?.state==='charge';
    if(g.hazardRetry){caught=true;break;}
  }
  assert.ok(charged&&caught);
  for(let i=0;i<60;i++)g.step(1/60);
  assert.equal(g.player.x,85);assert.equal(g.chaser,null);assert.equal(g.index,15);
});

test('a timed jump dodges a committed charge and the creature recovers',()=>{
  const g=new Game(15),c=controls(g);
  c.walk(112);c.until(()=>g.chaser?.state==='windup');
  c.wait(.65);c.step({jump:true});
  c.until(()=>g.chaser.state==='recover');
  assert.equal(g.hazardRetry,0);
  const x=g.chaser.x;c.wait(.3);assert.equal(g.chaser.x,x);
});

test('bells distract on the correct floor, have cooldowns, and tolerate hesitation',()=>{
  const g=new Game(15);
  playChase(g,60,undefined,.75);
  assert.ok(g.complete);
  assert.equal(g.events.filter(e=>e.type==='bell').length,2);
  const sample=new Game(15),c=controls(sample);
  c.climb(175,250);c.step({action:true});
  const remaining=sample.distraction.remaining;
  c.step({action:true});
  assert.equal(sample.events.filter(e=>e.type==='bell').length,1);
  assert.ok(sample.distraction.remaining<remaining);
});

test('new mechanics round-trip in editor previews; unsafe geometry/timing is rejected',()=>{
  for(const level of levels.slice(13)){
    const result=parseLevel(serializeLevel(level));assert.ok(result.level);
    assert.deepEqual(result.level,{schemaVersion:1,...level});
  }
  const invalid=structuredClone(levels[13]);invalid.ropes[0].length=300;
  assert.equal(validateLevel(invalid).valid,false);
  const rain=structuredClone(levels[14]);rain.droplets[0].period=0;rain.shelters[0].w=500;rain.checkpoints[0].y=248;
  assert.equal(validateLevel(rain).valid,false);
});
