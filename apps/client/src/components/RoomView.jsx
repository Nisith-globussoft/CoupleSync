import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound, playHeartSound } from '../utils/soundEffects';
import { MusicPlayer } from './MusicPlayer';
import { ChatBox } from './ChatBox';
import { LoveWall } from './LoveWall';
import { GameSelector } from './games/GameSelector';
import { TruthOrDare } from './games/TruthOrDare';
import { CoupleQuiz } from './games/CoupleQuiz';
import { WouldYouRather } from './games/WouldYouRather';
import { NeverHaveIEver } from './games/NeverHaveIEver';
import {
  Music,
  Gamepad2,
  MessageCircle,
  Copy,
  Check,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RoomView = () => {
  const { room, activeTab, setActiveTab, leaveRoom, setActiveGame, showToast } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const handleCopyCode = () => {
    playClickSound();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    showToast('Room Code copied: ' + room.code + ' 📋');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareInvite = () => {
    playHeartSound();
    const inviteUrl = window.location.origin + '?room=' + room.code;
    navigator.clipboard.writeText(inviteUrl);
    showToast('Invite link copied! Send it to your partner 💌');
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.3 }
    });
  };

  const activeGame = room?.game?.activeGame;

  const handleTabChange = (tab) => {
    playClickSound();
    setActiveTab(tab);
  };

  return (
    <div style={{
      maxWidth: '740px',
      margin: '20px auto',
      padding: '0 16px 40px'
    }}>
      {/* Main Glass Panel */}
      <div className="glass-panel" style={{
        padding: '24px 20px',
        border: '1px solid var(--border-glow)',
        background: 'rgba(18, 14, 38, 0.92)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Room Header Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)'
              }}>
                <Heart size={18} fill="#fff" color="#fff" />
              </div>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: '#ffffff'
              }}>
                {room.name}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                Active Sync
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Room Code: <span style={{ color: 'var(--accent-pink)', fontWeight: 800, letterSpacing: '0.05em' }}>{room.code}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleShareInvite}
              className="btn-secondary"
              style={{
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <Share2 size={14} color="#ec4899" />
              <span>Invite</span>
            </button>

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
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Member Avatars Stack */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '14px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {room.members.map((m, idx) => (
              <div
                key={m.id}
                title={m.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: m.avatarColor || '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  marginLeft: idx > 0 ? '-10px' : 0,
                  border: '2px solid #120e26',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                }}
              >
                {m.avatarEmoji || m.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
              Connected Couple ({room.members.length} online)
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {room.members.map(m => m.name).join(' & ')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Music / Games / Chat / Love Wall) */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '5px',
          borderRadius: '999px',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)',
          gap: '4px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => handleTabChange('music')}
            style={{
              flex: 1,
              background: activeTab === 'music' ? '#ffffff' : 'none',
              color: activeTab === 'music' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'music' ? '0 4px 16px rgba(255, 255, 255, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Music size={15} />
            <span>Music</span>
          </button>

          <button
            onClick={() => handleTabChange('games')}
            style={{
              flex: 1,
              background: activeTab === 'games' ? '#ffffff' : 'none',
              color: activeTab === 'games' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'games' ? '0 4px 16px rgba(255, 255, 255, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Gamepad2 size={15} />
            <span>Games</span>
          </button>

          <button
            onClick={() => handleTabChange('chat')}
            style={{
              flex: 1,
              background: activeTab === 'chat' ? '#ffffff' : 'none',
              color: activeTab === 'chat' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'chat' ? '0 4px 16px rgba(255, 255, 255, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <MessageCircle size={15} />
            <span>Chat</span>
          </button>

          <button
            onClick={() => handleTabChange('love_wall')}
            style={{
              flex: 1,
              background: activeTab === 'love_wall' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'none',
              color: activeTab === 'love_wall' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'love_wall' ? '0 4px 16px rgba(236, 72, 153, 0.45)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Heart size={15} fill={activeTab === 'love_wall' ? '#fff' : 'none'} />
            <span>Love Wall</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'music' && <MusicPlayer />}

        {activeTab === 'games' && (
          <div>
            {activeGame && (
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveGame(null);
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Choose Another Game</span>
                </button>
              </div>
            )}

            {!activeGame && <GameSelector />}
            {activeGame === 'truth_or_dare' && <TruthOrDare />}
            {activeGame === 'quiz' && <CoupleQuiz />}
            {activeGame === 'would_you_rather' && <WouldYouRather />}
            {activeGame === 'never_have_i_ever' && <NeverHaveIEver />}
          </div>
        )}

        {activeTab === 'chat' && <ChatBox />}

        {activeTab === 'love_wall' && <LoveWall />}

        {/* Bottom Leave Button */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <button
            onClick={() => {
              playClickSound();
              leaveRoom();
            }}
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
