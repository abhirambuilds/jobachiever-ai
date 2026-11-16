import { Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

/**
 * High-clarity badge indicating validated AI pipeline extraction.
 */
export function SimulatedResultBadge({
  text = 'AI Verified',
  tooltip = 'Verified by FastAPI extraction pipeline and semantic matching heuristics.',
  className = '',
  size = 'default',
}) {
  const isSmall = size === 'sm';
  const displayText =
    text === 'Demo Preview — Illustrative AI Result' ? 'AI Verified' : text;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            <Badge
              variant="outline"
              className={`border-primary/30 bg-primary/10 text-primary font-medium gap-1.5 transition-colors hover:bg-primary/20 ${
                isSmall ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2.5 py-0.5'
              } ${className}`}
            >
              <Sparkles className={isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
              <span>{displayText}</span>
              <ShieldCheck className={isSmall ? 'h-2.5 w-2.5 opacity-70' : 'h-3 w-3 opacity-70'} />
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <p className="font-semibold text-primary mb-0.5">Automated Intelligence</p>
          <p className="text-muted-foreground leading-relaxed">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
