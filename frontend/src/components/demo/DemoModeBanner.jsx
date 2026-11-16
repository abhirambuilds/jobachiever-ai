import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, RotateCcw, LogOut, Info, Compass, LayoutDashboard } from 'lucide-react';
import { isDemoMode, disableDemoMode } from '@/demo/demoConfig';
import { demoService } from '@/demo/demoService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

export function DemoModeBanner() {
  const [active, setActive] = useState(() => isDemoMode());
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStateChange = (e) => {
      setActive(Boolean(e.detail?.active ?? isDemoMode()));
    };

    window.addEventListener('jobachiever:demo-state-changed', handleStateChange);
    return () => {
      window.removeEventListener('jobachiever:demo-state-changed', handleStateChange);
    };
  }, []);

  if (!active) {
    return null;
  }

  const handleReset = async () => {
    setIsResetting(true);
    try {
      demoService.resetDemoState();
      toast.success('Demo environment state successfully restored to initial baseline.');
    } catch {
      toast.error('Failed to reset demo state.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExit = () => {
    disableDemoMode();
    toast.info('Exited Interactive Demo Mode. Returned to standard application.');
    navigate('/');
  };

  return (
    <div
      role="region"
      aria-label="Platform Workspace Indicator"
      className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5 px-4 py-1.5 backdrop-blur-md shadow-xs transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Indicator & Identity */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant="outline"
            className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 text-[11px] tracking-wide flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Demo Mode</span>
          </Badge>

          <span className="font-medium text-foreground">
            Candidate: <strong className="text-primary">Aarav Sharma</strong> (IIT Bombay • SDE-2 at Razorpay • Bengaluru)
          </span>

          <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground text-[11px]">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>AI Provider: Groq Cloud LPU • Live Database Synchronized</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {location.pathname !== '/dashboard' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
              title="Return to Dashboard"
            >
              <LayoutDashboard className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('jobachiever:start-demo-tour'))}
            className="h-7 text-xs px-2.5 gap-1.5 border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-semibold shadow-xs"
            title="Start guided feature tour"
          >
            <Compass className="h-3 w-3" />
            <span>Product Tour</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
            className="h-7 text-xs px-2 gap-1 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Reset demo data to initial baseline"
          >
            <RotateCcw className={`h-3 w-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo State</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Exit demo mode"
          >
            <LogOut className="h-3 w-3" />
            <span>Exit Demo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
