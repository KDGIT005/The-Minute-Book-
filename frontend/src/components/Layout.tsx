import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-hairline bg-paper/85 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group no-underline" title="The Minute Book — Home">
            <div className="w-8 h-8 rounded-full bg-ledger-green flex items-center justify-center
                          group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-paper">
                <path d="M3 2h10v12H3V2zm2 3h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-ink tracking-tight group-hover:text-ledger-green transition-colors">
              The Minute Book
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/app"
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150 no-underline
                ${location.pathname === '/app'
                  ? 'text-ledger-green bg-ledger-green/10 font-semibold'
                  : 'text-slate hover:text-ink'
                }`}
            >
              Meetings
            </Link>
            <Link
              to="/app/upload"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-ink text-paper
                         hover:bg-ink/90 transition-colors duration-150 no-underline shadow-xs"
            >
              Upload audio
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

