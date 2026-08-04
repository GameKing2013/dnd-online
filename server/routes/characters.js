const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// List current user's characters
router.get('/', (req, res) => {
  const characters = db.find('characters', (c) => c.userId === req.session.userId);
  res.json({ characters });
});

router.get('/:id', (req, res) => {
  const character = db.findOne('characters', (c) => c.id === req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found.' });
  if (character.userId !== req.session.userId) {
    // allow campaign members / DM to view read-only
    const isMember = db.findOne('campaignMembers', (m) => m.campaignId === character.campaignId && m.userId === req.session.userId);
    if (!isMember) return res.status(403).json({ error: 'Not allowed.' });
  }
  res.json({ character });
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Character name is required.' });
  const character = db.insert('characters', {
    userId: req.session.userId,
    name: name.trim(),
    campaignId: req.body.campaignId || null,
    sheet: defaultSheet()
  });
  res.json({ character });
});

router.put('/:id', (req, res) => {
  const character = db.findOne('characters', (c) => c.id === req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found.' });
  if (character.userId !== req.session.userId) return res.status(403).json({ error: 'Not allowed.' });
  const patch = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) patch.name = req.body.name.trim();
  if (req.body.sheet) patch.sheet = { ...character.sheet, ...req.body.sheet };
  if ('campaignId' in req.body) patch.campaignId = req.body.campaignId || null;
  const updated = db.update('characters', character.id, patch);
  res.json({ character: updated });
});

router.delete('/:id', (req, res) => {
  const character = db.findOne('characters', (c) => c.id === req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found.' });
  if (character.userId !== req.session.userId) return res.status(403).json({ error: 'Not allowed.' });
  db.remove('characters', character.id);
  res.json({ ok: true });
});

function defaultSheet() {
  return {
    race: '', class: '', background: '', alignment: '', level: 1, experience: 0,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    skillProficiencies: {},
    saveProficiencies: {},
    ac: 10, initiativeBonus: 0, speed: 30,
    hpMax: 10, hpCurrent: 10, hpTemp: 0, hitDice: '1d8',
    attacks: [],
    inventory: [],
    spellSlots: { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 },
    spells: [],
    features: '',
    notes: ''
  };
}

module.exports = router;
