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
      aria-label="Demo Presentation Mode Indicator"
      className="sticky top-0 z-50 w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-background to-amber-500/10 px-4 py-2 backdrop-blur-md shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Indicator & Identity */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant="outline"
            className="border-amber-500/60 bg-amber-500/20 text-amber-500 dark:text-amber-400 font-semibold px-2 py-0.5 text-[11px] uppercase tracking-wider flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Interactive Demo Mode</span>
          </Badge>

          <span className="font-medium text-foreground">
            Persona: <strong className="text-amber-500 dark:text-amber-400">Aarav Sharma</strong> (Senior Backend SWE • Bengaluru)
          </span>

          <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground text-[11px]">
            <Info className="h-3 w-3" />
            <span>Isolated demonstration sandbox • Real data untouched</span>
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
            title="Start or resume guided product walkthrough"
          >
            <Compass className="h-3 w-3" />
            <span>Guided Tour</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
            className="h-7 text-xs px-2.5 gap-1.5 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
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
            className="h-7 text-xs px-2.5 gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
