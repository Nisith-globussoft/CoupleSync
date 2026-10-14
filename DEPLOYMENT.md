# 🚀 CoupleSync Deployment Guide (Render + Vercel)

CoupleSync uses a **WebSockets + Node.js** backend and a **Vite + React** frontend. Here is the exact, step-by-step 100% free deployment setup.

---

## 📌 Architecture & Platforms

| Component | Platform | Free Tier Benefits | Why this platform? |
|---|---|---|---|
| **Backend** | **Render.com** (Web Service) | Free Web Service with full WebSocket support | Persistent Socket.IO connections for music sync, chat, and games |
| **Frontend** | **Vercel** | Free global edge CDN, instant SSL | Lightning-fast React asset delivery & PWA ready |

---

## 🛠️ Part 1: Deploy Backend on Render.com (Do this first)

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect:  
   `https://github.com/Nisith-globussoft/CoupleSync`
4. Configure the settings:
   - **Name**: `couplesync-api` (or any name you like)
   - **Region**: Choose closest region (e.g. Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `apps/server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will build and deploy your backend. Once deployed, note down your Render backend URL:  
   👉 E.g.: `https://couplesync-api.onrender.com`

---

## 🌐 Part 2: Deploy Frontend on Vercel

1. Go to [https://vercel.com/](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import the repository: `Nisith-globussoft/CoupleSync`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select **`apps/client`**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. **Environment Variables**:
   Add this environment variable:
   - **Key**: `VITE_SERVER_URL`
   - **Value**: Your Render Backend URL from Part 1 (e.g. `https://couplesync-api.onrender.com`)
6. Click **Deploy**.
7. In ~45 seconds, your app will be live at:  
   👉 `https://couplesync.vercel.app` (or your Vercel project domain).

---

## 📱 Part 3: Test Real-Time Sync on Mobile & Desktop

1. Open your Vercel URL on your laptop/desktop: Create a Room.
2. Copy the room code or invite link.
3. Open the link on your phone: Join the room!
4. Hit **Play** on Music or send a **Love Burst ❤️** — notice both screens update instantly in real-time!
