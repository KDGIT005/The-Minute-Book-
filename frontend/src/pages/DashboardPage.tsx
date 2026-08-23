import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listMeetings } from '../api/meetings';
import type { MeetingListItem } from '../types/meeting';
import MeetingCard from '../components/MeetingCard';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMeetings() {
      try {
        const data = await listMeetings();
        if (mounted) {
          setMeetings(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load meetings');
          setLoading(false);
        }
      }
    }

    fetchMeetings();

    // Refresh every 5 seconds to catch status updates
    const interval = setInterval(fetchMeetings, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20">
        <div className="flex items-center justify-center gap-3 text-slate font-body">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"
                    strokeDasharray="31.4 31.4" strokeLinecap="round"/>
          </svg>
          Loading meetings…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto p-6 rounded-xl border border-red-200 bg-red-50">
          <p className="font-body text-sm text-red-700 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      // Optimitstically remove from UI
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      await import('../api/meetings').then(m => m.deleteMeeting(id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete meeting');
      // On failure, reload list
      const data = await import('../api/meetings').then(m => m.listMeetings());
      setMeetings(data);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">
            Meetings
          </h1>
          <p className="font-body text-sm text-slate mt-1">
            {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} recorded
          </p>
        </div>
        <Link
          to="/app/upload"
          className="px-4 py-2.5 rounded-xl bg-ink text-paper font-body font-semibold text-sm
                     hover:bg-ink/90 transition-colors duration-150 no-underline"
        >
          Upload audio
        </Link>
      </div>

      {meetings.length === 0 ? (
        /* Empty state — invitation, not apology */
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-paper-dark mx-auto mb-6 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-slate/50">
              <path d="M12 15V3m0 0l-4 4m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">
            No meetings yet
          </h2>
          <p className="font-body text-sm text-slate mb-6 max-w-sm mx-auto">
            Upload your first recording to get started. We'll transcribe it, extract key decisions,
            and build your action item list.
          </p>
          <Link
            to="/app/upload"
            className="inline-flex px-5 py-2.5 rounded-xl bg-ink text-paper font-body font-semibold text-sm
                       hover:bg-ink/90 transition-colors duration-150 no-underline"
          >
            Upload audio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
