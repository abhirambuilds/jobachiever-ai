import { AlertTriangle, CheckCircle, Clock, Flame, Sparkles } from 'lucide-react';

export default function SkillGapOverviewCard({
  skillGapData,
  onAnalyze,
  isAnalyzing = false,
  provider = 'GROQ',
  model = null,
}) {
  const demonstrated = skillGapData?.demonstratedSkills || [];
  const developing = skillGapData?.developingSkills || [];
  const missing = skillGapData?.missingEvidenceSkills || [];
  const critical = skillGapData?.criticalPriorities || [];
  const total = (skillGapData?.allEvaluatedSkills || []).length || (demonstrated.length + developing.length + missing.length);

  const demonstratedPct = total > 0 ? Math.round((demonstrated.length / total) * 100) : 0;
  const readyPct = total > 0 ? Math.round(((demonstrated.length + (developing.length * 0.5)) / total) * 100) : 0;

  return (
    <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              AI Skill Readiness Index
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Provider: {provider} {model ? `(${model})` : ''}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mt-1">
            Role Readiness: {readyPct}%
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            {skillGapData?.summary ||
              'Analyze your verified profile achievements against role benchmarks to uncover critical opportunities.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Analyzing Career Profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{skillGapData ? 'Re-Analyze Skills' : 'Analyze Skills'}</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Demonstrated Skills Alignment</span>
          <span className="font-bold text-foreground">{demonstratedPct}% Verified Evidence</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${demonstratedPct}%` }}
            title={`Demonstrated: ${demonstrated.length}`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${total > 0 ? (developing.length / total) * 100 : 0}%` }}
            title={`Developing: ${developing.length}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Demonstrated ({demonstrated.length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Developing ({developing.length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-border" />
            Missing Evidence ({missing.length})
          </span>
        </div>
      </div>

      {/* Granular Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium">Demonstrated</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{demonstrated.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Strong evidence found</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-medium">Developing</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{developing.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Partial / self-reported</p>
        </div>

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-medium">Missing Evidence</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{missing.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Required for role</p>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-medium">Critical Priority</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{critical.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Urgent market demand</p>
        </div>
      </div>
    </div>
  );
}
