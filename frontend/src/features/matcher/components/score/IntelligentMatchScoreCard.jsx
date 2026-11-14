import {
  ShieldAlert,
  ArrowRight,
  ArrowLeftRight,
  History,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function IntelligentMatchScoreCard({ onScrollToSkills }) {
  const {
    currentMatch,
    runResumeComparison,
    setIsHistoryModalOpen,
  } = useJobMatcher();

  if (!currentMatch) return null;

  const score = currentMatch.overallScore;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-xl backdrop-blur-md">
      {/* Decorative ambient blurred glow */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              Explainable Compatibility Engine
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Evaluated: {currentMatch.resumeName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runResumeComparison}
              className="h-8 text-xs gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compare All Resumes</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Saved Matches</span>
            </Button>
          </div>
        </div>

        {/* Overall Score + Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Heuristic Gauge (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl border border-border/70 bg-card/60 text-center space-y-3">
            <div className="relative flex items-center justify-center">
              <svg className="h-36 w-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-muted/40"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-primary"
                  strokeWidth="10"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {score}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Compatibility
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Badge variant="success" className="text-xs font-semibold px-2 py-0.5">
                {currentMatch.scoreRating}
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {currentMatch.scoreSummary}
              </p>
            </div>
          </div>

          {/* 7 Breakdown Vectors (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Granular Alignment Breakdown (7 Vectors)
              </span>
              <button
                type="button"
                onClick={onScrollToSkills}
                className="text-primary text-[11px] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Inspect Skill Matrix</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentMatch.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-border/70 bg-card/75 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground truncate pr-2">
                      {cat.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 shrink-0">
                      {cat.score}%
                    </Badge>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {cat.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground font-semibold">Evaluation Transparency: </strong>
            {currentMatch.disclaimer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
