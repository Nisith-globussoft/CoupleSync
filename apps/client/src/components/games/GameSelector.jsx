import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { playClickSound } from '../../utils/soundEffects';
import { Sparkles, HelpCircle, Flame, ArrowRight, Dices, Eye } from 'lucide-react';

export const GameSelector = () => {
  const { setActiveGame } = useRoom();

  const handleSelectGame = (id) => {
    playClickSound();
    setActiveGame(id);
  };

  const games = [
    {
      id: 'truth_or_dare',
      title: 'Truth or Dare: Couple Edition',
      tagline: 'Deep secrets, romantic confessions & fun playful dares.',
      icon: Flame,
      color: '#ec4899',
      badge: 'ROMANTIC',
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(244, 63, 94, 0.1) 100%)'
    },
    {
      id: 'quiz',
      title: 'Couple Quiz: Who Knows Who Better?',
      tagline: 'Interactive 5-question test to prove your couple connection!',
      icon: HelpCircle,
      color: '#8b5cf6',
      badge: 'SYNCHRONIZED',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)'
    },
    {
      id: 'would_you_rather',
      title: 'Would You Rather: Couples Edition',
      tagline: 'Choose between 2 romantic or funny dilemmas and see if you match.',
      icon: Dices,
      color: '#06b6d4',
      badge: 'LIVE VOTING',
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
    },
    {
      id: 'never_have_i_ever',
      title: 'Never Have I Ever: Couple Edition',
      tagline: 'Confess cute habits, secret crushes, and romantic memories together.',
      icon: Eye,
      color: '#f59e0b',
      badge: 'NEW & SPICY',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          marginBottom: '4px'
        }}>
          Multiplayer Couple Games
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Pick a game to start playing together in real time!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              onClick={() => handleSelectGame(g.id)}
              className="glass-card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                background: g.gradient,
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: g.color + '25',
                    border: '1px solid ' + g.color + '50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} color={g.color} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: g.color + '20',
                    color: g.color,
                    border: '1px solid ' + g.color + '40',
                    letterSpacing: '0.05em'
                  }}>
                    {g.badge}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: '#ffffff',
                  marginBottom: '6px'
                }}>
                  {g.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {g.tagline}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: g.color,
                marginTop: '16px'
              }}>
                <span>Play Now</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
