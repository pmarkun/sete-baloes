import { levels } from '../levels.mjs';
import { componentCatalog } from '../components.mjs';
import { Game } from '../engine.mjs';
import { loadArt, render } from '../render.mjs';
import {
  EDITOR_SCHEMA_VERSION,
  LEVEL_OPTIONS,
  EDITOR_STORAGE_KEY,
  EDITOR_PREVIEW_KEY,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  addComponent,
  blankLevel,
  cloneLevel,
  componentAt,
  exportableLevel,
  findDefinition,
  parseLevel,
  removeComponent,
  serializeLevel,
  validateLevel,
} from './model.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('#editor-canvas');
const ctx = canvas.getContext('2d');
const palette = $('#palette-list');
const inspector = $('#inspector-content');
const draftSelect = $('#draft-select');
const sourceSelect = $('#source-select');
const fileInput = $('#file-input');
const snap = value => Math.max(0, Math.min(WORLD_WIDTH, Math.round(value / 5) * 5));
const snapY = value => Math.max(0, Math.min(WORLD_HEIGHT, Math.round(value / 5) * 5));
const uid = () => globalThis.crypto?.randomUUID?.() || `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

let drafts = [];
let activeId = null;
let draft = blankLevel();
let selected = null;
let art = null;
let undoStack = [];
let redoStack = [];
let drag = null;

function safeRead() {
  try { return JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || 'null'); } catch { return null; }
}

function persist(message = 'Salvo localmente') {
  const record = drafts.find(item => item.id === activeId);
  if (record) { record.level = exportableLevel(draft); record.lastModified = new Date().toISOString(); record.title = draft.name; }
  try { localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify({ version: EDITOR_SCHEMA_VERSION, activeId, drafts })); } catch { message = 'Não foi possível salvar neste navegador'; }
  $('#save-state').textContent = message;
}

function resetHistory() { undoStack = []; redoStack = []; updateHistoryButtons(); }
function updateHistoryButtons() { $('#undo').disabled = !undoStack.length; $('#redo').disabled = !redoStack.length; }

function commit(mutator) {
  const before = cloneLevel(draft);
  mutator(draft);
  if (serializeLevel(before) === serializeLevel(draft)) return false;
  undoStack.push(before);
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];
  persist();
  refresh();
  return true;
}

function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  redoStack.push(cloneLevel(draft));
  draft = previous;
  selected = null;
  persist('Desfeito');
  refresh();
}

function redo() {
  const next = redoStack.pop();
  if (!next) return;
  undoStack.push(cloneLevel(draft));
  draft = next;
  selected = null;
  persist('Refeito');
  refresh();
}

function makeDraft(level, title = level.name || 'Nova fase') {
  const value = cloneLevel({ ...level, name: title });
  return { id: uid(), title: value.name, lastModified: new Date().toISOString(), level: exportableLevel(value) };
}

function loadState() {
  const state = safeRead();
  if (state?.version === EDITOR_SCHEMA_VERSION && Array.isArray(state.drafts)) {
    drafts = state.drafts.map(item => {
      const parsed = parseLevel(JSON.stringify(item.level));
      return parsed.level ? { id: item.id || uid(), title: parsed.level.name, lastModified: item.lastModified || new Date().toISOString(), level: parsed.level } : null;
    }).filter(Boolean);
    activeId = drafts.some(item => item.id === state.activeId) ? state.activeId : drafts[0]?.id;
  }
  if (!drafts.length) { const initial = makeDraft(blankLevel()); drafts = [initial]; activeId = initial.id; }
  const active = drafts.find(item => item.id === activeId) || drafts[0];
  activeId = active.id;
  draft = cloneLevel(active.level);
}

function renderDraftOptions() {
  draftSelect.replaceChildren();
  for (const item of drafts) { const option = new Option(item.title, item.id); option.selected = item.id === activeId; draftSelect.add(option); }
  sourceSelect.replaceChildren(new Option('Fase vazia', 'blank'));
  levels.forEach((level, index) => sourceSelect.add(new Option(`Fase ${String(index + 1).padStart(2, '0')} · ${level.name}`, `builtin:${index}`)));
  drafts.forEach(item => sourceSelect.add(new Option(`Rascunho · ${item.title}`, `draft:${item.id}`)));
}

function renderPalette() {
  palette.replaceChildren();
  const groups = new Map();
  for (const definition of componentCatalog) { if (!groups.has(definition.group)) groups.set(definition.group, []); groups.get(definition.group).push(definition); }
  for (const [group, definitions] of groups) {
    const heading = document.createElement('div'); heading.className = 'palette-group-title'; heading.textContent = group; palette.append(heading);
    for (const definition of definitions) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'palette-item'; button.draggable = true; button.dataset.type = definition.type; button.textContent = definition.label;
      button.addEventListener('click', () => placeComponent(definition.type, WORLD_WIDTH / 2, WORLD_HEIGHT / 2));
      button.addEventListener('dragstart', event => event.dataTransfer.setData('application/x-treehouse-component', definition.type));
      palette.append(button);
    }
  }
  $('#component-count').textContent = `${componentCatalog.length} peças`;
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: snap((event.clientX - rect.left) / rect.width * WORLD_WIDTH), y: snapY((event.clientY - rect.top) / rect.height * WORLD_HEIGHT) };
}

function placeComponent(type, x, y) {
  const definition = findDefinition(type);
  if (!definition) return;
  if (['door', 'portal', 'falseExit', 'hatch'].includes(definition.collection) && draft[definition.collection]) {
    setStatus(`${definition.label} já existe; selecione-a para editar.`);
    selected = { collection: definition.collection, index: null };
    refresh();
    return;
  }
  let newRef;
  commit(level => { newRef = addComponent(level, type, snap(x), snapY(y)); });
  selected = newRef;
  refresh();
}

function setStatus(message, invalid = false) {
  $('#save-state').textContent = message;
  $('#validation-summary').textContent = message;
  $('#validation-summary').classList.toggle('invalid', invalid);
}

function selectedValue() { return componentAt(draft, selected); }
function selectedType() { return selected?.collection === 'objects' ? selectedValue()?.type : selected?.collection; }
function selectedLabel() { return findDefinition(selectedType())?.label || selectedType() || 'Nada selecionado'; }

function allRefs() {
  const refs = [];
  for (const collection of ['platforms', 'ladders', 'objects']) for (let index = 0; index < (draft[collection] || []).length; index++) refs.push({ collection, index });
  for (const collection of ['door', 'hatch', 'portal', 'falseExit']) if (draft[collection]) refs.push({ collection, index: null });
  return refs;
}

function boundsFor(ref) {
  const value = componentAt(draft, ref); if (!value) return null;
  if (ref.collection === 'platforms') return { x: value.x, y: value.y - 5, w: value.w, h: 12 };
  if (ref.collection === 'ladders') return { x: value.x - 10, y: value.top, w: 20, h: Math.max(10, value.bottom - value.top) };
  if (ref.collection === 'door') return { x: value.x - 16, y: value.y - 38, w: 32, h: 42 };
  if (ref.collection === 'hatch') return { x: value.x - 16, y: value.y - 7, w: 32, h: 12 };
  if (ref.collection === 'portal') return { x: value.x - 18, y: value.y - 42, w: 36, h: 44 };
  if (ref.collection === 'falseExit') return { x: value.x - 15, y: value.y - 35, w: 30, h: 38 };
  if (value.type === 'spikes') return { x: value.x, y: value.y - 10, w: value.w || 14, h: 14 };
  return { x: value.x - 16, y: value.y - 38, w: 32, h: 42 };
}

function hitTest(point) {
  for (const ref of allRefs().reverse()) {
    const box = boundsFor(ref); if (!box) continue;
    if (point.x >= box.x - 3 && point.x <= box.x + box.w + 3 && point.y >= box.y - 3 && point.y <= box.y + box.h + 3) return ref;
  }
  return null;
}

function moveValue(value, ref, dx, dy) {
  if (ref.collection === 'platforms') { value.x = snap(value.x + dx); value.y = snapY(value.y + dy); return; }
  if (ref.collection === 'ladders') { value.x = snap(value.x + dx); value.top = snapY(value.top + dy); value.bottom = snapY(value.bottom + dy); return; }
  value.x = snap(value.x + dx); value.y = snapY(value.y + dy);
}

function updateCoordinateReadout(point = null) {
  const value = selectedValue();
  const x = point?.x ?? value?.x;
  const y = point?.y ?? value?.y ?? value?.top;
  $('#coordinate-readout').textContent = `x ${x === undefined ? '—' : x} · y ${y === undefined ? '—' : y}`;
}

canvas.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
canvas.addEventListener('drop', event => { event.preventDefault(); const type = event.dataTransfer.getData('application/x-treehouse-component'); if (type) { const point = pointFromEvent(event); placeComponent(type, point.x, point.y); } });
canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  const point = pointFromEvent(event); const ref = hitTest(point); selected = ref; updateCoordinateReadout(point); refreshInspector(); refreshStage();
  if (!ref) return;
  canvas.setPointerCapture(event.pointerId);
  const value = componentAt(draft, ref);
  drag = { pointerId: event.pointerId, ref, start: point, original: structuredClone(value), before: cloneLevel(draft), changed: false };
});
canvas.addEventListener('pointermove', event => {
  const point = pointFromEvent(event); updateCoordinateReadout(point);
  if (!drag || drag.pointerId !== event.pointerId) return;
  const value = componentAt(draft, drag.ref); if (!value) return;
  const dx = point.x - drag.start.x, dy = point.y - drag.start.y;
  Object.assign(value, drag.original);
  moveValue(value, drag.ref, dx, dy); drag.changed = drag.changed || dx !== 0 || dy !== 0; refreshStage(); refreshInspector();
});
function finishDrag(event) {
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (drag.changed) { undoStack.push(drag.before); if (undoStack.length > 30) undoStack.shift(); redoStack = []; persist(); updateHistoryButtons(); }
  drag = null; refresh();
}
canvas.addEventListener('pointerup', finishDrag); canvas.addEventListener('pointercancel', finishDrag);

function fieldId(prop) { return `field-${prop.replace(/[^a-z0-9]+/gi, '-')}`; }
function numberField(label, prop, value, { min = 0, max, step = 5 } = {}) { const inferredMax = max ?? (prop === 'x' || prop.endsWith('.x') || prop === 'w' ? WORLD_WIDTH : WORLD_HEIGHT); const id = fieldId(prop); return `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${prop}" autocomplete="off" data-prop="${prop}" type="number" min="${min}" max="${inferredMax}" step="${step}" value="${escapeHtml(value)}"></div>`; }
function textField(label, prop, value, full = false) { const id = fieldId(prop); return `<div class="field${full ? ' full' : ''}"><label for="${id}">${label}</label><input id="${id}" name="${prop}" autocomplete="off" data-prop="${prop}" type="text" value="${escapeHtml(value)}"></div>`; }
function flagsValue(value) { return Array.isArray(value) ? value.join(', ') : value || ''; }
function flagsField(label, prop, value, full = false) { return textField(`${label} (separadas por vírgula)`, prop, flagsValue(value), full); }
function advancedField(value, key = 'advanced') { const id = fieldId(key); return `<details class="field full" open><summary>JSON avançado</summary><textarea id="${id}" name="${key}" autocomplete="off" aria-label="JSON avançado" data-advanced="${key}">${escapeHtml(JSON.stringify(value || {}, null, 2))}</textarea></details>`; }

