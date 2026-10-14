import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import { Send, Heart, Smile, Sparkles } from 'lucide-react';

export const ChatBox = () => {
  const { room, currentUser, sendMessage, sendReaction, sendFloatingHeart } = useRoom();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const messages = room?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const quickEmojis = ['❤️', '🔥', '🥰', '🎵', '🤣', '💖', '✨', '🥺'];

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '520px',
      overflow: 'hidden',
      border: '1px solid var(--border-glow)'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Room Live Chat
          </h3>
        </div>

        {/* Love Burst button */}
        <button
          onClick={sendFloatingHeart}
          title="Send heart showers!"
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid var(--border-pink)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-pink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          <Heart size={12} fill="#ec4899" />
          <span>LOVE BURST</span>
        </button>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => {
          if (msg.system) {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  fontWeight: 500,
                  textAlign: 'center',
                  maxWidth: '90%'
                }}
              >
                {msg.text}
              </div>
            );
          }

          const isMe = currentUser && currentUser.id === msg.senderId;

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '78%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '2px',
                fontSize: '0.72rem',
                color: 'var(--text-dim)'
              }}>
                <span style={{ fontWeight: 600, color: msg.avatarColor || '#ec4899' }}>
                  {msg.senderName}
                </span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: isMe
                  ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                boxShadow: isMe ? '0 4px 15px rgba(236, 72, 153, 0.25)' : 'none',
                border: isMe ? 'none' : '1px solid var(--border-subtle)'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reaction Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderTop: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          VIBE:
        </span>
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '6px',
              transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(12, 9, 28, 0.95)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Whisper sweet words or thoughts..."
          maxLength={400}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '999px',
            padding: '10px 16px',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'var(--font-body)'
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: 0
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
