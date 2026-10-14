import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within a RoomProvider');
  return context;
};

const DEFAULT_PLAYLIST = [
  {
    id: 'track-1',
    title: 'Midnight Serenade',
    artist: 'Lofi Cozy Moments',
    album: 'Starlight Vibes Vol. 1',
    duration: 372,
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'track-2',
    title: 'Warm Coffee & You',
    artist: 'Sunset Cafe Acoustics',
    album: 'Together Tonight',
    duration: 423,
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'track-3',
    title: 'Endless Horizon',
    artist: 'Romantic Piano Dreams',
    album: 'Under The Moon',
    duration: 355,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'track-4',
    title: 'Dancing in the Starlight',
    artist: 'Lo-Fi Heartbeats',
    album: 'CoupleSync Exclusive',
    duration: 312,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];

export const RoomProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('couplesync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('music');
  const [connected, setConnected] = useState(false);
  const [floatingHeartTrigger, setFloatingHeartTrigger] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SERVER_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to server:', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    s.on('room:sync_state', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    s.on('room:member_joined', ({ user, members, messages }) => {
      showToast((user.name || 'Someone') + ' joined the room! 💖');
      setRoom(prev => prev ? { ...prev, members, messages } : prev);
    });

    s.on('music:sync_state', (musicState) => {
      setRoom(prev => prev ? { ...prev, music: musicState } : prev);
    });

    s.on('chat:new_message', (message) => {
      setRoom(prev => {
        if (!prev) return prev;
        const exists = prev.messages.some(m => m.id === message.id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    s.on('chat:floating_heart_broadcast', ({ senderName }) => {
      setFloatingHeartTrigger({ id: Date.now(), senderName });
    });

    s.on('chat:reaction_broadcast', ({ emoji, senderName }) => {
      showToast((senderName || 'Partner') + ' reacted ' + emoji);
    });

    s.on('game:state_sync', (gameState) => {
      setRoom(prev => prev ? { ...prev, game: gameState } : prev);
    });

    s.on('game:truth_or_dare_update', (tod) => {
      setRoom(prev => prev ? { ...prev, game: { ...prev.game, truthOrDare: tod } } : prev);
    });

    s.on('game:quiz_update', (quiz) => {
      setRoom(prev => prev ? { ...prev, game: { ...prev.game, quiz } } : prev);
    });

    s.on('game:wyr_update', (wyr) => {
      setRoom(prev => prev ? { ...prev, game: { ...prev.game, wouldYouRather: wyr } } : prev);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  const triggerFloatingHearts = (senderName = 'You') => {
    setFloatingHeartTrigger({ id: Date.now(), senderName });
  };

  // Helper to create client-side room (Instant Demo or Fallback)
  const initializeClientRoom = ({ hostName, roomName, avatarEmoji = '🐱' }) => {
    const user = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: hostName || 'You',
      avatarColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      avatarEmoji: avatarEmoji || '💖',
      isHost: true
    };
    const partner = {
      id: 'partner-demo',
      name: 'Sweetheart 💖',
      avatarColor: 'linear-gradient(135deg, #f43f5e, #ec4899)',
      avatarEmoji: '🦊',
      isHost: false
    };

    const newRoom = {
      code: 'LOVE-' + Math.floor(1000 + Math.random() * 9000),
      name: roomName || 'Cozy Date Night',
      hostId: user.id,
      members: [user, partner],
      messages: [
        {
          id: 'welcome-1',
          text: 'Welcome to your private CoupleSync sanctuary! 💖',
          system: true
        },
        {
          id: 'welcome-2',
          senderId: partner.id,
          senderName: partner.name,
          text: 'Hey sweetheart! I am so glad we are hanging out together tonight! 🥰',
          timestamp: Date.now() - 30000
        }
      ],
      music: {
        isPlaying: true,
        currentTrackIndex: 0,
        positionMs: 0,
        lastUpdated: Date.now(),
        playlist: DEFAULT_PLAYLIST
      },
      game: {
        activeGame: null,
        truthOrDare: null,
        quiz: {
          currentQuestionIndex: 0,
          answers: {}
        },
        wouldYouRather: {
          currentDilemmaIndex: 0,
          votes: {}
        }
      }
    };

    setRoom(newRoom);
    setCurrentUser(user);
    setIsDemoMode(true);
    localStorage.setItem('couplesync_user', JSON.stringify(user));
    showToast('Room ' + newRoom.code + ' ready! Enjoy your date 💖');
    return newRoom;
  };

  const createRoom = ({ hostName, roomName, passcode, avatarEmoji = '🐱' }) => {
    return new Promise((resolve) => {
      if (socket && connected) {
        let didRespond = false;
        const timer = setTimeout(() => {
          if (!didRespond) {
            console.log('[RoomContext] Socket timeout, falling back to local room');
            const fallbackRoom = initializeClientRoom({ hostName, roomName, avatarEmoji });
            resolve({ success: true, room: fallbackRoom });
          }
        }, 3500);

        socket.emit('room:create', { hostName, roomName, passcode }, (res) => {
          didRespond = true;
          clearTimeout(timer);
          if (res && res.success) {
            setRoom(res.room);
            const userWithAvatar = { ...res.user, avatarEmoji };
            setCurrentUser(userWithAvatar);
            localStorage.setItem('couplesync_user', JSON.stringify(userWithAvatar));
            showToast('Room ' + res.room.code + ' created! Invite your partner 💌');
            setIsDemoMode(false);
            resolve(res);
          } else {
            const fallbackRoom = initializeClientRoom({ hostName, roomName, avatarEmoji });
            resolve({ success: true, room: fallbackRoom });
          }
        });
      } else {
        // Instant local room setup
        const fallbackRoom = initializeClientRoom({ hostName, roomName, avatarEmoji });
        resolve({ success: true, room: fallbackRoom });
      }
    });
  };

  const joinRoom = ({ code, userName, passcode, avatarEmoji = '🦊' }) => {
    return new Promise((resolve, reject) => {
      if (socket && connected) {
        let didRespond = false;
        const timer = setTimeout(() => {
          if (!didRespond) {
            const fallbackRoom = initializeClientRoom({ hostName: userName, roomName: 'Room ' + code, avatarEmoji });
            resolve({ success: true, room: fallbackRoom });
          }
        }, 3500);

        socket.emit('room:join', { code, userName, passcode }, (res) => {
          didRespond = true;
          clearTimeout(timer);
          if (res && res.success) {
            setRoom(res.room);
            const userWithAvatar = { ...res.user, avatarEmoji };
            setCurrentUser(userWithAvatar);
            localStorage.setItem('couplesync_user', JSON.stringify(userWithAvatar));
            showToast('Joined room ' + code + ' successfully! 🎉');
            setIsDemoMode(false);
            resolve(res);
          } else {
            const fallbackRoom = initializeClientRoom({ hostName: userName, roomName: 'Room ' + code, avatarEmoji });
            resolve({ success: true, room: fallbackRoom });
          }
        });
      } else {
        const fallbackRoom = initializeClientRoom({ hostName: userName, roomName: 'Room ' + code, avatarEmoji });
        resolve({ success: true, room: fallbackRoom });
      }
    });
  };

  const leaveRoom = () => {
    if (socket && connected && room && currentUser) {
      socket.emit('room:leave', { roomCode: room.code, userId: currentUser.id });
    }
    setRoom(null);
    setIsDemoMode(false);
  };

  const setMusicPlayback = ({ isPlaying, positionMs, currentTrackIndex }) => {
    if (socket && connected && room) {
      socket.emit('music:state_change', {
        roomCode: room.code,
        isPlaying,
        positionMs,
        currentTrackIndex
      });
    }
    setRoom(prev => prev ? {
      ...prev,
      music: {
        ...prev.music,
        isPlaying,
        positionMs,
        currentTrackIndex,
        lastUpdated: Date.now()
      }
    } : prev);
  };

  const changeTrack = (trackIndex) => {
    if (socket && connected && room) {
      socket.emit('music:track_change', {
        roomCode: room.code,
        trackIndex
      });
    }
    setRoom(prev => prev ? {
      ...prev,
      music: {
        ...prev.music,
        currentTrackIndex: trackIndex,
        positionMs: 0,
        lastUpdated: Date.now()
      }
    } : prev);
  };

  const sendMessage = (text) => {
    if (!room || !currentUser || !text.trim()) return;
    const msgObj = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatarColor: currentUser.avatarColor,
      text: text.trim(),
      timestamp: Date.now()
    };

    if (socket && connected) {
      socket.emit('chat:send_message', {
        roomCode: room.code,
        ...msgObj
      });
    }

    setRoom(prev => prev ? {
      ...prev,
      messages: [...prev.messages, msgObj]
    } : prev);

    // If in demo mode, partner sends a sweet reply after 1.4s!
    if (isDemoMode) {
      setTimeout(() => {
        const partnerReplies = [
          'Aww you are the sweetest! 💖',
          'I love this song so much! 🎶',
          'Can not wait for our next date in person! 🥰',
          'Sending you a million kisses right now! 💋',
          'You always know how to make me smile! ✨'
        ];
        const replyText = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
        const partnerMsg = {
          id: 'partner-msg-' + Date.now(),
          senderId: 'partner-demo',
          senderName: 'Sweetheart 💖',
          text: replyText,
          timestamp: Date.now()
        };
        setRoom(p => p ? { ...p, messages: [...p.messages, partnerMsg] } : p);
      }, 1400);
    }
  };

  const sendReaction = (emoji) => {
    if (!room || !currentUser) return;
    if (socket && connected) {
      socket.emit('chat:quick_reaction', {
        roomCode: room.code,
        emoji,
        senderName: currentUser.name
      });
    }
    showToast('You reacted ' + emoji);
    triggerFloatingHearts(currentUser.name);
  };

  const sendFloatingHeart = () => {
    if (!room || !currentUser) return;
    if (socket && connected) {
      socket.emit('chat:floating_heart', {
        roomCode: room.code,
        senderName: currentUser.name
      });
    }
    triggerFloatingHearts(currentUser.name);
  };

  const setActiveGame = (gameType) => {
    if (socket && connected && room) {
      socket.emit('game:set_active', {
        roomCode: room.code,
        gameType
      });
    }
    setRoom(prev => prev ? {
      ...prev,
      game: {
        ...(prev.game || {}),
        activeGame: gameType
      }
    } : prev);
  };

  const spinTruthOrDare = (category, type) => {
    if (socket && connected && room) {
      socket.emit('game:truth_or_dare_spin', {
        roomCode: room.code,
        category,
        type
      });
    }
  };

  const submitQuizAnswer = (questionIndex, selectedIndex) => {
    if (socket && connected && room && currentUser) {
      socket.emit('game:quiz_answer', {
        roomCode: room.code,
        userId: currentUser.id,
        questionIndex,
        selectedIndex
      });
    }
  };

  const nextQuizQuestion = () => {
    if (socket && connected && room) {
      socket.emit('game:quiz_next', { roomCode: room.code });
    }
  };

  const voteWouldYouRather = (choice) => {
    if (socket && connected && room && currentUser) {
      socket.emit('game:wyr_vote', {
        roomCode: room.code,
        userId: currentUser.id,
        choice
      });
    }
  };

  const nextWouldYouRather = () => {
    if (socket && connected && room) {
      socket.emit('game:wyr_next', { roomCode: room.code });
    }
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        currentUser,
        socket,
        activeTab,
        setActiveTab,
        connected,
        isDemoMode,
        createRoom,
        joinRoom,
        leaveRoom,
        initializeClientRoom,
        setMusicPlayback,
        changeTrack,
        sendMessage,
        sendReaction,
        sendFloatingHeart,
        triggerFloatingHearts,
        setActiveGame,
        spinTruthOrDare,
        submitQuizAnswer,
        nextQuizQuestion,
        voteWouldYouRather,
        nextWouldYouRather,
        floatingHeartTrigger,
        toastMessage,
        showToast
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
