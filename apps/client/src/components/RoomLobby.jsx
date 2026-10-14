import React, { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { Heart, Plus, LogIn, Music2, Gamepad2, MessageCircleHeart, Sparkles, ShieldCheck } from 'lucide-react';

export const RoomLobby = () => {
  const { createRoom, joinRoom, currentUser } = useRoom();

  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [roomName, setRoomName] = useState('Friday Double Date');
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
    try {
      await createRoom({ hostName: userName.trim(), roomName: roomName.trim(), passcode: passcode.trim() });
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
    try {
      await joinRoom({ code: roomCode.trim(), userName: userName.trim(), passcode: passcode.trim() });
    } catch (err) {
      setErrorMessage(err.message || 'Error joining room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '30px 16px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(236, 72, 153, 0.12)',
          border: '1px solid var(--border-pink)',
          marginBottom: '16px'
        }}>
          <Sparkles size={14} color="#ec4899" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-pink)', letterSpacing: '0.04em' }}>
            VIRTUAL HANGOUT & DATE PLATFORM
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '16px'
        }}>
          Same vibes, <span className="gradient-text">different places.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'var(--text-muted)',
          maxWidth: '580px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          A synchronized social room where couples and close friends listen to music together,
          play interactive games, and chat in real-time.
        </p>
      </div>

      {/* Main Action Box */}
      <div className="glass-panel" style={{
        maxWidth: '480px',
        margin: '0 auto 48px',
        padding: '28px',
        border: '1px solid var(--border-glow)'
      }}>
        {/* Toggle between Create & Join */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '999px',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setMode('create')}
            style={{
              flex: 1,
              background: mode === 'create' ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'none',
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
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('join')}
            style={{
              flex: 1,
              background: mode === 'join' ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'none',
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
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} />
            <span>Join with Code</span>
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#f43f5e',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {errorMessage}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Your Nickname
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex or Honey"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Friday Double Date"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Room Passcode (Optional)
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Leave blank for public room"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '6px', fontSize: '1rem' }}
            >
              {isLoading ? 'Creating Room...' : 'Create Private Room ✨'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Your Nickname
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Sam"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. LOVE-4821"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: 'var(--accent-pink)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Passcode (If required)
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode if set"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '6px', fontSize: '1rem' }}
            >
              {isLoading ? 'Connecting...' : 'Join Room ❤️'}
            </button>
          </form>
        )}
      </div>

      {/* Feature Preview Cards matching user blueprint */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {/* Feature 1 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid var(--border-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Music2 size={22} color="var(--accent-pink)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Listen Together
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Shared playback controls where play, pause, seek, and track skips sync instantly on both devices.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Gamepad2 size={22} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Multiplayer Couple Games
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Truth or Dare cards, Couple Quiz tests, and Would You Rather dilemmas with real-time turn sync.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <MessageCircleHeart size={22} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Live Chat & Love Bursts
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Instant private messaging, emoji reactions, and screen-spanning floating heart showers!
          </p>
        </div>
      </div>
    </div>
  );
};