function editorFieldsFor(ref, value) {
  const type = selectedType();
  if (ref.collection === 'platforms') return numberField('X', 'x', value.x) + numberField('Y', 'y', value.y) + numberField('Largura', 'w', value.w, { max: WORLD_WIDTH }) + flagsField('Requisito', 'requires', value.requires, true);
  if (ref.collection === 'ladders') return numberField('X', 'x', value.x) + numberField('Topo', 'top', value.top) + numberField('Base', 'bottom', value.bottom) + flagsField('Requisito', 'requires', value.requires, true) + `<div class="field checkbox full"><input id="field-vine" name="vine" autocomplete="off" data-prop="vine" type="checkbox" ${value.vine ? 'checked' : ''}><label for="field-vine">Vinha viva</label></div>`;
  if (ref.collection === 'door') return numberField('X', 'x', value.x) + numberField('Y', 'y', value.y) + flagsField('Requisitos', 'requires', value.requires, true);
  if (ref.collection === 'hatch') return numberField('X', 'x', value.x) + numberField('Y', 'y', value.y) + textField('Requisito', 'requires', value.requires, true);
  if (ref.collection === 'portal' || ref.collection === 'falseExit') return numberField('X', 'x', value.x) + numberField('Y', 'y', value.y);
  let fields = numberField('X', 'x', value.x) + numberField('Y', 'y', value.y);
  if (type === 'spikes') fields += numberField('Largura', 'w', value.w, { max: WORLD_WIDTH });
  if (type === 'bell') fields += numberField('Nota', 'note', value.note, { min: 0, max: 127, step: 1 });
  const extras = { ...value }; delete extras.type; delete extras.x; delete extras.y; delete extras.w; delete extras.note;
  return fields + advancedField(extras);
}

