import React, { useRef, useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';
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
  Heart
} from 'lucide-react';

export const MusicPlayer = () => {
  const { room, setMusicPlayback, changeTrack } = useRoom();
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const musicState = room?.music;
  const playlist = musicState?.playlist || [];
  const currentTrackIndex = musicState?.currentTrackIndex ?? 0;
  const currentTrack = playlist[currentTrackIndex] || null;
  const isPlaying = musicState?.isPlaying || false;

  // Sync audio tag with room music state
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    // Check if source changed
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      // Calculate target position based on elapsed time since last sync
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

  // Track playback time update
  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || currentTrack?.duration || 0);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    const nextState = !isPlaying;
    const currentMs = Math.floor(audioRef.current.currentTime * 1000);

    setMusicPlayback({
      isPlaying: nextState,
      positionMs: currentMs,
      currentTrackIndex
    });
  };

  // Seek bar interactions
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

  // Skip tracks
  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    changeTrack(nextIdx);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    changeTrack(prevIdx);
  };

  // Volume change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  if (!currentTrack) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No music loaded.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--border-glow)'
    }}>
      {/* Background ambient album blur */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '320px',
        background: `radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)`,
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top bar with Room Playlist Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(236, 72, 153, 0.15)',
              color: 'var(--accent-pink)',
              border: '1px solid var(--border-pink)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={12} />
              SYNCED PLAYBACK
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Track {currentTrackIndex + 1} of {playlist.length}
            </span>
          </div>

          <button
            onClick={() => setShowQueue(!showQueue)}
            style={{
              background: showQueue ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: showQueue ? 'var(--accent-pink)' : 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <ListMusic size={16} />
            <span>Queue</span>
          </button>
        </div>

        {/* Album Artwork & Vinyl effect */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '10px 0 24px'
        }}>
          <div style={{
            position: 'relative',
            width: '210px',
            height: '210px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: isPlaying ? '0 12px 40px rgba(236, 72, 153, 0.45)' : '0 8px 25px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.4s ease',
            transform: isPlaying ? 'scale(1.02)' : 'scale(1)',
            border: '2px solid rgba(255, 255, 255, 0.12)'
          }}>
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Glowing overlay when playing */}
            {isPlaying && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(10, 8, 24, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '6px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div className="equalizer-bar" />
                <div className="equalizer-bar" />
                <div className="equalizer-bar" />
                <div className="equalizer-bar" />
              </div>
            )}
          </div>
        </div>

        {/* Track Title and Artist */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
            color: '#ffffff'
          }}>
            {currentTrack.title}
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {currentTrack.artist} • <span style={{ color: 'var(--text-dim)' }}>{currentTrack.album}</span>
          </p>
        </div>

        {/* Progress scrub bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="range"
            min={0}
            max={duration || currentTrack.duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            style={{
              width: '100%',
              accentColor: '#ec4899',
              cursor: 'pointer',
              height: '5px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.12)'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            marginTop: '6px',
            fontWeight: 500
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || currentTrack.duration)}</span>
          </div>
        </div>

        {/* Main playback control buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '20px'
        }}>
          {/* Previous */}
          <button
            onClick={handlePrev}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <SkipBack size={26} />
          </button>

          {/* Big Play/Pause button */}
          <button
            onClick={togglePlayPause}
            className="btn-primary"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              padding: 0,
              fontSize: '1.5rem',
              boxShadow: '0 8px 30px rgba(236, 72, 153, 0.5)'
            }}
          >
            {isPlaying ? <Pause size={28} fill="#fff" /> : <Play size={28} fill="#fff" style={{ marginLeft: '4px' }} />}
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <SkipForward size={26} />
          </button>
        </div>

        {/* Volume controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '999px',
          width: 'fit-content',
          margin: '0 auto'
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              width: '80px',
              accentColor: '#8b5cf6',
              cursor: 'pointer',
              height: '4px'
            }}
          />
        </div>

        {/* Shared Queue Drawer */}
        {showQueue && (
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '10px'
            }}>
              Shared Playlist Queue
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              {playlist.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => changeTrack(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--border-pink)' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isSelected ? 'var(--accent-pink)' : 'var(--text-dim)',
                        width: '16px'
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <p style={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#fff' : 'var(--text-main)'
                        }}>
                          {track.title}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-pink)', fontWeight: 600 }}>
                        PLAYING
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
