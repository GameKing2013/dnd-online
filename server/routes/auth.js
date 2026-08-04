const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, currentUser } = require('../auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const existing = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with that email already exists.' });
  }
  const existingName = db.findOne('users', (u) => u.username.toLowerCase() === username.toLowerCase());
  if (existingName) {
    return res.status(400).json({ error: 'That username is taken.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = db.insert('users', { username, email, passwordHash });
  req.session.userId = user.id;
  const { passwordHash: _, ...safe } = user;
  res.json({ user: safe });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });
  req.session.userId = user.id;
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  const user = currentUser(req, db);
  res.json({ user });
});

module.exports = router;
