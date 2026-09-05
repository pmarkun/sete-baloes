import { base, componentCatalog } from '../components.mjs';

export const EDITOR_SCHEMA_VERSION = 1;
export const EDITOR_STORAGE_KEY = 'treehouse-level-editor-v1';
export const EDITOR_PREVIEW_KEY = 'treehouse-level-editor-preview-v1';
export const WORLD_WIDTH = 240;
export const WORLD_HEIGHT = 360;

const collectionFields = ['platforms', 'ladders', 'objects'];
const advancedFields = ['physics', 'lighting', 'hunter', 'paradox', 'melody', 'music', 'entryFlags'];
const objectTypes = new Set(componentCatalog.filter(item => item.collection === 'objects').map(item => item.type));

export function cloneLevel(level) {
  return { schemaVersion: EDITOR_SCHEMA_VERSION, ...structuredClone(level) };
}

export function blankLevel(name = 'Nova fase') {
  return cloneLevel({ ...base(), name });
}

export function serializeLevel(level) {
  return JSON.stringify(cloneLevel(level), null, 2);
}

export function parseLevel(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return { level: null, errors: [{ path: '$', message: `JSON inválido: ${error.message}` }], warnings: [] };
  }
  const result = validateLevel(value);
  return result.valid ? { ...result, level: cloneLevel(value) } : { ...result, level: null };
}

