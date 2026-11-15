import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Layers,
  FileSearch,
  Cpu,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { useProfile } from '@/hooks/useProfile';
import { ANALYSIS_MODES, TARGET_INDUSTRIES } from '@/services/resumeAnalysisService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

const iconMap = {
  Layers,
  Target,
  FileSearch,
  Cpu,
};

export function AnalysisConfigPanel() {
  const {
    config,
    setConfig,
    runAnalysis,
    isAnalyzing,
    analysisProgress,
    analysisStepMessage,
    analysisError,
    selectedResume,
    hasConsent,
    selectedProvider,
  } = useAnalyzer();

  const { profile } = useProfile();
  const [showJdInput, setShowJdInput] = useState(false);

  const careerTracks = profile?.careerTracks || [
    { id: 'track-1', name: 'Full-Stack Engineer', targetRole: 'Senior Full-Stack Engineer' },
  ];

  const handleTrackChange = (trackId) => {
    const selected = careerTracks.find((t) => t.id === trackId);
    if (selected) {
      setConfig((prev) => ({
        ...prev,
        careerTrackId: selected.id,
        careerTrackName: selected.name,
        targetRole: selected.targetRole || prev.targetRole,
      }));
    }
  };

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Analysis Mode &amp; Target Persona Configuration</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure how the intelligence engine audits your document against industry requirements.
          </p>
        </div>

        {/* 1. Analysis Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Select Evaluation Lens
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ANALYSIS_MODES.map((mode) => {
              const Icon = iconMap[mode.icon] || FileText;
              const isSelected = config.mode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, mode: mode.id }))}
                  className={`text-left rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-glow-xs scale-[1.01]'
                      : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-muted text-muted-foreground border-border/60'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && (
                        <Badge variant="ai" className="text-[9px] px-1.5 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-bold text-foreground block pt-1">
                      {mode.name}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {mode.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Target Persona & Industry Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Career Track */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Target Career Track</span>
            </label>
            <select
              value={config.careerTrackId}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              {careerTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              <span>Target Job Title</span>
            </label>
            <Input
              value={config.targetRole}
              onChange={(e) => setConfig((prev) => ({ ...prev, targetRole: e.target.value }))}
              placeholder="e.g. Senior Backend Engineer"
              className="text-xs h-9"
            />
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Target Industry</span>
            </label>
            <select
              value={config.targetIndustry}
              onChange={(e) => setConfig((prev) => ({ ...prev, targetIndustry: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              {TARGET_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Optional Job Description Collapsible */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowJdInput(!showJdInput)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            {showJdInput ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>
              {showJdInput ? 'Hide Job Description Alignment' : '+ Add Specific Job Description for Keyword Scoring (Optional)'}
            </span>
          </button>

          {showJdInput && (
            <div className="mt-2.5 space-y-2 animate-in fade-in">
              <textarea
                value={config.jobDescription}
                onChange={(e) => setConfig((prev) => ({ ...prev, jobDescription: e.target.value }))}
                placeholder="Paste the target job description or requirements here to calculate keyword overlap and semantic missing competencies..."
                rows={4}
                className="w-full rounded-xl border border-input bg-background/80 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
              <span className="text-[10px] text-muted-foreground">
                {config.jobDescription.length} characters entered. Analysis evaluates keyword density against this listing.
              </span>
            </div>
          )}
        </div>

        {/* Consent warning notice if not yet granted */}
        {!hasConsent && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex items-start gap-3 text-xs text-amber-500">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">External AI Processing Consent Disabled</p>
              <p className="text-muted-foreground leading-relaxed">
                AI Resume Analysis sends extracted text to your configured AI provider ({selectedProvider || 'GROQ'}).
                To protect candidate privacy, you must explicitly enable external AI processing before running analyses.
              </p>
              <Link to="/settings/ai" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline pt-0.5">
                <span>Configure AI Provider Settings &amp; Grant Consent</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* 4. Action Button & Progress Indicator */}
        <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Zero-Fabrication Guardrail Enforced.</span>
            </span>
            <span>•</span>
            <span className="font-mono text-primary font-medium">
              Provider: {selectedProvider || 'GROQ'}
            </span>
          </div>

          <Button
            type="button"
            variant="ai"
            size="lg"
            onClick={runAnalysis}
            disabled={!selectedResume || isAnalyzing}
            className="gap-2 shadow-glow-sm text-xs sm:text-sm font-semibold px-6"
          >
            {isAnalyzing ? (
              <>
                <Spinner size="xs" />
                <span>Auditing Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>Run AI Resume Analysis</span>
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar during execution */}
        {isAnalyzing && (
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Spinner size="xs" />
                <span>{analysisStepMessage}</span>
              </span>
              <span className="font-mono text-primary font-bold">{analysisProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {analysisError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
