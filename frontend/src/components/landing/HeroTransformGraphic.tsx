import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeroTransformGraphicProps {
  scrollProgress?: number;
}

export default function HeroTransformGraphic({ scrollProgress }: HeroTransformGraphicProps) {
  const [internalProgress, setInternalProgress] = useState(0.85);
  const containerRef = useRef<HTMLDivElement>(null);

  // If scrollProgress is provided from parent scroll observer, use it; otherwise observe container visibility
  useEffect(() => {
    if (typeof scrollProgress === 'number') {
      setInternalProgress(Math.min(Math.max(scrollProgress, 0), 1));
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the viewport the graphic has traveled
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height * 0.5);
      setInternalProgress(Math.min(Math.max(progress * 1.1, 0.15), 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress]);

  // Generate deterministic waveform heights for natural audio look
  const waveformBars = [
    24, 45, 78, 32, 60, 95, 40, 85, 30, 70, 90, 50, 65, 35, 80, 100, 55, 42, 88, 62,
    30, 75, 45, 92, 68, 38, 82, 54, 96, 70, 40, 60, 85, 30, 48, 90, 72, 35, 65, 40,
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto my-6 select-none"
      id="hero-transform-graphic"
    >
      {/* Background shadow & subtle paper glow */}
      <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-hairline/40 via-ledger-green/5 to-seal-amber/5 rounded-2xl blur-xl opacity-60 -z-10" />

      {/* Main Container Card */}
      <Card className="border border-hairline/80 bg-paper/95 shadow-[0_12px_40px_rgba(32,38,46,0.06)] rounded-2xl overflow-hidden p-0">
        
        {/* Top bar with audio status and transformation label */}
        <div className="px-5 py-3 border-b border-hairline bg-paper-dark/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-slate tracking-tight">recording_0823.m4a (42:15)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-slate bg-paper/60 border-hairline">
              Audio → Structured Record
            </Badge>
          </div>
        </div>

        {/* Transformation Grid: Two Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px] divide-y lg:divide-y-0 lg:divide-x divide-hairline">
          
          {/* Left Panel: Unstructured Audio Waveform & Speech Fragments */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-paper relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate font-medium">
                  Raw Audio Stream
                </span>
                <span className="text-xs font-mono text-slate">Whisper 99.4%</span>
              </div>

              {/* Realistic Waveform */}
              <div className="h-24 flex items-center gap-[3px] sm:gap-1 px-1 my-3 overflow-hidden">
                {waveformBars.map((height, i) => {
                  const isActive = (i / waveformBars.length) <= internalProgress;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-slate/70'
                          : 'bg-hairline'
                      }`}
                      style={{
                        height: `${Math.max(height * 0.8, 12)}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Faint unstructured speech snippet */}
              <div className="mt-4 p-3 rounded-lg bg-paper-dark/60 border border-hairline/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate">
                  <span>[00:14:32] Speaker 2</span>
                  <span className="italic text-slate/80">unstructured talk</span>
                </div>
                <p className="text-xs text-slate font-body leading-relaxed">
                  "...so regarding the Q3 launch date, if we push to Thursday instead of Tuesday, Sarah has enough time to finish the staging verification and we avoid Friday releases..."
                </p>
              </div>
            </div>

            {/* Bottom transformation indicator */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-hairline/60 text-xs text-slate font-mono">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ledger-green" />
                Speech parsed
              </span>
              <span className="text-[11px]">→ Gemini AI extraction</span>
            </div>
          </div>

          {/* Right Panel: Structured Ledger Record */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-paper relative">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-ledger-green/15 text-ledger-green flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 2h10v12H3V2zm2 3h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="font-display font-medium text-base text-ink">
                    Ledger Entry #104
                  </span>
                </div>
                <span className="text-xs font-mono text-ledger-green bg-ledger-green/10 px-2 py-0.5 rounded border border-ledger-green/20">
                  Verified Summary
                </span>
              </div>

              {/* Structured entries matching in-app Spine style */}
              <div className="space-y-3.5 my-2">
                
                {/* Decision item (Green Filled Dot) */}
                <div className="p-3.5 rounded-lg border border-ledger-green/25 bg-ledger-green/[0.04] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-ledger-green border-2 border-paper shadow-xs" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-body text-ledger-green uppercase tracking-wider">
                          Key Decision
                        </span>
                        <span className="text-[11px] font-mono text-slate">[00:14:48]</span>
                      </div>
                      <p className="text-sm font-medium text-ink font-body leading-snug">
                        Approve shifting the Q3 production release to Thursday with mandatory staging smoke tests.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action item (Amber Outlined Dot) */}
                <div className="p-3.5 rounded-lg border border-seal-amber/30 bg-seal-amber/[0.04] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-seal-amber bg-paper shadow-xs" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold font-body text-seal-amber uppercase tracking-wider">
                            Action Item
                          </span>
                          <span className="text-[11px] font-mono text-slate">[00:15:10]</span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-seal-amber/15 text-seal-amber font-medium">
                          Due Thu 2 PM
                        </span>
                      </div>
                      <p className="text-sm font-body text-ink leading-snug">
                        <span className="font-semibold text-ink">Sarah C.</span> to finalize automated smoke test suite and sign off on staging.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-slate font-body">
              <span className="font-mono text-[11px]">2 decisions · 4 action items recorded</span>
              <span className="text-ledger-green font-medium flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3 4.3l-7 7L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ready for export
              </span>
            </div>

          </div>

        </div>
      </Card>
    </div>
  );
}
