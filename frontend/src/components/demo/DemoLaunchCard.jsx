import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { enableDemoMode } from '@/demo/demoConfig';
import { demoToast } from './DemoToast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DemoLaunchCard({ className = '', variant = 'card' }) {
  const navigate = useNavigate();

  const handleLaunch = () => {
    enableDemoMode();
    demoToast.launched();
    navigate('/dashboard');
  };

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLaunch}
        className={`gap-2 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 font-semibold shadow-sm ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        <span>Launch Interactive Demo</span>
      </Button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-4 sm:p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-amber-500/60 bg-amber-500/20 text-amber-500 dark:text-amber-400 text-[11px] font-semibold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Emergency Reviewer Mode
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              No API Keys Required
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Explore JobAchiever AI as <span className="text-amber-500 dark:text-amber-400">Alex Morgan</span>
          </h3>

          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Instant 1-click access to the complete career workflow: Master Profile, Resume Intelligence (94% ATS score), Stripe Core Platform JD decomposition, and 91% explainable compatibility match.
          </p>
        </div>

        <Button
          type="button"
          variant="ai"
          size="default"
          onClick={handleLaunch}
          className="shrink-0 gap-2 font-semibold shadow-glow-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
        >
          <span>Enter Demo Mode</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
