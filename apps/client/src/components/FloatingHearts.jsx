import React, { useEffect, useState } from 'react';

export const FloatingHearts = ({ trigger }) => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const emojis = ['💖', '❤️', '💕', '✨', '🥰', '🌹', '💘', '💞'];
    const newBurst = Array.from({ length: 14 }).map(() => ({
      id: Math.random(),
      left: Math.floor(10 + Math.random() * 80),
      size: Math.floor(22 + Math.random() * 24),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      duration: 2.2 + Math.random() * 1.5,
      delay: Math.random() * 0.4
    }));

    setHearts(prev => [...prev, ...newBurst]);

    const timer = setTimeout(() => {
      setHearts(prev => prev.slice(newBurst.length));
    }, 4000);

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
      zIndex: 9999,
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
            animation: 'floatUp ' + h.duration + 's ease-out ' + h.delay + 's forwards',
            filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6))',
            userSelect: 'none'
          }}
        >
          {h.emoji}
        </span>
      ))}
      <style>{'\
        @keyframes floatUp {\
          0% {\
            transform: translateY(0) scale(0.6) rotate(0deg);\
            opacity: 0;\
          }\
          15% {\
            opacity: 1;\
            transform: translateY(-80px) scale(1.1) rotate(10deg);\
          }\
          70% {\
            opacity: 0.9;\
          }\
          100% {\
            transform: translateY(-90vh) scale(1.3) rotate(-20deg);\
            opacity: 0;\
          }\
        }\
      '}</style>
    </div>
  );
};
