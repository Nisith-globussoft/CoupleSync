const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
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

// Root route
app.get('/', (req, res) => {
  res.status(200).send('CoupleSync Realtime Backend is Live & Healthy! 🚀💖');
});

// Primary Health check endpoints (supports /health, /healthz, and /api/health)
const handleHealthCheck = (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const memoryUsageMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  res.status(200).json({
    status: 'healthy',
    service: 'CoupleSync Backend',
    tagline: 'Same vibes, different places',
    uptime: `${hours}h ${minutes}m ${seconds}s (${uptimeSeconds}s total)`,
    memoryUsage: `${memoryUsageMb} MB`,
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealthCheck);
app.get('/healthz', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

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
  console.log('==================================================');
  console.log(`🚀 CoupleSync Server listening on port ${PORT}`);
  console.log(`💓 Realtime Socket.IO ready for couples & friends`);
  console.log('==================================================');

  // Setup Keep-Alive Cron: runs every 10 minutes (Render sleeps after 15m)
  // Schedule: */10 * * * *
  cron.schedule('*/10 * * * *', async () => {
    const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || process.env.BACKEND_URL;
    const targetUrl = externalUrl
      ? `${externalUrl.replace(/\/$/, '')}/health`
      : `http://localhost:${PORT}/health`;

    try {
      console.log(`[Cron Keep-Alive] Pinging health check at ${new Date().toLocaleTimeString()} -> ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (response.ok) {
        const data = await response.json();
        console.log(`[Cron Keep-Alive] Ping successful! Status: ${data.status}, Uptime: ${data.uptime}`);
      } else {
        console.warn(`[Cron Keep-Alive] Ping returned status ${response.status}`);
      }
    } catch (err) {
      console.error(`[Cron Keep-Alive] Failed to ping ${targetUrl}:`, err.message);
    }
  });

  console.log('⏰ Keep-Alive Cron initialized: checks every 10 minutes to prevent Render sleep mode');
});
