import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import HeroTransformGraphic from './HeroTransformGraphic';

export default function Hero() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Left-Aligned Editorial Header */}
        <div className="max-w-4xl space-y-6 sm:space-y-8 animate-fade-rise">
          
          {/* Eyebrow badge */}
          <div>
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-widest font-mono py-1 px-3.5 border-hairline bg-paper-dark/70 text-slate font-medium"
            >
              Meeting transcription & summaries
            </Badge>
          </div>

          {/* Oversized Headline (Fraunces ~80-96px on desktop) */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-normal tracking-tight text-ink leading-[1.04]">
            Every meeting, kept like a ledger.
          </h1>

          {/* Subhead */}
          <p className="font-body text-lg sm:text-xl text-slate max-w-2xl leading-relaxed font-normal">
            Upload the recording. Get a clean transcript, the decisions that were actually made, and the tasks that came out of it — written down the way it should have been all along.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" asChild className="shadow-sm">
              <Link to="/app" className="no-underline">
                Open the ledger →
              </Link>
            </Button>

            <Button
              variant="link"
              onClick={() => scrollToSection('how-it-works')}
              className="text-base text-slate hover:text-ink cursor-pointer flex items-center gap-1.5"
            >
              See how it works <span aria-hidden="true">↓</span>
            </Button>
          </div>

        </div>

        {/* Signature Transform Graphic */}
        <div className="mt-14 sm:mt-20">
          <HeroTransformGraphic />
        </div>

      </div>
    </section>
  );
}
