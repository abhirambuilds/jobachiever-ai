import { useState } from 'react';
import {
  Clock,
  FileCode,
  History,
  Maximize2,
  Printer,
  Save,
  Target,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Wand2,
  Loader2,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { ResumeRenderer } from '../ResumeRenderer';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';
import { generateWritingAssistance } from '@/services/resumeStudioService';
import { toast } from '@/components/ui/toast';

export function CenterPreviewPanel() {
  const {
    resume,
    designSettings,
    zoom,
    setZoom,
    hasUnsavedChanges,
    isSaving,
    saveCurrentVersion,
    setTailorModalOpen,
    setVersionModalOpen,
    handlePrint,
    exportAsJson,
    versions,
    updateSectionData,
  } = useResumeStudio();

  const [promptText, setPromptText] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);

  const handlePromptSubmit = async (e) => {
    e?.preventDefault();
    const query = promptText.trim();
    if (!query) return;

    setIsPrompting(true);
    try {
      const summarySec = resume.sections?.find((s) => s.type === 'summary');
      const currentSummary = summarySec?.data?.summaryText || '';

      const res = await generateWritingAssistance({
        action: 'IMPROVE_SUMMARY',
        sourceText: currentSummary || `${resume.title || 'Candidate Resume'}. Targeted focus: ${query}`,
        context: {
          section: 'summary',
          user_instruction: query,
        },
        writingMode: 'PROFESSIONAL',
        provider: 'GROQ',
      });

      const suggestion = res.suggestions?.[0]?.suggestedText || res.suggestions?.[0]?.suggested_text;
      if (suggestion) {
        if (summarySec) {
          updateSectionData(summarySec.id, { summaryText: suggestion });
        }
        toast.success('Resume updated live with Groq AI!');
        setPromptText('');
      } else {
        toast.info('AI analyzed request. Check the Writing Assistant for options.');
      }
    } catch (err) {
      toast.error(err.message || 'AI request could not be completed.');
    } finally {
      setIsPrompting(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  const scaleValue = zoom / 100;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/5 dark:bg-black/30">
      {/* 1. Top Action Toolbar */}
      <div className="h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
        {/* Left: Zoom Toolbar */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/60">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium px-1.5 min-w-[42px] text-center text-foreground">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 150}
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-border/80 mx-0.5" />
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded transition-colors flex items-center gap-1"
            title="Fit to 100%"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">100%</span>
          </button>
        </div>

        {/* Center: Save Status Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">ATS Canvas</Badge>
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Saving version...</span>
            </span>
          ) : hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes (cached locally)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Draft up to date</span>
            </span>
          )}
        </div>

        {/* Right: Studio Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Job Tailoring Shortcut */}
          <button
            onClick={() => setTailorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-colors"
            title="Tailor resume against a target job description"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tailor for Job</span>
          </button>

          {/* Versions History */}
          <button
            onClick={() => setVersionModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            title="View saved versions & snapshots"
          >
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Versions</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-background font-mono text-muted-foreground">
              {versions.length}
            </span>
          </button>

          {/* Save Version Button */}
          <button
            onClick={() => saveCurrentVersion('Manual snapshot')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors"
            title="Save new version snapshot"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Version</span>
          </button>

          {/* Print / Export Vector PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
            title="Print or export high-resolution vector PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          {/* Export JSON Schema */}
          <button
            onClick={exportAsJson}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border transition-colors"
            title="Download JSON data schema"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Interactive Groq Prompt Bar */}
      <div className="px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border/60 shrink-0">
        <form onSubmit={handlePromptSubmit} className="max-w-3xl mx-auto flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-xl border border-primary/40 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            <span className="hidden sm:inline">AI Prompt (Groq):</span>
          </div>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type any prompt: e.g. Enhance summary for Senior Backend Engineer with Kafka and microservices..."
            className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPrompting || !promptText.trim()}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors shrink-0"
          >
            {isPrompting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Prompt</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. Paper Canvas Workspace */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center">
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center pb-12"
          style={{
            transform: `scale(${scaleValue})`,
            marginBottom: `${(scaleValue - 1) * 300}px`,
          }}
        >
          {/* A4 Paper Sheet Wrapper */}
          <div className="relative">
            <ResumeRenderer resume={resume} designSettings={designSettings} />

            {/* Page break marker notice */}
            <div className="mt-4 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2 print:hidden">
              <span className="h-px w-12 bg-border" />
              <span>Simulated A4 Dimensions (210mm × 297mm) • Native Vector Print Enabled</span>
              <span className="h-px w-12 bg-border" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
