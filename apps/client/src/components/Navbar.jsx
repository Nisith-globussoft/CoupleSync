import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound, toggleMute, isMuted } from '../utils/soundEffects';
import { Heart, Copy, Check, Users, LogOut, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const Navbar = ({ onOpenMembers }) => {
  const { room, leaveRoom, sendFloatingHeart, showToast } = useRoom();
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  const handleCopyCode = () => {
    if (!room) return;
    playClickSound();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    showToast('Room code copied: ' + room.code);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const next = toggleMute();
    setMuted(next);
    if (!next) playClickSound();
    showToast(next ? 'Sound FX Muted 🔇' : 'Sound FX Enabled 🔊');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 8, 24, 0.88)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 18px rgba(236, 72, 153, 0.45)'
        }}>
          <Heart size={22} color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ffffff'
          }}>
            CoupleSync
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
              color: 'var(--accent-pink)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              textTransform: 'uppercase'
            }}>PRO MVP</span>
          </h1>
          <p style={{
            fontSize: '0.70rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            SAME VIBES, DIFFERENT PLACES
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          title={muted ? "Unmute Sound FX" : "Mute Sound FX"}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: muted ? 'var(--text-dim)' : '#ec4899',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {room && (
          <>
            <button
              onClick={() => {
                playClickSound();
                sendFloatingHeart();
              }}
              title="Send love burst to your partner!"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(139, 92, 246, 0.25))',
                border: '1px solid var(--border-pink)',
                borderRadius: '999px',
                padding: '6px 12px',
                color: '#f43f5e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: '0 0 12px rgba(236, 72, 153, 0.25)'
              }}
            >
              <Sparkles size={14} color="#ec4899" />
              <Heart size={16} fill="#ec4899" color="#ec4899" />
            </button>

            <button
              onClick={handleCopyCode}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '6px 14px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Room:</span>
              <span style={{ color: 'var(--accent-pink)', letterSpacing: '0.05em' }}>{room.code}</span>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="var(--text-muted)" />}
            </button>

            <button
              onClick={() => {
                playClickSound();
                onOpenMembers();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '6px 12px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <Users size={14} color="var(--accent-cyan)" />
              <span>{room.members.length}</span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
            </button>

            <button
              onClick={() => {
                playClickSound();
                leaveRoom();
              }}
              title="Leave Room"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '999px',
                padding: '6px 10px',
                color: '#f43f5e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
