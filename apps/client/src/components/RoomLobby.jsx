import React, { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound, playHeartSound, playSuccessFanfare } from '../utils/soundEffects';
import {
  Heart,
  Plus,
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
  { id: 'star', emoji: '✨', label: 'Starlight' }
];

const VIBES = [
  '🍷 Candlelight Date',
  '🌙 Late Night Talks',
  '🎧 Lo-Fi & Chill',
  '🎮 Gaming Night',
  '✈️ Long Distance Hangout'
];

export const RoomLobby = () => {
  const { createRoom, joinRoom, currentUser, initializeClientRoom, connected } = useRoom();

  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatarEmoji || '🐱');
  const [selectedVibe, setSelectedVibe] = useState('🍷 Candlelight Date');
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
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setErrorMessage(err.message || 'Error creating room');
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
      setErrorMessage('Please enter the 6-character room code');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    playClickSound();
    try {
      await joinRoom({
        code: roomCode.trim(),
        userName: userName.trim(),
        passcode: passcode.trim(),
        avatarEmoji: selectedAvatar
      });
      playHeartSound();
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setErrorMessage(err.message || 'Error joining room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    playSuccessFanfare();
    confetti({ particleCount: 40, spread: 80, origin: { y: 0.5 } });
    initializeClientRoom({
      hostName: userName.trim() || 'Alex',
      roomName: 'Valentine Hangout (' + selectedVibe + ')',
      avatarEmoji: selectedAvatar
    });
  };

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '36px 16px 60px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '38px', position: 'relative' }}>
        {/* Glow status pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(236, 72, 153, 0.12)',
          border: '1px solid var(--border-pink)',
          marginBottom: '18px',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
        }}>
          <Sparkles size={14} color="#ec4899" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', letterSpacing: '0.04em' }}>
            VIRTUAL DATE & COUPLE SANCTUARY
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '999px',
            background: connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            color: connected ? '#10b981' : '#a855f7',
            fontWeight: 700
          }}>
            {connected ? '● LIVE SYNC' : '● COZY READY'}
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
          marginBottom: '16px'
        }}>
          Same vibes, <span className="gradient-text">different places.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '620px',
          margin: '0 auto 24px',
          lineHeight: 1.55
        }}>
          Listen to synchronized music, play intimate couple games, send virtual hugs, and feel connected across any distance.
        </p>

        {/* 1-Click Instant Demo Button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleQuickDemo}
            className="btn-primary"
            style={{
              padding: '12px 28px',
              fontSize: '0.98rem',
              borderRadius: '999px',
              boxShadow: '0 0 28px rgba(236, 72, 153, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <Zap size={18} fill="#fff" />
            <span>Try Instant Couple Date (1-Click Demo)</span>
          </button>
        </div>
      </div>

      {/* Main Form Panel */}
      <div style={{ maxWidth: '540px', margin: '0 auto 48px' }}>
        <div className="glass-panel" style={{
          padding: '28px 24px',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 12px 45px rgba(0, 0, 0, 0.55)'
        }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '4px',
            borderRadius: '999px',
            marginBottom: '24px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => {
                playClickSound();
                setMode('create');
              }}
              style={{
                flex: 1,
                background: mode === 'create' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'none',
                color: mode === 'create' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '999px',
                padding: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: mode === 'create' ? '0 4px 15px rgba(236, 72, 153, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={16} />
              <span>Create Private Room</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setMode('join');
              }}
              style={{
                flex: 1,
                background: mode === 'join' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'none',
                color: mode === 'join' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '999px',
                padding: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: mode === 'join' ? '0 4px 15px rgba(236, 72, 153, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={16} />
              <span>Join with Code</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'create' ? handleCreate : handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Avatar Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Pick Your Couple Avatar
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '6px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '6px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedAvatar(av.emoji);
                    }}
                    title={av.label}
                    style={{
                      background: selectedAvatar === av.emoji ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 0',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      transform: selectedAvatar === av.emoji ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: selectedAvatar === av.emoji ? '0 0 10px rgba(236, 72, 153, 0.5)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname Input */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Your Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Honey / Alex / Sweetie"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={24}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
              />
            </div>

            {mode === 'create' ? (
              <>
                {/* Room Vibe Picker */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Tonight's Date Vibe
                  </label>
                  <select
                    value={selectedVibe}
                    onChange={(e) => setSelectedVibe(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#16112c',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      cursor: 'pointer'
                    }}
                  >
                    {VIBES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Room Name */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
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
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '1.05rem',
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

      {/* Feature Showcase Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Music2 size={22} color="#ec4899" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            Synced Audio & Visuals
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Zero-drift music streaming, animated audio visualizer waves, and custom audio streaming support.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Gamepad2 size={22} color="#8b5cf6" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            4 Multiplayer Games
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Truth or Dare, Couple Connection Quiz, Would You Rather, and spicy Never Have I Ever!
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <MessageCircleHeart size={22} color="#06b6d4" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            Live Chat & Hugs
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Instant whispers, quick romantic reactions, virtual hugs, kisses, and floating heart storms.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Flame size={22} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            Couples Love Wall
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Days Together counter, synchronized heartbeat pulse, sticky love notes, and date roulette!
          </p>
        </div>
      </div>
    </div>
  );
};
