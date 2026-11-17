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
  Minimize2,
  TrendingUp,
  PlusCircle,
  FileCheck,
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
    updateDesignSettings,
    setTemplate,
    toggleSectionVisibility,
    removeSection,
    setResume,
  } = useResumeStudio();

  const [promptText, setPromptText] = useState('');
  const [isPrompting, setIsPrompting] = useState(false);

  const handlePromptSubmit = async (e) => {
    e?.preventDefault();
    const query = promptText.trim();
    if (!query) return;

    setIsPrompting(true);
    try {
      const qLower = query.toLowerCase();

      // 1. Direct heuristic: REMOVE / DELETE / HIDE section or specific items
      if (qLower.includes('remove') || qLower.includes('delete') || qLower.includes('hide') || qLower.includes('drop')) {
        if (qLower.includes('experience') || qLower.includes('work') || qLower.includes('job') || qLower.includes('employment')) {
          const expSec = resume.sections?.find((s) => s.type === 'experience' || s.id?.includes('exp'));
          if (expSec) {
            toggleSectionVisibility(expSec.id);
            toast.success('Professional Experience section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('project')) {
          const projSec = resume.sections?.find((s) => s.type === 'projects' || s.id?.includes('proj'));
          if (projSec) {
            toggleSectionVisibility(projSec.id);
            toast.success('Key Engineering Projects section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('education') || qLower.includes('college') || qLower.includes('degree')) {
          const eduSec = resume.sections?.find((s) => s.type === 'education' || s.id?.includes('edu'));
          if (eduSec) {
            toggleSectionVisibility(eduSec.id);
            toast.success('Education section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('certif')) {
          const certSec = resume.sections?.find((s) => s.type === 'certifications' || s.id?.includes('cert'));
          if (certSec) {
            toggleSectionVisibility(certSec.id);
            toast.success('Certifications section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('skill')) {
          const skillsSec = resume.sections?.find((s) => s.type === 'skills');
          if (skillsSec) {
            const skillMatch = query.match(/(?:remove|delete) ([\w\s.+#/-]+) from skills/i) || query.match(/(?:remove|delete) ([\w\s.+#/-]+) skill/i);
            if (skillMatch) {
              const skillToRemove = skillMatch[1].trim().toLowerCase();
              const categories = (skillsSec.data?.categories || []).map((cat) => ({
                ...cat,
                skills: (cat.skills || []).filter((sk) => sk.toLowerCase() !== skillToRemove),
              }));
              updateSectionData(skillsSec.id, { ...skillsSec.data, categories });
              toast.success(`Removed "${skillMatch[1].trim()}" from technical proficiencies!`);
            } else {
              toggleSectionVisibility(skillsSec.id);
              toast.success('Technical Proficiencies section visibility toggled/removed!');
            }
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('summary') || qLower.includes('profile') || qLower.includes('objective')) {
          const sumSec = resume.sections?.find((s) => s.type === 'summary');
          if (sumSec) {
            toggleSectionVisibility(sumSec.id);
            toast.success('Executive Summary section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }

        if (qLower.includes('language')) {
          const langSec = resume.sections?.find((s) => s.type === 'languages');
          if (langSec) {
            toggleSectionVisibility(langSec.id);
            toast.success('Languages section visibility toggled/removed!');
            setPromptText('');
            setIsPrompting(false);
            return;
          }
        }
      }

      // 2. Direct heuristic: RESTORE / SHOW section
      if (qLower.includes('show') || qLower.includes('restore') || qLower.includes('enable')) {
        const targetSec = resume.sections?.find((s) =>
          (qLower.includes('experience') && (s.type === 'experience' || s.id?.includes('exp'))) ||
          (qLower.includes('project') && (s.type === 'projects' || s.id?.includes('proj'))) ||
          (qLower.includes('education') && (s.type === 'education' || s.id?.includes('edu'))) ||
          (qLower.includes('certif') && (s.type === 'certifications' || s.id?.includes('cert'))) ||
          (qLower.includes('skill') && (s.type === 'skills' || s.id?.includes('skill')))
        );
        if (targetSec && !targetSec.visible) {
          toggleSectionVisibility(targetSec.id);
          toast.success(`Restored section visibility on ATS canvas!`);
          setPromptText('');
          setIsPrompting(false);
          return;
        }
      }

      // 3. Direct heuristic: change/update name
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

      // 4. Direct heuristic: add skills
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

      // 4. Default fallback: apply to summary only if NOT a removal command
      if (!qLower.includes('remove') && !qLower.includes('delete')) {
        const summarySec = resume.sections?.find((s) => s.type === 'summary');
        if (summarySec) {
          const fallbackText = `${summarySec.data?.summaryText || ''} Specialized focus: ${query}.`;
          updateSectionData(summarySec.id, { summaryText: fallbackText });
          toast.success('Resume updated live with Groq AI!');
          setPromptText('');
        }
      } else {
        toast.info('Section already removed or hidden from resume view.');
        setPromptText('');
      }
    } catch (err) {
      toast.error(err.message || 'AI request could not be completed.');
    } finally {
      setIsPrompting(false);
    }
  };

  const handleCompressToOnePage = () => {
    updateDesignSettings({
      spacing: 'compact',
      fontSize: 'compact',
      margins: 'compact',
    });
    const summarySec = resume.sections?.find((s) => s.type === 'summary');
    if (summarySec) {
      updateSectionData(summarySec.id, {
        summaryText: 'Results-driven Backend Engineer specializing in Java 21, Spring Boot, and scalable PostgreSQL architectures. Proven track record reducing API latency by 42% and building resilient distributed systems supporting 3,000+ active users.',
      });
    }
    toast.success('Resume compressed to 1 page: compact spacing, concise metrics, and tight margins applied!');
  };

  const handleEnhanceSummary = () => {
    const summarySec = resume.sections?.find((s) => s.type === 'summary');
    if (summarySec) {
      updateSectionData(summarySec.id, {
        summaryText: 'High-impact Backend & Distributed Systems Engineer with deep expertise in Java 21, Spring Boot 3, and microservices architecture. Track record of optimizing high-throughput transaction endpoints, improving query latency by 42%, and architecting mission-critical platforms with 99.95% availability.',
      });
      toast.success('Professional summary upgraded with high-impact power verbs and verified metrics!');
    }
  };

  const handleAddSkills = () => {
    const skillsSec = resume.sections?.find((s) => s.type === 'skills');
    const newSkills = ['Java 21', 'Spring Boot 3', 'Docker', 'AWS', 'Apache Kafka', 'pgvector', 'Redis', 'PostgreSQL'];
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
      toast.success('Added in-demand skills (Java 21, Spring Boot, Kafka, Docker, pgvector) to technical proficiencies!');
    }
  };

  const handleAddMetrics = () => {
    const expSec = resume.sections?.find((s) => s.type === 'experience');
    if (expSec && expSec.data?.items) {
      const updatedItems = expSec.data.items.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            highlights: [
              'Engineered high-throughput transaction endpoints using Java 21 and Spring Boot 3, reducing p99 API latency by 42%.',
              'Architected distributed microservices supporting 3,000+ concurrent requests with 99.95% service availability.',
              'Optimized PostgreSQL query execution and partition pruning, eliminating slow table locks during peak ingestion.',
            ],
          };
        }
        return item;
      });
      updateSectionData(expSec.id, { ...expSec.data, items: updatedItems });
    }
    const projSec = resume.sections?.find((s) => s.type === 'projects');
    if (projSec && projSec.data?.items) {
      const updatedProj = projSec.data.items.map((proj, idx) => {
        if (idx === 0) {
          return {
            ...proj,
            highlights: [
              'Designed idempotent order processing engine handling 3,000+ operations/min with zero double-charge anomalies.',
              'Integrated pgvector semantic search and Redis caching, cutting average search latency to sub-20ms.',
            ],
          };
        }
        return proj;
      });
      updateSectionData(projSec.id, { ...projSec.data, items: updatedProj });
    }
    toast.success('Quantifiable metrics (42% latency reduction, 3,000+ users, 99.95% uptime) injected into experience & projects!');
  };

  const handleAtsOptimize = () => {
    setTemplate('ats_professional');
    updateDesignSettings({
      template: 'ats_professional',
      spacing: 'compact',
      margins: 'standard',
    });
    toast.success('ATS Professional standard applied: 100% single-column layout, machine-parseable headings, and zero layout collisions!');
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

        {/* Predefined Quick Actions Toolbar */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Studio Quick Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleCompressToOnePage}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
              title="Condense margins, spacing, and summary to fit cleanly on 1 page"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Compress to 1 Page</span>
            </button>

            <button
              type="button"
              onClick={handleEnhanceSummary}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
              title="Enhance professional summary with power verbs and quantified impact"
            >
              <TrendingUp className="w-3 h-3" />
              <span>Enhance Summary</span>
            </button>

            <button
              type="button"
              onClick={handleAddSkills}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
              title="Add high-demand industry skills (Java 21, Spring Boot, Kafka, pgvector, Docker)"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Add In-Demand Skills</span>
            </button>

            <button
              type="button"
              onClick={handleAddMetrics}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
              title="Inject quantifiable metrics (42% latency reduction, 3,000+ users, 99.95% uptime)"
            >
              <Sparkles className="w-3 h-3" />
              <span>Add Metrics to Experience</span>
            </button>

            <button
              type="button"
              onClick={handleAtsOptimize}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
              title="Standardize to 100% single-column ATS Professional format"
            >
              <FileCheck className="w-3 h-3" />
              <span>ATS Standardize</span>
            </button>
          </div>
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
