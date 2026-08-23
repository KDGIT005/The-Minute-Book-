import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureColumns from '@/components/landing/FeatureColumns';
import ClosingCta from '@/components/landing/ClosingCta';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-ledger-green/20 selection:text-ink">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureColumns />
        <ClosingCta />
      </main>
    </div>
  );
}
