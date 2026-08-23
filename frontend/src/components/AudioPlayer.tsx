import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface AudioPlayerProps {
  audioPath: string | null;
  duration: number;
}

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  function AudioPlayer({ duration }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration || 0);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
        }
      },
    }));

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setAudioDuration(audio.duration);
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
      };
    }, []);

    const togglePlay = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !audioDuration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audioDuration;
    }, [audioDuration]);

    const progressPct = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

    return (
      <div className="bg-paper-dark/60 border border-hairline rounded-xl px-4 py-3" id="audio-player">
        <audio ref={audioRef} preload="metadata">
          {/* Source will be set when we have audio streaming endpoint */}
        </audio>

        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-ink text-paper
                       flex items-center justify-center hover:bg-ink/85
                       transition-colors duration-150"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="3.5" height="12" rx="1"/>
                <rect x="8.5" y="1" width="3.5" height="12" rx="1"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3 1.5v11l9-5.5z"/>
              </svg>
            )}
          </button>

          {/* Current time */}
          <span className="font-mono text-xs text-slate tabular-nums w-12 text-right">
            {formatTimestamp(currentTime)}
          </span>

          {/* Progress bar */}
          <div
            onClick={handleSeek}
            className="flex-1 h-1.5 bg-hairline rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-ink rounded-full transition-[width] duration-100"
              style={{ width: `${progressPct}%` }}
            />
            {/* Playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ink
                         shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ left: `${progressPct}%`, marginLeft: '-6px' }}
            />
          </div>

          {/* Duration */}
          <span className="font-mono text-xs text-slate tabular-nums w-12">
            {formatTimestamp(audioDuration)}
          </span>
        </div>
      </div>
    );
  }
);

function formatTimestamp(seconds: number): string {
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default AudioPlayer;
