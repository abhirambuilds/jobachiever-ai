import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { enableDemoMode } from '@/demo/demoConfig';
import { demoToast } from './DemoToast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DemoLaunchCard({ className = '', variant = 'card', label = 'Explore Interactive Demo' }) {
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
        className={`gap-2 border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-semibold shadow-xs ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/50 bg-primary/15 text-primary text-[11px] font-semibold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Quick Access
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Verified Candidate Account
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Sign In as <span className="text-primary">Alex Morgan</span> (Backend Software Engineer)
          </h3>

          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Instant 1-click access to the complete career command center: Master Profile, verified credentials, active applications, and tailored resumes.
          </p>
        </div>

        <Button
          type="button"
          variant="ai"
          size="default"
          onClick={handleLaunch}
          className="shrink-0 gap-2 font-semibold shadow-glow-sm"
        >
          <span>Explore Interactive Demo</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
