import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound } from '../utils/soundEffects';
import { MusicPlayer } from './MusicPlayer';
import { MovieRoom } from './MovieRoom';
import { ChatBox } from './ChatBox';
import { LoveWall } from './LoveWall';
import { GameSelector } from './games/GameSelector';
import { TruthOrDare } from './games/TruthOrDare';
import { CoupleQuiz } from './games/CoupleQuiz';
import { WouldYouRather } from './games/WouldYouRather';
import { NeverHaveIEver } from './games/NeverHaveIEver';
import {
  Music,
  Tv,
  Gamepad2,
  MessageCircle,
  Heart,
  ArrowLeft,
  Users
} from 'lucide-react';

export const RoomView = () => {
  const { room, activeGame, setActiveGame, leaveRoom } = useRoom();
  const [activeTab, setActiveTab] = useState('movies'); // Default to movies for exciting watch-together

  const handleTabChange = (tab) => {
    playClickSound();
    setActiveTab(tab);
  };

  if (!room) return null;

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 65px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 10px calc(80px + var(--sab)) 10px'
    }}>
      <div style={{ width: '100%', maxWidth: '1050px' }}>
        {/* Connected Couple Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '10px 14px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Overlapping Avatars */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {room.members.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: m.avatarColor || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.88rem',
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
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {room.name || 'Private Couple Room'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {room.members.map(m => m.name).join(' & ')} • {room.members.length} online
              </p>
            </div>
          </div>

          <div style={{
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span>SYNCED LIVE</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <div className="desktop-only-tabs" style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '5px',
          borderRadius: '999px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
          gap: '4px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {/* Movie Stream Tab */}
          <button
            onClick={() => handleTabChange('movies')}
            style={{
              flex: 1,
              background: activeTab === 'movies' ? 'linear-gradient(135deg, #f59e0b, #ec4899)' : 'none',
              color: activeTab === 'movies' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 12px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'movies' ? '0 4px 16px rgba(245, 158, 11, 0.45)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Tv size={15} />
            <span>Movie Stream</span>
          </button>

          {/* Music Tab */}
          <button
            onClick={() => handleTabChange('music')}
            style={{
              flex: 1,
              background: activeTab === 'music' ? '#ffffff' : 'none',
              color: activeTab === 'music' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 12px',
              fontSize: '0.84rem',
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

          {/* Games Tab */}
          <button
            onClick={() => handleTabChange('games')}
            style={{
              flex: 1,
              background: activeTab === 'games' ? '#ffffff' : 'none',
              color: activeTab === 'games' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 12px',
              fontSize: '0.84rem',
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

          {/* Chat Tab */}
          <button
            onClick={() => handleTabChange('chat')}
            style={{
              flex: 1,
              background: activeTab === 'chat' ? '#ffffff' : 'none',
              color: activeTab === 'chat' ? '#090714' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 12px',
              fontSize: '0.84rem',
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

          {/* Love Wall Tab */}
          <button
            onClick={() => handleTabChange('love_wall')}
            style={{
              flex: 1,
              background: activeTab === 'love_wall' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'none',
              color: activeTab === 'love_wall' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '999px',
              padding: '9px 12px',
              fontSize: '0.84rem',
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
        {activeTab === 'movies' && <MovieRoom />}

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

        {/* Bottom Leave Button (Desktop) */}
        <div className="mobile-hide" style={{ marginTop: '28px', textAlign: 'center' }}>
          <button
            onClick={() => {
              playClickSound();
              leaveRoom();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 14px',
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

      {/* Native App-Style Mobile Bottom Navigation Dock */}
      <nav className="mobile-bottom-dock">
        <button
          onClick={() => handleTabChange('movies')}
          className={'mobile-dock-btn ' + (activeTab === 'movies' ? 'active' : '')}
        >
          <div className="dock-icon-wrapper">
            <Tv size={18} />
          </div>
          <span>Movies</span>
        </button>

        <button
          onClick={() => handleTabChange('music')}
          className={'mobile-dock-btn ' + (activeTab === 'music' ? 'active' : '')}
        >
          <div className="dock-icon-wrapper">
            <Music size={18} />
          </div>
          <span>Music</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={'mobile-dock-btn ' + (activeTab === 'games' ? 'active' : '')}
        >
          <div className="dock-icon-wrapper">
            <Gamepad2 size={18} />
          </div>
          <span>Games</span>
        </button>

        <button
          onClick={() => handleTabChange('chat')}
          className={'mobile-dock-btn ' + (activeTab === 'chat' ? 'active' : '')}
        >
          <div className="dock-icon-wrapper">
            <MessageCircle size={18} />
          </div>
          <span>Chat</span>
        </button>

        <button
          onClick={() => handleTabChange('love_wall')}
          className={'mobile-dock-btn ' + (activeTab === 'love_wall' ? 'active' : '')}
        >
          <div className="dock-icon-wrapper">
            <Heart size={18} fill={activeTab === 'love_wall' ? '#ec4899' : 'none'} />
          </div>
          <span>Love Wall</span>
        </button>
      </nav>
    </div>
  );
};
