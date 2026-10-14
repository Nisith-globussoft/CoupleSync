import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import {
  playClickSound,
  playHeartSound,
  playMessagePop,
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
  Volume2,
  Radio,
  X
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
  { emoji: '😮', label: 'Gasp' },
  { emoji: '😭', label: 'Crying' },
  { emoji: '🎉', label: 'Cheers' }
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
  const remoteVoiceRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const micStreamRef = useRef(null);
  const iceQueueRef = useRef([]);
  const chatScrollRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLocalStreamer, setIsLocalStreamer] = useState(false);
  const [activeStream, setActiveStream] = useState(null);
  const [movieTitle, setMovieTitle] = useState('Our Romantic Movie Night');
  const [streamerName, setStreamerName] = useState(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState(false);
  const [partnerSpeakerName, setPartnerSpeakerName] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsUserUnmute, setNeedsUserUnmute] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [sidePopMessage, setSidePopMessage] = useState(null);

  // Deduplicate messages for rendering
  const rawMessages = room?.messages || [];
  const messages = [];
  const seenKeys = new Set();
  for (const m of rawMessages) {
    const key = m.id || (m.senderId + '_' + m.text + '_' + Math.floor((m.timestamp || 0) / 2500));
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      messages.push(m);
    }
  }

  // Auto-scroll chat messages
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Listen for incoming messages to trigger floating Side Pop Notification
  const lastMessageRef = useRef(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];

    if (!latest.system && latest.senderId !== currentUser?.id && latest.id !== lastMessageRef.current) {
      lastMessageRef.current = latest.id;
      playMessagePop();
      setSidePopMessage({
        id: latest.id,
        senderName: latest.senderName || 'Partner',
        text: latest.text
      });

      const timer = setTimeout(() => {
        setSidePopMessage(prev => (prev?.id === latest.id ? null : prev));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [messages, currentUser?.id]);

  // Attach media stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStream) return;

    console.log('[MovieRoom] Attaching activeStream to video element. isLocalStreamer:', isLocalStreamer);
    video.srcObject = activeStream;

    if (isLocalStreamer) {
      video.muted = true;
      video.play().catch(e => console.warn('Local preview play err:', e));
    } else {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[MovieRoom] Autoplay prevented by browser:', err);
          setNeedsUserUnmute(true);
        });
      }
    }
  }, [activeStream, isLocalStreamer]);

  // Request active stream on mount
  useEffect(() => {
    if (socket && room?.code) {
      console.log('[MovieRoom] Requesting active stream for room', room.code);
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
          if (!pc) {
            pc = createPeerConnection();
          }

          await pc.setRemoteDescription(new RTCSessionDescription(signal));

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
      showToast((streamerName || 'Partner') + ' started streaming: ' + (title || 'Movie') + ' 🎥');
    };

    const handleStreamStopped = () => {
      console.log('[MovieRoom] Remote stream stopped');
      cleanUpStreams();
      showToast('Movie stream ended by partner.');
    };

    const handleVoiceState = ({ isMicOn, speakerName }) => {
      setPartnerSpeaking(isMicOn);
      setPartnerSpeakerName(speakerName);
      if (isMicOn) {
        showToast((speakerName || 'Partner') + ' turned on Voice Mic! 🎙️🔊');
      }
    };

    const handleRequestActiveStream = async () => {
      if ((localStreamRef.current || micStreamRef.current) && peerConnectionRef.current) {
        console.log('[MovieRoom] Re-offering active stream/voice to partner');
        try {
          const pc = peerConnectionRef.current;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (isStreaming) {
            socket.emit('movie:stream_started', {
              roomCode: room?.code,
              streamType: 'movie',
              title: movieTitle,
              streamerName: currentUser?.name
            });
          }

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
    socket.on('movie:voice_state', handleVoiceState);
    socket.on('movie:request_active_stream', handleRequestActiveStream);

    return () => {
      socket.off('webrtc:signal', handleSignal);
      socket.off('movie:stream_started', handleStreamStarted);
      socket.off('movie:stream_stopped', handleStreamStopped);
      socket.off('movie:voice_state', handleVoiceState);
      socket.off('movie:request_active_stream', handleRequestActiveStream);
    };
  }, [socket, room?.code, currentUser?.name, movieTitle, isStreaming]);

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
      const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);

      if (event.track.kind === 'audio') {
        console.log('[WebRTC] Attaching partner voice audio track to audio player');
        if (remoteVoiceRef.current) {
          remoteVoiceRef.current.srcObject = stream;
          remoteVoiceRef.current.play().catch(e => console.warn('Audio play err:', e));
        }
        setPartnerSpeaking(true);
      }

      if (event.track.kind === 'video') {
        setActiveStream(stream);
        setIsStreaming(true);
        setIsLocalStreamer(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Toggle Mic (Voice Chat)
  const toggleMic = async () => {
    playClickSound();

    if (isMicOn) {
      // Mute local mic
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      setIsMicOn(false);
      showToast('Microphone Muted 🎙️');
      if (socket && room?.code) {
        socket.emit('movie:voice_state', {
          roomCode: room.code,
          isMicOn: false,
          speakerName: currentUser?.name
        });
      }
    } else {
      // Unmute & transmit mic voice
      try {
        console.log('[MovieRoom] Requesting microphone access...');
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        micStreamRef.current = audioStream;
        setIsMicOn(true);
        playHeartSound();
        showToast('Microphone LIVE — partner can hear you speaking! 🗣️🔊');

        // Ensure peer connection exists
        let pc = peerConnectionRef.current;
        if (!pc) {
          pc = createPeerConnection();
        }

        // Add mic audio track to peer connection
        audioStream.getAudioTracks().forEach(track => {
          pc.addTrack(track, audioStream);
        });

        // Trigger renegotiation offer so partner receives voice track
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (socket && room?.code) {
          socket.emit('webrtc:signal', {
            roomCode: room.code,
            signal: offer,
            type: 'offer',
            senderName: currentUser?.name
          });

          socket.emit('movie:voice_state', {
            roomCode: room.code,
            isMicOn: true,
            speakerName: currentUser?.name
          });
        }
      } catch (err) {
        console.error('Microphone access denied:', err);
        showToast('Microphone access denied or not available.');
      }
    }
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

      localStreamRef.current = stream;
      setActiveStream(stream);
      setIsStreaming(true);
      setIsLocalStreamer(true);
      setStreamerName(currentUser?.name || 'You');

      const pc = peerConnectionRef.current || createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Also include mic track if mic is on
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(t => pc.addTrack(t, micStreamRef.current));
      }

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

  // 2. Select local movie file & stream directly via WebRTC captureStream
  const handleSelectMovieFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClickSound();
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setMovieTitle(cleanName);
    const fileUrl = URL.createObjectURL(file);

    const video = videoRef.current;
    if (!video) return;

    video.srcObject = null;
    video.src = fileUrl;
    video.muted = false;

    video.onloadeddata = async () => {
      try {
        await video.play();

        let capturedStream = null;
        if (typeof video.captureStream === 'function') {
          capturedStream = video.captureStream(30);
        } else if (typeof video.mozCaptureStream === 'function') {
          capturedStream = video.mozCaptureStream(30);
        }

        if (capturedStream) {
          console.log('[MovieRoom] Successfully captured stream from MP4 file!', capturedStream.getTracks());
          localStreamRef.current = capturedStream;
          setIsStreaming(true);
          setIsLocalStreamer(true);
          setStreamerName(currentUser?.name || 'You');

          const pc = peerConnectionRef.current || createPeerConnection();
          capturedStream.getTracks().forEach(track => pc.addTrack(track, capturedStream));

          if (micStreamRef.current) {
            micStreamRef.current.getAudioTracks().forEach(t => pc.addTrack(t, micStreamRef.current));
          }

          if (socket && room?.code) {
            socket.emit('movie:stream_started', {
              roomCode: room.code,
              streamType: 'file',
              title: cleanName,
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

          showToast('Streaming "' + cleanName + '" to your partner via WebRTC! 🎬🍿');
          playSuccessFanfare();
        } else {
          showToast('Playing locally. Click "Share Screen & Audio" if your browser restricts captureStream.');
        }
      } catch (err) {
        console.error('Error playing or streaming file:', err);
      }
    };
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

  const handleUserUnmuteClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().then(() => {
        setNeedsUserUnmute(false);
        showToast('Movie audio playing! 🔊🍿');
      }).catch(err => console.warn(err));
    }
  };

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

    sendMessage(emoji + ' *reacted to movie*');
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
      {/* Hidden dedicated audio element for partner's live voice mic */}
      <audio ref={remoteVoiceRef} autoPlay playsInline style={{ display: 'none' }} />

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.15rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Couple Cinema & Movie Stream
              </h3>
              {partnerSpeaking && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontSize: '0.72rem',
                  color: '#10b981',
                  fontWeight: 700
                }}>
                  <Radio size={12} style={{ animation: 'pulseGlow 1s infinite' }} />
                  <span>{partnerSpeakerName || 'Partner'} Speaking 🔊</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isStreaming ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  ● Live Streaming: {movieTitle} {streamerName ? '(' + streamerName + ')' : ''}
                </span>
              ) : (
                'Stream your movie or screen directly to your partner with full audio & voice talk'
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

          {/* Voice Mic Button */}
          <button
            onClick={toggleMic}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isMicOn
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255, 255, 255, 0.08)',
              border: isMicOn ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              color: '#ffffff',
              boxShadow: isMicOn ? '0 0 16px rgba(16, 185, 129, 0.5)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isMicOn ? <Mic size={15} /> : <MicOff size={15} color="var(--text-muted)" />}
            <span>{isMicOn ? '🎙️ Mic Live (Speaking)' : 'Talk (Mic Off)'}</span>
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
          minHeight: '210px',
          aspectRatio: '16/9',
          maxHeight: '55vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Floating Side Pop Notification when partner whispers */}
        {sidePopMessage && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            maxWidth: '280px',
            background: 'rgba(236, 72, 153, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 8px 30px rgba(236, 72, 153, 0.5)',
            zIndex: 120,
            animation: 'float 0.3s ease-out',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Heart size={16} fill="#fff" color="#fff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fef08a', marginBottom: '2px' }}>
                {sidePopMessage.senderName} whispers:
              </p>
              <p style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.35 }}>
                {sidePopMessage.text}
              </p>
            </div>
            <button
              onClick={() => setSidePopMessage(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

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

        {/* Autoplay Unblocker Prompt */}
        {needsUserUnmute && (
          <div
            onClick={handleUserUnmuteClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.78)',
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
              Click anywhere to start video with sound!
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
              Select a downloaded movie file from your PC or share your screen & audio directly to watch together!
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <label
                className="btn-primary"
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 22px rgba(236, 72, 153, 0.5)'
                }}
              >
                <FileVideo size={18} fill="#fff" />
                <span>Select & Stream Movie (.mp4/.mkv)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/mkv,video/*"
                  onChange={handleSelectMovieFile}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                onClick={handleStartScreenShare}
                className="btn-secondary"
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 600
                }}
              >
                <MonitorPlay size={18} color="#f59e0b" />
                <span>Share Screen & Audio</span>
              </button>
            </div>

            {/* Tip */}
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
                <strong style={{ color: '#ffffff' }}>Live Voice Call:</strong> Click <span style={{ color: '#10b981' }}>"Talk (Mic)"</span> at the top to talk with your partner with crystal-clear audio anytime!
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
        width: '100%',
        maxWidth: '460px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
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

      {/* Live Whisper Chat Feed & Input Box */}
      <div className="glass-card" style={{ padding: '16px', position: 'relative', zIndex: 95 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={16} color="#ec4899" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Live Movie Whispers
            </h4>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
            ● Live Synchronized
          </span>
        </div>

        {/* Messages Feed Area */}
        <div style={{
          maxHeight: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '10px',
          marginBottom: '12px'
        }}>
          {messages.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
              No whispers yet. Send a reaction or whisper to your partner! 💖
            </p>
          ) : (
            messages.slice(-15).map(m => {
              const isMe = m.senderId === currentUser?.id;
              if (m.system) {
                return (
                  <div key={m.id} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--accent-pink)' }}>
                    {m.text}
                  </div>
                );
              }
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '0.70rem', color: isMe ? '#ec4899' : '#8b5cf6', fontWeight: 700, marginBottom: '2px' }}>
                    {m.senderName}
                  </span>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isMe ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    lineHeight: 1.35,
                    maxWidth: '85%',
                    wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatScrollRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Whisper something to your partner while watching..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.88rem'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0 16px', borderRadius: '10px' }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
