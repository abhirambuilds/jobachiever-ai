import { useState } from 'react';
import {
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { aiWritingService } from '@/services/resumeStudioService';

export function AiWritingAssistantModal() {
  const { aiAssistantState, closeAiAssistant } = useResumeStudio();

  const [selectedGoal, setSelectedGoal] = useState('action_verbs');
  const [activeText, setActiveText] = useState(aiAssistantState.text || '');
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!aiAssistantState.isOpen) return null;

  const handleGenerate = async (goalToRun = selectedGoal) => {
    if (!activeText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await aiWritingService.rewriteSentence(activeText, goalToRun);
      setResult(res);
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (result?.rewritten && aiAssistantState.onApply) {
      aiAssistantState.onApply(result.rewritten);
    }
    closeAiAssistant();
  };

  const goals = [
    { id: 'action_verbs', label: 'Action Verbs & Metrics', desc: 'Strengthens weak opening verbs and highlights quantifiable deliverables.' },
    { id: 'ats_keywords', label: 'ATS Keyword Density', desc: 'Embeds industry-standard phrasing that matches job parser taxonomies.' },
    { id: 'conciseness', label: 'Crisp & Concise', desc: 'Eliminates filler words and passive phrasing for high-impact readability.' },
    { id: 'technical_depth', label: 'Technical Depth', desc: 'Sharpen technical vocabulary, architecture patterns, and engineering scope.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Sentence & Bullet Assistant</h3>
              <p className="text-[11px] text-muted-foreground">Fact-preserving writing enhancement</p>
            </div>
          </div>
          <button
            onClick={closeAiAssistant}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Goal selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Enhancement Objective
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGoal(g.id);
                    handleGenerate(g.id);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedGoal === g.id
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'bg-card border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="text-xs font-bold text-foreground">{g.label}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Original Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Original Sentence or Bullet
            </label>
            <textarea
              rows={3}
              value={activeText}
              onChange={(e) => setActiveText(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary leading-relaxed"
              placeholder="Paste or enter a sentence to improve..."
            />
          </div>

          {/* Generate Button if not yet generated or text changed */}
          {!result && (
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !activeText.trim()}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Analyzing & Rewriting...' : 'Generate AI Enhancement'}</span>
            </button>
          )}

          {/* Results Comparison */}
          {result && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>AI Recommended Revision</span>
                  <span className="text-[10px] font-mono uppercase bg-primary/10 px-1.5 py-0.2 rounded">
                    Score: {result.atsScore}% ATS Fit
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {result.rewritten}
                </p>
              </div>

              {/* Explainable Rationale */}
              {result.explanation && (
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground">Why this is stronger:</div>
                  <p className="leading-relaxed">{result.explanation}</p>
                </div>
              )}

              {/* Re-generate / Try another goal */}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}

          {/* Zero Fabrication principle banner */}
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Zero-Fabrication Guarantee:</strong> JobAchiever AI restructures impact without inventing false metrics. Verify that all numbers match your actual career milestones.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/20">
          <button
            onClick={closeAiAssistant}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!result?.rewritten}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
