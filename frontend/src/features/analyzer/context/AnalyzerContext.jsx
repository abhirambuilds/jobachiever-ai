import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  resumeAnalysisService,
  TARGET_INDUSTRIES,
  INITIAL_ANALYSIS_HISTORY,
  buildSimulatedAnalysisResult,
} from '@/services/resumeAnalysisService';
import { useDocuments } from '@/hooks/useDocuments';
import { useProfile } from '@/hooks/useProfile';
import { useAiPreferences } from '@/hooks/useAiPreferences';
import { toast } from '@/components/ui/toast';

const AnalyzerContext = createContext(null);

export function AnalyzerProvider({ children }) {
  const { documents } = useDocuments();
  const { profile } = useProfile();
  const { hasConsent, selectedProvider } = useAiPreferences();

  // Find initial primary resume or first available document
  const initialResume = useMemo(() => {
    return documents.find((d) => d.isPrimary) || documents[0] || null;
  }, [documents]);

  const [selectedResume, setSelectedResume] = useState(initialResume);

  // Configuration options
  const [config, setConfig] = useState({
    mode: 'role_specific',
    targetRole: profile?.careerTracks?.find((t) => t.isPrimary)?.targetRole || 'Senior Full-Stack Engineer',
    careerTrackId: profile?.careerTracks?.find((t) => t.isPrimary)?.id || 'track-1',
    careerTrackName: profile?.careerTracks?.find((t) => t.isPrimary)?.name || 'Full-Stack Engineer',
    targetIndustry: TARGET_INDUSTRIES[0],
    jobDescription: '',
  });

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepMessage, setAnalysisStepMessage] = useState('');
  const [analysisError, setAnalysisError] = useState(null);

  // Current active analysis report (prepopulate with baseline for selected resume)
  const [currentAnalysis, setCurrentAnalysis] = useState(() => {
    return initialResume ? buildSimulatedAnalysisResult(initialResume, config) : null;
  });

  // Interactive sentence review state
  const [sentenceReviews, setSentenceReviews] = useState(() => {
    return currentAnalysis?.sentenceReviews || [];
  });

  // History state
  const [history, setHistory] = useState(INITIAL_ANALYSIS_HISTORY);

  // Modals
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [activeSentenceTab, setActiveSentenceTab] = useState(false);

  // Synchronize when initialResume becomes available
  useEffect(() => {
    if (!selectedResume && initialResume) {
      setSelectedResume(initialResume);
      const res = buildSimulatedAnalysisResult(initialResume, config);
      setCurrentAnalysis(res);
      setSentenceReviews(res.sentenceReviews);
    }
  }, [initialResume, selectedResume, config]);

  // Load history from backend when selected resume changes
  useEffect(() => {
    if (selectedResume?.id) {
      resumeAnalysisService.getAnalysisHistory(selectedResume.id).then((hist) => {
        if (Array.isArray(hist) && hist.length > 0) {
          setHistory(hist);
        }
      }).catch(() => {
        // Retain current history
      });
    }
  }, [selectedResume?.id]);

  /**
   * Run Analysis Action
   */
  const runAnalysis = async () => {
    if (!selectedResume) {
      toast.error('Please select or upload a resume to analyze.');
      return;
    }

    if (!hasConsent) {
      const consentMsg = 'External AI processing consent is required. Please enable consent in AI Settings before analyzing your resume.';
      setAnalysisError(consentMsg);
      toast.error(consentMsg);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(10);
    setAnalysisStepMessage('Initializing AI parsing pipelines...');

    try {
      const result = await resumeAnalysisService.analyzeResume(
        selectedResume,
        config,
        (progress, message) => {
          setAnalysisProgress(progress);
          setAnalysisStepMessage(message);
        }
      );

      setCurrentAnalysis(result);
      setSentenceReviews(result.sentenceReviews || []);
      setIsAnalyzing(false);
      setAnalysisProgress(100);

      // Add to session history
      const newHistoryEntry = {
        id: result.analysisId || `ana-hist-${Date.now().toString(36)}`,
        resumeId: selectedResume.id,
        resumeName: selectedResume.name || selectedResume.title,
        filename: selectedResume.originalFilename || selectedResume.fileName,
        analyzedAt: new Date().toISOString(),
        mode: config.mode,
        targetRole: config.targetRole,
        targetTrack: config.careerTrackName,
        overallScore: result.overallScore,
        status: 'completed',
        summary: (result.scoreSummary || '').slice(0, 85) + '...',
      };

      setHistory((prev) => [newHistoryEntry, ...prev.filter((h) => h.id !== newHistoryEntry.id)]);
      toast.success('Resume analysis completed! Evidence-grounded critique report generated.');
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisError(err.message || 'Analysis encountered an error.');
      toast.error('Analysis failed: ' + err.message);
    }
  };

  /**
   * Sentence Review Actions
   */
  const acceptSentenceSuggestion = (sentenceId) => {
    setSentenceReviews((prev) =>
      prev.map((item) => {
        if (item.id !== sentenceId) return item;
        return {
          ...item,
          status: 'accepted',
          revisedText: item.suggestedText,
        };
      })
    );
    toast.success('Suggestion accepted and staged for comparison.');
  };

  const rejectSentenceSuggestion = (sentenceId) => {
    setSentenceReviews((prev) =>
      prev.map((item) => {
        if (item.id !== sentenceId) return item;
        return {
          ...item,
          status: 'rejected',
          revisedText: null,
        };
      })
    );
    toast.info('Suggestion rejected. Original sentence retained.');
  };

  const editSentenceSuggestion = (sentenceId, customText) => {
    const trimmed = customText.trim();
    if (!trimmed) {
      toast.error('Revised sentence cannot be empty.');
      return;
    }
    setSentenceReviews((prev) =>
      prev.map((item) => {
        if (item.id !== sentenceId) return item;
        return {
          ...item,
          status: 'modified',
          revisedText: trimmed,
        };
      })
    );
    toast.success('Custom rewrite saved and staged.');
  };

  const resetSentenceSuggestion = (sentenceId) => {
    setSentenceReviews((prev) =>
      prev.map((item) => {
        if (item.id !== sentenceId) return item;
        return {
          ...item,
          status: 'pending',
          revisedText: null,
        };
      })
    );
  };

  /**
   * Load previous analysis from history
   */
  const loadHistoryItem = async (historyItem) => {
    const matchingResume =
      documents.find((d) => d.id === historyItem.resumeId) || selectedResume;

    if (matchingResume) {
      setSelectedResume(matchingResume);
    }

    try {
      const detailed = await resumeAnalysisService.getAnalysisDetails(
        historyItem.id,
        matchingResume || selectedResume
      );
      setCurrentAnalysis(detailed);
      setSentenceReviews(detailed.sentenceReviews || []);
      setIsHistoryModalOpen(false);
      toast.info(`Loaded analysis report from ${new Date(historyItem.analyzedAt).toLocaleDateString()}.`);
    } catch {
      const reloadedResult = buildSimulatedAnalysisResult(matchingResume || selectedResume, {
        mode: historyItem.mode,
        targetRole: historyItem.targetRole,
        careerTrackName: historyItem.targetTrack,
      });
      setCurrentAnalysis(reloadedResult);
      setSentenceReviews(reloadedResult.sentenceReviews);
      setIsHistoryModalOpen(false);
      toast.info(`Loaded cached session from ${new Date(historyItem.analyzedAt).toLocaleDateString()}.`);
    }
  };

  const value = {
    selectedResume,
    setSelectedResume,
    availableResumes: documents,
    config,
    setConfig,
    isAnalyzing,
    analysisProgress,
    analysisStepMessage,
    analysisError,
    currentAnalysis,
    runAnalysis,
    hasConsent,
    selectedProvider,
    // Sentence actions
    sentenceReviews,
    acceptSentenceSuggestion,
    rejectSentenceSuggestion,
    editSentenceSuggestion,
    resetSentenceSuggestion,
    // History
    history,
    loadHistoryItem,
    // Modals
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    activeSentenceTab,
    setActiveSentenceTab,
  };

  return <AnalyzerContext.Provider value={value}>{children}</AnalyzerContext.Provider>;
}

export function useAnalyzer() {
  const context = useContext(AnalyzerContext);
  if (!context) {
    throw new Error('useAnalyzer must be used within an AnalyzerProvider');
  }
  return context;
}
