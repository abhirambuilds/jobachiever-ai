import { Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function DemoLoadingIndicator({
  message = 'Running AI reasoning pipeline...',
  subMessage = 'Extracting qualifications and evaluating semantic compatibility',
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <Spinner size="lg" className="text-primary" />
        <Sparkles className="h-4 w-4 text-cyan-400 absolute animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground">{subMessage}</p>
        )}
      </div>
      <span className="text-[10px] uppercase font-mono tracking-wider text-primary/80 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
        AI Pipeline Active
      </span>
    </div>
  );
}
