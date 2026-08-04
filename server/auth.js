function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
}

function currentUser(req, db) {
  if (!req.session || !req.session.userId) return null;
  const user = db.findOne('users', (u) => u.id === req.session.userId);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { requireAuth, currentUser };
