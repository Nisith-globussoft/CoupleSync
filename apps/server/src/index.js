const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSockets = require('./socketHandler');
const roomStore = require('./roomStore');
const PLAYLIST = require('./data/playlist');
const { COUPLE_QUIZ, WOULD_YOU_RATHER, TRUTH_OR_DARE } = require('./data/gameQuestions');

const app = express();
const server = http.createServer(app);

// CORS setup for local dev & networked devices (e.g. mobile phone on local Wi-Fi)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup real-time sockets
setupSockets(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CoupleSync',
    tagline: 'Same vibes, different places',
    timestamp: Date.now()
  });
});

// Playlist endpoint
app.get('/api/playlist', (req, res) => {
  res.json(PLAYLIST);
});

// Games metadata endpoint
app.get('/api/games/data', (req, res) => {
  res.json({
    coupleQuiz: COUPLE_QUIZ,
    wouldYouRather: WOULD_YOU_RATHER,
    truthOrDareCategories: Object.keys(TRUTH_OR_DARE)
  });
});

// Check room existence
app.get('/api/rooms/:code', (req, res) => {
  const room = roomStore.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ exists: false, error: 'Room not found' });
  }
  res.json({
    exists: true,
    name: room.name,
    memberCount: room.members.length,
    hasPasscode: !!room.passcode
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`💖 CoupleSync Server listening on port ${PORT}`);
  console.log(`📡 Realtime Socket.IO ready for couples & friends`);
  console.log(`==================================================`);
});
