import {
  History,
  ArrowRight,
  ShieldAlert,
  Edit3,
  ArrowLeftRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ScoreOverviewHeader({ onScrollToSentences }) {
  const {
    currentAnalysis,
    setIsHistoryModalOpen,
    setIsComparisonModalOpen,
    sentenceReviews,
  } = useAnalyzer();

  if (!currentAnalysis) return null;

  const score = currentAnalysis.overallScore;

  // Prepare chart data from categories
  const chartData = (currentAnalysis.categories || []).map((cat) => ({
    name: cat.name.split(' ')[0], // short name
    fullName: cat.name,
    score: cat.score,
  }));

  const acceptedCount = sentenceReviews.filter((s) => s.status === 'accepted' || s.status === 'modified').length;

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-xl backdrop-blur-md">
      {/* Decorative ambient blurred glow */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 relative z-10 space-y-6">
        {/* Top Header & History shortcut */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              AI Resume Intelligence Report
            </Badge>
            <Badge variant="outline" className="text-xs">
              Mode: {currentAnalysis.config.mode.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Target: {currentAnalysis.config.targetRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <History className="h-3.5 w-3.5 text-amber-400" />
              <span>Analysis History</span>
            </Button>
          </div>
        </div>

        {/* Score Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Heuristic Gauge (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl border border-border/70 bg-card/60 text-center space-y-3">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Ring */}
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

              {/* Center Score Number */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {score}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Out of 100
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <Badge variant="success" className="text-xs font-semibold px-2 py-0.5">
                  {currentAnalysis.scoreRating}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ATS Compatibility &amp; Engineering Quality
              </p>
            </div>
          </div>

          {/* Center: Recharts Category Balance Chart (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Category Benchmark Breakdown</span>
              <span className="text-[10px] text-muted-foreground font-mono">8 Evaluation Vectors</span>
            </div>

            <div className="h-44 w-full bg-card/40 rounded-xl border border-border/60 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
                            <p className="font-semibold">{payload[0].payload.fullName}</p>
                            <p className="text-primary font-mono">Score: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 90 ? 'hsl(var(--primary))' : 'hsl(var(--cyan-400, 190 90% 50%))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Quick Actions & Staged Stats (3 cols) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col justify-between h-full">
            <div className="rounded-xl border border-border/70 bg-card/75 p-3.5 space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Interactive Sentence Refinements
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Staged Rewrites:</span>
                <Badge variant={acceptedCount > 0 ? 'success' : 'outline'} className="text-[10px] font-mono">
                  {acceptedCount} of {sentenceReviews.length} Accepted
                </Badge>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ai"
                  size="sm"
                  onClick={onScrollToSentences}
                  className="w-full text-xs justify-between h-8"
                >
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Review Rewrites</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="w-full text-xs justify-between h-8"
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Before / After View</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Heuristic Evaluation Notice */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground font-semibold">Evaluation Transparency: </strong>
            {currentAnalysis.disclaimer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
