import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FeatureColumns() {
  return (
    <section id="what-you-get" className="py-24 sm:py-32 border-t border-hairline/60 scroll-mt-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-2xl mb-16 sm:mb-20 space-y-4">
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-widest font-mono py-1 px-3 border-hairline bg-paper-dark/60 text-slate"
          >
            The Deliverables
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-ink">
            What you get
          </h2>
          <p className="font-body text-slate text-base sm:text-lg leading-relaxed">
            Three structured records synthesized from every discussion — ready to search, review, and execute.
          </p>
        </div>

        {/* Asymmetric Split Layout: 1 Wide Panel + 2 Stacked Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 1. Transcript (Wider Panel - 7 columns) */}
          <div className="lg:col-span-7 flex">
            <Card className="flex-1 flex flex-col justify-between hover:border-hairline/80 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink" />
                    <CardTitle className="text-2xl">Transcript</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px] text-slate">
                    Searchable & Timestamped
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  Full text, timestamped, ready to search or export.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between pt-2">
                {/* Realistic Transcript Preview UI */}
                <div className="rounded-lg border border-hairline bg-paper-dark/40 p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60 text-slate">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-slate">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Filter query: <strong className="text-ink font-mono font-medium">endpoints</strong>
                    </span>
                    <span className="text-[10px] text-slate">3 matches</span>
                  </div>

                  <div className="space-y-2.5 text-ink/90 font-body">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[11px] text-slate flex-shrink-0 mt-0.5">00:03:15</span>
                      <div>
                        <span className="font-semibold text-xs text-ink">Elena Vance: </span>
                        <span className="text-xs text-slate">Let's review the API payload structure before migrating client stores.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-paper p-2 rounded border border-hairline/70">
                      <span className="font-mono text-[11px] text-ledger-green flex-shrink-0 mt-0.5 font-medium">00:03:42</span>
                      <div>
                        <span className="font-semibold text-xs text-ink">Marcus Reed: </span>
                        <span className="text-xs text-ink">Agreed. We'll use the <mark className="bg-ledger-green/15 text-ink px-1 rounded">v2 endpoints</mark> for better backward compatibility.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[11px] text-slate flex-shrink-0 mt-0.5">00:04:10</span>
                      <div>
                        <span className="font-semibold text-xs text-ink">Elena Vance: </span>
                        <span className="text-xs text-slate">That eliminates the database sync bottleneck completely.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between text-xs text-slate font-mono">
                  <span>Export: Markdown, JSON, Text</span>
                  <span>Audio-synced scrubbing</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stacked Right Column: Decisions & Action Items (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* 2. Decisions Card (Ledger Green) */}
            <Card className="flex-1 flex flex-col justify-between border-ledger-green/30 bg-ledger-green/[0.02] hover:border-ledger-green/50 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-ledger-green border-2 border-paper shadow-xs" />
                    <CardTitle className="text-xl text-ink">Decisions</CardTitle>
                  </div>
                  <Badge variant="green" className="font-mono text-[10px]">
                    Confirmed
                  </Badge>
                </div>
                <CardDescription>
                  The calls that were actually made, pulled out of the noise.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-1">
                <div className="p-3.5 rounded-lg border border-ledger-green/20 bg-paper space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-ledger-green font-medium">
                    <span>Key Decision · 00:03:42</span>
                    <span>Consensus</span>
                  </div>
                  <p className="text-xs font-medium text-ink font-body leading-snug">
                    Adopt v2 REST endpoints for client store migration to guarantee 100% backward compatibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Action Items Card (Seal Amber) */}
            <Card className="flex-1 flex flex-col justify-between border-seal-amber/30 bg-seal-amber/[0.02] hover:border-seal-amber/50 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-seal-amber bg-paper shadow-xs" />
                    <CardTitle className="text-xl text-ink">Action items</CardTitle>
                  </div>
                  <Badge variant="amber" className="font-mono text-[10px]">
                    Checklist
                  </Badge>
                </div>
                <CardDescription>
                  Who owns what, and by when — as an actual checklist, not a paragraph.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-1">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-seal-amber/20 bg-paper flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-seal-amber/60 flex items-center justify-center text-seal-amber">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3 4.3l-7 7L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-body text-ink font-medium">Audit current schema endpoints</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate">Elena V.</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-hairline bg-paper flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-hairline" />
                      <span className="font-body text-ink">Finalize migration test suite</span>
                    </div>
                    <span className="font-mono text-[10px] text-seal-amber font-medium">Marcus R. · Thu</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </section>
  );
}
