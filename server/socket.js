const db = require('./db');
const { rollDice } = require('./dice');

function safeUser(userId) {
  const u = db.findOne('users', (x) => x.id === userId);
  return u ? { id: u.id, username: u.username } : { id: userId, username: 'Unknown' };
}

function getState(campaignId) {
  let state = db.findOne('campaignState', (s) => s.campaignId === campaignId);
  if (!state) {
    state = db.insert('campaignState', { campaignId, tokens: [], initiative: [], activeIndex: -1, mapUrl: '' });
  }
  return state;
}

function recentChat(campaignId) {
  return db.find('chatMessages', (m) => m.campaignId === campaignId).slice(-100);
}

function isMember(campaignId, userId) {
  return !!db.findOne('campaignMembers', (m) => m.campaignId === campaignId && m.userId === userId);
}

function attach(io) {
  io.on('connection', (socket) => {
    const session = socket.request.session;
    const userId = session && session.userId;

    socket.on('join-campaign', (campaignId, ack) => {
      if (!userId || !isMember(campaignId, userId)) {
        if (ack) ack({ error: 'Not authorized for this campaign.' });
        return;
      }
      socket.data.campaignId = campaignId;
      socket.data.userId = userId;
      socket.join(`campaign:${campaignId}`);
      const state = getState(campaignId);
      const user = safeUser(userId);
      socket.to(`campaign:${campaignId}`).emit('presence', { type: 'joined', user });
      if (ack) ack({ state, chat: recentChat(campaignId), you: user });
    });

    socket.on('chat-message', (text) => {
      const { campaignId, userId } = socket.data;
      if (!campaignId || !userId || typeof text !== 'string' || !text.trim()) return;
      const user = safeUser(userId);
      const msg = db.insert('chatMessages', {
        campaignId, userId, username: user.username, type: 'chat', text: text.trim().slice(0, 1000)
      });
      io.to(`campaign:${campaignId}`).emit('chat-message', msg);
    });

    socket.on('dice-roll', (expression) => {
      const { campaignId, userId } = socket.data;
      if (!campaignId || !userId) return;
      const result = rollDice(expression);
      if (!result) {
        socket.emit('error-message', `Could not parse dice expression "${expression}". Try something like 1d20+5.`);
        return;
      }
      const user = safeUser(userId);
      const msg = db.insert('chatMessages', {
        campaignId, userId, username: user.username, type: 'roll', text: '', roll: result
      });
      io.to(`campaign:${campaignId}`).emit('chat-message', msg);
    });

    socket.on('initiative:update', (list) => {
      const { campaignId } = socket.data;
      if (!campaignId || !Array.isArray(list)) return;
      const state = getState(campaignId);
      const updated = db.update('campaignState', state.id, { initiative: list });
      io.to(`campaign:${campaignId}`).emit('state', updated);
    });

    socket.on('initiative:next', () => {
      const { campaignId } = socket.data;
      if (!campaignId) return;
      const state = getState(campaignId);
      if (!state.initiative.length) return;
      const nextIndex = (state.activeIndex + 1) % state.initiative.length;
      const updated = db.update('campaignState', state.id, { activeIndex: nextIndex });
      io.to(`campaign:${campaignId}`).emit('state', updated);
    });

    socket.on('token:update', (tokens) => {
      const { campaignId } = socket.data;
      if (!campaignId || !Array.isArray(tokens)) return;
      const state = getState(campaignId);
      const updated = db.update('campaignState', state.id, { tokens });
      io.to(`campaign:${campaignId}`).emit('state', updated);
    });

    socket.on('map:set', (mapUrl) => {
      const { campaignId } = socket.data;
      if (!campaignId) return;
      const state = getState(campaignId);
      const updated = db.update('campaignState', state.id, { mapUrl: String(mapUrl || '').slice(0, 2000) });
      io.to(`campaign:${campaignId}`).emit('state', updated);
    });

    socket.on('disconnect', () => {
      const { campaignId, userId } = socket.data;
      if (campaignId && userId) {
        socket.to(`campaign:${campaignId}`).emit('presence', { type: 'left', user: safeUser(userId) });
      }
    });
  });
}

module.exports = { attach };
