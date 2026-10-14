import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { MusicPlayer } from './MusicPlayer';
import { ChatBox } from './ChatBox';
import { GameSelector } from './games/GameSelector';
import { TruthOrDare } from './games/TruthOrDare';
import { CoupleQuiz } from './games/CoupleQuiz';
import { WouldYouRather } from './games/WouldYouRather';
import { Music, Gamepad2, MessageCircle, Copy, Check, LogOut, Heart } from 'lucide-react';

export const RoomView = () => {
  const { room, activeTab, setActiveTab, leaveRoom } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeGame = room?.game?.activeGame;

  return (
    <div style={{
      maxWidth: '680px',
      margin: '24px auto',
      padding: '0 16px 40px'
    }}>
      {/* Main Prototype Card matching User Mockup Image #4 */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid var(--border-glow)',
        background: 'rgba(18, 14, 38, 0.88)'
      }}>
        {/* Room Header Card */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={16} fill="#fff" color="#fff" />
              </div>
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff'
              }}>
                {room.name}
              </h2>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                In room
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Room code: <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{room.code}</span>
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '999px',
              padding: '6px 14px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy code'}</span>
          </button>
        </div>

        {/* Member Avatars Stack */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {room.members.map((m, idx) => (
              <div
                key={m.id}
                title={m.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: m.avatarColor || '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginLeft: idx > 0 ? '-10px' : 0,
                  border: '2px solid #120e26',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                }}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
              Your Group ({room.members.length} online)
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {room.members.map(m => m.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Music / Games / Chat) matching Image #4 */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '999px',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('music')}
            style={{
              flex: 1,
              background: activeTab === 'music' ? '#ffffff' : 'none',
              color: activeTab === 'music' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'music' ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          >
            <Music size={16} />
            <span>Music</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            style={{
              flex: 1,
              background: activeTab === 'games' ? '#ffffff' : 'none',
              color: activeTab === 'games' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'games' ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          >
            <Gamepad2 size={16} />
            <span>Games</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              flex: 1,
              background: activeTab === 'chat' ? '#ffffff' : 'none',
              color: activeTab === 'chat' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'chat' ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          >
            <MessageCircle size={16} />
            <span>Chat</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'music' && <MusicPlayer />}

        {activeTab === 'games' && (
          <div>
            {!activeGame && <GameSelector />}
            {activeGame === 'truth_or_dare' && <TruthOrDare />}
            {activeGame === 'quiz' && <CoupleQuiz />}
            {activeGame === 'would_you_rather' && <WouldYouRather />}
          </div>
        )}

        {activeTab === 'chat' && <ChatBox />}

        {/* Bottom Leave Button matching prototype Image #4 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={leaveRoom}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            Leave room
          </button>
        </div>
      </div>
    </div>
  );
};
