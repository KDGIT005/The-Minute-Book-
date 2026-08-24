import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMeeting, getMeetingStatus } from '../api/meetings';
import type { MeetingDetail, ActionItem } from '../types/meeting';
import StatusPill from '../components/StatusPill';
import LedgerSpine from '../components/LedgerSpine';
import TranscriptView from '../components/TranscriptView';
import SummaryView from '../components/SummaryView';
import ActionItemsView from '../components/ActionItemsView';
import AudioPlayer, { type AudioPlayerRef } from '../components/AudioPlayer';
import ExportMenu from '../components/ExportMenu';

type Tab = 'transcript' | 'summary' | 'actions';

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('transcript');
  const audioRef = useRef<AudioPlayerRef>(null);

  // Fetch full meeting data
  const fetchMeeting = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getMeeting(id);
      setMeeting(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meeting');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  // Poll status while processing
  useEffect(() => {
    if (!id || !meeting) return;
    if (meeting.status === 'DONE' || meeting.status === 'FAILED') return;

    const interval = setInterval(async () => {
      try {
        const status = await getMeetingStatus(id);
        if (status.status !== meeting.status) {
          // Status changed — refetch full data
          fetchMeeting();
        }
      } catch {
        // Ignore polling errors
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [id, meeting?.status, fetchMeeting, meeting]);

  const handleTimestampClick = useCallback((time: number) => {
    audioRef.current?.seekTo(time);
  }, []);

  const handleActionItemUpdate = useCallback((updatedItem: ActionItem) => {
    setMeeting((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        actionItems: prev.actionItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center gap-3 text-slate font-body">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"
                  strokeDasharray="31.4 31.4" strokeLinecap="round"/>
        </svg>
        Loading meeting…
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto p-6 rounded-xl border border-red-200 bg-red-50">
          <p className="font-body text-sm text-red-700 mb-3">
            {error || 'Meeting not found.'}
          </p>
          <Link to="/app" className="text-sm font-medium text-red-600 underline hover:text-red-800">
            Back to meetings
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = meeting.status === 'QUEUED' || meeting.status === 'TRANSCRIBING' || meeting.status === 'SUMMARIZING';
  const date = new Date(meeting.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'transcript', label: 'Transcript', count: meeting.transcriptSegments.length },
    { key: 'summary', label: 'Summary' },
    { key: 'actions', label: 'Action Items', count: meeting.actionItems.length },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink
                              transition-colors duration-150 mb-4 no-underline font-body">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Meetings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink tracking-tight mb-1">
            {meeting.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate font-body">
            <span>{formattedDate}</span>
            {meeting.durationSeconds && (
              <>
                <span className="text-hairline">·</span>
                <span className="font-mono text-xs">
                  {formatDuration(meeting.durationSeconds)}
                </span>
              </>
            )}
            <StatusPill status={meeting.status} />
          </div>
        </div>

        <ExportMenu meetingId={meeting.id} disabled={meeting.status !== 'DONE'} />
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="mb-6 p-4 rounded-xl border border-seal-amber/20 bg-seal-amber/5 animate-fade-rise">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 text-seal-amber" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"
                      strokeDasharray="31.4 31.4" strokeLinecap="round"/>
            </svg>
            <p className="font-body text-sm text-seal-amber font-medium">
              {meeting.status === 'QUEUED' && 'Queued for processing — this usually takes a moment.'}
              {meeting.status === 'TRANSCRIBING' && 'Transcribing audio — converting speech to text with Whisper.'}
              {meeting.status === 'SUMMARIZING' && 'Summarizing transcript — extracting decisions and action items.'}
            </p>
          </div>
        </div>
      )}

      {/* Failed state */}
      {meeting.status === 'FAILED' && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 animate-fade-rise">
          <p className="font-body text-sm text-red-700">
            Processing failed. Check your Groq API key in <code className="font-mono text-xs">.env</code> and try uploading again.
          </p>
        </div>
      )}

      {/* Main content area with Ledger Spine */}
      <div className="flex">
        {/* Ledger Spine */}
        {meeting.status === 'DONE' && (
          <LedgerSpine
            decisions={meeting.keyDecisions}
            actionItems={meeting.actionItems}
            chapters={meeting.chapters}
            totalDuration={meeting.durationSeconds || 0}
            onTimestampClick={handleTimestampClick}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-hairline mb-6">
            <div className="flex gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  id={`tab-${tab.key}`}
                  className={`relative px-4 py-3 text-sm font-body font-medium transition-colors duration-150
                             ${activeTab === tab.key
                               ? 'text-ink'
                               : 'text-slate hover:text-ink'
                             }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-slate/60 font-mono">
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-ink rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'transcript' && (
            <TranscriptView
              segments={meeting.transcriptSegments}
              onTimestampClick={handleTimestampClick}
            />
          )}
          {activeTab === 'summary' && (
            <SummaryView
              summary={meeting.summary}
              decisions={meeting.keyDecisions}
            />
          )}
          {activeTab === 'actions' && (
            <ActionItemsView
              meetingId={meeting.id}
              items={meeting.actionItems}
              onUpdate={handleActionItemUpdate}
            />
          )}
        </div>
      </div>

      {/* Audio Player (bottom) */}
      <div className="mt-8">
        <AudioPlayer
          ref={audioRef}
          audioPath={null}
          duration={meeting.durationSeconds || 0}
        />
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}
