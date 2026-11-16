import { Sparkles, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

/**
 * Reusable badge clearly labeling simulated / demonstrative AI outputs.
 * Enforces the core product principle: Ground-truth transparency & no false claims.
 */
export function SimulatedResultBadge({
  text = 'Demo Preview — Illustrative AI Result',
  tooltip = 'This analysis is precomputed from verified demonstration data to showcase the JobAchiever AI experience without requiring live API keys.',
  className = '',
  size = 'default',
}) {
  const isSmall = size === 'sm';

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            <Badge
              variant="outline"
              className={`border-amber-500/40 bg-amber-500/10 text-amber-500 dark:text-amber-400 font-medium gap-1.5 transition-colors hover:bg-amber-500/20 ${
                isSmall ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2.5 py-0.5'
              } ${className}`}
            >
              <Sparkles className={isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
              <span>{text}</span>
              <Info className={isSmall ? 'h-2.5 w-2.5 opacity-60' : 'h-3 w-3 opacity-60'} />
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <p className="font-semibold text-amber-400 mb-1">Demonstration Content</p>
          <p className="text-muted-foreground leading-relaxed">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
