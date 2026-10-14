import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import {
  playClickSound,
  playHeartSound,
  playHugSound,
  playSuccessFanfare
} from '../utils/soundEffects';
import {
  Tv,
  MonitorPlay,
  FileVideo,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Lightbulb,
  LightbulbOff,
  Heart,
  Send,
  Sparkles,
  MessageCircle,
  Share2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

const MOVIE_REACTIONS = [
  { emoji: '🍿', label: 'Popcorn' },
  { emoji: '💖', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😱', label: 'Gasp' },
  { emoji: '😭', label: 'Crying' },
  { emoji: '🍷', label: 'Cheers' }
];

export const MovieRoom = () => {
  const {
    room,
    currentUser,
    socket,
    connected,
    sendMessage,
    showToast,
    triggerFloatingHearts
  } = useRoom();

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const micStreamRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamType, setStreamType] = useState(null); // 'screen' | 'file'
  const [movieTitle, setMovieTitle] = useState('Our Romantic Movie Night');
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [streamerName, setStreamerName] = useState(null);

  // Setup WebRTC signaling listeners
  useEffect(() => {
    if (!socket) return;

    const handleSignal = async ({ signal, type, senderId, senderName }) => {
      try {
        let pc = peerConnectionRef.current;
        if (!pc) {
          pc = createPeerConnection();
        }

        if (type === 'offer') {
          console.log('[WebRTC] Received offer from', senderName);
          setStreamerName(senderName);
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc:signal', {
            roomCode: room?.code,
            signal: answer,
            type: 'answer',
            senderName: currentUser?.name
          });
          showToast(senderName + ' started sharing their movie! 🎬🍿');
        } else if (type === 'answer') {
          console.log('[WebRTC] Received answer');
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (type === 'candidate' && signal) {
          await pc.addIceCandidate(new RTCIceCandidate(signal));
        }
      } catch (err) {
        console.error('[WebRTC] Error handling signal:', err);
      }
    };

    const handleStreamStarted = ({ streamType, title, streamerName }) => {
      setStreamType(streamType);
      setMovieTitle(title || 'Shared Movie Stream');
      setStreamerName(streamerName);
      showToast(streamerName + ' is sharing movie: ' + (title || 'Screen') + ' 🎥');
    };

    const handleStreamStopped = () => {
      stopLocalStream();
      setStreamerName(null);
      showToast('Movie stream ended by partner.');
    };

    socket.on('webrtc:signal', handleSignal);
    socket.on('movie:stream_started', handleStreamStarted);
    socket.on('movie:stream_stopped', handleStreamStopped);

    return () => {
      socket.off('webrtc:signal', handleSignal);
      socket.off('movie:stream_started', handleStreamStarted);
      socket.off('movie:stream_stopped', handleStreamStopped);
    };
  }, [socket, room?.code, currentUser?.name]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && room?.code) {
        socket.emit('webrtc:signal', {
          roomCode: room.code,
          signal: event.candidate,
          type: 'candidate',
          senderName: currentUser?.name
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream track:', event.track.kind);
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(e => console.warn('Autoplay error:', e));
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // 1. Google Meet style screen share (with system & movie audio)
  const handleStartScreenShare = async () => {
    playClickSound();
    try {
      // Prompt user to select screen/window/tab and share audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      });

      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // mute locally to avoid echo
        videoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);
      setStreamType('screen');
      setStreamerName(currentUser?.name || 'You');

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle user stopping share from browser UI toolbar
      stream.getVideoTracks()[0].onended = () => {
        handleStopStream();
      };

      if (socket && room?.code) {
        socket.emit('movie:stream_started', {
          roomCode: room.code,
          streamType: 'screen',
          title: movieTitle,
          streamerName: currentUser?.name
        });

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc:signal', {
          roomCode: room.code,
          signal: offer,
          type: 'offer',
          senderName: currentUser?.name
        });
      }

      showToast('Movie screen sharing started! Ensure "Share Audio" was checked 🍿');
      playSuccessFanfare();
    } catch (err) {
      console.error('Error starting screen share:', err);
      showToast('Screen share cancelled or not allowed.');
    }
  };

  // 2. Select downloaded movie file from PC
  const handleSelectMovieFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClickSound();
    const fileUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setMovieTitle(cleanName);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = fileUrl;
      videoRef.current.muted = false;
      videoRef.current.play().catch(e => console.warn(e));
    }

    setIsStreaming(true);
    setStreamType('file');
    setStreamerName(currentUser?.name || 'You');

    showToast('Loaded "' + cleanName + '"! You can also click Share Screen for live audio broadcast.');
  };

  const handleStopStream = () => {
    playClickSound();
    stopLocalStream();
    if (socket && room?.code) {
      socket.emit('movie:stream_stopped', { roomCode: room.code });
    }
    showToast('Movie stream stopped.');
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    setIsStreaming(false);
    setStreamType(null);
  };

  // Mic voice toggle
  const toggleMic = async () => {
    playClickSound();
    if (isMicOn) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      setIsMicOn(false);
      showToast('Microphone Muted 🎙️');
    } else {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = audioStream;
        setIsMicOn(true);
        showToast('Microphone Enabled — you can now talk with partner! 🗣️');
        playHeartSound();

        // If peer connection active, add mic track
        if (peerConnectionRef.current) {
          audioStream.getAudioTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, audioStream);
          });
        }
      } catch (err) {
        showToast('Could not access microphone.');
      }
    }
  };

  // Movie Reactions (Popcorn, Love, etc)
  const handleSendReaction = (emoji) => {
    playClickSound();
    if (emoji === '🍿') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else if (emoji === '💖') {
      triggerFloatingHearts();
    }

    const newId = Date.now() + Math.random();
    setFloatingReactions(prev => [
      ...prev,
      { id: newId, emoji, left: Math.floor(15 + Math.random() * 70) }
    ]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newId));
    }, 2500);

    // Send in chat
    sendMessage(emoji + ' *reacted while watching*');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  const toggleFullscreen = () => {
    playClickSound();
    const elem = document.getElementById('cinema-screen-container');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative'
    }}>
      {/* Dim Lights Backdrop Overlay */}
      {isDimmed && (
        <div
          onClick={() => setIsDimmed(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 90,
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease'
          }}
        />
      )}

      {/* Top Cinema Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative',
        zIndex: 95
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
          }}>
            <Tv size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Couple Cinema & Movie Stream
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isStreaming ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>● Live Streaming: {movieTitle}</span>
              ) : (
                'Watch downloaded movies together with synchronized audio & voice chat'
              )}
            </p>
          </div>
        </div>

        {/* Ambient Dimmer & Voice controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              playClickSound();
              setIsDimmed(prev => !prev);
            }}
            className="btn-secondary"
            title={isDimmed ? "Turn Lights On" : "Dim Theater Lights"}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '8px',
              color: isDimmed ? '#f59e0b' : 'var(--text-muted)'
            }}
          >
            {isDimmed ? <Lightbulb size={15} /> : <LightbulbOff size={15} />}
            <span>{isDimmed ? 'Lights On' : 'Dim Lights'}</span>
          </button>

          <button
            onClick={toggleMic}
            className="btn-secondary"
            title={isMicOn ? "Mute Microphone" : "Talk with Partner"}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '8px',
              color: isMicOn ? '#10b981' : 'var(--text-muted)',
              border: isMicOn ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)'
            }}
          >
            {isMicOn ? <Mic size={15} /> : <MicOff size={15} />}
            <span>{isMicOn ? 'Mic Live' : 'Talk (Mic)'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Cinema Container */}
      <div
        id="cinema-screen-container"
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#040308',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: isDimmed
            ? '0 0 60px rgba(245, 158, 11, 0.35), 0 0 100px rgba(236, 72, 153, 0.2)'
            : '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 95,
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* The Video Element */}
        <video
          ref={videoRef}
          controls
          playsInline
          style={{
            width: '100%',
            maxHeight: isFullscreen ? '100vh' : '480px',
            objectFit: 'contain',
            background: '#000000',
            display: isStreaming ? 'block' : 'none'
          }}
        />

        {/* Floating In-Video Reactions Layer */}
        {floatingReactions.map(r => (
          <span
            key={r.id}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: r.left + '%',
              fontSize: '2.5rem',
              pointerEvents: 'none',
              animation: 'floatUp 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              zIndex: 100,
              filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))'
            }}
          >
            {r.emoji}
          </span>
        ))}

        {/* Empty / Placeholder State when not streaming */}
        {!isStreaming && (
          <div style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '540px'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)'
            }}>
              <MonitorPlay size={36} color="#f59e0b" />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Movie Night Cinema Ready
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '24px' }}>
              Stream your downloaded movie directly to your partner with synchronized audio, or pick a movie file from your laptop.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Screen Share Button */}
              <button
                onClick={handleStartScreenShare}
                className="btn-primary"
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.45)'
                }}
              >
                <MonitorPlay size={18} fill="#fff" />
                <span>Share Movie Screen (With Audio)</span>
              </button>

              {/* Local File Picker */}
              <label
                className="btn-secondary"
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileVideo size={18} color="#f59e0b" />
                <span>Select Movie File (.mp4/.mkv)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/mkv,video/*"
                  onChange={handleSelectMovieFile}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Google Meet Style Tip */}
            <div style={{
              marginTop: '22px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              textAlign: 'left',
              display: 'flex',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff' }}>Google Meet Style Tip:</strong> When sharing your movie window or tab, remember to tick <span style={{ color: '#f59e0b' }}>"Also share tab / system audio"</span> so your partner can hear every beat and dialogue!
              </div>
            </div>
          </div>
        )}

        {/* Video Overlays (when playing) */}
        {isStreaming && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              onClick={handleStopStream}
              style={{
                background: 'rgba(244, 63, 94, 0.8)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Stop Sharing
            </button>
          </div>
        )}
      </div>

      {/* Floating Movie Reaction Bar (Popcorn, Love, LOL) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '999px',
        background: 'rgba(18, 14, 38, 0.9)',
        border: '1px solid var(--border-glow)',
        width: 'fit-content',
        margin: '0 auto',
        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        zIndex: 95
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginRight: '4px' }}>
          LIVE REACTIONS:
        </span>
        {MOVIE_REACTIONS.map(r => (
          <button
            key={r.emoji}
            onClick={() => handleSendReaction(r.emoji)}
            title={r.label}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.45rem',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            {r.emoji}
          </button>
        ))}
      </div>

      {/* Mini Movie Whisper Chat Box */}
      <div className="glass-card" style={{ padding: '16px', position: 'relative', zIndex: 95 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={16} color="#ec4899" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              Whisper Chat While Watching
            </h4>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Real-time couple whispers
          </span>
        </div>

        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a quick whisper about this movie scene..."
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0 14px', borderRadius: '8px' }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
