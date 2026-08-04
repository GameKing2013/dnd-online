const path = require('path');
const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const campaignRoutes = require('./routes/campaigns');
const socketHandlers = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dnd-online-dev-secret-change-me';

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 } // 30 days
});

app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, '..', 'public')));

// Share express-session with socket.io connections
io.engine.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/campaigns', campaignRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

socketHandlers.attach(io);

server.listen(PORT, () => {
  console.log(`D&D Online running at http://localhost:${PORT}`);
});
