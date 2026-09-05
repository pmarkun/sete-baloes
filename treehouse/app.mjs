import { Game } from './engine.mjs';
import { levels } from './levels.mjs';
import { loadArt, render, renderFinale } from './render.mjs';
import { destinationAfterExit, finalePose, FINALE_DURATION } from './finale.mjs';
import { Soundscape } from './audio.mjs';
const $ = s => document.querySelector(s);
const storageKey = 'casa-na-arvore-progress-v1';
const victoryKey = `${storageKey}-won`;
const params=new URLSearchParams(location.search);
const previewFinale = params.has('finale');
const previewFloor=Number(params.get('floor'));
const preview=previewFinale||(Number.isInteger(previewFloor)&&previewFloor>=1&&previewFloor<=levels.length);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let saved = 0, savedVictory = false;
try { saved = Math.min(levels.length-1,Math.max(0,Number(localStorage.getItem(storageKey))||0)); } catch { /* Private browsing may disable storage. */ }
try {
  const won=localStorage.getItem(victoryKey);
  savedVictory = won === String(levels.length);
  // The old five-floor ending unlocks the newly added sixth floor.
  if(won==='true')saved=Math.max(saved,5);
  const previousEnding=Number(won);
  if(Number.isInteger(previousEnding)&&previousEnding>0&&previousEnding<levels.length)saved=Math.max(saved,previousEnding);
} catch {}
if(preview&&!previewFinale){saved=previewFloor-1;savedVictory=false;}
const game = new Game(saved), canvas=$('canvas'), ctx=canvas.getContext('2d'), world=$('.world');
function fitCanvas(){const width=Math.floor(Math.min(world.clientWidth,world.clientHeight*2/3));canvas.style.width=`${width}px`;canvas.style.height=`${Math.floor(width*3/2)}px`;}
fitCanvas();window.addEventListener('resize',fitCanvas);window.visualViewport?.addEventListener('resize',fitCanvas);
const sound=new Soundscape();
const devFloor=$('#dev-floor');
levels.forEach((level,index)=>devFloor.add(new Option(`${String(index+1).padStart(2,'0')} · ${level.name}`,String(index+1))));
devFloor.value=preview&&!previewFinale?String(previewFloor):'1';
$('#dev-start').onclick=()=>{const floor=Number(devFloor.value);if(Number.isInteger(floor)&&floor>=1&&floor<=levels.length)location.href=`?floor=${floor}`;};
function soundButton(){ $('#sound').textContent=sound.enabled?'♪':'♪×';$('#sound').setAttribute('aria-pressed',String(sound.enabled));$('#sound').setAttribute('aria-label',sound.enabled?'Silenciar música e efeitos':'Ativar música e efeitos'); }
function unlockSound(){sound.unlock().then(()=>{$('#sound').dataset.state=sound.context?.state||'unavailable';}).catch(()=>{$('#sound').dataset.state='blocked';});}
$('#sound').onclick=()=>{sound.toggle();unlockSound();soundButton();if(mode==='playing')document.activeElement?.blur();};soundButton();
let mode='intro',art,last=0;
let finaleElapsed=0, pausedMode='playing';
const held = new Map(), keyboard = new Set();
let jumpQueued=false,actionQueued=false;
const keys = {ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'jump',e:'action'};
function clearInput(){held.clear();keyboard.clear();jumpQueued=false;actionQueued=false;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function save(){if(preview)return;try{localStorage.setItem(storageKey,String(game.index));}catch{}}
function resetCompletedRun(){
  if(mode!=='won'||preview)return;
  for(const key of [storageKey,victoryKey]){try{localStorage.removeItem(key);}catch{}}
}
// Both routes back to the menu prepare a fresh game after a completed run.
$('header a').addEventListener('click',resetCompletedRun);
for(const type of ['contextmenu','selectstart'])$('.shell').addEventListener(type,e=>e.preventDefault());
function hud(){
  $('#floor').textContent=`${String(game.index+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}${game.inPast?'':` · ${game.level.name}`}`;
  const mirrored=!!game.flags.mirror;
  $('#hint').textContent=mirrored?'O espelho virou tudo: direita ↔ esquerda · cima ↔ baixo.':' ';
  $('#hint').hidden=!mirrored;
  $('.controls').classList.toggle('mirrored',mirrored);
}
function overlay(title,copy,button){clearInput();$('#overlay').hidden=false;$('#overlay-title').textContent=title;$('#overlay-copy').textContent=copy;$('#continue').textContent=button;$('#restart').hidden=false;$('#overlay-number').textContent=`${String(game.index+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')} · ${game.level.name}`;}
function start(nextMode='playing'){unlockSound();mode=nextMode;$('#overlay').hidden=true;$('#dev-tools').hidden=true;document.activeElement?.blur();$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','Pausar jogo');clearInput();}
function pause(){if(mode==='playing'||mode==='finale'){pausedMode=mode;mode='paused';overlay('Uma pausa no galho.','A árvore espera por você.','CONTINUAR');if(pausedMode==='finale')$('#restart').hidden=true;$('#pause').textContent='▶';$('#pause').setAttribute('aria-label','Continuar jogo');}else if(mode==='paused')start(pausedMode);}
function beginFinale(alreadyWon=false){
  clearInput();game.load(levels.length-1);mode='finale';finaleElapsed=alreadyWon?FINALE_DURATION:0;
  $('#overlay').hidden=true;$('.shell').classList.add('at-canopy');
  $('#floor').textContent='Último andar · A copa da árvore';
  $('#hint').textContent='Você chegou ao último andar. Olha o céu!';
  $('#hint').hidden=false;
  document.querySelectorAll('[data-key]').forEach(button=>button.disabled=true);
  if(alreadyWon)showVictory();
}
function showVictory(){
  mode='won';sound.setActive(false);sound.effect({type:'victory'});if(!preview){try{localStorage.setItem(victoryKey,String(levels.length));}catch{}}
  overlay('Você ganhou!','Você chegou ao último andar e encontrou o céu.','VOLTAR AO MENU');
  $('#overlay-number').textContent='NO ALTO DA ÁRVORE';$('#restart').hidden=true;
  $('#overlay').classList.add('victory');$('#pause').disabled=true;
  $('#hint').textContent='A subida terminou. Este lugar é seu.';
  $('#continue').focus();
}
$('#pause').onclick=pause;
$('#continue').onclick=()=>{if(mode==='won'){resetCompletedRun();location.href='../';return;}if(mode==='paused'){start(pausedMode);return;}if(mode==='complete'){game.load(game.index+1);save();}start();hud();};
$('#restart').onclick=()=>{game.load(0);if(!preview){try{localStorage.removeItem(victoryKey);}catch{}}save();start();hud();};
for(const button of document.querySelectorAll('[data-key]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();if(mode!=='playing')return;button.setPointerCapture(e.pointerId);held.set(e.pointerId,button.dataset.key);button.classList.add('held');if(button.dataset.key==='jump')jumpQueued=true;if(button.dataset.key==='action')actionQueued=true;});
  const release=e=>{held.delete(e.pointerId);button.classList.remove('held');};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('click',e=>{if(e.detail===0&&mode==='playing'){const key=button.dataset.key;if(key==='jump')jumpQueued=true;else if(key==='action')actionQueued=true;}});
}
window.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key.toLowerCase()==='p'){if(!e.repeat)pause();return;}const key=keys[e.key]||keys[e.key.toLowerCase()];if(!key||mode!=='playing'||e.target.closest?.('button,a'))return;e.preventDefault();keyboard.add(key);if(!e.repeat&&key==='jump')jumpQueued=true;if(!e.repeat&&key==='action')actionQueued=true;});
window.addEventListener('keyup',e=>keyboard.delete(keys[e.key]||keys[e.key.toLowerCase()]));
window.addEventListener('blur',()=>{clearInput();if(mode==='playing'||mode==='finale')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='playing'||mode==='finale')pause();}});
function frame(now){const dt=Math.min((now-last)/1000,1/30);last=now;if(mode==='playing'){
  const input=Object.fromEntries([...keyboard,...held.values()].map(k=>[k,true]));input.jump=jumpQueued;input.action=actionQueued;jumpQueued=actionQueued=false;
  game.step(dt,input);for(const event of game.drainEvents())sound.effect(event);hud();if(game.complete){mode=destinationAfterExit(game.index,levels.length);if(mode==='finale')beginFinale();else{overlay('Mais perto do céu.',`Andar ${game.index+1} concluído. Vamos descobrir o próximo?`,'PRÓXIMO ANDAR');$('#continue').focus();}}
}
if(mode==='finale'){finaleElapsed+=dt;if(finalePose(finaleElapsed).won)showVictory();}
sound.setScene(mode==='finale'||mode==='won'?null:game.level.music);sound.setActive(mode==='playing'||mode==='finale');sound.update();
if(art){if(mode==='finale'||mode==='won'||(mode==='paused'&&pausedMode==='finale'))renderFinale(ctx,art,finalePose(finaleElapsed,reducedMotion.matches));else render(ctx,game,art,{reducedMotion:reducedMotion.matches});}
requestAnimationFrame(frame);}
hud();
loadArt().then(a=>{art=a;fitCanvas();$('#continue').disabled=false;$('#continue').textContent=saved?'CONTINUAR SUBIDA':'COMEÇAR A SUBIDA';if(saved)$('#restart').hidden=false;if(previewFinale||savedVictory)beginFinale(savedVictory&&!previewFinale);requestAnimationFrame(frame);}).catch(error=>{$('#overlay-title').textContent='A arte não carregou.';$('#overlay-copy').textContent='Confira a conexão e recarregue a página.';console.error(error);});
