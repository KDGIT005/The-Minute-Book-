import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function LandingNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Wordmark */}
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <div className="w-8 h-8 rounded-full bg-ledger-green flex items-center justify-center
                        group-hover:scale-105 transition-transform duration-200 shadow-xs">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-paper">
              <path
                d="M3 2h10v12H3V2zm2 3h6M5 8h6M5 11h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold text-ink tracking-tight">
            The Minute Book
          </span>
        </Link>

        {/* Navigation & CTA */}
        <div className="flex items-center gap-6 sm:gap-8">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="nav-link-hover hover:text-ink transition-colors cursor-pointer py-1 bg-transparent border-none"
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo('what-you-get')}
              className="nav-link-hover hover:text-ink transition-colors cursor-pointer py-1 bg-transparent border-none"
            >
              What you get
            </button>
          </nav>

          <Button asChild size="default" className="shadow-xs">
            <Link to="/app" className="no-underline">
              Open the app →
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
}
