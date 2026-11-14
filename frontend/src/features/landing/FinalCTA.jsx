import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-gradient-to-tr from-primary/25 via-indigo-600/15 to-cyan-400/25 blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/80 to-card/40 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto max-w-2xl space-y-4">
            <Badge variant="ai" dot className="mb-2">
              Career Acceleration
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Next Opportunity{' '}
              <span className="gradient-text-primary">Is Waiting.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Build your profile, discover your possibilities and take control of your career journey.
              Empower your applications with honest, explainable AI intelligence.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="ai"
                size="lg"
                onClick={() => navigate('/register')}
                className="gap-2 px-8 text-base shadow-glow-sm"
              >
                <span>Get Started with JobAchiever AI</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/showcase')}
                className="gap-2 text-base border-border/80"
              >
                <Layers className="h-4 w-4" />
                <span>Explore Design System</span>
              </Button>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/40 mt-8">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>No Credit Card Required</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Zero Hallucination Guarantee</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
