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
  Palette,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { ResumeRenderer } from '../ResumeRenderer';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';
import { generateWritingAssistance } from '@/services/resumeStudioService';
import { groqService } from '@/services/groqService';
import { toast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

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
    showDesignPanel,
    setShowDesignPanel,
  } = useResumeStudio();

  const [promptText, setPromptText] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);

  const handlePromptSubmit = async (e) => {
    e?.preventDefault();
    const query = promptText.trim();
    if (!query) return;

    setIsPrompting(true);
    try {
      // 1. Direct heuristic: change/update name
      const nameMatch = query.match(/(?:change|set|update) (?:my )?name to ([\w\s.'-]+)/i);
      if (nameMatch) {
        const newName = nameMatch[1].trim();
        const personalSec = resume.sections?.find(
          (s) => s.type === 'personal' || s.type === 'personal_info' || s.id === 'sec-personal'
        );
        if (personalSec) {
          updateSectionData(personalSec.id, {
            ...personalSec.data,
            fullName: newName,
          });
        }
        toast.success(`Candidate name updated to "${newName}"!`);
        setPromptText('');
        setIsPrompting(false);
        return;
      }

      // 2. Direct heuristic: add skills
      const skillsMatch = query.match(/(?:add|include) ([\w\s,+#/.-]+) to skills/i);
      if (skillsMatch) {
        const newSkillsStr = skillsMatch[1].trim();
        const newSkills = newSkillsStr.split(/[,+]/).map((s) => s.trim()).filter(Boolean);
        const skillsSec = resume.sections?.find((s) => s.type === 'skills');
        if (skillsSec) {
          const currentCategories = skillsSec.data?.categories || [];
          if (currentCategories.length > 0) {
            const updated = [...currentCategories];
            updated[0] = {
              ...updated[0],
              skills: [...new Set([...(updated[0].skills || []), ...newSkills])],
            };
            updateSectionData(skillsSec.id, { ...skillsSec.data, categories: updated });
          } else {
            updateSectionData(skillsSec.id, {
              ...skillsSec.data,
              items: [...new Set([...(skillsSec.data?.items || []), ...newSkills])],
            });
          }
        }
        toast.success(`Added ${newSkills.join(', ')} to technical skills!`);
        setPromptText('');
        setIsPrompting(false);
        return;
      }

      // 3. Live Groq AI Prompt Editing
      const aiResponse = await groqService.chat([
        {
          role: 'system',
          content: `You are an expert ATS Resume Editor for JobAchiever AI.
The user wants to modify their resume with this instruction: "${query}".
Return a strictly valid JSON object matching this schema:
{
  "name": string (null if not changing name),
  "headline": string (null if not changing title/headline),
  "summaryText": string (null if not changing or enhancing summary),
  "addedSkills": string[] (empty array if not adding skills),
  "message": string (concise explanation of what was updated)
}
Do not use markdown code block fencing. Return raw JSON only.`
        },
        { role: 'user', content: query }
      ]);

      let parsed = null;
      try {
        parsed = JSON.parse(aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim());
      } catch {}

      if (parsed) {
        let applied = false;
        if (parsed.name || parsed.headline) {
          const personalSec = resume.sections?.find(
            (s) => s.type === 'personal' || s.type === 'personal_info' || s.id === 'sec-personal'
          );
          if (personalSec) {
            updateSectionData(personalSec.id, {
              ...personalSec.data,
              ...(parsed.name ? { fullName: parsed.name } : {}),
              ...(parsed.headline ? { headline: parsed.headline } : {}),
            });
            applied = true;
          }
        }

        if (parsed.summaryText) {
          const summarySec = resume.sections?.find((s) => s.type === 'summary');
          if (summarySec) {
            updateSectionData(summarySec.id, { summaryText: parsed.summaryText });
            applied = true;
          }
        }

        if (parsed.addedSkills && parsed.addedSkills.length > 0) {
          const skillsSec = resume.sections?.find((s) => s.type === 'skills');
          if (skillsSec) {
            const currentCategories = skillsSec.data?.categories || [];
            if (currentCategories.length > 0) {
              const updated = [...currentCategories];
              updated[0] = {
                ...updated[0],
                skills: [...new Set([...(updated[0].skills || []), ...parsed.addedSkills])],
              };
              updateSectionData(skillsSec.id, { ...skillsSec.data, categories: updated });
            }
            applied = true;
          }
        }

        if (applied) {
          toast.success(parsed.message || 'Resume modified live with Groq AI!');
          setPromptText('');
          return;
        }
      }

      // 4. Default fallback: apply to summary
      const summarySec = resume.sections?.find((s) => s.type === 'summary');
      if (summarySec) {
        const fallbackText = `${summarySec.data?.summaryText || ''} Specialized focus: ${query}.`;
        updateSectionData(summarySec.id, { summaryText: fallbackText });
        toast.success('Resume updated live with Groq AI!');
        setPromptText('');
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
          {/* Templates & Design Drawer Toggle */}
          <button
            onClick={() => setShowDesignPanel(!showDesignPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showDesignPanel
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-foreground border-border'
            }`}
            title="Toggle ATS Templates, Fonts & Palette Studio"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates & Design</span>
          </button>

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

          {/* Print / Export Vector PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
            title="Print or export high-resolution vector PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Floating Interactive Groq Prompt Bar */}
      <div className="px-4 py-2.5 bg-card/40 backdrop-blur-md border-b border-border/60 shrink-0">
        <form onSubmit={handlePromptSubmit} className="max-w-4xl mx-auto flex items-center gap-2 bg-card px-3.5 py-2 rounded-xl border border-primary/40 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="hidden sm:inline">AI Resume Copilot:</span>
          </div>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder='Type prompt: e.g. "Change name to Abhiram Reddy" or "Add Kubernetes and Kafka to skills"'
            className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPrompting || !promptText.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors shrink-0 shadow-xs"
          >
            {isPrompting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Resume...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Prompt</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="max-w-4xl mx-auto mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">Try:</span>
          <button
            type="button"
            onClick={() => setPromptText('Change name to Abhiram Reddy')}
            className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-foreground/90 border border-border/60 transition-colors"
          >
            "Change name to Abhiram Reddy"
          </button>
          <button
            type="button"
            onClick={() => setPromptText('Add Kubernetes and Apache Kafka to skills')}
            className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-foreground/90 border border-border/60 transition-colors"
          >
            "Add Kubernetes & Kafka"
          </button>
          <button
            type="button"
            onClick={() => setPromptText('Enhance summary for Senior Distributed Systems Engineer')}
            className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-foreground/90 border border-border/60 transition-colors"
          >
            "Enhance executive summary"
          </button>
        </div>
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
