import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RecommendationsPanel({ onScrollToSentences }) {
  const { currentAnalysis } = useAnalyzer();

  if (!currentAnalysis?.recommendations) return null;

  const recs = currentAnalysis.recommendations;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          border: 'border-destructive/40 bg-destructive/5',
          badgeVariant: 'destructive',
          icon: AlertCircle,
          iconColor: 'text-destructive',
          label: 'Critical Priority',
        };
      case 'high':
        return {
          border: 'border-amber-500/40 bg-amber-500/5',
          badgeVariant: 'warning',
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          label: 'High Priority',
        };
      case 'medium':
        return {
          border: 'border-blue-500/40 bg-blue-500/5',
          badgeVariant: 'outline',
          icon: Info,
          iconColor: 'text-blue-500',
          label: 'Medium Priority',
        };
      default:
        return {
          border: 'border-purple-500/40 bg-purple-500/5',
          badgeVariant: 'secondary',
          icon: Sparkles,
          iconColor: 'text-purple-400',
          label: 'Optional Refinement',
        };
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Prioritized Engineering Recommendations
          </h3>
          <p className="text-xs text-muted-foreground">
            Prescriptive, actionable adjustments sorted from critical architecture fixes to polish items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map((rec) => {
          const style = getPriorityStyle(rec.priority);
          const Icon = style.icon;

          return (
            <Card
              key={rec.id}
              className={`border transition-all duration-200 hover:shadow-glow-xs flex flex-col justify-between ${style.border}`}
            >
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <Badge variant={style.badgeVariant} className="text-[10px] gap-1 px-1.5 py-0 font-mono">
                      <Icon className="h-3 w-3" />
                      <span>{style.label}</span>
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Section: {rec.section}
                    </span>
                  </div>

                  {/* Issue */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Identified Issue
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-0.5 leading-snug">
                      {rec.issue}
                    </h4>
                  </div>

                  {/* Why it matters */}
                  <div className="rounded-lg bg-background/50 border border-border/50 p-2.5 text-xs text-muted-foreground space-y-1">
                    <strong className="text-[11px] font-semibold text-foreground block">
                      Why it matters:
                    </strong>
                    <p className="text-[11px] leading-relaxed">{rec.why}</p>
                  </div>

                  {/* Suggested Improvement */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-primary block">
                      Recommended Action
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      {rec.suggestedImprovement}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Zero-Fabrication Guardrail Enforced
                  </span>

                  {rec.actionType === 'sentence_review' ? (
                    <Button
                      type="button"
                      variant="ai"
                      size="sm"
                      onClick={onScrollToSentences}
                      className="h-7 text-xs gap-1.5 shadow-xs"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Link to="/profile">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                        <span>{rec.actionLabel}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
