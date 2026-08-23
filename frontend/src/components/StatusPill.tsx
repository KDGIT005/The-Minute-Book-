import type { MeetingStatus } from '../types/meeting';

const statusConfig: Record<MeetingStatus, { label: string; classes: string }> = {
  QUEUED: {
    label: 'Queued',
    classes: 'bg-slate/10 text-slate',
  },
  TRANSCRIBING: {
    label: 'Transcribing',
    classes: 'bg-seal-amber/10 text-seal-amber animate-pulse-gentle',
  },
  SUMMARIZING: {
    label: 'Summarizing',
    classes: 'bg-seal-amber/10 text-seal-amber animate-pulse-gentle',
  },
  DONE: {
    label: 'Complete',
    classes: 'bg-ledger-green/10 text-ledger-green',
  },
  FAILED: {
    label: 'Failed',
    classes: 'bg-red-50 text-red-600',
  },
};

interface StatusPillProps {
  status: MeetingStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status] || statusConfig.QUEUED;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  font-body tracking-wide ${config.classes}`}
    >
      {(status === 'TRANSCRIBING' || status === 'SUMMARIZING') && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      )}
      {config.label}
    </span>
  );
}
