import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { playClickSound, playHeartSound, playSuccessFanfare } from '../../utils/soundEffects';
import { Flame, RefreshCw, Heart, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const NHIE_QUESTIONS = [
  { id: 1, text: "Never have I ever fallen asleep while talking on a late night call with you.", category: "Cute" },
  { id: 2, text: "Never have I ever gotten butterflies looking at an old photo of us.", category: "Romantic" },
  { id: 3, text: "Never have I ever stalked your social media profile before we even started talking.", category: "Confession" },
  { id: 4, text: "Never have I ever pretended to like a song, movie, or food just to impress you.", category: "Funny" },
  { id: 5, text: "Never have I ever planned our wedding or future vacation without telling you.", category: "Romantic" },
  { id: 6, text: "Never have I ever worn an item of your clothes secretly just because it smelled like you.", category: "Cute" },
  { id: 7, text: "Never have I ever rehearsed what I was going to say before calling you.", category: "Confession" },
  { id: 8, text: "Never have I ever re-read our cute chat messages and smiled like an idiot.", category: "Romantic" },
  { id: 9, text: "Never have I ever felt secretly jealous when someone else made you laugh really hard.", category: "Spicy" },
  { id: 10, text: "Never have I ever wanted to kiss you in the middle of a serious argument.", category: "Spicy" },
  { id: 11, text: "Never have I ever sent a risky flirty text and immediately put my phone face down.", category: "Spicy" },
  { id: 12, text: "Never have I ever told my friends that you're the best thing that ever happened to me.", category: "Heartfelt" }
];

export const NeverHaveIEver = () => {
  const { room, currentUser, triggerFloatingHearts } = useRoom();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [userId]: 'I HAVE' | 'I NEVER' }

  const question = NHIE_QUESTIONS[currentIndex] || NHIE_QUESTIONS[0];
  const members = room?.members || [];

  const handleAnswer = (choice) => {
    playClickSound();
    setAnswers(prev => ({
      ...prev,
      [currentUser?.id || 'me']: choice
    }));

    if (choice === 'I HAVE') {
      playHeartSound();
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const handleNext = () => {
    playClickSound();
    setAnswers({});
    setCurrentIndex(prev => (prev + 1) % NHIE_QUESTIONS.length);
  };

  const currentAnswer = answers[currentUser?.id || 'me'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#f43f5e'
        }}>
          <Flame size={14} />
          <span>{question.category} Edition</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Question {currentIndex + 1} of {NHIE_QUESTIONS.length}
        </span>
      </div>

      {/* Main Question Card */}
      <div style={{
        padding: '28px 20px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <p style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          lineHeight: 1.45,
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          "{question.text}"
        </p>

        {/* Choice buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => handleAnswer('I HAVE')}
            style={{
              flex: 1,
              maxWidth: '160px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: currentAnswer === 'I HAVE' ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.15)',
              background: currentAnswer === 'I HAVE' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: currentAnswer === 'I HAVE' ? '0 0 18px rgba(236, 72, 153, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🙈 I Have!
          </button>

          <button
            onClick={() => handleAnswer('I NEVER')}
            style={{
              flex: 1,
              maxWidth: '160px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: currentAnswer === 'I NEVER' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.15)',
              background: currentAnswer === 'I NEVER' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: currentAnswer === 'I NEVER' ? '0 0 18px rgba(99, 102, 241, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            😇 Never!
          </button>
        </div>
      </div>

      {/* Partner Answer Status */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#ec4899" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentAnswer ? "You answered: " + currentAnswer : "Waiting for your answer..."}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
        >
          <RefreshCw size={14} />
          <span>Next Prompt</span>
        </button>
      </div>
    </div>
  );
};
