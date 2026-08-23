import { useState, useCallback } from 'react';
import type { ActionItem } from '../types/meeting';
import { updateActionItem } from '../api/meetings';

interface ActionItemsViewProps {
  meetingId: string;
  items: ActionItem[];
  onUpdate: (updatedItem: ActionItem) => void;
}

export default function ActionItemsView({ meetingId, items, onUpdate }: ActionItemsViewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate font-body">
        <p className="text-lg mb-1">No action items</p>
        <p className="text-sm">Action items will appear here once processing is complete.</p>
      </div>
    );
  }

  const completedCount = items.filter((i) => i.isComplete).length;

  return (
    <div className="animate-fade-rise" id="action-items-view">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate font-body mb-2">
          <span>{completedCount} of {items.length} complete</span>
          <span className="font-mono text-xs">
            {Math.round((completedCount / items.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-hairline rounded-full overflow-hidden">
          <div
            className="h-full bg-ledger-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <ActionItemRow
            key={item.id}
            meetingId={meetingId}
            item={item}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

interface ActionItemRowProps {
  meetingId: string;
  item: ActionItem;
  onUpdate: (updatedItem: ActionItem) => void;
}

function ActionItemRow({ meetingId, item, onUpdate }: ActionItemRowProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = useCallback(async () => {
    setToggling(true);
    try {
      const updated = await updateActionItem(meetingId, item.id, {
        isComplete: !item.isComplete,
      });
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to update action item:', err);
    } finally {
      setToggling(false);
    }
  }, [meetingId, item.id, item.isComplete, onUpdate]);

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-seal-amber/10 text-seal-amber border-seal-amber/20',
    low: 'bg-slate/10 text-slate border-slate/20',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200
                  ${item.isComplete
                    ? 'border-hairline bg-paper-dark/30 opacity-60'
                    : 'border-hairline bg-paper hover:shadow-sm'
                  }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className="flex-shrink-0 mt-0.5 group"
        aria-label={item.isComplete ? 'Mark incomplete' : 'Mark complete'}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                        transition-all duration-200
                        ${item.isComplete
                          ? 'bg-ledger-green border-ledger-green'
                          : 'border-hairline group-hover:border-ledger-green'
                        }`}>
          {item.isComplete && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-body text-sm font-medium leading-snug
                      ${item.isComplete ? 'line-through text-slate' : 'text-ink'}`}>
          {item.task}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium
                           uppercase tracking-wider border ${priorityColors[item.priority]}`}>
            {item.priority}
          </span>

          {/* Owner */}
          {item.owner && (
            <span className="text-xs text-slate font-body">
              → {item.owner}
            </span>
          )}

          {/* Deadline */}
          {item.deadline && (
            <span className="text-xs text-slate font-mono">
              by {item.deadline}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
