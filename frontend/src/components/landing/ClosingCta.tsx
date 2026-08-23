import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ClosingCta() {
  return (
    <section className="pt-20 sm:pt-28 pb-12 sm:pb-16 border-t border-hairline/60 bg-paper">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Editorial Echo CTA Box */}
        <div className="max-w-3xl mb-24 sm:mb-32 space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-ink leading-tight">
            Stop taking notes. <br />
            Start keeping a ledger.
          </h2>
          
          <p className="font-body text-slate text-lg sm:text-xl leading-relaxed max-w-xl">
            Upload your first meeting recording and turn conversations into structured decisions and action items.
          </p>

          <div className="pt-2">
            <Button size="lg" asChild className="shadow-sm">
              <Link to="/app" className="no-underline">
                Open the ledger →
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer with Separator */}
        <div className="space-y-8">
          <Separator />
          
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-slate py-2">
            <div>
              © 2026 The Minute Book
            </div>
            <div className="text-slate font-medium">
              Developed by Kuldeep Dhangad
            </div>
          </footer>
        </div>

      </div>
    </section>
  );
}
