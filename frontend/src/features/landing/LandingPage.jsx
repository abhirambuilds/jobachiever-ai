import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ValueSection } from './ValueSection';
import { FeatureShowcase } from './FeatureShowcase';
import { HowItWorks } from './HowItWorks';
import { CareerTracks } from './CareerTracks';
import { AISection } from './AISection';
import { FinalCTA } from './FinalCTA';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValueSection />
        <FeatureShowcase />
        <HowItWorks />
        <CareerTracks />
        <AISection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
