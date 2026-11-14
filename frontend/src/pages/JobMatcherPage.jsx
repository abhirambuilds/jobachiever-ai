import { useRef } from 'react';
import {
  Bookmark,
  ArrowLeftRight,
} from 'lucide-react';

import { DocumentProvider } from '@/features/resumes/context/DocumentContext';
import { JobMatcherProvider, useJobMatcher } from '@/features/matcher/context/JobMatcherContext';

import { JobInputPanel } from '@/features/matcher/components/input/JobInputPanel';
import { ProfileResumeSelector } from '@/features/matcher/components/selection/ProfileResumeSelector';
import { JobDecompositionView } from '@/features/matcher/components/intelligence/JobDecompositionView';
import { IntelligentMatchScoreCard } from '@/features/matcher/components/score/IntelligentMatchScoreCard';
import { SkillComparisonMatrix } from '@/features/matcher/components/skills/SkillComparisonMatrix';
import { GapAnalysisPanel } from '@/features/matcher/components/gaps/GapAnalysisPanel';
import { ActionableImprovementsCard } from '@/features/matcher/components/actions/ActionableImprovementsCard';
import { MultiResumeComparisonModal } from '@/features/matcher/components/comparison/MultiResumeComparisonModal';
import { SavedJobAnalysesModal } from '@/features/matcher/components/history/SavedJobAnalysesModal';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function JobMatcherContent() {
  const {
    currentMatch,
    isCompareModalOpen,
    setIsCompareModalOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    runResumeComparison,
  } = useJobMatcher();

  const skillsRef = useRef(null);

  const scrollToSkills = () => {
    skillsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              Explainable Compatibility Engine
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              FastAPI Semantic Matching Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Job Description Analyzer &amp; Resume Matcher
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Deconstruct employer expectations, compare requirement-to-evidence alignment, and
            diagnose skill gaps with absolute factual truthfulness.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runResumeComparison}
            className="text-xs gap-1.5"
          >
            <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
            <span>Compare Resumes</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Bookmark className="h-4 w-4 text-amber-400" />
            <span>Saved Opportunities</span>
          </Button>
        </div>
      </div>

      {/* 1. Job Description Input Workspace (Paste, Upload, Job Details Form, Quick Samples) */}
      <JobInputPanel />

      {/* 2. Resume & Profile Evidence Selection */}
      <ProfileResumeSelector />

      {/* Match Results (Decomposition, Score, Skill Matrix, Gap Analysis, Actions) */}
      {currentMatch && (
        <>
          {/* 3. Job Description Intelligence (Overview, Required, Preferred, Responsibilities, Keywords, Eligibility) */}
          <JobDecompositionView />

          {/* 4. Intelligent Match Score (Overall Score, 7 Vectors Breakdown, Transparency Disclaimer) */}
          <IntelligentMatchScoreCard onScrollToSkills={scrollToSkills} />

          {/* 5. Granular Skill Evidence Matrix (Requirement vs Evidence with Status & Expandable Drawers) */}
          <SkillComparisonMatrix sectionRef={skillsRef} />

          {/* 6. Prioritized Gap & Evidence Analysis */}
          <GapAnalysisPanel />

          {/* 7. Actionable Next Steps & Application Prep */}
          <ActionableImprovementsCard />
        </>
      )}

      {/* Modals & Dialogs */}
      <MultiResumeComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      <SavedJobAnalysesModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}

export function JobMatcherPage() {
  return (
    <DocumentProvider>
      <JobMatcherProvider>
        <JobMatcherContent />
      </JobMatcherProvider>
    </DocumentProvider>
  );
}
