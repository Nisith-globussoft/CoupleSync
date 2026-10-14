const PLAYLIST = require('./data/playlist');
const { TRUTH_OR_DARE, COUPLE_QUIZ, WOULD_YOU_RATHER } = require('./data/gameQuestions');

class RoomStore {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    const prefixes = ['LOVE', 'VIBE', 'SYNC', 'DATE', 'MOON', 'SOUL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }

  createRoom({ hostName, roomName, passcode }) {
    let code = this.generateRoomCode();
    while (this.rooms.has(code)) {
      code = this.generateRoomCode();
    }

    const hostId = 'user-' + Math.random().toString(36).substring(2, 9);
    const hostUser = {
      id: hostId,
      name: hostName || 'Player 1',
      isHost: true,
      avatarColor: '#ec4899',
      joinedAt: Date.now()
    };

    const room = {
      code,
      name: roomName || 'Couple Sanctuary',
      passcode: passcode || null,
      hostId,
      createdAt: Date.now(),
      members: [hostUser],
      messages: [
        {
          id: 'msg-welcome',
          system: true,
          text: `Room created by ${hostUser.name}! Share code ${code} to invite your partner.`,
          timestamp: Date.now()
        }
      ],
      music: {
        currentTrackIndex: 0,
        isPlaying: false,
        positionMs: 0,
        lastUpdated: Date.now(),
        playlist: PLAYLIST
      },
      game: {
        activeGame: null, // 'truth_or_dare' | 'quiz' | 'would_you_rather'
        truthOrDare: {
          category: 'romantic',
          type: 'truth', // 'truth' | 'dare'
          currentPrompt: TRUTH_OR_DARE.romantic.truths[0],
          currentTurnUserId: hostId,
          turnCounter: 1
        },
        quiz: {
          currentQuestionIndex: 0,
          answers: {}, // { [userId]: selectedIndex }
          scores: { [hostId]: 0 }
        },
        wouldYouRather: {
          currentIndex: 0,
          votes: {} // { [userId]: 'A' | 'B' }
        }
      }
    };

    this.rooms.set(code, room);
    return { room, user: hostUser };
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  joinRoom({ code, userName, passcode }) {
    const formattedCode = (code || '').toUpperCase().trim();
    const room = this.rooms.get(formattedCode);

    if (!room) {
      return { error: 'Room not found. Check your code or create a new room.' };
    }

    if (room.passcode && room.passcode !== passcode) {
      return { error: 'Incorrect room passcode.' };
    }

    const userId = 'user-' + Math.random().toString(36).substring(2, 9);
    const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
    const avatarColor = colors[room.members.length % colors.length];

    const newUser = {
      id: userId,
      name: userName || `Guest ${room.members.length + 1}`,
      isHost: false,
      avatarColor,
      joinedAt: Date.now()
    };

    room.members.push(newUser);
    if (!room.game.quiz.scores[userId]) {
      room.game.quiz.scores[userId] = 0;
    }

    room.messages.push({
      id: 'msg-' + Date.now(),
      system: true,
      text: `${newUser.name} has joined the room! ❤️`,
      timestamp: Date.now()
    });

    return { room, user: newUser };
  }

  leaveRoom(code, userId) {
    const formattedCode = (code || '').toUpperCase().trim();
    const room = this.rooms.get(formattedCode);
    if (!room) return null;

    const memberIndex = room.members.findIndex(m => m.id === userId);
    let departingUser = null;
    if (memberIndex !== -1) {
      departingUser = room.members[memberIndex];
      room.members.splice(memberIndex, 1);
    }

    if (room.members.length === 0) {
      // Empty room can be removed or kept for a while
      this.rooms.delete(formattedCode);
      return { roomDeleted: true };
    }

    // Reassign host if host left
    if (room.hostId === userId && room.members.length > 0) {
      room.hostId = room.members[0].id;
      room.members[0].isHost = true;
    }

    if (departingUser) {
      room.messages.push({
        id: 'msg-' + Date.now(),
        system: true,
        text: `${departingUser.name} left the room.`,
        timestamp: Date.now()
      });
    }

    return { room, departingUser };
  }

  addMessage(code, { id, senderId, senderName, text, avatarColor }) {
    const room = this.getRoom(code);
    if (!room) return null;

    const message = {
      id: id || ('msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
      senderId,
      senderName,
      text: (text || '').trim(),
      avatarColor: avatarColor || '#6366f1',
      timestamp: Date.now()
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    return message;
  }

  updateMusic(code, updates) {
    const room = this.getRoom(code);
    if (!room) return null;

    if (updates.isPlaying !== undefined) room.music.isPlaying = updates.isPlaying;
    if (updates.currentTrackIndex !== undefined) room.music.currentTrackIndex = updates.currentTrackIndex;
    if (updates.positionMs !== undefined) room.music.positionMs = updates.positionMs;
    room.music.lastUpdated = Date.now();

    return room.music;
  }

  updateMusicState(code, updates) {
    return this.updateMusic(code, updates);
  }

  changeTrack(code, trackIndex) {
    return this.updateMusic(code, { currentTrackIndex: trackIndex, positionMs: 0, isPlaying: true });
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  setActiveGame(code, gameType) {
    const room = this.getRoom(code);
    if (!room) return null;
    room.game.activeGame = gameType;
    return room.game;
  }

  spinTruthOrDare(code, { category, type }) {
    const room = this.getRoom(code);
    if (!room) return null;

    const cat = category || room.game.truthOrDare.category || 'romantic';
    const t = type || (Math.random() > 0.5 ? 'truth' : 'dare');
    const deck = TRUTH_OR_DARE[cat] ? TRUTH_OR_DARE[cat][t === 'truth' ? 'truths' : 'dares'] : TRUTH_OR_DARE.romantic.truths;
    const prompt = deck[Math.floor(Math.random() * deck.length)];

    // Next turn
    const members = room.members;
    const currentIdx = members.findIndex(m => m.id === room.game.truthOrDare.currentTurnUserId);
    const nextIdx = (currentIdx + 1) % (members.length || 1);
    const nextTurnUser = members[nextIdx] ? members[nextIdx].id : room.hostId;

    room.game.truthOrDare = {
      category: cat,
      type: t,
      currentPrompt: prompt,
      currentTurnUserId: nextTurnUser,
      turnCounter: room.game.truthOrDare.turnCounter + 1
    };

    return room.game.truthOrDare;
  }

  submitQuizAnswer(code, { userId, questionIndex, selectedIndex }) {
    const room = this.getRoom(code);
    if (!room) return null;

    if (!room.game.quiz.answers[questionIndex]) {
      room.game.quiz.answers[questionIndex] = {};
    }
    room.game.quiz.answers[questionIndex][userId] = selectedIndex;

    // Check if score can increment
    if (!room.game.quiz.scores[userId]) room.game.quiz.scores[userId] = 0;
    room.game.quiz.scores[userId] += 10;

    return room.game.quiz;
  }

  nextQuizQuestion(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    const nextIdx = (room.game.quiz.currentQuestionIndex + 1) % COUPLE_QUIZ.length;
    room.game.quiz.currentQuestionIndex = nextIdx;
    return room.game.quiz;
  }

  voteWouldYouRather(code, { userId, choice }) {
    const room = this.getRoom(code);
    if (!room) return null;

    const currentIdx = room.game.wouldYouRather.currentIndex;
    if (!room.game.wouldYouRather.votes[currentIdx]) {
      room.game.wouldYouRather.votes[currentIdx] = {};
    }
    room.game.wouldYouRather.votes[currentIdx][userId] = choice; // 'A' or 'B'
    return room.game.wouldYouRather;
  }

  nextWouldYouRather(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    const nextIdx = (room.game.wouldYouRather.currentIndex + 1) % WOULD_YOU_RATHER.length;
    room.game.wouldYouRather.currentIndex = nextIdx;
    return room.game.wouldYouRather;
  }
}

module.exports = new RoomStore();
