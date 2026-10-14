import React, { useRef, useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
import { playClickSound, playHeartSound } from '../utils/soundEffects';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Disc3,
  Sparkles,
  Heart,
  Plus,
  Radio,
  Music2
} from 'lucide-react';

const FALLBACK_TRACKS = [
  {
    id: 'track-1',
    title: 'Midnight Serenade',
    artist: 'Lofi Cozy Moments',
    album: 'Starlight Vibes Vol. 1',
    duration: 372,
    cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'track-2',
    title: 'Warm Coffee & You',
    artist: 'Sunset Cafe Acoustics',
    album: 'Together Tonight',
    duration: 423,
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'track-3',
    title: 'Endless Horizon',
    artist: 'Romantic Piano Dreams',
    album: 'Under The Moon',
    duration: 355,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'track-4',
    title: 'Dancing in the Starlight',
    artist: 'Lo-Fi Heartbeats',
    album: 'CoupleSync Exclusive',
    duration: 312,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];

export const MusicPlayer = () => {
  const { room, setMusicPlayback, changeTrack, showToast } = useRoom();
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showCustomUrlModal, setShowCustomUrlModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const musicState = room?.music;
  const rawPlaylist = musicState?.playlist && musicState.playlist.length > 0 ? musicState.playlist : FALLBACK_TRACKS;
  // Ensure tracks have working audio urls
  const playlist = rawPlaylist.map((t, idx) => ({
    ...t,
    audioUrl: t.audioUrl && t.audioUrl.startsWith('https://www.soundhelix') ? t.audioUrl : FALLBACK_TRACKS[idx % FALLBACK_TRACKS.length].audioUrl
  }));

  const currentTrackIndex = Math.min(musicState?.currentTrackIndex ?? 0, playlist.length - 1);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];
  const isPlaying = musicState?.isPlaying || false;

  // Sync audio tag with room music state
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      const elapsedSinceSync = Math.max(0, (Date.now() - (musicState?.lastUpdated || Date.now())) / 1000);
      const targetPos = ((musicState?.positionMs || 0) / 1000) + elapsedSinceSync;

      if (Math.abs(audio.currentTime - targetPos) > 1.5) {
        audio.currentTime = targetPos;
      }

      audio.play().catch(err => {
        console.warn('Autoplay prevented by browser:', err);
      });
    } else {
      audio.pause();
      if (musicState?.positionMs !== undefined) {
        audio.currentTime = musicState.positionMs / 1000;
      }
    }
  }, [isPlaying, currentTrackIndex, musicState?.lastUpdated]);

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const bars = 32;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4;
        if (isPlaying) {
          const wave = Math.sin(phase + i * 0.35) * Math.cos(phase * 0.8 + i * 0.2);
          barHeight = Math.max(4, Math.abs(wave) * (height * 0.78) + 6);
        }

        const x = i * barWidth;
        const y = centerY - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#6366f1');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 3) : ctx.rect(x + 2, y, barWidth - 4, barHeight);
        ctx.fill();
      }

      phase += isPlaying ? 0.08 : 0.01;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentTrack?.duration || 0);
    }
  };

  const togglePlayPause = () => {
    playClickSound();
    if (!audioRef.current) return;
    const nextState = !isPlaying;
    const currentMs = Math.floor(audioRef.current.currentTime * 1000);

    setMusicPlayback({
      isPlaying: nextState,
      positionMs: currentMs,
      currentTrackIndex
    });
  };

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekCommit = (e) => {
    const newTime = parseFloat(e.target.value);
    setIsSeeking(false);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setMusicPlayback({
      isPlaying,
      positionMs: Math.floor(newTime * 1000),
      currentTrackIndex
    });
  };

  const handleNext = () => {
    playClickSound();
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    changeTrack(nextIdx);
  };

  const handlePrev = () => {
    playClickSound();
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    changeTrack(prevIdx);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    playClickSound();
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
    }
  };

  const handleAddCustomTrack = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const newTrack = {
      id: 'custom-' + Date.now(),
      title: customTitle.trim() || 'Shared Couple Stream',
      artist: room?.name || 'CoupleSync Special',
      album: 'Our Shared Songs',
      duration: 240,
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      audioUrl: customUrl.trim()
    };
    playlist.push(newTrack);
    changeTrack(playlist.length - 1);
    setMusicPlayback({ isPlaying: true, positionMs: 0, currentTrackIndex: playlist.length - 1 });
    setShowCustomUrlModal(false);
    setCustomTitle('');
    setCustomUrl('');
    showToast('Custom song added to couple queue! 🎵');
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        preload="auto"
      />

      {/* Main Player Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        borderRadius: '20px',
        background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 11, 32, 0.6) 100%)',
        border: '1px solid var(--border-glow)',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Sync Indicator Pill */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: isPlaying ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid ' + (isPlaying ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
          fontSize: '0.72rem',
          fontWeight: 700,
          color: isPlaying ? '#10b981' : 'var(--text-dim)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isPlaying ? '#10b981' : 'var(--text-dim)',
            animation: isPlaying ? 'pulseGlow 1.5s infinite' : 'none'
          }} />
          <span>{isPlaying ? 'SYNCED PLAYING' : 'PAUSED'}</span>
        </div>

        {/* Vinyl Album Cover Art */}
        <div style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          margin: '12px 0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Rotating Vinyl Grooves */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #2a2040 0%, #0d0818 70%)',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isPlaying ? '0 0 35px rgba(236, 72, 153, 0.35)' : '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isPlaying ? 'spin 12s linear infinite' : 'none',
            overflow: 'hidden'
          }}>
            <img
              src={currentTrack?.cover}
              alt={currentTrack?.title}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            {/* Center vinyl hole */}
            <div style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#070510',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }} />
          </div>
        </div>

        {/* Audio Visualizer Canvas */}
        <div style={{ width: '100%', maxWidth: '360px', height: '36px', marginBottom: '14px' }}>
          <canvas
            ref={canvasRef}
            width={360}
            height={36}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Track Title & Artist */}
        <div style={{ textAlign: 'center', marginBottom: '18px', width: '100%', padding: '0 20px' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: '#ffffff',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack?.title || 'No Track Selected'}
          </h3>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--accent-pink)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack?.artist || 'CoupleSync Chill Radio'}
          </p>
        </div>

        {/* Seek Bar & Timers */}
        <div style={{ width: '100%', maxWidth: '420px', marginBottom: '20px' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '999px',
              accentColor: '#ec4899',
              cursor: 'pointer'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            marginTop: '6px'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
          <button
            onClick={handlePrev}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <SkipBack size={22} />
          </button>

          <button
            onClick={togglePlayPause}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(236, 72, 153, 0.45)',
              transition: 'transform 0.15s ease'
            }}
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: '3px' }} />}
          </button>

          <button
            onClick={handleNext}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <SkipForward size={22} />
          </button>
        </div>

        {/* Volume & Queue & Custom URL Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '420px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Volume slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMute}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{ width: '70px', height: '4px', accentColor: '#ec4899' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                playClickSound();
                setShowCustomUrlModal(true);
              }}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              <Plus size={13} />
              <span>Add Song</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setShowQueue(prev => !prev);
              }}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              <ListMusic size={13} />
              <span>Queue ({playlist.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Queue Drawer */}
      {showQueue && (
        <div className="glass-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
            Couple Shared Playlist
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlist.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    playClickSound();
                    changeTrack(idx);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid ' + (isSelected ? 'rgba(236, 72, 153, 0.35)' : 'transparent'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={track.cover}
                    alt={track.title}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#ec4899' : '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {track.title}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {track.artist}
                    </p>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: 700 }}>
                      NOW PLAYING
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Audio Stream Modal */}
      {showCustomUrlModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Add Song to Synchronized Queue 🎵
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Paste any direct MP3 audio URL or online radio stream link to play together with your partner!
            </p>

            <form onSubmit={handleAddCustomTrack} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Song Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Our Favorite Song"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Direct Audio URL (MP3 / Stream)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomUrlModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Add & Play
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
