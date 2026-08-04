const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

function inviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function safeUser(userId) {
  const u = db.findOne('users', (u) => u.id === userId);
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

function withMembers(campaign) {
  const members = db.find('campaignMembers', (m) => m.campaignId === campaign.id).map((m) => ({
    ...m,
    user: safeUser(m.userId),
    character: m.characterId ? db.findOne('characters', (c) => c.id === m.characterId) : null
  }));
  return { ...campaign, members };
}

// Campaigns the user DMs or plays in
router.get('/', (req, res) => {
  const myMemberships = db.find('campaignMembers', (m) => m.userId === req.session.userId);
  const campaignIds = new Set(myMemberships.map((m) => m.campaignId));
  const campaigns = db.find('campaigns', (c) => campaignIds.has(c.id)).map(withMembers);
  res.json({ campaigns });
});

router.get('/:id', (req, res) => {
  const campaign = db.findOne('campaigns', (c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  const isMember = db.findOne('campaignMembers', (m) => m.campaignId === campaign.id && m.userId === req.session.userId);
  if (!isMember) return res.status(403).json({ error: 'Not a member of this campaign.' });
  res.json({ campaign: withMembers(campaign), myRole: isMember.role });
});

router.post('/', (req, res) => {
  const { name, description } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Campaign name is required.' });
  const campaign = db.insert('campaigns', {
    name: name.trim(),
    description: description || '',
    dmId: req.session.userId,
    inviteCode: inviteCode(),
    dmNotes: ''
  });
  db.insert('campaignMembers', { campaignId: campaign.id, userId: req.session.userId, role: 'dm', characterId: null });
  db.insert('campaignState', { campaignId: campaign.id, tokens: [], initiative: [], activeIndex: -1, mapUrl: '' });
  res.json({ campaign: withMembers(campaign) });
});

router.post('/join', (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Invite code is required.' });
  const campaign = db.findOne('campaigns', (c) => c.inviteCode === code.trim().toUpperCase());
  if (!campaign) return res.status(404).json({ error: 'No campaign found with that invite code.' });
  const existing = db.findOne('campaignMembers', (m) => m.campaignId === campaign.id && m.userId === req.session.userId);
  if (existing) return res.json({ campaign: withMembers(campaign) });
  db.insert('campaignMembers', { campaignId: campaign.id, userId: req.session.userId, role: 'player', characterId: null });
  res.json({ campaign: withMembers(campaign) });
});

router.put('/:id', (req, res) => {
  const campaign = db.findOne('campaigns', (c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  if (campaign.dmId !== req.session.userId) return res.status(403).json({ error: 'Only the DM can edit the campaign.' });
  const patch = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) patch.name = req.body.name.trim();
  if (typeof req.body.description === 'string') patch.description = req.body.description;
  if (typeof req.body.dmNotes === 'string') patch.dmNotes = req.body.dmNotes;
  const updated = db.update('campaigns', campaign.id, patch);
  res.json({ campaign: withMembers(updated) });
});

// Attach one of my characters to this campaign
router.post('/:id/character', (req, res) => {
  const campaign = db.findOne('campaigns', (c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  const membership = db.findOne('campaignMembers', (m) => m.campaignId === campaign.id && m.userId === req.session.userId);
  if (!membership) return res.status(403).json({ error: 'Not a member of this campaign.' });
  const { characterId } = req.body || {};
  if (characterId) {
    const character = db.findOne('characters', (c) => c.id === characterId);
    if (!character || character.userId !== req.session.userId) return res.status(403).json({ error: 'Not your character.' });
    db.update('characters', characterId, { campaignId: campaign.id });
  }
  db.update('campaignMembers', membership.id, { characterId: characterId || null });
  res.json({ campaign: withMembers(campaign) });
});

module.exports = router;
