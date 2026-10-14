import React, { useEffect, useState } from 'react';

const EMOJIS = ['💖', '💕', '💘', '💗', '💓', '✨', '🌹', '🥰', '🧸', '💋', '💍', '💐'];

export const FloatingHearts = ({ trigger }) => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newBurst = Array.from({ length: 18 }).map(() => ({
      id: Math.random(),
      left: Math.floor(8 + Math.random() * 84),
      size: Math.floor(22 + Math.random() * 26),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      duration: 2.2 + Math.random() * 1.6,
      delay: Math.random() * 0.35
    }));

    setHearts(prev => [...prev, ...newBurst]);

    const timer = setTimeout(() => {
      setHearts(prev => prev.slice(newBurst.length));
    }, 4200);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (hearts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 99999,
      overflow: 'hidden'
    }}>
      {hearts.map(h => (
        <span
          key={h.id}
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: h.left + '%',
            fontSize: h.size + 'px',
            animation: 'floatUp ' + h.duration + 's cubic-bezier(0.25, 1, 0.5, 1) ' + h.delay + 's forwards',
            filter: 'drop-shadow(0 0 14px rgba(236, 72, 153, 0.7))',
            userSelect: 'none'
          }}
        >
          {h.emoji}
        </span>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-90px) scale(1.15) rotate(12deg);
          }
          70% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(-95vh) scale(1.35) rotate(-22deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
