import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import {
  playMessagePop,
  playHeartSound,
  playKissSound,
  playHugSound,
  playClickSound
} from '../utils/soundEffects';
import { Send, Heart, Smile, Sparkles, MessageCircle, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUICK_EMOJIS = ['❤️', '🥰', '😘', '🥺', '🌹', '💍', '🧸', '✨', '🔥', '🍷', '💋', '🍫'];

export const ChatBox = () => {
  const { room, currentUser, sendMessage, sendReaction, sendFloatingHeart, showToast } = useRoom();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const rawMessages = room?.messages || [];
  const messages = [];
  const seenKeys = new Set();
  for (const m of rawMessages) {
    const key = m.id || (m.senderId + '_' + m.text + '_' + Math.floor((m.timestamp || 0) / 2500));
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      messages.push(m);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playMessagePop();
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleSendEmoji = (emoji) => {
    playClickSound();
    sendReaction(emoji);
  };

  const handleLoveBurst = () => {
    playHeartSound();
    sendFloatingHeart();
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleVirtualHug = () => {
    playHugSound();
    sendFloatingHeart();
    showToast('Sent a warm, cozy virtual hug! 🫂💖');
    sendMessage('🫂 *Sent you a big tight warm hug!*');
  };

  const handleVirtualKiss = () => {
    playKissSound();
    sendFloatingHeart();
    showToast('Sent a sweet virtual kiss! 💋');
    sendMessage('💋 *Sent you a sweet kiss on your forehead!*');
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '540px',
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
        background: 'rgba(255, 255, 255, 0.02)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
            Couples Live Chat
          </h3>
        </div>

        {/* Action Buttons: Hug, Kiss, Love Burst */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleVirtualHug}
            className="btn-secondary"
            title="Send Virtual Hug"
            style={{ padding: '5px 9px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            🫂 Hug
          </button>

          <button
            onClick={handleVirtualKiss}
            className="btn-secondary"
            title="Send Virtual Kiss"
            style={{ padding: '5px 9px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            💋 Kiss
          </button>

          <button
            onClick={handleLoveBurst}
            className="btn-primary"
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              borderRadius: '999px',
              boxShadow: '0 0 16px rgba(236, 72, 153, 0.5)'
            }}
          >
            <Heart size={13} fill="#fff" />
            <span>Love Burst</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            padding: '20px'
          }}>
            <Heart size={32} color="#ec4899" style={{ opacity: 0.6, marginBottom: '8px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              No messages yet in this room.
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Say hi, send a hug, or launch a Love Burst! 💖
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser?.id;
            const isSystem = m.system;

            if (isSystem) {
              return (
                <div key={m.id} style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--accent-pink)',
                  background: 'rgba(236, 72, 153, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  alignSelf: 'center',
                  maxWidth: '85%'
                }}>
                  {m.text}
                </div>
              );
            }

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '3px'
                }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: isMe ? '#ec4899' : '#8b5cf6'
                  }}>
                    {m.senderName || 'Anonymous'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  boxShadow: isMe ? '0 4px 15px rgba(236, 72, 153, 0.25)' : 'none'
                }}>
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.25)',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendEmoji(emoji)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '6px',
              transition: 'transform 0.15s ease'
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 14px',
          background: 'rgba(15, 11, 32, 0.7)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Whisper something sweet..."
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Send size={17} style={{ marginLeft: '2px' }} />
        </button>
      </form>
    </div>
  );
};
