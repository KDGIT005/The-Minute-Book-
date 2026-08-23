import type { KeyDecision } from '../types/meeting';

interface SummaryViewProps {
  summary: string | null;
  decisions: KeyDecision[];
}

export default function SummaryView({ summary, decisions }: SummaryViewProps) {
  if (!summary && decisions.length === 0) {
    return (
      <div className="text-center py-16 text-slate font-body">
        <p className="text-lg mb-1">No summary yet</p>
        <p className="text-sm">The executive summary will appear here once processing is complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-rise" id="summary-view">
      {/* Executive Summary */}
      {summary && (
        <div className="space-y-4">
          <div className="bg-paper-dark/40 rounded-2xl p-6 sm:p-8 border border-hairline shadow-xs">
            <div className="space-y-6">
              {renderFormattedMarkdown(summary)}
            </div>
          </div>
        </div>
      )}

      {/* Key Decisions */}
      {decisions.length > 0 && (
        <div className="pt-2">
          <h3 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-ledger-green border-2 border-paper shadow-xs" />
            Extracted Key Decisions
          </h3>
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-ledger-green/20
                           bg-ledger-green/[0.03] hover:bg-ledger-green/[0.06] transition-colors duration-150 shadow-2xs"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-ledger-green" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-ink leading-snug">
                    {decision.decision}
                  </p>
                  {decision.context && (
                    <p className="font-body text-xs text-slate mt-1.5 leading-relaxed">
                      {decision.context}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Clean markdown renderer for structured summaries
 */
function renderFormattedMarkdown(text: string) {
  // Split into sections or blocks
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check for H3 / Section Headers: "### Header" or "## Header"
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      return (
        <h4
          key={idx}
          className="font-display text-lg sm:text-xl font-medium text-ink tracking-tight pt-2 border-b border-hairline/60 pb-2"
        >
          {headerText}
        </h4>
      );
    }

    // Check for bullet list
    const lines = trimmed.split('\n');
    const isBulletList = lines.every((line) => line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• '));

    if (isBulletList) {
      return (
        <ul key={idx} className="space-y-2.5 pl-1 my-2">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^[\*\-•]\s*/, '');
            return (
              <li key={lIdx} className="flex items-start gap-2.5 text-sm sm:text-base font-body text-ink leading-relaxed">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ledger-green mt-2 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanLine) }} />
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p
        key={idx}
        className="font-body text-sm sm:text-base text-ink/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
      />
    );
  });
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-paper-dark px-1.5 py-0.5 rounded border border-hairline">$1</code>');
}

