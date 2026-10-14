import React, { useState } from 'react';
import { RoomProvider, useRoom } from './context/RoomContext';
import { Navbar } from './components/Navbar';
import { RoomLobby } from './components/RoomLobby';
import { RoomView } from './components/RoomView';
import { MemberList } from './components/MemberList';
import { FloatingHearts } from './components/FloatingHearts';

const MainApp = () => {
  const { room, floatingHeartTrigger, toastMessage } = useRoom();
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Romantic floating hearts particle emitter */}
      <FloatingHearts trigger={floatingHeartTrigger} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '74px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(236, 72, 153, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#ffffff',
          padding: '8px 20px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.88rem',
          zIndex: 9999,
          boxShadow: '0 8px 30px rgba(236, 72, 153, 0.45)',
          animation: 'float 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Sticky header navbar */}
      <Navbar onOpenMembers={() => setIsMemberListOpen(true)} />

      {/* Main Body */}
      <main style={{ flex: 1 }}>
        {room ? <RoomView /> : <RoomLobby />}
      </main>

      {/* Members dialog */}
      <MemberList isOpen={isMemberListOpen} onClose={() => setIsMemberListOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <RoomProvider>
      <MainApp />
    </RoomProvider>
  );
}
