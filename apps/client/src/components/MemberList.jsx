import React from 'react';
import { useRoom } from '../context/RoomContext';
import { X, Crown, Heart } from 'lucide-react';

export const MemberList = ({ isOpen, onClose }) => {
  const { room, currentUser } = useRoom();

  if (!isOpen || !room) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '24px',
        background: 'rgba(19, 14, 38, 0.95)',
        border: '1px solid var(--border-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Connected Members
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Room: <span style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>{room.name}</span> ({room.code})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {room.members.map((m) => {
            const isMe = currentUser && currentUser.id === m.id;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isMe ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: isMe ? '1px solid var(--border-pink)' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: m.avatarColor || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    position: 'relative'
                  }}>
                    {m.name.charAt(0).toUpperCase()}
                    <span style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #0f0b20'
                    }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.name}</span>
                      {isMe && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-muted)'
                        }}>You</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {m.isHost ? 'Host / Room Creator' : 'Partner / Member'}
                    </span>
                  </div>
                </div>

                {m.isHost ? (
                  <Crown size={18} color="#f59e0b" title="Host" />
                ) : (
                  <Heart size={16} color="#ec4899" fill="#ec4899" />
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ width: '100%', padding: '10px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
