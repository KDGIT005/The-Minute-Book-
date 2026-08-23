import { Link } from 'react-router-dom';
import type { MeetingListItem } from '../types/meeting';
import StatusPill from './StatusPill';

interface MeetingCardProps {
  meeting: MeetingListItem;
  onDelete?: (id: string) => void;
}

export default function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
  const date = new Date(meeting.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDuration = meeting.durationSeconds
    ? formatDuration(meeting.durationSeconds)
    : null;

  return (
    <Link
      to={`/app/meetings/${meeting.id}`}
      className="block group no-underline relative"
      id={`meeting-card-${meeting.id}`}
    >
      <div className="border border-hairline rounded-xl p-5 bg-paper
                      transition-all duration-200 ease-out
                      hover:shadow-md hover:-translate-y-0.5
                      group-focus-visible:ring-2 group-focus-visible:ring-ledger-green">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-lg font-semibold text-ink leading-tight
                         group-hover:text-ledger-green transition-colors duration-200">
            {meeting.title}
          </h3>
          <div className="flex items-center gap-2">
            <StatusPill status={meeting.status} />
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this meeting? This cannot be undone.')) {
                    onDelete(meeting.id);
                  }
                }}
                className="p-1 text-slate/50 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete meeting"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate font-body">
          <span>{formattedDate}</span>
          {formattedDuration && (
            <>
              <span className="text-hairline">·</span>
              <span className="font-mono text-xs">{formattedDuration}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
