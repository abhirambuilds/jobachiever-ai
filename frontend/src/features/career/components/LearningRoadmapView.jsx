import React from 'react';
import {
  Clock,
  Compass,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import MilestoneCard from './MilestoneCard';

export default function LearningRoadmapView({
  roadmap,
  onGenerateRoadmap,
  onUpdateMilestone,
  isGenerating = false,
  provider = 'GROQ',
  model = null,
}) {
  const [customGoal, setCustomGoal] = React.useState('');
  const [showGoalInput, setShowGoalInput] = React.useState(false);

  const phases = roadmap?.phases || [];
  const totalMilestones = roadmap?.totalMilestones || 0;
  const completedMilestones = roadmap?.completedMilestones || 0;
  const inProgressMilestones = roadmap?.inProgressMilestones || 0;
  const progressPct = roadmap?.progressPercentage || 0;

  const handleGenerate = () => {
    onGenerateRoadmap(customGoal.trim() || null);
    setShowGoalInput(false);
  };

  return (
    <div className="space-y-5">
      {/* Roadmap Summary Card */}
      <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Personalized Phased Learning Roadmap
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Provider: {roadmap?.provider || provider} {roadmap?.model || model ? `(${roadmap?.model || model})` : ''}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mt-1">
              {roadmap?.title || 'No Active Learning Roadmap'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              {roadmap?.description ||
                'Generate a dependency-ordered, phased curriculum targeting the critical skill gaps identified in your profile.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowGoalInput(!showGoalInput)}
              className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-lg border border-border transition-colors"
            >
              {showGoalInput ? 'Cancel Goal' : 'Custom Goal'}
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Roadmap...</span>
                </>
              ) : (
                <>
                  {roadmap ? <RotateCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{roadmap ? 'Regenerate Roadmap' : 'Generate Roadmap'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Custom Goal Box */}
        {showGoalInput && (
          <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2 animate-in fade-in">
            <label className="text-xs font-semibold text-foreground">
              Define Target Focus or Custom Horizon (Optional)
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={e => setCustomGoal(e.target.value)}
              placeholder="e.g. Prepare for Staff distributed systems interviews in 3 months..."
              className="w-full text-xs p-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Progress Bar & Stats */}
        {roadmap && (
          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Overall Roadmap Completion</span>
              <span className="font-bold text-foreground">{progressPct}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                <span className="text-muted-foreground text-[11px]">Total Milestones</span>
                <p className="text-lg font-bold text-foreground">{totalMilestones}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Completed</span>
                <p className="text-lg font-bold text-foreground">{completedMilestones}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-primary text-[11px]">In Progress</span>
                <p className="text-lg font-bold text-foreground">{inProgressMilestones}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phased Milestones List */}
      {phases.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <Compass className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h4 className="text-sm font-bold text-foreground">No Roadmap Generated Yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Generate Roadmap&quot; above to synthesize a phased curriculum aligned with your verified career goals.
          </p>
        </div>
      ) : (
        phases.map(phase => (
          <div key={phase.phaseNumber} className="space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {phase.phaseNumber}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{phase.name}</h4>
                {phase.description && (
                  <p className="text-[11px] text-muted-foreground">{phase.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pl-2 sm:pl-3 border-l-2 border-border/60 ml-3.5">
              {(phase.milestones || []).map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onUpdateStatus={onUpdateMilestone}
                  onSaveNotes={onUpdateMilestone}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
