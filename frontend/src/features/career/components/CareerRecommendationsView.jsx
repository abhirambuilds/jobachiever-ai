import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  FolderKanban,
  RotateCw,
  Sparkles,
} from 'lucide-react';

export default function CareerRecommendationsView({
  recommendationsData,
  onGenerateRecommendations,
  isGenerating = false,
  provider = 'GROQ',
  model = null,
}) {
  const recommendations = recommendationsData?.recommendations || [];

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Targeted Career Strategy & Recommendations
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Provider: {recommendationsData?.provider || provider} {recommendationsData?.model || model ? `(${recommendationsData?.model || model})` : ''}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mt-1">
            Actionable Strategic Recommendations
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Prioritized strategic interventions designed to address critical qualification gaps and maximize your candidate marketability.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateRecommendations}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Synthesizing Strategy...</span>
            </>
          ) : (
            <>
              {recommendations.length > 0 ? <RotateCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{recommendations.length > 0 ? 'Refresh Recommendations' : 'Generate Recommendations'}</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <Brain className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h4 className="text-sm font-bold text-foreground">No Recommendations Generated</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Generate Recommendations&quot; above to synthesize targeted strategic advice based on your analyzed profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec, idx) => (
            <RecommendationCard key={idx} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }) {
  const CategoryIcon = getCategoryIcon(rec.category);

  return (
    <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatCategory(rec.category)}
              </span>
              <PriorityBadge priority={rec.priority} />
              {rec.estimatedEffort && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted">
                  <Clock className="w-2.5 h-2.5" /> {rec.estimatedEffort}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-foreground mt-1">{rec.title}</h4>
          </div>
        </div>
      </div>

      {/* Rationale */}
      {rec.rationale && (
        <div className="p-3 bg-muted/40 border border-border/50 rounded-lg text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Market Demand Rationale: </span>
          {rec.rationale}
        </div>
      )}

      {/* Target Skills */}
      {rec.targetSkills && rec.targetSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Target Skills:</span>
          {rec.targetSkills.map(skill => (
            <span
              key={skill}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actionable Steps */}
      {rec.actionableSteps && rec.actionableSteps.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-foreground">Actionable Execution Steps:</span>
          <div className="space-y-1.5">
            {rec.actionableSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category) {
  switch (category) {
    case 'SKILL_DEVELOPMENT':
      return BookOpen;
    case 'PRACTICAL_PROJECT':
      return FolderKanban;
    case 'PORTFOLIO_ENHANCEMENT':
      return Sparkles;
    case 'CERTIFICATION':
      return Award;
    case 'CONCEPT_MASTERY':
      return Brain;
    default:
      return BookOpen;
  }
}

function formatCategory(category) {
  if (!category) return 'Skill Enhancement';
  return category.replace(/_/g, ' ');
}

function PriorityBadge({ priority }) {
  if (priority === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <Flame className="w-2.5 h-2.5 fill-current" /> Critical
      </span>
    );
  }
  if (priority === 'HIGH') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        High
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
      Medium
    </span>
  );
}