function renderInspector() {
  if (!selected || !selectedValue()) {
    const advanced = {}; for (const key of LEVEL_OPTIONS) if (draft[key] !== undefined) advanced[key] = draft[key];
    inspector.innerHTML = `<div class="inspector-form"><h3>Configuração da fase</h3><div class="field-grid">${textField('Nome', 'name', draft.name, true)}${numberField('Spawn X', 'spawn.x', draft.spawn.x)}${numberField('Spawn Y', 'spawn.y', draft.spawn.y)}${numberField('Gravidade', 'physics.gravity', draft.physics.gravity, { max: 2000 })}${numberField('Força do pulo', 'physics.jumpSpeed', draft.physics.jumpSpeed, { max: 500 })}${numberField('Limite de impacto', 'physics.impactThreshold', draft.physics.impactThreshold ?? '', { max: 2000 })}${advancedField(advanced, 'level')}</div></div><div class="empty-inspector">Selecione uma peça no mundo para editar suas propriedades. A configuração avançada aceita iluminação, perseguição, cordas, gotas, paradoxo, ritmo e flags de entrada.</div>`;
    bindLevelInspector(); return;
  }
  const value = selectedValue();
  inspector.innerHTML = `<div class="inspector-form"><h3>${selectedLabel()}</h3><div class="field-grid">${editorFieldsFor(selected, value)}</div><div class="inspector-actions"><button id="delete-selected" class="danger" type="button">EXCLUIR PEÇA</button></div></div>`;
  bindComponentInspector();
}

