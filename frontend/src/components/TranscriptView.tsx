import type { TranscriptSegment } from '../types/meeting';

interface TranscriptViewProps {
  segments: TranscriptSegment[];
  onTimestampClick: (time: number) => void;
}

export default function TranscriptView({ segments, onTimestampClick }: TranscriptViewProps) {
  if (segments.length === 0) {
    return (
      <div className="text-center py-16 text-slate font-body">
        <p className="text-lg mb-1">No transcript available</p>
        <p className="text-sm">The transcript will appear here once processing is complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" id="transcript-view">
      {segments.map((seg, i) => (
        <div
          key={seg.id}
          className="flex items-start gap-3 py-2.5 px-3 rounded-lg
                     hover:bg-paper-dark/60 transition-colors duration-100 animate-fade-rise"
          style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
        >
          {/* Timestamp */}
          <button
            onClick={() => onTimestampClick(seg.startTime)}
            className="flex-shrink-0 font-mono text-xs text-slate/70 hover:text-ledger-green
                       transition-colors duration-150 mt-0.5 tabular-nums"
          >
            {formatTimestamp(seg.startTime)}
          </button>

          {/* Speaker label */}
          <span className="flex-shrink-0 font-mono text-xs font-medium text-ink/50 mt-0.5 w-20 truncate">
            {seg.speakerLabel || 'Speaker'}
          </span>

          {/* Text */}
          <p className="font-body text-sm text-ink leading-relaxed flex-1">
            {seg.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
