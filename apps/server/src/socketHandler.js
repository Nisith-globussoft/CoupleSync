const roomStore = require('./roomStore');
const PLAYLIST = require('./data/playlist');
const { COUPLE_QUIZ, WOULD_YOU_RATHER } = require('./data/gameQuestions');

function setupSockets(io) {
  io.on('connection', (socket) => {
    let currentRoomCode = null;
    let currentUserId = null;

    console.log(`[Socket] Client connected: ${socket.id}`);

    // --- ROOM CREATION ---
    socket.on('room:create', ({ hostName, roomName, passcode }, callback) => {
      try {
        const { room, user } = roomStore.createRoom({ hostName, roomName, passcode });
        currentRoomCode = room.code;
        currentUserId = user.id;

        socket.join(room.code);
        console.log(`[Room] Created ${room.code} by ${user.name}`);

        if (typeof callback === 'function') {
          callback({ success: true, room, user });
        }
      } catch (err) {
        console.error('Error creating room:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // --- ROOM JOIN ---
    socket.on('room:join', ({ code, userName, passcode }, callback) => {
      try {
        const result = roomStore.joinRoom({ code, userName, passcode });
        if (result.error) {
          if (typeof callback === 'function') callback({ success: false, error: result.error });
          return;
        }

        const { room, user } = result;
        currentRoomCode = room.code;
        currentUserId = user.id;

        socket.join(room.code);
        console.log(`[Room] ${user.name} joined ${room.code}`);

        // Notify other room members
        socket.to(room.code).emit('room:member_joined', { user, members: room.members, messages: room.messages });
        io.to(room.code).emit('room:sync_state', room);

        if (typeof callback === 'function') {
          callback({ success: true, room, user });
        }
      } catch (err) {
        console.error('Error joining room:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // --- ROOM LEAVE ---
    socket.on('room:leave', ({ code, userId }, callback) => {
      if (code && userId) {
        const res = roomStore.leaveRoom(code, userId);
        socket.leave(code.toUpperCase());
        if (res && res.room) {
          io.to(code.toUpperCase()).emit('room:sync_state', res.room);
        }
      }
      currentRoomCode = null;
      currentUserId = null;
      if (typeof callback === 'function') callback({ success: true });
    });

    // --- MUSIC SYNC ---
    socket.on('music:state_change', ({ roomCode, isPlaying, positionMs, currentTrackIndex }) => {
      if (!roomCode) return;
      const updatedMusic = roomStore.updateMusic(roomCode, { isPlaying, positionMs, currentTrackIndex });
      if (updatedMusic) {
        socket.to(roomCode.toUpperCase()).emit('music:sync_state', updatedMusic);
      }
    });

    socket.on('music:track_change', ({ roomCode, trackIndex }) => {
      if (!roomCode) return;
      const updatedMusic = roomStore.updateMusic(roomCode, {
        currentTrackIndex: trackIndex,
        positionMs: 0,
        isPlaying: true
      });
      if (updatedMusic) {
        io.to(roomCode.toUpperCase()).emit('music:sync_state', updatedMusic);
      }
    });

    // --- LIVE CHAT ---
    socket.on('chat:send_message', ({ roomCode, text, senderId, senderName, avatarColor }) => {
      if (!roomCode || !text) return;
      const newMsg = roomStore.addMessage(roomCode, { senderId, senderName, text, avatarColor });
      if (newMsg) {
        io.to(roomCode.toUpperCase()).emit('chat:new_message', newMsg);
      }
    });

    // --- FLOATING HEARTS & REACTION BROADCAST ---
    socket.on('chat:floating_heart', ({ roomCode, senderName }) => {
      if (!roomCode) return;
      io.to(roomCode.toUpperCase()).emit('chat:floating_heart_broadcast', {
        senderName: senderName || 'Someone',
        timestamp: Date.now()
      });
    });

    socket.on('chat:quick_reaction', ({ roomCode, emoji, senderName }) => {
      if (!roomCode || !emoji) return;
      io.to(roomCode.toUpperCase()).emit('chat:reaction_broadcast', {
        emoji,
        senderName: senderName || 'Partner',
        timestamp: Date.now()
      });
    });

    // --- MULTIPLAYER GAMES ---
    socket.on('game:set_active', ({ roomCode, gameType }) => {
      if (!roomCode) return;
      const game = roomStore.setActiveGame(roomCode, gameType);
      if (game) {
        io.to(roomCode.toUpperCase()).emit('game:state_sync', game);
      }
    });

    socket.on('game:truth_or_dare_spin', ({ roomCode, category, type }) => {
      if (!roomCode) return;
      const tod = roomStore.spinTruthOrDare(roomCode, { category, type });
      if (tod) {
        io.to(roomCode.toUpperCase()).emit('game:truth_or_dare_update', tod);
      }
    });

    socket.on('game:quiz_answer', ({ roomCode, userId, questionIndex, selectedIndex }) => {
      if (!roomCode) return;
      const quiz = roomStore.submitQuizAnswer(roomCode, { userId, questionIndex, selectedIndex });
      if (quiz) {
        io.to(roomCode.toUpperCase()).emit('game:quiz_update', quiz);
      }
    });

    socket.on('game:quiz_next', ({ roomCode }) => {
      if (!roomCode) return;
      const quiz = roomStore.nextQuizQuestion(roomCode);
      if (quiz) {
        io.to(roomCode.toUpperCase()).emit('game:quiz_update', quiz);
      }
    });

    socket.on('game:wyr_vote', ({ roomCode, userId, choice }) => {
      if (!roomCode) return;
      const wyr = roomStore.voteWouldYouRather(roomCode, { userId, choice });
      if (wyr) {
        io.to(roomCode.toUpperCase()).emit('game:wyr_update', wyr);
      }
    });

    socket.on('game:wyr_next', ({ roomCode }) => {
      if (!roomCode) return;
      const wyr = roomStore.nextWouldYouRather(roomCode);
      if (wyr) {
        io.to(roomCode.toUpperCase()).emit('game:wyr_update', wyr);
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      if (currentRoomCode && currentUserId) {
        const res = roomStore.leaveRoom(currentRoomCode, currentUserId);
        if (res && res.room) {
          io.to(currentRoomCode.toUpperCase()).emit('room:sync_state', res.room);
        }
      }
    });
  });
}

module.exports = setupSockets;
