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
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 8, 24, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%'
    }}>
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(236, 72, 153, 0.45)',
          flexShrink: 0
        }}>
          <Heart size={20} color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ffffff',
            lineHeight: 1.1
          }}>
            CoupleSync
            <span className="mobile-hide" style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3))',
              color: 'var(--accent-pink)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              textTransform: 'uppercase'
            }}>PRO</span>
          </h1>
          <p className="mobile-hide" style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            SAME VIBES, DIFFERENT PLACES
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          title={muted ? "Unmute Sound FX" : "Mute Sound FX"}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: muted ? 'var(--text-dim)' : '#ec4899',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {room && (
          <>
            {/* Quick Heart Burst */}
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
                padding: '5px 10px',
                color: '#f43f5e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.82rem',
                fontWeight: 600,
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.25)',
                flexShrink: 0
              }}
            >
              <Heart size={15} fill="#ec4899" color="#ec4899" />
            </button>

            {/* Room Code Pill */}
            <button
              onClick={handleCopyCode}
              title="Click to copy Room Code"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '5px 10px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              <span className="mobile-hide" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Room:</span>
              <span style={{ color: 'var(--accent-pink)', letterSpacing: '0.04em' }}>{room.code}</span>
              {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} color="var(--text-muted)" />}
            </button>

            {/* Members Counter */}
            <button
              onClick={() => {
                playClickSound();
                onOpenMembers();
              }}
              title="View room members"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '5px 9px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              <Users size={13} color="var(--accent-cyan)" />
              <span>{room.members.length}</span>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }} />
            </button>

            {/* Leave Room Button */}
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
                padding: '6px 8px',
                color: '#f43f5e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