export function validateLevel(level) {
  const errors = [], warnings = [];
  const error = (path, message) => errors.push({ path, message });
  const warning = (path, message) => warnings.push({ path, message });
  const number = (value, path, { min = -Infinity, max = Infinity } = {}) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) { error(path, 'deve ser um número finito'); return false; }
    if (value < min || value > max) error(path, `deve ficar entre ${min} e ${max}`);
    return true;
  };
  const point = (value, path) => {
    if (!value || typeof value !== 'object') { error(path, 'deve ser um ponto'); return false; }
    number(value.x, `${path}.x`, { min: 0, max: WORLD_WIDTH });
    number(value.y, `${path}.y`, { min: 0, max: WORLD_HEIGHT });
    return true;
  };
  const requirement = (value, path) => {
    if (value !== null && value !== undefined && (typeof value !== 'string' || !value.trim())) error(path, 'deve ser uma flag não vazia ou nula');
  };

  if (!level || typeof level !== 'object' || Array.isArray(level)) return { valid: false, errors: [{ path: '$', message: 'a fase deve ser um objeto' }], warnings };
  if (level.schemaVersion !== undefined && level.schemaVersion !== EDITOR_SCHEMA_VERSION) error('schemaVersion', `versão não suportada: ${level.schemaVersion}`);
  if (typeof level.name !== 'string' || !level.name.trim()) error('name', 'informe um nome para a fase');
  point(level.spawn, 'spawn');

  for (const field of collectionFields) {
    if (!Array.isArray(level[field])) { error(field, 'deve ser uma lista'); continue; }
    for (const [index, item] of level[field].entries()) {
      const path = `${field}[${index}]`;
      if (!item || typeof item !== 'object') { error(path, 'deve ser um objeto'); continue; }
      if (field === 'platforms') {
        number(item.x, `${path}.x`, { min: 0, max: WORLD_WIDTH });
        number(item.y, `${path}.y`, { min: 0, max: WORLD_HEIGHT });
        if (!number(item.w, `${path}.w`, { min: 1, max: WORLD_WIDTH }) || item.x + item.w > WORLD_WIDTH) error(`${path}.w`, 'a plataforma deve caber no mundo');
        requirement(item.requires, `${path}.requires`);
      } else if (field === 'ladders') {
        number(item.x, `${path}.x`, { min: 0, max: WORLD_WIDTH });
        number(item.top, `${path}.top`, { min: 0, max: WORLD_HEIGHT });
        number(item.bottom, `${path}.bottom`, { min: 0, max: WORLD_HEIGHT });
        if (Number.isFinite(item.top) && Number.isFinite(item.bottom) && item.top > item.bottom) error(path, 'top deve ser menor ou igual a bottom');
        requirement(item.requires, `${path}.requires`);
      } else {
        if (!objectTypes.has(item.type)) error(`${path}.type`, `componente desconhecido: ${item.type}`);
        point(item, path);
        if (item.type === 'spikes') {
          number(item.w, `${path}.w`, { min: 1, max: WORLD_WIDTH });
          if (Number.isFinite(item.x) && Number.isFinite(item.w) && item.x + item.w > WORLD_WIDTH) error(`${path}.w`, 'os espinhos devem caber no mundo');
        }
        if (item.type === 'bell' && (typeof item.note !== 'number' || !Number.isFinite(item.note))) error(`${path}.note`, 'o sino precisa de uma nota numérica');
      }
    }
  }

  const objects = Array.isArray(level.objects) ? level.objects : [];
  if (objects.some(item => item?.type === 'bell') && !Array.isArray(level.melody)) error('melody', 'uma fase com sino precisa de uma sequência melody');
  if (objects.some(item => item?.type === 'crate') && !objects.some(item => item?.type === 'plate')) error('objects', 'uma caixa precisa de uma placa para funcionar');

  if (!level.door || typeof level.door !== 'object') error('door', 'a fase precisa de uma porta');
  else { point(level.door, 'door'); if (!Array.isArray(level.door.requires)) error('door.requires', 'deve ser uma lista de flags'); else level.door.requires.forEach((value, i) => requirement(value, `door.requires[${i}]`)); }

  for (const field of ['hatch', 'portal', 'falseExit']) {
    if (level[field] === undefined) continue;
    if (!point(level[field], field)) continue;
    if (field === 'hatch') requirement(level[field].requires, 'hatch.requires');
  }
  if (!level.physics || typeof level.physics !== 'object') error('physics', 'a fase precisa de configurações de física');
  else { number(level.physics.gravity, 'physics.gravity', { min: 0 }); number(level.physics.jumpSpeed, 'physics.jumpSpeed', { min: 0 }); if (level.physics.impactThreshold !== undefined) number(level.physics.impactThreshold, 'physics.impactThreshold', { min: 0 }); }

  for (const field of advancedFields) {
    if (level[field] === undefined) continue;
    if (field === 'paradox' && typeof level[field] === 'boolean') continue;
    if (typeof level[field] !== 'object' || level[field] === null) error(field, 'deve ser um objeto ou lista válido');
  }
  if (Array.isArray(level.platforms) && !level.platforms.length) warning('platforms', 'a fase não tem plataformas');
  if (Array.isArray(level.ladders) && !level.ladders.length) warning('ladders', 'a fase não tem escadas');
  return { valid: errors.length === 0, errors, warnings };
}

export function findDefinition(type) {
  return componentCatalog.find(item => item.type === type) || null;
}

export function addComponent(level, type, x, y) {
  const definition = findDefinition(type);
  if (!definition) throw new Error(`Componente desconhecido: ${type}`);
  const value = definition.create(x, y);
  if (definition.collection === 'door' || definition.collection === 'portal' || definition.collection === 'falseExit' || definition.collection === 'hatch') level[definition.collection] = value;
  else level[definition.collection].push(value);
  return { collection: definition.collection, index: definition.collection === 'objects' || definition.collection === 'platforms' || definition.collection === 'ladders' ? level[definition.collection].length - 1 : null };
}

export function componentAt(level, ref) {
  if (!ref) return null;
  return ref.index === null ? level[ref.collection] : level[ref.collection]?.[ref.index];
}

export function removeComponent(level, ref) {
  if (!ref) return;
  if (ref.index === null) { delete level[ref.collection]; return; }
  level[ref.collection]?.splice(ref.index, 1);
}

export function exportableLevel(level) {
  const value = cloneLevel(level);
  delete value.id;
  delete value.lastModified;
  return value;
}
