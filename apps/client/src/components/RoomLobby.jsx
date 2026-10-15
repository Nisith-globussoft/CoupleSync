import React, { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound, playHeartSound, playSuccessFanfare } from '../utils/soundEffects';
import {
  Heart,
  Plus,
  Tv,
  LogIn,
  Music2,
  Gamepad2,
  MessageCircleHeart,
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Globe2,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATARS = [
  { id: 'cat', emoji: '🐱', label: 'Cozy Cat' },
  { id: 'fox', emoji: '🦊', label: 'Playful Fox' },
  { id: 'bunny', emoji: '🐰', label: 'Sweet Bunny' },
  { id: 'panda', emoji: '🐼', label: 'Chill Panda' },
  { id: 'teddy', emoji: '🧸', label: 'Soft Teddy' },
  { id: 'rose', emoji: '🌹', label: 'Royal Rose' },
  { id: 'crown', emoji: '👑', label: 'King/Queen' },
  { id: 'star', emoji: '⭐', label: 'Starlight' }
];

const VIBES = [
  '🕯️ Candlelight Date',
  '🌙 Late Night Talks',
  '☕ Lo-Fi & Chill',
  '🎮 Gaming Night',
  '✈️ Long Distance Hangout'
];

export const RoomLobby = () => {
  const { createRoom, joinRoom, currentUser, connected } = useRoom();

  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarEmoji || '🐱');
  const [selectedVibe, setSelectedVibe] = useState('🕯️ Candlelight Date');
  const [roomName, setRoomName] = useState('Cozy Date Night');
  const [roomCode, setRoomCode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check URL query param for invite code e.g. ?room=LOVE-4821
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMessage('Please enter your nickname');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    playClickSound();
    try {
      await createRoom({
        hostName: userName.trim(),
        roomName: roomName.trim() + ' (' + selectedVibe + ')',
        passcode: passcode.trim(),
        avatarEmoji: selectedAvatar
      });
      playHeartSound();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Create room error:', err);
      setErrorMessage(err.message || 'Could not create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMessage('Please enter your nickname');
      return;
    }
    if (!roomCode.trim()) {
      setErrorMessage('Please enter the room code');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    playClickSound();
    try {
      await joinRoom({
        code: roomCode.trim().toUpperCase(),
        userName: userName.trim(),
        passcode: passcode.trim(),
        avatarEmoji: selectedAvatar
      });
      playHeartSound();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Join room error:', err);
      setErrorMessage(err.message || 'Room not found or incorrect code. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 16px 80px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* Hero Welcome Banner */}
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(236, 72, 153, 0.12)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          marginBottom: '14px',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.15)'
        }}>
          <Sparkles size={14} color="#ec4899" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ec4899', letterSpacing: '0.04em' }}>
            PRIVATE COUPLE SPACE & MOVIE THEATER
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5.5vw, 3.4rem)',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '12px',
          color: '#ffffff'
        }}>
          Distance means nothing, <br />
          <span className="gradient-text">when vibe is synchronized.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.92rem, 2.8vw, 1.15rem)',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          margin: '0 auto',
          lineHeight: 1.55
        }}>
          Stream downloaded movies together, watch screen shares with audio, listen to zero-drift music, and play multiplayer games in real-time.
        </p>
      </div>

      {/* Main Interactive Form Card */}
      <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: 'clamp(16px, 4vw, 28px)', width: '100%' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setMode('create');
              }}
              style={{
                flex: 1,
                background: mode === 'create' ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'none',
                color: mode === 'create' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={16} />
              <span>Create Room</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setMode('join');
              }}
              style={{
                flex: 1,
                background: mode === 'join' ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'none',
                color: mode === 'join' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={16} />
              <span>Join with Code</span>
            </button>
          </div>

          <form onSubmit={mode === 'create' ? handleCreate : handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Nickname Input */}
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Your Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Baby, Honey, Nisith..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={24}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Avatar Selector (Clean 4x2 Grid for Mobile) */}
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Choose Your Vibe Avatar
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {AVATARS.map((a) => {
                  const isSelected = selectedAvatar === a.emoji;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedAvatar(a.emoji);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        padding: '8px 4px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>{a.emoji}</span>
                      <span style={{ fontSize: '0.65rem', color: isSelected ? '#ffffff' : 'var(--text-dim)', fontWeight: 600 }}>
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === 'create' ? (
              <>
                {/* Mood / Vibe Selector */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Tonight's Vibe
                  </label>
                  <select
                    value={selectedVibe}
                    onChange={(e) => setSelectedVibe(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#15102a',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '16px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {VIBES.map((v) => (
                      <option key={v} value={v} style={{ background: '#15102a', color: '#fff' }}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Name */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Room Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Our Cozy Hangout"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    maxLength={32}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  6-Digit Room Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. LOVE-4821"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '18px',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#f43f5e',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 6px 20px rgba(236, 72, 153, 0.4)',
                marginTop: '6px'
              }}
            >
              {isLoading ? (
                <span>Connecting to room...</span>
              ) : mode === 'create' ? (
                <>
                  <Heart size={18} fill="#fff" />
                  <span>Create Private Room</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Join Partner's Room</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Feature Showcase Grid (Responsive minmax 220px) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Music2 size={20} color="#ec4899" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            Synced Audio & Visuals
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Zero-drift music streaming, animated audio visualizer waves, and custom audio streaming support.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Tv size={20} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            Movie Stream & Cinema
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Google Meet style screen share with movie audio, downloaded video file stream, and full-duplex voice talk!
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Gamepad2 size={20} color="#8b5cf6" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            4 Multiplayer Games
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Truth or Dare, Couple Connection Quiz, Would You Rather, and spicy Never Have I Ever!
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <MessageCircleHeart size={20} color="#06b6d4" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            Live Chat & Hugs
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Instant whispers, quick romantic reactions, virtual hugs, kisses, and floating heart storms.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Flame size={20} color="#f43f5e" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            Couples Love Wall
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Days Together counter, synchronized heartbeat pulse, sticky love notes, and date roulette!
          </p>
        </div>
      </div>
    </div>
  );
};
