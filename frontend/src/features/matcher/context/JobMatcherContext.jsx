import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  jobMatchingService,
  SAMPLE_JOB_DESCRIPTIONS,
  buildSimulatedMatchAnalysis,
} from '@/services/jobMatchingService';
import { useDocuments } from '@/hooks/useDocuments';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/toast';

const JobMatcherContext = createContext(null);

export function JobMatcherProvider({ children }) {
  const { documents } = useDocuments();
  const { profile } = useProfile();

  // Initial resume from library
  const initialResume = useMemo(() => {
    return documents.find((d) => d.isPrimary) || documents[0] || null;
  }, [documents]);

  const [selectedResume, setSelectedResume] = useState(initialResume);
  const [selectionSource, setSelectionSource] = useState('resume'); // 'resume' | 'profile'
  const [selectedTrackId, setSelectedTrackId] = useState(
    profile?.careerTracks?.find((t) => t.isPrimary)?.id || 'track-1'
  );

  // Job Description Input State
  const [jobText, setJobText] = useState(SAMPLE_JOB_DESCRIPTIONS[0].text);
  const [jobDetails, setJobDetails] = useState({
    company: SAMPLE_JOB_DESCRIPTIONS[0].company,
    title: SAMPLE_JOB_DESCRIPTIONS[0].title,
    location: SAMPLE_JOB_DESCRIPTIONS[0].location,
    employmentType: SAMPLE_JOB_DESCRIPTIONS[0].employmentType,
    workMode: SAMPLE_JOB_DESCRIPTIONS[0].workMode,
    experienceLevel: SAMPLE_JOB_DESCRIPTIONS[0].experienceLevel,
    deadline: SAMPLE_JOB_DESCRIPTIONS[0].deadline,
    url: SAMPLE_JOB_DESCRIPTIONS[0].url,
  });
  const [uploadedJdFile, setUploadedJdFile] = useState(null);

  // Matching Execution State
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingStepMessage, setMatchingStepMessage] = useState('');
  const [matchingError, setMatchingError] = useState(null);

  // Current Active Match Result
  const [currentMatch, setCurrentMatch] = useState(() => {
    return initialResume ? buildSimulatedMatchAnalysis(initialResume, jobDetails) : null;
  });

  // Multi-Resume Comparison State
  const [comparisonResults, setComparisonResults] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Saved Analyses History State
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fetch initial saved analyses on mount
  useEffect(() => {
    jobMatchingService.getSavedJobAnalyses().then((data) => {
      setSavedAnalyses(data);
    });
  }, []);

  // Synchronize when initialResume becomes available
  useEffect(() => {
    if (!selectedResume && initialResume) {
      setSelectedResume(initialResume);
      const res = buildSimulatedMatchAnalysis(initialResume, jobDetails);
      setCurrentMatch(res);
    }
  }, [initialResume, selectedResume, jobDetails]);

  /**
   * Quick-load sample JD
   */
  const loadSampleJd = (sampleId) => {
    const sample = SAMPLE_JOB_DESCRIPTIONS.find((s) => s.id === sampleId);
    if (!sample) return;

    setJobText(sample.text);
    setJobDetails({
      company: sample.company,
      title: sample.title,
      location: sample.location,
      employmentType: sample.employmentType,
      workMode: sample.workMode,
      experienceLevel: sample.experienceLevel,
      deadline: sample.deadline,
      url: sample.url,
    });
    setUploadedJdFile(null);
    toast.info(`Loaded sample job description: "${sample.title}" at ${sample.company}.`);
  };

  /**
   * Run Matching Pipeline
   */
  const runMatching = async () => {
    if (!jobText.trim() && !uploadedJdFile) {
      toast.error('Please paste or upload a Job Description to match against.');
      return;
    }

    const candidateTarget =
      selectionSource === 'profile'
        ? {
            id: 'master-profile',
            name: `${profile.personalInfo.fullName || 'Candidate'} — Master Profile`,
            careerTrackName: profile.careerTracks?.find((t) => t.id === selectedTrackId)?.name || 'Full-Stack Engineer',
          }
        : selectedResume || initialResume;

    setIsMatching(true);
    setMatchingError(null);
    setMatchingProgress(10);
    setMatchingStepMessage('Decomposing job posting structure...');

    try {
      const matchResult = await jobMatchingService.matchResumeToJob(
        candidateTarget,
        jobDetails,
        (progress, message) => {
          setMatchingProgress(progress);
          setMatchingStepMessage(message);
        }
      );

      setCurrentMatch(matchResult);
      setIsMatching(false);
      setMatchingProgress(100);
      toast.success('Job compatibility analysis updated!');
    } catch (err) {
      setIsMatching(false);
      setMatchingError(err.message || 'Matching failed.');
      toast.error('Matching failed: ' + err.message);
    }
  };

  /**
   * Compare all available resumes against this JD
   */
  const runResumeComparison = async () => {
    if (!documents || documents.length === 0) {
      toast.error('No resumes found in library to compare.');
      return;
    }

    try {
      const results = await jobMatchingService.compareResumesForJob(documents, jobDetails);
      setComparisonResults(results);
      setIsCompareModalOpen(true);
    } catch {
      toast.error('Failed to run resume comparison.');
    }
  };

  /**
   * Save current analysis to history
   */
  const saveCurrentAnalysis = () => {
    if (!currentMatch) return;

    const newRecord = {
      id: `saved-match-${Date.now().toString(36)}`,
      company: jobDetails.company,
      title: jobDetails.title,
      analyzedAt: new Date().toISOString(),
      resumeName: currentMatch.resumeName,
      careerTrack: currentMatch.resumeTrack,
      compatibilityScore: currentMatch.overallScore,
      status: currentMatch.overallScore >= 90 ? 'high_match' : 'good_match',
    };

    setSavedAnalyses((prev) => [newRecord, ...prev]);
    toast.success('Job analysis and alignment report saved to history.');
  };

  /**
   * Reload a saved analysis
   */
  const loadSavedAnalysis = async (savedItem) => {
    setJobDetails((prev) => ({
      ...prev,
      company: savedItem.company,
      title: savedItem.title,
    }));

    if (savedItem.id && savedItem.id.length === 36 && savedItem.id.includes('-')) {
      try {
        const fullMatch = await jobMatchingService.getMatchDetails(savedItem.id);
        if (fullMatch) {
          setCurrentMatch(fullMatch);
          setIsHistoryModalOpen(false);
          toast.info(`Reloaded analysis for ${savedItem.company} (${savedItem.title}).`);
          return;
        }
      } catch (err) {
        console.warn('Could not load backend match details, falling back:', err);
      }
    }

    const matchingResume =
      documents.find((d) => d.name === savedItem.resumeName) || selectedResume;

    const reloaded = buildSimulatedMatchAnalysis(matchingResume || selectedResume, {
      company: savedItem.company,
      title: savedItem.title,
    });

    setCurrentMatch(reloaded);
    setIsHistoryModalOpen(false);
    toast.info(`Reloaded analysis for ${savedItem.company} (${savedItem.title}).`);
  };

  /**
   * Delete a saved analysis
   */
  const deleteSavedAnalysis = async (savedId) => {
    if (savedId && savedId.length === 36 && savedId.includes('-')) {
      try {
        await jobMatchingService.deleteMatch(savedId);
      } catch (err) {
        console.warn('Backend delete error:', err);
      }
    }
    setSavedAnalyses((prev) => prev.filter((item) => item.id !== savedId));
    toast.success('Match record removed.');
  };

  const value = {
    // Input state
    jobText,
    setJobText,
    jobDetails,
    setJobDetails,
    uploadedJdFile,
    setUploadedJdFile,
    loadSampleJd,
    // Selection state
    selectedResume,
    setSelectedResume,
    selectionSource,
    setSelectionSource,
    selectedTrackId,
    setSelectedTrackId,
    availableResumes: documents,
    availableTracks: profile?.careerTracks || [],
    // Matching execution
    isMatching,
    matchingProgress,
    matchingStepMessage,
    matchingError,
    currentMatch,
    runMatching,
    // Comparison
    comparisonResults,
    isCompareModalOpen,
    setIsCompareModalOpen,
    runResumeComparison,
    // Saved history
    savedAnalyses,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    saveCurrentAnalysis,
    loadSavedAnalysis,
    deleteSavedAnalysis,
  };

  return <JobMatcherContext.Provider value={value}>{children}</JobMatcherContext.Provider>;
}

export function useJobMatcher() {
  const context = useContext(JobMatcherContext);
  if (!context) {
    throw new Error('useJobMatcher must be used within a JobMatcherProvider');
  }
  return context;
}
