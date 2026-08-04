// Tiny synchronous JSON-file database. No native deps, easy to deploy anywhere.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DATA = {
  users: [],
  characters: [],
  campaigns: [],
  campaignMembers: [],
  chatMessages: [],
  campaignState: [] // one row per campaign: tokens, initiative, map url
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

ensureFile();

let cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
// Backfill any missing collections (schema upgrades)
for (const key of Object.keys(DEFAULT_DATA)) {
  if (!cache[key]) cache[key] = DEFAULT_DATA[key];
}

let writeScheduled = false;
function persist() {
  if (writeScheduled) return;
  writeScheduled = true;
  setImmediate(() => {
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
    writeScheduled = false;
  });
}

function id() {
  return crypto.randomBytes(9).toString('base64url');
}

const db = {
  id,
  raw: cache,

  insert(collection, row) {
    const record = { id: id(), createdAt: new Date().toISOString(), ...row };
    cache[collection].push(record);
    persist();
    return record;
  },

  update(collection, recordId, patch) {
    const list = cache[collection];
    const idx = list.findIndex((r) => r.id === recordId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    persist();
    return list[idx];
  },

  upsertByKey(collection, key, keyValue, row) {
    const list = cache[collection];
    const idx = list.findIndex((r) => r[key] === keyValue);
    if (idx === -1) {
      const record = { id: id(), [key]: keyValue, ...row };
      list.push(record);
      persist();
      return record;
    }
    list[idx] = { ...list[idx], ...row, updatedAt: new Date().toISOString() };
    persist();
    return list[idx];
  },

  remove(collection, recordId) {
    const list = cache[collection];
    const idx = list.findIndex((r) => r.id === recordId);
    if (idx === -1) return false;
    list.splice(idx, 1);
    persist();
    return true;
  },

  find(collection, predicate) {
    return cache[collection].filter(predicate);
  },

  findOne(collection, predicate) {
    return cache[collection].find(predicate) || null;
  },

  all(collection) {
    return cache[collection];
  }
};

module.exports = db;