function setPath(target, path, value) { const parts = path.split('.'); const final = parts.pop(); let object = target; for (const part of parts) object = object[part]; object[final] = value; }
function parseNumber(value) { return value === '' ? undefined : Number(value); }
function parseFlags(value) { return value.split(',').map(item => item.trim()).filter(Boolean); }

function bindLevelInspector() {
  inspector.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('change', () => {
    const prop = input.dataset.prop;
    if (prop === 'name') commit(level => { level.name = input.value || 'Nova fase'; });
    else if (prop === 'requires') commit(level => { level.door.requires = parseFlags(input.value); });
    else if (prop === 'physics.impactThreshold') commit(level => { const value = parseNumber(input.value); if (value === undefined) delete level.physics.impactThreshold; else level.physics.impactThreshold = value; });
    else commit(level => setPath(level, prop, parseNumber(input.value)));
  }));
  inspector.querySelector('[data-advanced="level"]')?.addEventListener('change', event => {
    try {
      const advanced = JSON.parse(event.target.value); if (!advanced || typeof advanced !== 'object' || Array.isArray(advanced)) throw new Error('use um objeto JSON');
      commit(level => { for (const key of LEVEL_OPTIONS) delete level[key]; Object.assign(level, advanced); });
      event.target.setCustomValidity('');
    } catch (error) { event.target.setCustomValidity(error.message); event.target.reportValidity(); setStatus(`JSON avançado inválido: ${error.message}`, true); }
  });
}

