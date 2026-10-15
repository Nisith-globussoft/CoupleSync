const roomStore = require('./roomStore');
const PLAYLIST = require('./data/playlist');
const { COUPLE_QUIZ, WOULD_YOU_RATHER } = require('./data/gameQuestions');

function setupSockets(io) {
  io.on('connection', (socket) => {
    let currentRoomCode = null;
    let currentUserId = null;

    console.log(`[Socket] Client connected: ${socket.id}`);

    // --- ROOM CREATION ---
    socket.on('room:create', ({ hostName, roomName, passcode, avatarEmoji }, callback) => {
      try {
        const { room, user } = roomStore.createRoom({ hostName, roomName, passcode, avatarEmoji });
        currentRoomCode = room.code;
        currentUserId = user.id;

        socket.join(room.code.toUpperCase());
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
    socket.on('room:join', ({ code, userName, passcode, avatarEmoji }, callback) => {
      try {
        const result = roomStore.joinRoom({ code, userName, passcode, avatarEmoji });
        if (result.error) {
          if (typeof callback === 'function') callback({ success: false, error: result.error });
          return;
        }

        const { room, user } = result;
        currentRoomCode = room.code;
        currentUserId = user.id;

        socket.join(room.code.toUpperCase());
        console.log(`[Room] ${user.name} joined ${room.code}`);

        socket.to(room.code.toUpperCase()).emit('room:member_joined', { user, members: room.members, messages: room.messages });
        io.to(room.code.toUpperCase()).emit('room:sync_state', room);

        if (typeof callback === 'function') {
          callback({ success: true, room, user });
        }
      } catch (err) {
        console.error('Error joining room:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // --- ROOM LEAVE ---
    socket.on('room:leave', ({ roomCode, userId }) => {
      if (!roomCode || !userId) return;
      const result = roomStore.leaveRoom(roomCode, userId);
      socket.leave(roomCode.toUpperCase());
      if (result && result.room) {
        io.to(roomCode.toUpperCase()).emit('room:sync_state', result.room);
      }
    });

    // --- MUSIC SYNC & CONTROLS ---
    socket.on('music:state_change', ({ roomCode, isPlaying, positionMs, currentTrackIndex }) => {
      if (!roomCode) return;
      const updatedMusic = roomStore.updateMusicState(roomCode, { isPlaying, positionMs, currentTrackIndex });
      if (updatedMusic) {
        io.to(roomCode.toUpperCase()).emit('music:sync_state', updatedMusic);
      }
    });

    socket.on('music:track_change', ({ roomCode, trackIndex }) => {
      if (!roomCode) return;
      const updatedMusic = roomStore.changeTrack(roomCode, trackIndex);
      if (updatedMusic) {
        io.to(roomCode.toUpperCase()).emit('music:sync_state', updatedMusic);
      }
    });

    // --- CHAT & EMOTE REACTIONS ---
    socket.on('chat:send_message', ({ id, roomCode, text, senderId, senderName, avatarColor }) => {
      if (!roomCode || !text) return;
      const message = roomStore.addMessage(roomCode, { id, text, senderId, senderName, avatarColor });
      if (message) {
        // Send only to partner, sender already has optimistic local state
        socket.to(roomCode.toUpperCase()).emit('chat:new_message', message);
      }
    });

    socket.on('chat:quick_reaction', ({ roomCode, emoji, senderName }) => {
      if (!roomCode) return;
      io.to(roomCode.toUpperCase()).emit('chat:reaction_broadcast', { emoji, senderName });
    });

    socket.on('chat:floating_heart', ({ roomCode, senderName }) => {
      if (!roomCode) return;
      io.to(roomCode.toUpperCase()).emit('chat:floating_heart_broadcast', { senderName });
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

    // --- WEBRTC MOVIE STREAMING & AUDIO SIGNALING ---
    socket.on('webrtc:signal', (data) => {
      const code = data.roomCode || currentRoomCode;
      if (!code) return;
      console.log(`[WebRTC] Relay signal '${data.type}' in room ${code}`);
      socket.to(code.toUpperCase()).emit('webrtc:signal', {
        ...data,
        senderId: socket.id
      });
    });

    socket.on('movie:stream_started', (data) => {
      const code = data.roomCode || currentRoomCode;
      if (!code) return;
      console.log(`[Movie] Stream started in room ${code} by ${data.streamerName}`);
      socket.to(code.toUpperCase()).emit('movie:stream_started', {
        ...data,
        streamerId: socket.id
      });
    });

    socket.on('movie:stream_stopped', (data) => {
      const code = data?.roomCode || currentRoomCode;
      if (!code) return;
      console.log(`[Movie] Stream stopped in room ${code}`);
      socket.to(code.toUpperCase()).emit('movie:stream_stopped');
    });

    socket.on('movie:voice_state', (data) => {
      const code = data?.roomCode || currentRoomCode;
      if (!code) return;
      socket.to(code.toUpperCase()).emit('movie:voice_state', data);
    });

    socket.on('movie:request_active_stream', (data) => {
      const code = data?.roomCode || currentRoomCode;
      if (!code) return;
      socket.to(code.toUpperCase()).emit('movie:request_active_stream', {
        requesterId: socket.id
      });
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
