// Playthroughs use only public controls; reusable in Node and browser QA.
import { rainPhase } from './mechanics.mjs';

export function controls(game, hz=60, onStep=()=>{}) {
  const step=(input={})=>{
    game.step(1/hz,input);onStep(game,input);
    if(game.hazardRetry)throw new Error('Captured on the route');
  };
  const until=(predicate,input={},limit=8)=>{
    for(let i=0;i<limit*hz;i++){if(predicate())return;step(typeof input==='function'?input():input);}
    throw new Error('Route timed out at '+JSON.stringify(game.player));
  };
  const walk=x=>until(()=>Math.abs(game.player.x-x)<1.5,()=>({[game.player.x<x?'right':'left']:true}));
  const climb=(x,y)=>{walk(x);until(()=>Math.abs(game.player.y-y)<.1,{[game.player.y>y?'up':'down']:true});};
  const wait=seconds=>{for(let i=0;i<Math.round(seconds*hz);i++)step();};
  const jump=(x,y)=>{
    step({jump:true,[game.player.x<x?'right':'left']:true});
    until(()=>game.player.grounded,()=>Math.abs(game.player.x-x)>1.5?{[game.player.x<x?'right':'left']:true}:{});
    if(Math.abs(game.player.y-y)>.1)throw new Error('Missed landing '+y);
  };
  return {step,until,walk,climb,wait,jump};
}

export function playRopes(game,hz=60,onStep) {
  const c=controls(game,hz,onStep);
  const swing=(index,direction)=>{
    c.until(()=>game.player.rope===index,{up:true});
    c.until(()=>game.ropes[index].vx*direction>0 && (game.player.x-120)*direction>12);
    c.step({jump:true});
    c.until(()=>game.player.grounded,()=>({[direction>0?'right':'left']:(game.player.x-(direction>0?185:55))*direction<0}));
  };
  c.climb(55,260);c.walk(70);swing(0,1);
  c.climb(185,140);c.walk(170);swing(1,-1);
  c.climb(55,60);c.walk(120);c.step({action:true});
}

export function playRain(game,hz=60,onStep) {
  const c=controls(game,hz,onStep);
  const afterBurst=(index,phase)=>{
    c.until(()=>{const state=rainPhase(game.level.droplets[index],game.time);return state.phase>=phase&&state.phase<phase+.08;});
  };
  c.climb(55,250);afterBurst(0,1);c.walk(93);c.jump(148,250);
  c.climb(178,160);afterBurst(1,1);c.walk(147);c.jump(93,160);
  c.climb(55,70);afterBurst(2,1.85);c.walk(187);c.step({action:true});
}

export function playChase(game,hz=60,onStep,hesitation=0) {
  const c=controls(game,hz,onStep);
  c.climb(175,250);c.wait(hesitation);c.step({action:true});
  c.walk(141);c.jump(91,250);c.climb(65,160);c.wait(hesitation);c.step({action:true});
  c.climb(175,70);c.walk(115);c.step({action:true});
}
