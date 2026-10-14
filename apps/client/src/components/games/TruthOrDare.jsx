import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { ArrowLeft, RotateCw, Flame, Sparkles, Heart } from 'lucide-react';

export const TruthOrDare = () => {
  const { room, currentUser, setActiveGame, spinTruthOrDare } = useRoom();
  const [selectedCat, setSelectedCat] = useState('romantic');
  const [selectedType, setSelectedType] = useState('truth');
  const [isSpinning, setIsSpinning] = useState(false);

  const tod = room?.game?.truthOrDare || {
    category: 'romantic',
    type: 'truth',
    currentPrompt: 'What was the exact moment you realized you had real feelings for me?',
    turnCounter: 1
  };

  const categories = [
    { id: 'romantic', label: 'Romantic', color: '#ec4899', emoji: '💖' },
    { id: 'spicy', label: 'Spicy', color: '#f43f5e', emoji: '🔥' },
    { id: 'funny', label: 'Playful', color: '#f59e0b', emoji: '🤣' },
    { id: 'deep', label: 'Deep Soul', color: '#8b5cf6', emoji: '✨' }
  ];

  const handleDraw = () => {
    setIsSpinning(true);
    spinTruthOrDare(selectedCat, selectedType);
    setTimeout(() => setIsSpinning(false), 500);
  };

  const turnUser = room?.members?.find(m => m.id === tod.currentTurnUserId);
  const isMyTurn = currentUser && currentUser.id === tod.currentTurnUserId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top action header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setActiveGame(null)}
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
          <ArrowLeft size={16} />
          <span>Game Hub</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Turn:</span>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: isMyTurn ? 'var(--accent-pink)' : '#ffffff',
            background: isMyTurn ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.06)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: isMyTurn ? '1px solid var(--border-pink)' : '1px solid var(--border-subtle)'
          }}>
            {isMyTurn ? "Your Turn! 🌟" : (turnUser ? turnUser.name + "'s Turn" : 'Anyone')}
          </span>
        </div>
      </div>

      {/* Category selector pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((c) => {
          const isActive = selectedCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              style={{
                flex: 1,
                minWidth: '95px',
                background: isActive ? c.color : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 15px ' + c.color + '50' : 'none'
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Truth vs Dare mode switcher */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.25)',
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setSelectedType('truth')}
          style={{
            flex: 1,
            background: selectedType === 'truth' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'none',
            color: selectedType === 'truth' ? '#fff' : 'var(--text-dim)',
            border: 'none',
            borderRadius: '999px',
            padding: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          TRUTH 💬
        </button>
        <button
          onClick={() => setSelectedType('dare')}
          style={{
            flex: 1,
            background: selectedType === 'dare' ? 'linear-gradient(135deg, #f43f5e, #f59e0b)' : 'none',
            color: selectedType === 'dare' ? '#fff' : 'var(--text-dim)',
            border: 'none',
            borderRadius: '999px',
            padding: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          DARE ⚡
        </button>
      </div>

      {/* Main interactive Card */}
      <div className="glass-panel" style={{
        padding: '32px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(23, 17, 49, 0.85) 0%, rgba(35, 23, 68, 0.85) 100%)',
        border: '1px solid var(--border-glow)',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: isSpinning ? 'scale(0.96) rotate(1deg)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: tod.type === 'truth' ? 'var(--accent-pink)' : '#f43f5e',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {tod.category} • {tod.type}
        </span>

        <p style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          lineHeight: 1.45,
          maxWidth: '460px',
          margin: '24px 0'
        }}>
          "{tod.currentPrompt}"
        </p>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Prompt #{tod.turnCounter}
        </span>
      </div>

      {/* Spin / Draw Button */}
      <button
        onClick={handleDraw}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}
      >
        <RotateCw size={18} className={isSpinning ? 'animate-spin' : ''} />
        <span>DRAW NEXT {selectedType.toUpperCase()}</span>
      </button>
    </div>
  );
};
