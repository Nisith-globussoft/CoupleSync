import React, { createContext, useContext, useState, useEffect } from 'react';
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
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('couplesync_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name && u.name !== 'You' && u.name !== 'Player 1') return u;
      } catch (e) {}
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState('movies');
  const [activeGame, setActiveGame] = useState(null);
  const [connected, setConnected] = useState(false);
  const [floatingHeartTrigger, setFloatingHeartTrigger] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Default to real Render backend URL when not on localhost
  const getBackendUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000';
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('server');
    if (fromQuery) {
      localStorage.setItem('couplesync_server_url', fromQuery.trim());
      return fromQuery.trim();
    }
    const fromStorage = localStorage.getItem('couplesync_server_url');
    if (fromStorage && fromStorage.trim()) {
      return fromStorage.trim();
    }
    if (import.meta.env.VITE_SERVER_URL) {
      return import.meta.env.VITE_SERVER_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://couplesync-api.onrender.com';
  };

  const [backendUrl, setBackendUrlState] = useState(getBackendUrl());
  const socketUrl = backendUrl;

  const updateBackendUrl = (newUrl) => {
    if (!newUrl) return;
    const cleaned = newUrl.trim().replace(/\/$/, '');
    localStorage.setItem('couplesync_server_url', cleaned);
    setBackendUrlState(cleaned);
    window.location.reload();
  };

  useEffect(() => {
    console.log('[RoomContext] Connecting to backend server:', socketUrl);
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to real backend:', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected from backend');
      setConnected(false);
    });

    s.on('room:sync_state', (updatedRoom) => {
      if (!updatedRoom) return;
      const seen = new Set();
      const dedupedMessages = [];
      for (const m of (updatedRoom.messages || [])) {
        const key = m.id || (m.senderId + '_' + m.text + '_' + Math.floor((m.timestamp || 0) / 2500));
        if (!seen.has(key)) {
          seen.add(key);
          dedupedMessages.push(m);
        }
      }
      setRoom({ ...updatedRoom, messages: dedupedMessages });
    });

    s.on('room:member_joined', ({ user, members, messages }) => {
      showToast((user.name || 'Your partner') + ' joined the room! ❤️');
      setRoom(prev => prev ? { ...prev, members, messages } : prev);
    });

    s.on('music:sync_state', (musicState) => {
      setRoom(prev => prev ? { ...prev, music: musicState } : prev);
    });

    s.on('chat:new_message', (message) => {
      setRoom(prev => {
        if (!prev) return prev;
        const isDuplicate = prev.messages.some(
          m => m.id === message.id || (m.senderId === message.senderId && m.text === message.text && Math.abs((m.timestamp || 0) - (message.timestamp || 0)) < 3000)
        );
        if (isDuplicate) return prev;
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

    // Initial and periodic Keep-Alive heartbeat to server /health endpoint every 4 minutes
    const pingServerHealth = () => {
      try {
        const healthUrl = socketUrl.replace(/\/$/, '') + '/health';
        fetch(healthUrl, { method: 'GET' })
          .then(res => res.json())
          .then(data => console.log('[Keep-Alive] Server health:', data.status))
          .catch(() => {});
      } catch (e) {}
    };

    pingServerHealth();
    const keepAliveInterval = setInterval(pingServerHealth, 4 * 60 * 1000);

    return () => {
      clearInterval(keepAliveInterval);
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

  // Real Room Creation over WebSockets (Zero bots!)
  const createRoom = ({ hostName, roomName, passcode, avatarEmoji = '🐱' }) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        return reject(new Error('Connecting to server... Please wait a few seconds and try again.'));
      }

      const sendCreate = () => {
        socket.emit('room:create', { hostName, roomName, passcode, avatarEmoji }, (res) => {
          if (res && res.success) {
            setRoom(res.room);
            const userWithAvatar = { ...res.user, avatarEmoji };
            setCurrentUser(userWithAvatar);
            localStorage.setItem('couplesync_user', JSON.stringify(userWithAvatar));
            showToast('Room ' + res.room.code + ' created! Share code with your partner 💌');
            resolve(res);
          } else {
            reject(new Error(res?.error || 'Failed to create room. Please try again.'));
          }
        });
      };

      if (socket.connected) {
        sendCreate();
      } else {
        // Wait up to 10 seconds for socket connection (handles Render waking up)
        showToast('Connecting to real-time server... ⏳');
        const timeout = setTimeout(() => {
          reject(new Error('Server is currently waking up. Please click Create again in 10 seconds!'));
        }, 12000);

        socket.once('connect', () => {
          clearTimeout(timeout);
          sendCreate();
        });
      }
    });
  };

  // Real Room Joining over WebSockets (Zero bots!)
  const joinRoom = ({ code, userName, passcode, avatarEmoji = '🦊' }) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        return reject(new Error('Connecting to server... Please wait a few seconds and try again.'));
      }

      const sendJoin = () => {
        socket.emit('room:join', { code, userName, passcode, avatarEmoji }, (res) => {
          if (res && res.success) {
            setRoom(res.room);
            const userWithAvatar = { ...res.user, avatarEmoji };
            setCurrentUser(userWithAvatar);
            localStorage.setItem('couplesync_user', JSON.stringify(userWithAvatar));
            showToast('Joined room ' + code + ' successfully! 🎉');
            resolve(res);
          } else {
            reject(new Error(res?.error || 'Room not found. Please check your code.'));
          }
        });
      };

      if (socket.connected) {
        sendJoin();
      } else {
        showToast('Connecting to real-time server... ⏳');
        const timeout = setTimeout(() => {
          reject(new Error('Server is currently waking up. Please click Join again in 10 seconds!'));
        }, 12000);

        socket.once('connect', () => {
          clearTimeout(timeout);
          sendJoin();
        });
      }
    });
  };

  const leaveRoom = () => {
    if (socket && room && currentUser) {
      socket.emit('room:leave', { roomCode: room.code, userId: currentUser.id });
    }
    setRoom(null);
  };

  const setMusicPlayback = ({ isPlaying, positionMs, currentTrackIndex }) => {
    if (!socket || !room) return;
    socket.emit('music:state_change', {
      roomCode: room.code,
      isPlaying,
      positionMs,
      currentTrackIndex
    });
  };

  const changeTrack = (trackIndex) => {
    if (!socket || !room) return;
    socket.emit('music:track_change', {
      roomCode: room.code,
      trackIndex
    });
  };

  const sendMessage = (text) => {
    if (!socket || !room || !currentUser || !text.trim()) return;

    const msgObj = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      text: text.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatarColor: currentUser.avatarColor,
      avatarEmoji: currentUser.avatarEmoji,
      timestamp: Date.now()
    };

    // Add locally for instant response
    setRoom(prev => prev ? {
      ...prev,
      messages: [...prev.messages, msgObj]
    } : prev);

    socket.emit('chat:send_message', {
      roomCode: room.code,
      ...msgObj
    });
  };

  const sendReaction = (emoji) => {
    if (!socket || !room || !currentUser) return;
    socket.emit('chat:quick_reaction', {
      roomCode: room.code,
      emoji,
      senderName: currentUser.name
    });
  };

  const sendFloatingHeart = () => {
    if (!socket || !room || !currentUser) return;
    socket.emit('chat:floating_heart', {
      roomCode: room.code,
      senderName: currentUser.name
    });
    setFloatingHeartTrigger({ id: Date.now(), senderName: currentUser.name });
  };

  const spinTruthOrDare = (category, type) => {
    if (!socket || !room) return;
    socket.emit('game:truth_or_dare_spin', {
      roomCode: room.code,
      category,
      type
    });
  };

  const submitQuizAnswer = (questionIndex, selectedIndex) => {
    if (!socket || !room || !currentUser) return;
    socket.emit('game:quiz_answer', {
      roomCode: room.code,
      userId: currentUser.id,
      questionIndex,
      selectedIndex
    });
  };

  const nextQuizQuestion = () => {
    if (!socket || !room) return;
    socket.emit('game:quiz_next', { roomCode: room.code });
  };

  const voteWouldYouRather = (choice) => {
    if (!socket || !room || !currentUser) return;
    socket.emit('game:wyr_vote', {
      roomCode: room.code,
      userId: currentUser.id,
      choice
    });
  };

  const nextWouldYouRather = () => {
    if (!socket || !room) return;
    socket.emit('game:wyr_next', { roomCode: room.code });
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        currentUser,
        activeTab,
        setActiveTab,
        activeGame,
        setActiveGame,
        connected,
        socket,
        createRoom,
        joinRoom,
        leaveRoom,
        setMusicPlayback,
        changeTrack,
        sendMessage,
        sendReaction,
        sendFloatingHeart,
        spinTruthOrDare,
        submitQuizAnswer,
        nextQuizQuestion,
        voteWouldYouRather,
        nextWouldYouRather,
        floatingHeartTrigger,
        triggerFloatingHearts,
        toastMessage,
        showToast,
        backendUrl,
        updateBackendUrl
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
