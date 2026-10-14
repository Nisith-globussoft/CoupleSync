import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { ArrowLeft, CheckCircle2, Award, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    id: 'cq-1',
    question: "When your partner has had a super exhausting day, what is their ultimate comfort go-to?",
    options: [
      "Snuggling up with comfort food & a cozy movie",
      "Going out for fresh air or a long drive",
      "Total quiet time alone to recharge",
      "Vent session with warm tea or coffee"
    ]
  },
  {
    id: 'cq-2',
    question: "What would your dream vacation style be together?",
    options: [
      "Secluded beach villa with sunsets and cocktails",
      "Bustling city adventure exploring food and night markets",
      "Cozy mountain cabin surrounded by snow and pines",
      "Thrill-seeking road trip with no fixed schedule"
    ]
  },
  {
    id: 'cq-3',
    question: "What is your partner's love language priority?",
    options: [
      "Words of Affirmation & sweet messages",
      "Quality Time (undivided attention & shared vibes)",
      "Physical Touch & close hugs",
      "Acts of Service & caring gestures"
    ]
  },
  {
    id: 'cq-4',
    question: "If you could order dinner right now with zero budget limit, what cuisine wins?",
    options: [
      "Gourmet Italian Pizza & Pasta with Wine",
      "Authentic Spicy Asian Street Food / Sushi",
      "Rich North Indian Biryani & Butter Chicken",
      "Juicy Burgers, Crispy Fries & Thick Shakes"
    ]
  },
  {
    id: 'cq-5',
    question: "Who is more likely to fall asleep during a late-night movie marathon?",
    options: [
      "Definitely the Host / Me!",
      "100% my Partner",
      "Both of us knock out before the climax",
      "Neither — we stay awake chatting till 3 AM"
    ]
  }
];

export const CoupleQuiz = () => {
  const { room, currentUser, setActiveGame, submitQuizAnswer, nextQuizQuestion } = useRoom();

  const quizState = room?.game?.quiz || {
    currentQuestionIndex: 0,
    answers: {},
    scores: {}
  };

  const currentIndex = quizState.currentQuestionIndex % QUESTIONS.length;
  const currentQ = QUESTIONS[currentIndex];

  const currentAnswers = quizState.answers[currentIndex] || {};
  const myAnswer = currentUser ? currentAnswers[currentUser.id] : undefined;

  const handleSelectOption = (idx) => {
    submitQuizAnswer(currentIndex, idx);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleNext = () => {
    nextQuizQuestion();
  };

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
          color: 'var(--accent-primary)',
          background: 'rgba(99, 102, 241, 0.15)',
          padding: '3px 10px',
          borderRadius: '999px',
          border: '1px solid var(--border-glow)'
        }}>
          Question {currentIndex + 1} of {QUESTIONS.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'rgba(20, 15, 42, 0.9)',
        border: '1px solid var(--border-glow)'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          lineHeight: 1.4,
          marginBottom: '20px'
        }}>
          {currentQ.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentQ.options.map((opt, idx) => {
            const isSelectedByMe = myAnswer === idx;
            // Check if others selected this too
            const otherMembers = room?.members?.filter(m => m.id !== currentUser?.id) || [];
            const partnerSelectedThis = otherMembers.some(m => currentAnswers[m.id] === idx);

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: isSelectedByMe
                    ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelectedByMe
                    ? '1px solid var(--accent-pink)'
                    : '1px solid var(--border-subtle)',
                  color: isSelectedByMe ? '#ffffff' : 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: isSelectedByMe ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{opt}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {partnerSelectedThis && (
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: 'var(--accent-cyan)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}>
                      Partner Pick
                    </span>
                  )}
                  {isSelectedByMe && <CheckCircle2 size={18} color="var(--accent-pink)" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next question action */}
      <button
        onClick={handleNext}
        className="btn-primary"
        style={{ width: '100%', padding: '12px' }}
      >
        <span>Next Question</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
