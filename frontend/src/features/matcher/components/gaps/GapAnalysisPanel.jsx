import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function GapAnalysisPanel() {
  const { currentMatch } = useJobMatcher();

  if (!currentMatch?.gaps) return null;

  const gaps = currentMatch.gaps;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0 font-mono">
            <AlertCircle className="h-3 w-3" />
            <span>High Priority Gap</span>
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0 font-mono">
            <AlertTriangle className="h-3 w-3" />
            <span>Medium Priority</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 font-mono">
            <Info className="h-3 w-3 text-cyan-400" />
            <span>Optional Opportunity</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Prioritized Gap &amp; Evidence Analysis
          </h3>
          <p className="text-xs text-muted-foreground">
            Identifies missing or weak evidentiary proof and provides realistic strategies to bridge them honestly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((gap) => (
          <Card
            key={gap.id}
            className="border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col justify-between"
          >
            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  {getPriorityBadge(gap.priority)}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {gap.profileSection}
                  </span>
                </div>

                {/* Requirement */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Target Requirement
                  </span>
                  <h4 className="text-xs font-bold text-foreground mt-0.5 leading-snug">
                    {gap.requirement}
                  </h4>
                </div>

                {/* Current Evidence */}
                <div className="rounded-lg bg-muted/20 border border-border/50 p-2.5 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Current Recorded Evidence:
                  </span>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    {gap.currentEvidence}
                  </p>
                </div>

                {/* Why It Matters */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary block">
                    Why It Matters
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {gap.whyItMatters}
                  </p>
                </div>

                {/* Recommended Next Step */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary block">
                    Realistic Recommendation:
                  </span>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {gap.recommendedStep}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Zero Fabrication Principle
                </span>

                <Link to={gap.actionRoute}>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <span>{gap.actionLabel}</span>
                    <ExternalLink className="h-3 w-3 text-cyan-400" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
