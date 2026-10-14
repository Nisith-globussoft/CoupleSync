# AGENT.md - CoupleSync Agent Guide

Welcome to the **CoupleSync** codebase! This document is designed for AI coding agents and human developers to instantly grasp the project architecture, tech stack, conventions, and operational workflows.

---

## 1. Quick Project Summary

- **Product**: CoupleSync ("Same vibes, different places")
- **Type**: Real-time virtual hangout & social sync app for couples and friends.
- **Core Features**:
  1. **Private Rooms**: Join by code (e.g., `LOVE-4821`), member presence list, host privileges.
  2. **Music Together**: Synced audio streaming (Play/Pause/Seek/Next in real-time across both devices).
  3. **Live Chat**: Instant socket chat, emoji reactions, and synchronized floating heart animations.
  4. **Couple Games**:
     - *Truth or Dare* (Romantic, Fun, Deep, Spicy categories)
     - *Couple Quiz* ("Who Knows Who Better?" live scoring)
     - *Would You Rather* (Couples dilemma voting with instant match percentages)
- **Repo Pattern**: Monorepo with NPM workspaces.

---

## 2. Directory Structure

```
D:/CoupleSync/
├── phases/
│   └── PHASES.md              # Detailed engineering roadmap (Phase 0 to Phase 6)
├── AGENT.md                   # You are here! Agent guide & protocols
├── README.md                  # Human-friendly documentation
├── package.json               # Root monorepo workspace & concurrently scripts
└── apps/
    ├── server/                # Node.js + Express + Socket.IO Backend
    │   ├── package.json
    │   └── src/
    │       ├── index.js       # HTTP & Socket.IO server startup
    │       ├── socketHandler.js # Real-time event logic (rooms, music, chat, games)
    │       ├── roomStore.js   # In-memory authoritative room state store
    │       └── data/
    │           ├── playlist.js      # Curated romantic & chill lofi tracks
    │           └── gameQuestions.js # Truth/Dare, Quiz, & Would You Rather decks
    └── client/                # React 18 + Vite + Modern Glassmorphic CSS
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── main.jsx
            ├── App.jsx
            ├── index.css      # Custom neon dark-mode glassmorphic design system
            ├── context/
            │   └── RoomContext.jsx  # Socket.IO client state & action dispatchers
            └── components/
                ├── Navbar.jsx        # Room header, code copy, member pills
                ├── RoomLobby.jsx     # Landing page, Create Room, Join with Code
                ├── RoomView.jsx      # Main tabbed/unified dashboard
                ├── MusicPlayer.jsx   # Synced audio player with scrub bar & visualizer
                ├── ChatBox.jsx       # Real-time chat & emoji reaction shelf
                ├── FloatingHearts.jsx # Screen-spanning animated romantic particles
                ├── MemberList.jsx    # Online presence drawer / card
                └── games/
                    ├── GameSelector.jsx   # Game launcher hub
                    ├── TruthOrDare.jsx    # Interactive card flip & turn spinner
                    ├── CoupleQuiz.jsx     # Synchronized questions & score tally
                    └── WouldYouRather.jsx # Dilemma cards with live sync votes
```

---

## 3. Tech Stack & Ports

| Component | Technology | Default Port | Notes |
|---|---|---|---|
| **Backend** | Node.js, Express, Socket.IO, CORS | `http://localhost:5000` | WebSocket enabled on same port |
| **Frontend** | React 18, Vite, Lucide-React, Canvas Confetti | `http://localhost:3000` | Auto-proxies `/socket.io` & API |
| **Realtime** | WebSocket via Socket.IO | bi-directional | Real-time state broadcasting |

---

## 4. Key Developer Commands

All commands can be executed from the root of `D:/CoupleSync`:

```bash
# 1. Install all dependencies across monorepo
npm run install:all

# 2. Run both server and client concurrently
npm run dev

# 3. Run individual apps
npm run dev:server   # Starts backend on :5000
npm run dev:client   # Starts frontend on :3000

# 4. Build frontend for production
npm run build:client
```

---

## 5. Real-Time Socket.IO Protocol Specification

### Room Events
- `room:create` (Client -> Server) `{ userName, roomName, passcode? }`  
  -> Returns `{ success, room, user }`
- `room:join` (Client -> Server) `{ userName, roomCode, passcode? }`  
  -> Returns `{ success, room, user }`
- `room:leave` (Client -> Server) `{ roomCode, userId }`
- `room:sync` (Server -> Client) Broadcasts updated room state (members, hostId, etc.)

### Music Sync Events
- `music:state_change` (Client -> Server) `{ roomCode, isPlaying, trackId, positionMs, timestamp }`
- `music:state_broadcast` (Server -> Client) Broadcasts updated music state to all room members.
- `music:track_change` (Client -> Server) `{ roomCode, trackIndex }`

### Live Chat & Reactions
- `chat:send_message` (Client -> Server) `{ roomCode, text, senderId, senderName }`
- `chat:new_message` (Server -> Client) Emits message to all members.
- `chat:reaction` (Client -> Server) `{ roomCode, emoji, senderName }`
- `chat:floating_heart` (Client -> Server) `{ roomCode, senderName }` -> triggers floating hearts on all clients!

### Multiplayer Games
- `game:set_active` (Client -> Server) `{ roomCode, gameType }`
- `game:truth_or_dare` (Client -> Server) `{ roomCode, category, type }`
- `game:quiz_answer` (Client -> Server) `{ roomCode, questionId, selectedIndex, userId }`
- `game:quiz_next` (Client -> Server) `{ roomCode }`
- `game:wyr_vote` (Client -> Server) `{ roomCode, questionId, choice, userId }`
- `game:reset` (Client -> Server) `{ roomCode }`

---

## 6. Design System Tokens & Aesthetics

- **Dark Indigo / Night Sky Background**: `#080612` to `#100c24`
- **Glass Surfaces**: `rgba(23, 17, 49, 0.7)` with `backdrop-filter: blur(16px)`
- **Border Gradients**: `rgba(255, 255, 255, 0.08)` and `rgba(99, 102, 241, 0.25)`
- **Primary Accent**: Electric Indigo `#6366f1`
- **Romantic Accent**: Hot Pink / Rose `#ec4899` & `#f43f5e`
- **Warm Glow**: Soft Amber `#f59e0b`
- **Typography**: Inter / Outfit sans-serif with clean letter spacing and subtle neon text shadows.

---

## 7. Guidelines for Future Agent Tasks

1. **Always maintain sync integrity**: If modifying music or game state, ensure state mutations happen through the authoritative server in `roomStore.js` before broadcasting.
2. **Keep the UI mobile-first**: Touch targets must be at least 44px, bottom nav/dock must not be obscured by virtual keyboards.
3. **No broken audio**: Audio player must gracefully handle browser autoplay restrictions by showing a tap-to-resume banner when initial autoplay is blocked.