function bindComponentInspector() {
  inspector.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('change', () => {
    const prop = input.dataset.prop;
    commit(level => {
      const value = componentAt(level, selected); if (!value) return;
      if (input.type === 'checkbox') value[prop] = input.checked;
      else if (prop === 'requires') value[prop] = selected.collection === 'door' ? parseFlags(input.value) : input.value.trim() || null;
      else if (['x', 'y', 'w', 'top', 'bottom', 'note'].includes(prop)) value[prop] = parseNumber(input.value);
      else value[prop] = input.value;
    });
  }));
  inspector.querySelector('[data-advanced]')?.addEventListener('change', event => {
    try {
      const extras = JSON.parse(event.target.value); if (!extras || typeof extras !== 'object' || Array.isArray(extras)) throw new Error('use um objeto JSON');
      commit(level => { const value = componentAt(level, selected); if (!value) return; for (const key of Object.keys(value)) if (!['type', 'x', 'y', 'w', 'note'].includes(key)) delete value[key]; Object.assign(value, extras); });
      event.target.setCustomValidity('');
    } catch (error) { event.target.setCustomValidity(error.message); event.target.reportValidity(); setStatus(`JSON avançado inválido: ${error.message}`, true); }
  });
  $('#delete-selected').addEventListener('click', () => { commit(level => removeComponent(level, selected)); selected = null; refresh(); });
}

function refreshInspector() { renderInspector(); $('#selection-label').textContent = selected ? selectedLabel() : 'Nada selecionado'; }

function drawGrid() {
  ctx.save(); ctx.lineWidth = 0.5; ctx.strokeStyle = '#f4d9a40c';
  for (let x = 0; x <= WORLD_WIDTH; x += 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= WORLD_HEIGHT; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_WIDTH, y); ctx.stroke(); }
  ctx.lineWidth = 1; ctx.strokeStyle = '#fbc86726';
  for (let x = 0; x <= WORLD_WIDTH; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= WORLD_HEIGHT; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_WIDTH, y); ctx.stroke(); }
  ctx.restore();
}

function drawEditorOverlay() {
  drawGrid();
  ctx.save(); ctx.strokeStyle = '#b7d895'; ctx.fillStyle = '#b7d895'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(draft.spawn.x - 5, draft.spawn.y); ctx.lineTo(draft.spawn.x + 5, draft.spawn.y); ctx.moveTo(draft.spawn.x, draft.spawn.y - 5); ctx.lineTo(draft.spawn.x, draft.spawn.y + 5); ctx.stroke();
  ctx.font = 'bold 6px monospace'; ctx.fillText('SPAWN', draft.spawn.x + 5, draft.spawn.y - 5);
  if (selected) { const box = boundsFor(selected); if (box) { ctx.strokeStyle = '#fbc867'; ctx.setLineDash([3, 2]); ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.setLineDash([]); ctx.fillStyle = '#fbc867'; ctx.fillRect(box.x - 2, box.y - 2, 4, 4); } }
  ctx.restore();
}

function refreshStage() {
  if (!art) { ctx.fillStyle = '#21151e'; ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT); return; }
  if (!validateLevel(draft).valid) {
    ctx.fillStyle='#21151e';ctx.fillRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    ctx.fillStyle='#f4d9a4';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('Revise os erros no inspetor',120,180);
    return;
  }
  const game = new Game(0, { levels: [exportableLevel(draft)] });
  render(ctx, game, art); drawEditorOverlay();
}

function refreshValidation() {
  const result = validateLevel(draft);
  if (!result.valid) setStatus(`${result.errors.length} erro(s) de validação`, true);
  else if (result.warnings.length) setStatus(`${result.warnings.length} aviso(s) · pronto para testar`);
  else setStatus('Pronto para testar');
  $('#validation-summary').textContent = result.valid ? (result.warnings.length ? `${result.warnings.length} aviso(s)` : 'Fase válida') : `${result.errors.length} erro(s)`;
  $('#validation-summary').classList.toggle('invalid', !result.valid);
  showValidationMessages([...result.errors, ...result.warnings], result.errors.length > 0);
}

