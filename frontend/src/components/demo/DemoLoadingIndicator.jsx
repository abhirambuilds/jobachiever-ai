import { Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function DemoLoadingIndicator({
  message = 'Simulating AI reasoning pipeline (Demo)...',
  subMessage = 'Extracting qualifications and evaluating semantic compatibility',
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <Spinner size="lg" className="text-amber-500" />
        <Sparkles className="h-4 w-4 text-amber-400 absolute animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground">{subMessage}</p>
        )}
      </div>
      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
        Demo Sandbox Mode
      </span>
    </div>
  );
}
