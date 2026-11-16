import { useRef } from 'react';
import {
  History,
  ArrowLeftRight,
} from 'lucide-react';

import { DocumentProvider, useDocuments } from '@/features/resumes/context/DocumentContext';
import { AnalyzerProvider, useAnalyzer } from '@/features/analyzer/context/AnalyzerContext';

import { ResumeSelector } from '@/features/analyzer/components/setup/ResumeSelector';
import { AnalysisConfigPanel } from '@/features/analyzer/components/setup/AnalysisConfigPanel';
import { ScoreOverviewHeader } from '@/features/analyzer/components/score/ScoreOverviewHeader';
import { CategoryScoreGrid } from '@/features/analyzer/components/score/CategoryScoreGrid';
import { DetailedAnalysisTabs } from '@/features/analyzer/components/detailed/DetailedAnalysisTabs';
import { RecommendationsPanel } from '@/features/analyzer/components/recommendations/RecommendationsPanel';
import { SentenceReviewSection } from '@/features/analyzer/components/sentences/SentenceReviewSection';
import { BeforeAfterComparisonModal } from '@/features/analyzer/components/comparison/BeforeAfterComparisonModal';
import { AnalysisHistoryModal } from '@/features/analyzer/components/history/AnalysisHistoryModal';
import { DocumentUploadModal } from '@/features/resumes/components/upload/DocumentUploadModal';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';

function ResumeAnalyzerContent() {
  const {
    currentAnalysis,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
  } = useAnalyzer();

  const { isUploadModalOpen, setIsUploadModalOpen } = useDocuments();

  const sentenceSectionRef = useRef(null);

  const scrollToSentences = () => {
    sentenceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              Resume Intelligence Studio
            </Badge>
            <Badge variant="outline" className="text-xs">
              FastAPI Engine
            </Badge>
            <SimulatedResultBadge text="Verified AI Diagnostic" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            AI Resume Analyzer &amp; Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Diagnose ATS machine-readability, audit engineering impact, and refine sentence-level
            phrasing with fact-preserving AI intelligence.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <History className="h-4 w-4 text-amber-400" />
            <span>Analysis History</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsComparisonModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
            <span>Before / After View</span>
          </Button>
        </div>
      </div>

      {/* 1. Resume Selection Area */}
      <ResumeSelector />

      {/* 2. Analysis Configuration Panel & Run Action */}
      <AnalysisConfigPanel />

      {/* 3. Resume Score Overview (Overall Score, Gauge, Recharts Breakdown, Notice) */}
      {currentAnalysis && (
        <>
          <ScoreOverviewHeader onScrollToSentences={scrollToSentences} />

          {/* 4. 8-Category Multi-Dimensional Audit */}
          <CategoryScoreGrid />

          {/* 5. Qualitative Critique Tabs (Strengths, Weaknesses, Missing Info, Language) */}
          <DetailedAnalysisTabs />

          {/* 6. Prioritized Engineering Recommendations */}
          <RecommendationsPanel onScrollToSentences={scrollToSentences} />

          {/* 7. Interactive Sentence-Level Rewrites */}
          <SentenceReviewSection sectionRef={sentenceSectionRef} />
        </>
      )}

      {/* Modals & Dialogs */}
      <BeforeAfterComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />

      <AnalysisHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

export function ResumeAnalyzerPage() {
  return (
    <DocumentProvider>
      <AnalyzerProvider>
        <ResumeAnalyzerContent />
      </AnalyzerProvider>
    </DocumentProvider>
  );
}