function showValidationMessages(messages, invalid = false) {
  inspector.querySelector('.validation-list')?.remove();
  if (!messages.length) return;
  const ul = document.createElement('ul'); ul.className = `${invalid ? 'error-list' : 'warning-list'} validation-list`;
  for (const item of messages) { const li = document.createElement('li'); li.textContent = `${item.path}: ${item.message}`; ul.append(li); }
  inspector.append(ul);
}

function refresh() {
  renderDraftOptions(); refreshStage(); refreshInspector(); refreshValidation(); updateHistoryButtons(); updateCoordinateReadout();
}

function selectDraft(id) {
  const next = drafts.find(item => item.id === id); if (!next) return;
  activeId = id; draft = cloneLevel(next.level); selected = null; resetHistory(); persist('Rascunho carregado'); refresh();
}

function newDraft() { const item = makeDraft(blankLevel()); drafts.push(item); activeId = item.id; draft = cloneLevel(item.level); selected = null; resetHistory(); persist('Nova fase criada'); refresh(); }

function duplicateSource() {
  const source = sourceSelect.value;
  const level = source === 'blank' ? blankLevel() : source.startsWith('builtin:') ? levels[Number(source.slice('builtin:'.length))] : drafts.find(item => item.id === source.slice('draft:'.length))?.level;
  if (!level) return;
  const item = makeDraft(level, `${level.name || 'Nova fase'} · cópia`); drafts.push(item); activeId = item.id; draft = cloneLevel(item.level); selected = null; resetHistory(); persist('Fase duplicada'); refresh();
}

function exportJson() {
  const result = validateLevel(draft); if (!result.valid) { setStatus('Corrija os erros antes de exportar', true); return; }
  const blob = new Blob([serializeLevel(exportableLevel(draft))], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `${(draft.name || 'nova-fase').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nova-fase'}.json`; link.click(); URL.revokeObjectURL(url); setStatus('JSON exportado');
}

function importJson(text) {
  const result = parseLevel(text);
  if (!result.level) { const first = result.errors[0]; setStatus(`${first.path}: ${first.message}`, true); showValidationMessages(result.errors, true); return; }
  const item = makeDraft(result.level); drafts.push(item); activeId = item.id; draft = cloneLevel(item.level); selected = null; resetHistory(); persist('JSON importado'); refresh();
}

function playPreview() {
  const result = validateLevel(draft); if (!result.valid) { setStatus('Corrija os erros antes de testar', true); return; }
  try { sessionStorage.setItem(EDITOR_PREVIEW_KEY, JSON.stringify(exportableLevel(draft))); location.href = 'play.html'; } catch { setStatus('Não foi possível preparar a prévia', true); }
}

$('#undo').addEventListener('click', undo); $('#redo').addEventListener('click', redo); $('#new').addEventListener('click', newDraft); $('#duplicate').addEventListener('click', duplicateSource); $('#save').addEventListener('click', () => persist('Salvo localmente')); $('#export').addEventListener('click', exportJson); $('#play').addEventListener('click', playPreview); $('#import').addEventListener('click', () => fileInput.click());
draftSelect.addEventListener('change', () => selectDraft(draftSelect.value));
fileInput.addEventListener('change', async () => { const file = fileInput.files?.[0]; if (file) importJson(await file.text()); fileInput.value = ''; });
window.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
  else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
  else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); persist('Salvo localmente'); }
  else if (event.key === 'Delete' && selected) { event.preventDefault(); commit(level => removeComponent(level, selected)); selected = null; refresh(); }
});

renderPalette(); loadState(); refresh();
function updateDesktopWarning() { $('#desktop-warning').hidden = innerWidth >= 1000; }
updateDesktopWarning();
window.addEventListener('resize', updateDesktopWarning);
loadArt('../assets').then(value => { art = value; refreshStage(); }).catch(error => { setStatus(`Arte indisponível: ${error.message}`, true); console.error(error); });
