import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { ArrowLeft, Check, Sparkles, Dices, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const DILEMMAS = [
  {
    id: 'wyr-1',
    scenario: "Couples Lifestyle Choice",
    optionA: "Live in a peaceful seaside cottage where you hear ocean waves every morning",
    optionB: "Live in a high-rise luxury penthouse with panoramic city lights at midnight"
  },
  {
    id: 'wyr-2',
    scenario: "Vacation Dilemma",
    optionA: "A surprise luxury all-inclusive weekend getaway planned 100% by your partner",
    optionB: "A 2-week backpacking adventure across scenic countries you plan together"
  },
  {
    id: 'wyr-3',
    scenario: "Couple Superpower",
    optionA: "Have the superpower to telepathically hear each other's loving thoughts anytime",
    optionB: "Have the superpower to teleport to each other's side instantly for 10 minutes every day"
  },
  {
    id: 'wyr-4',
    scenario: "Date Night Style",
    optionA: "Dressing up fancy for a 5-star candlelit rooftop dinner",
    optionB: "Messy midnight cooking in pajamas while dancing in the kitchen"
  },
  {
    id: 'wyr-5',
    scenario: "Memory Capsule",
    optionA: "Relive the very first day you met for 24 magical hours",
    optionB: "Fast forward for a sneak peek of your 10th anniversary celebration"
  }
];

export const WouldYouRather = () => {
  const { room, currentUser, setActiveGame, voteWouldYouRather, nextWouldYouRather } = useRoom();

  const wyrState = room?.game?.wouldYouRather || {
    currentIndex: 0,
    votes: {}
  };

  const currentIdx = wyrState.currentIndex % DILEMMAS.length;
  const currentDilemma = DILEMMAS[currentIdx];

  const currentVotes = wyrState.votes[currentIdx] || {};
  const myVote = currentUser ? currentVotes[currentUser.id] : null;

  const handleVote = (choice) => {
    voteWouldYouRather(choice);
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  // Calculate percentages
  const votesList = Object.values(currentVotes);
  const totalVotes = votesList.length;
  const votesA = votesList.filter(v => v === 'A').length;
  const votesB = votesList.filter(v => v === 'B').length;

  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
  const pctB = totalVotes > 0 ? Math.round((votesB / totalVotes) * 100) : 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
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

        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          background: 'rgba(6, 182, 212, 0.15)',
          padding: '3px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}>
          Round {currentIdx + 1} of {DILEMMAS.length}
        </span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.08em'
        }}>
          {currentDilemma.scenario}
        </span>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          marginTop: '4px'
        }}>
          Would You Rather...
        </h3>
      </div>

      {/* Option Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Option A */}
        <div
          onClick={() => handleVote('A')}
          className="glass-card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            background: myVote === 'A'
              ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)'
              : 'rgba(255, 255, 255, 0.04)',
            border: myVote === 'A' ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {totalVotes > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: pctA + '%',
              background: 'rgba(236, 72, 153, 0.12)',
              zIndex: 0,
              transition: 'width 0.4s ease'
            }} />
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-pink)' }}>
                OPTION A
              </span>
              {totalVotes > 0 && (
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                  {pctA}%
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.98rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
              {currentDilemma.optionA}
            </p>
          </div>
        </div>

        {/* OR Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--text-dim)',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '3px 10px',
            borderRadius: '999px'
          }}>
            OR
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Option B */}
        <div
          onClick={() => handleVote('B')}
          className="glass-card"
          style={{
            padding: '20px',
            cursor: 'pointer',
            background: myVote === 'B'
              ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)'
              : 'rgba(255, 255, 255, 0.04)',
            border: myVote === 'B' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {totalVotes > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: pctB + '%',
              background: 'rgba(6, 182, 212, 0.12)',
              zIndex: 0,
              transition: 'width 0.4s ease'
            }} />
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                OPTION B
              </span>
              {totalVotes > 0 && (
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                  {pctB}%
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.98rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
              {currentDilemma.optionB}
            </p>
          </div>
        </div>
      </div>

      {/* Next Dilemma Button */}
      <button
        onClick={nextWouldYouRather}
        className="btn-primary"
        style={{ width: '100%', padding: '12px' }}
      >
        <span>Next Dilemma</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
