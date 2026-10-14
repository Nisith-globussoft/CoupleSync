import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within a RoomProvider');
  return context;
};

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

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SERVER_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
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
      showToast(user.name + ' joined the room! ❤️');
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
      showToast(senderName + ' reacted ' + emoji);
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const createRoom = ({ hostName, roomName, passcode }) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not ready'));
      socket.emit('room:create', { hostName, roomName, passcode }, (res) => {
        if (res.success) {
          setRoom(res.room);
          setCurrentUser(res.user);
          localStorage.setItem('couplesync_user', JSON.stringify(res.user));
          showToast('Room ' + res.room.code + ' created! Invite your partner.');
          resolve(res);
        } else {
          reject(new Error(res.error || 'Failed to create room'));
        }
      });
    });
  };

  const joinRoom = ({ code, userName, passcode }) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not ready'));
      socket.emit('room:join', { code, userName, passcode }, (res) => {
        if (res.success) {
          setRoom(res.room);
          setCurrentUser(res.user);
          localStorage.setItem('couplesync_user', JSON.stringify(res.user));
          showToast('Joined ' + res.room.name + '!');
          resolve(res);
        } else {
          reject(new Error(res.error || 'Failed to join room'));
        }
      });
    });
  };

  const leaveRoom = () => {
    if (socket && room && currentUser) {
      socket.emit('room:leave', { code: room.code, userId: currentUser.id });
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
    socket.emit('chat:send_message', {
      roomCode: room.code,
      text,
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatarColor: currentUser.avatarColor
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

  const setActiveGame = (gameType) => {
    if (!socket || !room) return;
    socket.emit('game:set_active', {
      roomCode: room.code,
      gameType
    });
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
        connected,
        createRoom,
        joinRoom,
        leaveRoom,
        setMusicPlayback,
        changeTrack,
        sendMessage,
        sendReaction,
        sendFloatingHeart,
        setActiveGame,
        spinTruthOrDare,
        submitQuizAnswer,
        nextQuizQuestion,
        voteWouldYouRather,
        nextWouldYouRather,
        floatingHeartTrigger,
        toastMessage
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
