import { Game } from '../engine.mjs';
import { loadArt, render } from '../render.mjs';
import { Soundscape } from '../audio.mjs';
import { EDITOR_PREVIEW_KEY, parseLevel } from './model.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const world = $('.world');
function fitCanvas() { const width = Math.floor(Math.min(world.clientWidth, world.clientHeight * 2 / 3)); canvas.style.width = `${width}px`; canvas.style.height = `${Math.floor(width * 3 / 2)}px`; }
fitCanvas(); window.addEventListener('resize', fitCanvas); window.visualViewport?.addEventListener('resize', fitCanvas);
const keys = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ' ': 'jump', e: 'action' };
const held = new Map();
const keyboard = new Set();
let jumpQueued = false;
let actionQueued = false;
let mode = 'intro';
let pausedMode = 'playing';
let art = null;
let last = 0;

function readPreview() {
  try {
    const result = parseLevel(sessionStorage.getItem(EDITOR_PREVIEW_KEY) || '');
    return result.level;
  } catch {
    return null;
  }
}

const level = readPreview();
const game = level ? new Game(0, { levels: [level] }) : null;
const sound = new Soundscape();

function clearInput() {
  held.clear(); keyboard.clear(); jumpQueued = false; actionQueued = false;
  document.querySelectorAll('.held').forEach(button => button.classList.remove('held'));
}

function unlockSound() {
  sound.unlock().catch(() => {});
}

function setOverlay(title, copy, button = 'COMEÇAR') {
  clearInput(); $('#overlay').hidden = false; $('#overlay-title').textContent = title; $('#overlay-copy').textContent = copy; $('#continue').textContent = button;
}

function start() {
  unlockSound(); mode = 'playing'; $('#overlay').hidden = true; $('#pause').textContent = 'Ⅱ'; $('#pause').setAttribute('aria-label', 'Pausar jogo'); clearInput();
}

function pause() {
  if (mode === 'playing') { pausedMode = mode; mode = 'paused'; setOverlay('Uma pausa no galho.', 'A prévia espera por você.', 'CONTINUAR'); $('#pause').textContent = '▶'; $('#pause').setAttribute('aria-label', 'Continuar jogo'); }
  else if (mode === 'paused') start();
}

function finish() {
  mode = 'won'; sound.setActive(false); setOverlay('Prévia concluída', 'A fase foi executada sem alterar a campanha oficial.', 'VOLTAR AO EDITOR'); $('#restart').hidden = true; $('#pause').disabled = true; $('#overlay-number').textContent = 'EDITOR LOCAL';
}

function restart() {
  if (!game) return;
  game.load(0); $('#pause').disabled = false; start();
}

function soundButton() {
  $('#sound').textContent = sound.enabled ? '♪' : '♪×'; $('#sound').setAttribute('aria-pressed', String(sound.enabled));
}

function hud() {
  if (!game) return;
  $('#preview-name').textContent = game.level.name;
  $('#hint').textContent = game.flags.mirror ? 'O espelho virou tudo: direita ↔ esquerda · cima ↔ baixo.' : 'A prévia não altera progresso nem fases oficiais.';
  $('.controls').classList.toggle('mirrored', !!game.flags.mirror);
}

$('#sound').addEventListener('click', () => { sound.toggle(); unlockSound(); soundButton(); });
$('#pause').addEventListener('click', pause);
$('#continue').addEventListener('click', () => { if (mode === 'won') { location.href = './'; return; } start(); });
$('#restart').addEventListener('click', restart);
soundButton();

for (const button of document.querySelectorAll('[data-key]')) {
  button.addEventListener('pointerdown', event => { event.preventDefault(); if (mode !== 'playing') return; button.setPointerCapture(event.pointerId); held.set(event.pointerId, button.dataset.key); button.classList.add('held'); if (button.dataset.key === 'jump') jumpQueued = true; if (button.dataset.key === 'action') actionQueued = true; });
  const release = event => { held.delete(event.pointerId); button.classList.remove('held'); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  button.addEventListener('click', event => { if (event.detail === 0 && mode === 'playing') { if (button.dataset.key === 'jump') jumpQueued = true; if (button.dataset.key === 'action') actionQueued = true; } });
}

window.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key.toLowerCase() === 'p') { if (!event.repeat) pause(); return; } const key = keys[event.key] || keys[event.key.toLowerCase()]; if (!key || mode !== 'playing' || event.target.closest?.('button,a')) return; event.preventDefault(); keyboard.add(key); if (!event.repeat && key === 'jump') jumpQueued = true; if (!event.repeat && key === 'action') actionQueued = true; });
window.addEventListener('keyup', event => keyboard.delete(keys[event.key] || keys[event.key.toLowerCase()]));
window.addEventListener('blur', () => { clearInput(); if (mode === 'playing') pause(); });

function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
  if (game && mode === 'playing') {
    const input = Object.fromEntries([...keyboard, ...held.values()].map(key => [key, true])); input.jump = jumpQueued; input.action = actionQueued; jumpQueued = false; actionQueued = false;
    game.step(dt, input); for (const event of game.drainEvents()) sound.effect(event); hud(); if (game.complete) finish();
  }
  sound.setScene(game?.level.music); sound.setActive(mode === 'playing'); sound.update(); if (art && game) render(ctx, game, art); requestAnimationFrame(frame);
}

if (!level) {
  setOverlay('Prévia indisponível', 'Volte ao editor e abra a prévia novamente.', 'VOLTAR AO EDITOR'); $('#restart').hidden = true; $('#continue').addEventListener('click', () => { location.href = './'; });
} else {
  hud(); setOverlay('Pronto para jogar', 'Este rascunho roda isolado da campanha oficial.');
  loadArt('../assets').then(value => { art = value; fitCanvas(); $('#continue').disabled = false; requestAnimationFrame(frame); }).catch(error => { setOverlay('A arte não carregou.', 'Confira os assets e recarregue a página.', 'VOLTAR AO EDITOR'); $('#continue').disabled = true; console.error(error); });
}
