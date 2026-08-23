import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

interface NarrativeStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  tag: string;
}

const STEPS: NarrativeStep[] = [
  {
    id: 'upload',
    stepNumber: 1,
    title: 'Upload',
    description: 'Drop in an audio file — mp3, wav, or m4a.',
    tag: 'Direct audio ingestion',
  },
  {
    id: 'transcribe',
    stepNumber: 2,
    title: 'Transcribe',
    description: "Groq's Whisper model turns speech into a timestamped transcript.",
    tag: 'Whisper-large-v3',
  },
  {
    id: 'summarize',
    stepNumber: 3,
    title: 'Summarize',
    description: 'Gemini reads the transcript in stages — chunk by chunk — and pulls out real decisions and action items, not a generic recap.',
    tag: 'Structured AI distillation',
  },
  {
    id: 'review',
    stepNumber: 4,
    title: 'Review',
    description: 'Read it, check off tasks, export it, or jump straight to any moment in the audio.',
    tag: 'Interactive Ledger & Export',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      // Check how far each step is scrolled into view
      let currentActive = 0;
      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          // Activate step when it reaches the upper half of viewport
          if (rect.top <= windowHeight * 0.65) {
            currentActive = index;
          }
        }
      });

      setActiveStep(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 sm:py-32 border-t border-hairline/60 relative scroll-mt-12"
    >
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-24 space-y-4">
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-widest font-mono py-1 px-3 border-hairline bg-paper-dark/60 text-slate"
          >
            The Workflow
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight text-ink">
            How it works
          </h2>
          <p className="font-body text-slate text-base sm:text-lg leading-relaxed">
            From raw conversation to a permanent, actionable minute book in four transparent stages.
          </p>
        </div>

        {/* Narrative Ledger Spine Timeline */}
        <div className="max-w-3xl">
          {STEPS.map((step, index) => {
            const isCompleted = index <= activeStep;
            const isCurrent = index === activeStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div
                key={step.id}
                ref={(el) => { stepRefs.current[index] = el; }}
                className="relative flex gap-6 sm:gap-10 group"
              >
                {/* Vertical Spine Column */}
                <div className="relative flex flex-col items-center flex-shrink-0 w-8 sm:w-10 select-none">
                  
                  {/* Connecting Spine Line to Next Step */}
                  {!isLast && (
                    <>
                      {/* Inactive hairline background line */}
                      <div className="absolute top-4 bottom-0 w-px bg-hairline left-1/2 -translate-x-1/2" />
                      
                      {/* Active green filled line */}
                      <div
                        className={`absolute top-4 bottom-0 w-px bg-ledger-green left-1/2 -translate-x-1/2 transition-all duration-500 origin-top ${
                          index < activeStep ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                        }`}
                      />
                    </>
                  )}

                  {/* Marker Dot (Green filled circle matching Ledger Spine style) */}
                  <div className="relative z-10 mt-1 flex items-center justify-center">
                    {/* Pulsing halo ring for current active step */}
                    {isCurrent && (
                      <div className="absolute -inset-1.5 rounded-full bg-ledger-green/20 animate-pulse-gentle" />
                    )}

                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-xs ${
                        isCompleted
                          ? 'bg-ledger-green border-paper ring-2 ring-ledger-green/30 scale-105'
                          : 'bg-paper border-hairline scale-95'
                      }`}
                    />
                  </div>
                </div>

                {/* Step Content */}
                <div
                  className={`flex-1 transition-all duration-500 pb-16 sm:pb-24 ${
                    isCompleted ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Step label & tag */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-ledger-green tracking-wider">
                        0{step.stepNumber}
                      </span>
                      <span className="text-hairline">/</span>
                      <span className="font-mono text-xs text-slate uppercase tracking-wider">
                        {step.tag}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-display text-2xl sm:text-3xl font-medium text-ink tracking-tight">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="font-body text-base sm:text-lg text-slate leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
