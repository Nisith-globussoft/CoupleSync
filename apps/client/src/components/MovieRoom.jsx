import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import {
  playClickSound,
  playHeartSound,
  playSuccessFanfare
} from '../utils/soundEffects';
import {
  Tv,
  MonitorPlay,
  FileVideo,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Lightbulb,
  LightbulbOff,
  Heart,
  Send,
  Sparkles,
  MessageCircle,
  AlertCircle,
  Volume2
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
    sendMessage,
    showToast,
    triggerFloatingHearts
  } = useRoom();

  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const micStreamRef = useRef(null);
  const iceQueueRef = useRef([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLocalStreamer, setIsLocalStreamer] = useState(false);
  const [activeStream, setActiveStream] = useState(null);
  const [movieTitle, setMovieTitle] = useState('Our Romantic Movie Night');
  const [streamerName, setStreamerName] = useState(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsUserUnmute, setNeedsUserUnmute] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Attach media stream to video element whenever activeStream or videoRef changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStream) return;

    console.log('[MovieRoom] Attaching activeStream to video element. isLocalStreamer:', isLocalStreamer);
    video.srcObject = activeStream;

    if (isLocalStreamer) {
      video.muted = true; // Avoid audio feedback echo on the host machine
      video.play().catch(e => console.warn('Host play preview err:', e));
    } else {
      video.muted = false; // Receiver MUST hear movie sound!
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[MovieRoom] Autoplay prevented by browser:', err);
          // Show big clickable prompt to start video with sound
          setNeedsUserUnmute(true);
        });
      }
    }
  }, [activeStream, isLocalStreamer]);

  // Request active stream on mount if joining an in-progress session
  useEffect(() => {
    if (socket && room?.code) {
      console.log('[MovieRoom] Asking if anyone is streaming in room', room.code);
      socket.emit('movie:request_active_stream', { roomCode: room.code });
    }
  }, [socket, room?.code]);

  // WebRTC & Stream Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleSignal = async ({ signal, type, senderName }) => {
      console.log(`[WebRTC] Received signal type: '${type}' from '${senderName}'`);
      try {
        let pc = peerConnectionRef.current;

        if (type === 'offer') {
          console.log('[WebRTC] Processing incoming offer from', senderName);
          setIsStreaming(true);
          setIsLocalStreamer(false);
          setStreamerName(senderName || 'Partner');

          if (!pc) {
            pc = createPeerConnection();
          }

          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          // Flush queued candidates
          while (iceQueueRef.current.length > 0) {
            const cand = iceQueueRef.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.warn('ICE add err:', e));
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('webrtc:signal', {
            roomCode: room?.code,
            signal: answer,
            type: 'answer',
            senderName: currentUser?.name
          });

          showToast((senderName || 'Partner') + ' started streaming their movie! 🎬🍿');
        } else if (type === 'answer') {
          console.log('[WebRTC] Processing incoming answer');
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            while (iceQueueRef.current.length > 0) {
              const cand = iceQueueRef.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e => console.warn('ICE add err:', e));
            }
          }
        } else if (type === 'candidate' && signal) {
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal)).catch(e => console.warn('Add candidate err:', e));
          } else {
            iceQueueRef.current.push(signal);
          }
        }
      } catch (err) {
        console.error('[WebRTC] Signal handling error:', err);
      }
    };

    const handleStreamStarted = ({ streamType, title, streamerName }) => {
      console.log('[MovieRoom] Stream started notice from', streamerName);
      setIsStreaming(true);
      setIsLocalStreamer(false);
      setMovieTitle(title || 'Shared Movie Stream');
      setStreamerName(streamerName || 'Partner');
      showToast((streamerName || 'Partner') + ' is sharing movie: ' + (title || 'Screen') + ' 🎥');
    };

    const handleStreamStopped = () => {
      console.log('[MovieRoom] Remote stream stopped');
      cleanUpStreams();
      showToast('Movie stream ended by partner.');
    };

    // If another peer requests the active stream and I am currently streaming, send them a fresh offer!
    const handleRequestActiveStream = async () => {
      if (localStreamRef.current && peerConnectionRef.current) {
        console.log('[MovieRoom] Responding to partner stream request with new offer');
        try {
          const pc = peerConnectionRef.current;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('movie:stream_started', {
            roomCode: room?.code,
            streamType: 'screen',
            title: movieTitle,
            streamerName: currentUser?.name
          });

          socket.emit('webrtc:signal', {
            roomCode: room?.code,
            signal: offer,
            type: 'offer',
            senderName: currentUser?.name
          });
        } catch (e) {
          console.warn('[MovieRoom] Error re-offering stream:', e);
        }
      }
    };

    socket.on('webrtc:signal', handleSignal);
    socket.on('movie:stream_started', handleStreamStarted);
    socket.on('movie:stream_stopped', handleStreamStopped);
    socket.on('movie:request_active_stream', handleRequestActiveStream);

    return () => {
      socket.off('webrtc:signal', handleSignal);
      socket.off('movie:stream_started', handleStreamStarted);
      socket.off('movie:stream_stopped', handleStreamStopped);
      socket.off('movie:request_active_stream', handleRequestActiveStream);
    };
  }, [socket, room?.code, currentUser?.name, movieTitle]);

  const createPeerConnection = () => {
    console.log('[WebRTC] Creating new RTCPeerConnection');
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
      console.log('[WebRTC] Received remote track:', event.track.kind, event.streams);
      if (event.streams && event.streams[0]) {
        setActiveStream(event.streams[0]);
        setIsStreaming(true);
        setIsLocalStreamer(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // 1. Google Meet style screen & audio share
  const handleStartScreenShare = async () => {
    playClickSound();
    try {
      console.log('[MovieRoom] Prompting getDisplayMedia...');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      });

      console.log('[MovieRoom] Screen stream captured! Audio tracks:', stream.getAudioTracks().length);
      localStreamRef.current = stream;
      setActiveStream(stream);
      setIsStreaming(true);
      setIsLocalStreamer(true);
      setStreamerName(currentUser?.name || 'You');

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle user clicking native browser "Stop sharing" bar
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

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc:signal', {
          roomCode: room.code,
          signal: offer,
          type: 'offer',
          senderName: currentUser?.name
        });
      }

      showToast('Screen sharing started! Partner can now watch with full audio 🍿');
      playSuccessFanfare();
    } catch (err) {
      console.error('Error starting screen share:', err);
      showToast('Screen share cancelled or not allowed.');
    }
  };

  // 2. Select local movie file from PC
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
    setIsLocalStreamer(true);
    setStreamerName(currentUser?.name || 'You');

    showToast('Loaded "' + cleanName + '"! Click Share Screen if you want live audio broadcast to partner.');
  };

  const handleStopStream = () => {
    playClickSound();
    cleanUpStreams();
    if (socket && room?.code) {
      socket.emit('movie:stream_stopped', { roomCode: room.code });
    }
    showToast('Movie stream stopped.');
  };

  const cleanUpStreams = () => {
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
    setActiveStream(null);
    setIsStreaming(false);
    setIsLocalStreamer(false);
    setNeedsUserUnmute(false);
    setStreamerName(null);
  };

  // Unblock autoplay if browser restricted audio
  const handleUserUnmuteClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().then(() => {
        setNeedsUserUnmute(false);
        showToast('Movie audio playing! 🔊🍿');
      }).catch(err => console.warn(err));
    }
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

  // Movie Reactions
  const handleSendReaction = (emoji) => {
    playClickSound();
    if (emoji === '🍿') {
      confetti({ particleCount: 25, spread: 60, origin: { y: 0.6 } });
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

    sendMessage(emoji + ' *reacted to the movie*');
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
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  ● Live Streaming: {movieTitle} {streamerName ? '(' + streamerName + ')' : ''}
                </span>
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
          autoPlay
          style={{
            width: '100%',
            maxHeight: isFullscreen ? '100vh' : '480px',
            objectFit: 'contain',
            background: '#000000',
            display: isStreaming ? 'block' : 'none'
          }}
        />

        {/* Autoplay Unblocker Prompt Overlay (if browser restricted unmuted autoplay) */}
        {needsUserUnmute && (
          <div
            onClick={handleUserUnmuteClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 110,
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
              animation: 'pulseGlow 1.4s infinite'
            }}>
              <Volume2 size={32} color="#ffffff" />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              Movie is Streaming! 🍿
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#fcd34d', maxWidth: '360px', marginBottom: '16px' }}>
              Click anywhere on this screen to start playback with full audio!
            </p>
            <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '999px' }}>
              ▶️ Play Movie with Sound
            </button>
          </div>
        )}

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
            zIndex: 105
          }}>
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
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

            {isLocalStreamer && (
              <button
                onClick={handleStopStream}
                style={{
                  background: 'rgba(244, 63, 94, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(244, 63, 94, 0.4)'
                }}
              >
                Stop Sharing
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Movie Reaction Bar */}
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
