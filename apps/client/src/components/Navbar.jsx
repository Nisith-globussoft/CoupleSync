import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { Heart, Copy, Check, Users, LogOut, Sparkles } from 'lucide-react';

export const Navbar = ({ onOpenMembers }) => {
  const { room, leaveRoom, sendFloatingHeart } = useRoom();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 8, 24, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)'
        }}>
          <Heart size={20} color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            CoupleSync
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'rgba(236, 72, 153, 0.2)',
              color: 'var(--accent-pink)',
              textTransform: 'uppercase'
            }}>MVP</span>
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

      {room && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={sendFloatingHeart}
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
            onClick={onOpenMembers}
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
            onClick={leaveRoom}
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
        </div>
      )}
    </header>
  );
};
