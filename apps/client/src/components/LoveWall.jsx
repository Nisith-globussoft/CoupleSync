import React, { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import {
  playHeartSound,
  playHugSound,
  playClickSound,
  playSuccessFanfare
} from '../utils/soundEffects';
import {
  Heart,
  Calendar,
  Sparkles,
  Shuffle,
  StickyNote,
  Plus,
  Send,
  Flame,
  Award,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DATE_IDEAS = [
  "Cook the same meal together over video call 🍝",
  "Write a 3-line romantic haiku or poem for each other 📜",
  "Order each other surprise midnight snacks or drinks 🍕🥤",
  "Build a collaborative CoupleSync playlist of your story 🎵",
  "Take a virtual tour of Paris or Tokyo street view together ✈️",
  "Dress up fancy and have a candlelight dessert date on video 🍷🍰",
  "Send 5 photos from childhood and guess the stories behind them 🧸",
  "Do a 10-minute couples stargazing session listening to ambient lofi 🌌",
  "Make a dream bucket-list of 10 countries to visit together 🗺️",
  "Read each other a chapter of a cozy romance or mystery book 📖"
];

export const LoveWall = () => {
  const { room, currentUser, triggerFloatingHearts, showToast } = useRoom();

  // Anniversary date setup
  const [anniversary, setAnniversary] = useState(() => {
    return localStorage.getItem('couplesync_anniversary') || '2025-01-01';
  });
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Date roulette
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);

  // Love notes
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('couplesync_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'note-1', author: 'Sweetheart 💖', text: "Counting down every single hour until I see you again! ✈️", color: '#ec4899', likes: 3 },
      { id: 'note-2', author: 'Alex 🦊', text: "You looked breathtaking today. Remember to drink plenty of water! 🥤", color: '#8b5cf6', likes: 5 },
      { id: 'note-3', author: 'CoupleSync Bot', text: "Tip: Tap the Heartbeat Pulse button to sync your heartbeats across any distance! 💓", color: '#06b6d4', likes: 2 }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [heartbeatActive, setHeartbeatActive] = useState(false);

  // Calculate days together
  const startDate = new Date(anniversary);
  const today = new Date();
  const diffTime = Math.max(0, today - startDate);
  const daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const handleHeartbeat = () => {
    playHeartSound();
    setHeartbeatActive(true);
    triggerFloatingHearts();
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setHeartbeatActive(false), 1200);
  };

  const handleShuffleIdea = () => {
    playClickSound();
    setCurrentIdeaIndex(prev => (prev + 1) % DATE_IDEAS.length);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    playSuccessFanfare();
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];
    const newNote = {
      id: 'note-' + Date.now(),
      author: currentUser?.name || 'You',
      text: newNoteText.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      likes: 1
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('couplesync_notes', JSON.stringify(updated));
    setNewNoteText('');
    showToast('Love Note posted to your wall! 💌');
  };

  const handleLikeNote = (id) => {
    playHeartSound();
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n);
      localStorage.setItem('couplesync_notes', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Days Counter Card */}
      <div style={{
        padding: '24px 20px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.12)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(236, 72, 153, 0.2)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#ec4899',
          marginBottom: '10px'
        }}>
          <Award size={14} />
          <span>LOVE TIMELINE</span>
        </div>

        <div style={{
          fontSize: 'clamp(2.5rem, 7vw, 3.8rem)',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          lineHeight: 1.1,
          marginBottom: '4px'
        }}>
          <span className="gradient-text">{daysTogether}</span> <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>Days</span>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Growing stronger together, one beautiful memory at a time 💖
        </p>

        {isEditingDate ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <input
              type="date"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.88rem'
              }}
            />
            <button
              onClick={() => {
                localStorage.setItem('couplesync_anniversary', anniversary);
                setIsEditingDate(false);
                playClickSound();
              }}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playClickSound();
              setIsEditingDate(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Since {new Date(anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} (Edit Anniversary)
          </button>
        )}
      </div>

      {/* Heartbeat Sync Pulse Module */}
      <div className="glass-card" style={{
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>Synchronized Heartbeat</span>
          <Flame size={16} color="#ec4899" />
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Tap the heart to pulse love vibrations across the distance
        </p>

        <button
          onClick={handleHeartbeat}
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: heartbeatActive
              ? 'radial-gradient(circle, #f43f5e 0%, #ec4899 70%)'
              : 'radial-gradient(circle, #ec4899 0%, #8b5cf6 100%)',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            boxShadow: heartbeatActive
              ? '0 0 45px rgba(244, 63, 94, 0.9), 0 0 80px rgba(236, 72, 153, 0.6)'
              : '0 0 25px rgba(236, 72, 153, 0.4)',
            transform: heartbeatActive ? 'scale(1.18)' : 'scale(1)',
            transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Heart
            size={40}
            color="#ffffff"
            fill="#ffffff"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
              animation: heartbeatActive ? 'pulseGlow 0.4s infinite' : 'none'
            }}
          />
        </button>

        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {heartbeatActive ? "💓 Beating together in sync!" : "Touch to beat your partner's heart"}
        </div>
      </div>

      {/* Date Idea Roulette */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Couple Date Night Roulette
            </h4>
          </div>

          <button
            onClick={handleShuffleIdea}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
          >
            <Shuffle size={13} />
            <span>Shuffle Idea</span>
          </button>
        </div>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#ffffff',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          "{DATE_IDEAS[currentIdeaIndex]}"
        </div>
      </div>

      {/* Love Sticky Notes Wall */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StickyNote size={18} color="#ec4899" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Shared Love Notes Wall
            </h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {notes.length} Sweet Notes
          </span>
        </div>

        {/* Input note form */}
        <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Write a cute love note for your partner..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.88rem'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0 16px', borderRadius: '10px' }}
          >
            <Send size={15} />
          </button>
        </form>

        {/* Notes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: n.color + '18',
                border: '1px solid ' + n.color + '40',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100px'
              }}
            >
              <p style={{
                fontSize: '0.88rem',
                color: '#ffffff',
                lineHeight: 1.45,
                marginBottom: '10px'
              }}>
                "{n.text}"
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: n.color }}>
                  - {n.author}
                </span>

                <button
                  onClick={() => handleLikeNote(n.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#ec4899',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}
                >
                  <Heart size={13} fill="#ec4899" />
                  <span>{n.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
