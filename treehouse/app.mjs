import { Game } from './engine.mjs';
import { levels } from './levels.mjs';
import { loadArt, render } from './render.mjs';
const $ = s => document.querySelector(s);
const storageKey = 'casa-na-arvore-progress-v1';
let saved = 0;
try { saved = Math.min(levels.length-1,Math.max(0,Number(localStorage.getItem(storageKey))||0)); } catch { /* Private browsing may disable storage. */ }
const game = new Game(saved), canvas=$('canvas'), ctx=canvas.getContext('2d');
let mode='intro',art,last=0;
const held = new Map(), keyboard = new Set();
let jumpQueued=false,actionQueued=false;
const keys = {ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'jump',e:'action'};
function clearInput(){held.clear();keyboard.clear();jumpQueued=false;actionQueued=false;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function save(){try{localStorage.setItem(storageKey,String(game.index));}catch{}}
function hud(){ $('#floor').textContent=`${String(game.index+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')} · ${game.level.name}`;$('#hint').textContent=game.message||game.level.hint; }
function overlay(title,copy,button){clearInput();$('#overlay').hidden=false;$('#overlay-title').textContent=title;$('#overlay-copy').textContent=copy;$('#continue').textContent=button;$('#restart').hidden=false;$('#overlay-number').textContent=`${String(game.index+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')} · ${game.level.name}`;}
function start(){mode='playing';$('#overlay').hidden=true;document.activeElement?.blur();$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','Pausar jogo');clearInput();}
function pause(){if(mode==='playing'){mode='paused';overlay('Uma pausa no galho.','A árvore espera por você.','CONTINUAR');$('#pause').textContent='▶';$('#pause').setAttribute('aria-label','Continuar jogo');}else if(mode==='paused')start();}
$('#pause').onclick=pause;
$('#continue').onclick=()=>{if(mode==='complete'){if(game.index===levels.length-1)game.load(0);else game.load(game.index+1);save();}start();hud();};
$('#restart').onclick=()=>{game.load(0);save();start();hud();};
for(const button of document.querySelectorAll('[data-key]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();if(mode!=='playing')return;button.setPointerCapture(e.pointerId);held.set(e.pointerId,button.dataset.key);button.classList.add('held');if(button.dataset.key==='jump')jumpQueued=true;if(button.dataset.key==='action')actionQueued=true;});
  const release=e=>{held.delete(e.pointerId);button.classList.remove('held');};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('click',e=>{if(e.detail===0&&mode==='playing'){const key=button.dataset.key;if(key==='jump')jumpQueued=true;else if(key==='action')actionQueued=true;}});
}
window.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key.toLowerCase()==='p'){if(!e.repeat)pause();return;}const key=keys[e.key]||keys[e.key.toLowerCase()];if(!key||mode!=='playing'||e.target.closest?.('button,a'))return;e.preventDefault();keyboard.add(key);if(!e.repeat&&key==='jump')jumpQueued=true;if(!e.repeat&&key==='action')actionQueued=true;});
window.addEventListener('keyup',e=>keyboard.delete(keys[e.key]||keys[e.key.toLowerCase()]));
window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='playing')pause();}});
function frame(now){const dt=Math.min((now-last)/1000,1/30);last=now;if(mode==='playing'){
  const input=Object.fromEntries([...keyboard,...held.values()].map(k=>[k,true]));input.jump=jumpQueued;input.action=actionQueued;jumpQueued=actionQueued=false;
  game.step(dt,input);hud();if(game.complete){mode='complete';const final=game.index===levels.length-1;overlay(final?'A casa continua crescendo.':'Mais perto do céu.',final?'Você explorou os cinco primeiros andares. O X fica: ainda há muito para construir.':`Andar ${game.index+1} concluído. Vamos descobrir o próximo?`,final?'JOGAR DE NOVO':'PRÓXIMO ANDAR');$('#continue').focus();}
}if(art)render(ctx,game,art);requestAnimationFrame(frame);}
hud();
loadArt().then(a=>{art=a;$('#continue').disabled=false;$('#continue').textContent=saved?'CONTINUAR SUBIDA':'COMEÇAR A SUBIDA';if(saved)$('#restart').hidden=false;requestAnimationFrame(frame);}).catch(error=>{$('#overlay-title').textContent='A arte não carregou.';$('#overlay-copy').textContent='Confira a conexão e recarregue a página.';console.error(error);});
