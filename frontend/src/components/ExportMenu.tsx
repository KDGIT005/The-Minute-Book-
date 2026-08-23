import { useState, useRef, useEffect } from 'react';
import { exportMeeting } from '../api/meetings';

interface ExportMenuProps {
  meetingId: string;
  disabled?: boolean;
}

export default function ExportMenu({ meetingId, disabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = async (format: 'md' | 'json' | 'srt') => {
    setExporting(true);
    try {
      const blob = await exportMeeting(meetingId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const formats = [
    { key: 'md' as const, label: 'Markdown', desc: 'Human-readable notes' },
    { key: 'json' as const, label: 'JSON', desc: 'Structured data' },
    { key: 'srt' as const, label: 'SRT', desc: 'Subtitle file' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        id="export-button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline
                   text-sm font-body font-medium text-ink
                   hover:bg-paper-dark transition-colors duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Export
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-hairline bg-paper shadow-lg
                       z-30 overflow-hidden animate-fade-rise">
          {formats.map((fmt) => (
            <button
              key={fmt.key}
              onClick={() => handleExport(fmt.key)}
              disabled={exporting}
              className="w-full text-left px-4 py-3 hover:bg-paper-dark transition-colors duration-100
                        border-b border-hairline last:border-0"
            >
              <span className="block text-sm font-medium text-ink font-body">{fmt.label}</span>
              <span className="block text-xs text-slate font-body">{fmt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
