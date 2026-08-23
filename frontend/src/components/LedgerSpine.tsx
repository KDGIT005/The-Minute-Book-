import type { KeyDecision, ActionItem, Chapter } from '../types/meeting';

export interface NarrativeStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  detail?: string;
}

export interface LedgerSpineProps {
  mode?: 'live' | 'narrative';
  // Props for mode="live"
  decisions?: KeyDecision[];
  actionItems?: ActionItem[];
  chapters?: Chapter[];
  totalDuration?: number;
  onTimestampClick?: (time: number) => void;
  // Props for mode="narrative"
  steps?: NarrativeStep[];
  activeStep?: number; // Index of currently active or reached step (0-indexed)
  progress?: number; // 0 to 1 float for continuous scroll tracking
}

const DEFAULT_NARRATIVE_STEPS: NarrativeStep[] = [
  {
    id: 'upload',
    stepNumber: 1,
    title: 'Upload',
    description: 'Drop in an audio file — mp3, wav, or m4a.',
  },
  {
    id: 'transcribe',
    stepNumber: 2,
    title: 'Transcribe',
    description: "Groq's Whisper model turns speech into a timestamped transcript.",
  },
  {
    id: 'summarize',
    stepNumber: 3,
    title: 'Summarize',
    description: 'Gemini reads the transcript in stages — chunk by chunk — and pulls out real decisions and action items, not a generic recap.',
  },
  {
    id: 'review',
    stepNumber: 4,
    title: 'Review',
    description: 'Read it, check off tasks, export it, or jump straight to any moment in the audio.',
  },
];

export default function LedgerSpine({
  mode = 'live',
  decisions = [],
  actionItems = [],
  chapters = [],
  totalDuration = 0,
  onTimestampClick = () => {},
  steps = DEFAULT_NARRATIVE_STEPS,
  activeStep = 4,
  progress = 1,
}: LedgerSpineProps) {
  if (mode === 'narrative') {
    return (
      <div className="relative w-8 sm:w-10 flex-shrink-0 flex flex-col items-center select-none" aria-hidden="true">
        {/* Background inactive hairline */}
        <div className="absolute top-3 bottom-6 w-px bg-hairline left-1/2 -translate-x-1/2" />
        
        {/* Animated active progress fill */}
        <div
          className="absolute top-3 w-px bg-ledger-green left-1/2 -translate-x-1/2 transition-all duration-300 ease-out"
          style={{
            height: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
            maxHeight: 'calc(100% - 24px)',
          }}
        />

        {/* Narrative Step Markers */}
        <div className="relative w-full flex flex-col justify-between h-full space-y-24 sm:space-y-32">
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div key={step.id} className="relative flex items-center justify-center">
                <div
                  className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'scale-100'
                      : 'scale-90 opacity-60'
                  }`}
                >
                  {/* Outer glow ring for current step */}
                  {isCurrent && (
                    <div className="absolute -inset-1 rounded-full bg-ledger-green/20 animate-pulse-gentle" />
                  )}

                  {/* Marker Dot: Green filled circle matching in-app style */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 shadow-xs ${
                      isCompleted
                        ? 'bg-ledger-green border-paper ring-2 ring-ledger-green/30'
                        : 'bg-paper border-hairline'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Live Mode (In-App Meeting Detail Spine) ──────────────────────
  if (totalDuration <= 0) return null;

  const markers = [
    ...decisions
      .filter((d) => d.sourceTimestamp != null)
      .map((d) => ({
        time: d.sourceTimestamp!,
        type: 'decision' as const,
        label: d.decision.slice(0, 40) + (d.decision.length > 40 ? '…' : ''),
      })),
    ...actionItems
      .filter((a) => a.sourceTimestamp != null)
      .map((a) => ({
        time: a.sourceTimestamp!,
        type: 'action' as const,
        label: a.task.slice(0, 40) + (a.task.length > 40 ? '…' : ''),
      })),
    ...chapters.map((c) => ({
      time: c.startTime,
      type: 'chapter' as const,
      label: c.title,
    })),
  ].sort((a, b) => a.time - b.time);

  if (markers.length === 0) return null;

  return (
    <div className="relative w-10 flex-shrink-0 mr-4" id="ledger-spine">
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-hairline -translate-x-1/2" />

      {/* Markers */}
      {markers.map((marker, i) => {
        const pct = Math.min((marker.time / totalDuration) * 100, 100);

        return (
          <button
            key={`${marker.type}-${i}`}
            onClick={() => onTimestampClick(marker.time)}
            title={marker.label}
            className="absolute left-1/2 -translate-x-1/2 group z-10 cursor-pointer"
            style={{ top: `${pct}%` }}
          >
            {marker.type === 'decision' ? (
              // Green filled circle — confirmed decision
              <div className="w-3.5 h-3.5 rounded-full bg-ledger-green border-2 border-paper
                             shadow-xs group-hover:scale-125 transition-transform duration-150" />
            ) : marker.type === 'action' ? (
              // Amber outlined circle — pending action
              <div className="w-3.5 h-3.5 rounded-full border-2 border-seal-amber bg-paper
                             shadow-xs group-hover:scale-125 transition-transform duration-150" />
            ) : (
              // Chapter marker — small diamond
              <div className="w-3 h-3 rotate-45 bg-ink/20 border border-ink/30
                             group-hover:bg-ink/40 transition-all duration-150" />
            )}

            {/* Tooltip */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                          transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20">
              <div className="bg-ink text-paper text-xs font-body px-2.5 py-1 rounded-md shadow-lg">
                <span className="font-mono text-[10px] text-paper/60 mr-1.5">
                  {formatTimestamp(marker.time)}
                </span>
                {marker.label}
              </div>
            </div>
          </button>
        );
      })}
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

