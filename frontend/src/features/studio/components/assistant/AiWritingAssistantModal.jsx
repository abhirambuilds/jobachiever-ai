import { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import {
  generateWritingAssistance,
  STUDIO_ACTIONS,
  WRITING_MODES,
} from '@/services/resumeStudioService';

export function AiWritingAssistantModal() {
  const { aiAssistantState, closeAiAssistant } = useResumeStudio();

  // Normalize incoming context
  const sectionHint = typeof aiAssistantState.context === 'string'
    ? aiAssistantState.context
    : (aiAssistantState.context?.section || 'bullet');

  // Derive initial action from context
  const getInitialAction = useCallback(() => {
    if (sectionHint === 'summary') return 'IMPROVE_SUMMARY';
    if (sectionHint === 'project' || sectionHint === 'projects') return 'IMPROVE_PROJECT';
    if (sectionHint === 'experience') return 'IMPROVE_EXPERIENCE';
    return 'IMPROVE_BULLET';
  }, [sectionHint]);

  const [selectedAction, setSelectedAction] = useState(getInitialAction);
  const [selectedMode, setSelectedMode] = useState('PROFESSIONAL');
  const [activeText, setActiveText] = useState(aiAssistantState.text || '');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [showTargetJobInputs, setShowTargetJobInputs] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [editableSuggestedText, setEditableSuggestedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [consentMissing, setConsentMissing] = useState(false);

  // Sync state when modal is opened with new text/context
  useEffect(() => {
    if (aiAssistantState.isOpen) {
      setActiveText(aiAssistantState.text || '');
      setSelectedAction(getInitialAction());
      setResult(null);
      setErrorMessage(null);
      setConsentMissing(false);
      setCopied(false);
      if (typeof aiAssistantState.context === 'object' && aiAssistantState.context) {
        if (aiAssistantState.context.jobTitle) setTargetJobTitle(aiAssistantState.context.jobTitle);
        if (aiAssistantState.context.targetJobDescription) setTargetJobDescription(aiAssistantState.context.targetJobDescription);
      }
    }
  }, [aiAssistantState.isOpen, aiAssistantState.text, aiAssistantState.context, getInitialAction]);

  if (!aiAssistantState.isOpen) return null;

  const handleGenerate = async (overrideAction = selectedAction, overrideMode = selectedMode) => {
    if (!activeText.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setConsentMissing(false);
    setCopied(false);

    try {
      const contextObj = {
        section: sectionHint,
        ...(typeof aiAssistantState.context === 'object' ? aiAssistantState.context : {}),
      };
      if (targetJobTitle.trim()) contextObj.job_title = targetJobTitle.trim();
      if (targetJobDescription.trim()) contextObj.target_job_description = targetJobDescription.trim();

      const response = await generateWritingAssistance({
        action: overrideAction,
        sourceText: activeText,
        context: contextObj,
        writingMode: overrideMode,
        numAlternatives: overrideAction === 'GENERATE_ALTERNATIVES' ? 3 : 1,
      });

      setResult(response);
      setActiveSuggestionIndex(0);
      const firstSug = response.suggestions?.[0];
      setEditableSuggestedText(firstSug?.suggestedText || firstSug?.suggested_text || '');
    } catch (err) {
      const msg = err.message || 'Failed to generate writing suggestions.';
      if (msg.includes('consent is required') || err.status === 403) {
        setConsentMissing(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (index) => {
    setActiveSuggestionIndex(index);
    const sug = result?.suggestions?.[index];
    setEditableSuggestedText(sug?.suggestedText || sug?.suggested_text || '');
    setCopied(false);
  };

  const handleCopy = () => {
    if (!editableSuggestedText) return;
    navigator.clipboard.writeText(editableSuggestedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    const textToApply = editableSuggestedText.trim();
    if (textToApply && aiAssistantState.onApply) {
      aiAssistantState.onApply(textToApply);
    }
    closeAiAssistant();
  };

  const activeSuggestion = result?.suggestions?.[activeSuggestionIndex];
  const confidence = activeSuggestion?.confidence || 'HIGH';
  const unsupportedClaims = activeSuggestion?.unsupportedClaims || activeSuggestion?.unsupported_claims || [];
  const warnings = activeSuggestion?.warnings || [];
  const changes = activeSuggestion?.changes || [];
  const preservedFacts = activeSuggestion?.preservedFacts || activeSuggestion?.preserved_facts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">AI Writing Assistant</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {sectionHint}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Fact-preserving writing enhancement • Zero fabrication guaranteed</p>
            </div>
          </div>
          <button
            onClick={closeAiAssistant}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Missing Consent Alert */}
          {consentMissing && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">AI Processing Consent Required</div>
                  <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-300/90">
                    To comply with data privacy policies, explicit user consent is required before dispatching resume text to AI providers.
                  </p>
                </div>
              </div>
              <a
                href="/settings/ai"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-md shrink-0 flex items-center gap-1"
              >
                <span>Grant Consent</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Enhancement Action Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Enhancement Action
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {STUDIO_ACTIONS.map((act) => {
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      setSelectedAction(act.id);
                      if (act.id === 'TAILOR_TO_JOB') {
                        setShowTargetJobInputs(true);
                      }
                    }}
                    className={`px-2.5 py-2 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary ring-1 ring-primary font-semibold text-foreground'
                        : 'bg-card border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <div className="truncate text-xs font-medium text-foreground">{act.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stylistic Writing Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Stylistic Mode
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WRITING_MODES.map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      isSelected
                        ? 'bg-secondary text-secondary-foreground border-secondary font-medium'
                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
                    }`}
                    title={mode.description}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Job Context (Toggleable or auto-expanded for TAILOR_TO_JOB) */}
          <div className="border border-border/80 rounded-lg p-2.5 bg-muted/10 space-y-2">
            <button
              type="button"
              onClick={() => setShowTargetJobInputs((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Target Job Context (Optional for Role Alignment)</span>
              </div>
              {showTargetJobInputs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTargetJobInputs && (
              <div className="space-y-2 pt-2 border-t border-border/60 animate-in fade-in duration-100">
                <input
                  type="text"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="Target Role (e.g. Senior Backend Engineer, Staff Architect)..."
                  className="w-full text-xs p-2 bg-background border border-border rounded-md"
                />
                <textarea
                  rows={2}
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                  placeholder="Paste relevant job description snippet or key requirements..."
                  className="w-full text-xs p-2 bg-background border border-border rounded-md leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Source Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Original Text to Enhance
              </label>
              <span className="text-[10px] font-mono text-muted-foreground">
                {activeText.length} characters
              </span>
            </div>
            <textarea
              rows={3}
              value={activeText}
              onChange={(e) => setActiveText(e.target.value)}
              placeholder="Paste or enter sentence, bullet, or summary text..."
              className="w-full text-xs p-2.5 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !activeText.trim()}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating fact-preserving suggestions...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate AI Enhancement</span>
              </>
            )}
          </button>

          {/* Suggestions Display & Comparison */}
          {result && result.suggestions?.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Variations Tabs if multiple */}
              {result.suggestions.length > 1 && (
                <div className="flex items-center gap-1.5 border-b border-border/80 pb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Variations:</span>
                  {result.suggestions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(idx)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        activeSuggestionIndex === idx
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      Option {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Suggestion Card */}
              <div className="p-3.5 rounded-lg bg-card border border-primary/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">AI Recommended Revision</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        confidence === 'HIGH'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : confidence === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {confidence} Confidence
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Editable Preview */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Editable Result (Review and refine before applying):
                  </label>
                  <textarea
                    rows={3}
                    value={editableSuggestedText}
                    onChange={(e) => setEditableSuggestedText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-background border border-border rounded-md font-medium text-foreground leading-relaxed focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Explainable Rationale */}
                {activeSuggestion?.reason && (
                  <div className="p-2.5 rounded-md bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground">Rationale & Value:</div>
                    <p className="leading-relaxed">{activeSuggestion.reason}</p>
                  </div>
                )}

                {/* Changes List */}
                {changes.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Applied Improvements
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {changes.map((chg, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground border border-border/60"
                        >
                          {chg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preserved Facts */}
                {preservedFacts.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Preserved Verified Facts</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {preservedFacts.map((fact, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anti-fabrication warnings */}
                {(unsupportedClaims.length > 0 || warnings.length > 0) && (
                  <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Candidate Fact-Checking Notice</span>
                    </div>
                    <p className="leading-snug">
                      Any bracketed placeholders (such as <code>[verified percentage]</code>) must be replaced with your verified numbers before publishing.
                    </p>
                    {warnings.map((w, i) => (
                      <div key={i} className="text-[10px] opacity-90">• {w}</div>
                    ))}
                  </div>
                )}

                {/* Action Bar inside Result */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Regenerate Fresh Angle</span>
                  </button>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Provider: {result.provider || 'GROQ'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Zero Fabrication Guarantee Badge */}
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Zero-Fabrication Guarantee:</strong> JobAchiever AI restructures impact without inventing false metrics, technologies, or titles. All suggestions update your editor draft state only until explicitly saved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={closeAiAssistant}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!editableSuggestedText.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
