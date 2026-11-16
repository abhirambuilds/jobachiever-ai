import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Compass,
  FolderKanban,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { careerTrackService } from '../../services/careerTrackService';
import { aiPreferenceService } from '../../services/aiPreferenceService';
import { careerIntelligenceService } from '../../services/careerIntelligenceService';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';
import { Badge } from '@/components/ui/badge';

import CareerTrackSelector from './components/CareerTrackSelector';
import SkillGapOverviewCard from './components/SkillGapOverviewCard';
import SkillGapExplorer from './components/SkillGapExplorer';
import LearningRoadmapView from './components/LearningRoadmapView';
import CareerRecommendationsView from './components/CareerRecommendationsView';
import ProjectRecommendationsView from './components/ProjectRecommendationsView';

const TABS = [
  { id: 'SKILL_GAPS', label: 'Skill Gap Analysis', icon: Brain },
  { id: 'ROADMAP', label: 'Learning Roadmap', icon: Compass },
  { id: 'RECOMMENDATIONS', label: 'Strategic Recommendations', icon: BookOpen },
  { id: 'PROJECTS', label: 'Portfolio Blueprints', icon: FolderKanban },
];

export default function CareerIntelligencePage() {
  const [tracks, setTracks] = React.useState([]);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('SKILL_GAPS');

  const [aiPreferences, setAiPreferences] = React.useState(null);
  const [hasConsent, setHasConsent] = React.useState(true);

  const [skillGapData, setSkillGapData] = React.useState(null);
  const [roadmapData, setRoadmapData] = React.useState(null);
  const [recommendationsData, setRecommendationsData] = React.useState(null);
  const [projectsData, setProjectsData] = React.useState(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = React.useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = React.useState(false);
  const [isGeneratingRecs, setIsGeneratingRecs] = React.useState(false);
  const [isGeneratingProjects, setIsGeneratingProjects] = React.useState(false);

  const [feedbackMessage, setFeedbackMessage] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);

  // 1. Initial Load: Tracks & Preferences
  React.useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        if (isDemoMode()) {
          const demoTracks = [
            {
              id: 'track-demo-backend',
              name: 'Backend Software Engineer',
              targetRole: 'Backend Software Engineer',
              targetSeniority: 'ENTRY_LEVEL',
              primary: true,
            },
            {
              id: 'track-demo-cloud',
              name: 'Cloud Systems & DevOps',
              targetRole: 'Junior Cloud Systems Engineer',
              targetSeniority: 'ENTRY_LEVEL',
              primary: false,
            },
          ];
          setTracks(demoTracks);
          setSelectedTrackId('track-demo-backend');
          setHasConsent(true);
          return;
        }

        const [tracksRes, prefsRes] = await Promise.all([
          careerTrackService.listTracks(true),
          aiPreferenceService.getAiPreferences(),
        ]);

        const loadedTracks = tracksRes && tracksRes.length > 0 ? tracksRes : [
          {
            id: 'default-track-backend',
            name: 'Senior Backend Engineer',
            targetRole: 'Senior Backend Developer',
            targetSeniority: 'SENIOR',
            primary: true,
          },
        ];
        setTracks(loadedTracks);

        const primary = loadedTracks.find(t => t.primary) || loadedTracks[0];
        setSelectedTrackId(primary?.id);

        if (prefsRes) {
          setAiPreferences(prefsRes);
          setHasConsent(Boolean(prefsRes.externalProcessingConsent));
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // 2. Fetch track-specific career intelligence when selectedTrackId changes
  React.useEffect(() => {
    if (!selectedTrackId) return;

    async function loadTrackData() {
      setErrorMessage(null);
      try {
        const [gaps, roadmap, recs, projects] = await Promise.all([
          careerIntelligenceService.getLatestSkillGaps(selectedTrackId),
          careerIntelligenceService.getActiveRoadmap(selectedTrackId),
          careerIntelligenceService.getLatestRecommendations(selectedTrackId),
          careerIntelligenceService.recommendProjects(selectedTrackId),
        ]);

        setSkillGapData(gaps);
        setRoadmapData(roadmap);
        setRecommendationsData(recs);
        setProjectsData(projects);
      } catch (err) {
        console.warn('Failed to load existing intelligence data:', err);
      }
    }

    loadTrackData();
  }, [selectedTrackId]);

  // Selected Track object
  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

  // Actions
  const handleAnalyzeSkillGaps = async () => {
    if (!currentTrack) return;
    setIsAnalyzingGaps(true);
    setErrorMessage(null);
    try {
      const result = await careerIntelligenceService.analyzeSkillGaps({
        careerTrackId: currentTrack.id,
        targetRole: currentTrack.targetRole,
        provider: aiPreferences?.selectedProvider,
        model: aiPreferences?.preferredModel,
      });
      setSkillGapData(result);
      setFeedbackMessage('Skill gap analysis completed successfully against verified profile facts.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      if (err.status === 403 || err.message?.includes('consent is required')) {
        setHasConsent(false);
      }
      setErrorMessage(err.message || 'Failed to analyze skill gaps.');
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleGenerateRoadmap = async customGoal => {
    if (!currentTrack) return;
    setIsGeneratingRoadmap(true);
    setErrorMessage(null);
    try {
      const result = await careerIntelligenceService.generateRoadmap({
        careerTrackId: currentTrack.id,
        targetRole: currentTrack.targetRole,
        customGoal,
        provider: aiPreferences?.selectedProvider,
        model: aiPreferences?.preferredModel,
      });
      setRoadmapData(result);
      setFeedbackMessage('Personalized learning roadmap generated.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      if (err.status === 403 || err.message?.includes('consent is required')) {
        setHasConsent(false);
      }
      setErrorMessage(err.message || 'Failed to generate learning roadmap.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId, updates) => {
    try {
      const updated = await careerIntelligenceService.updateMilestone(milestoneId, updates);
      // Optimistically update milestone in local roadmap state
      setRoadmapData(prev => {
        if (!prev || !prev.phases) return prev;
        let total = 0;
        let completed = 0;
        let inProgress = 0;

        const updatedPhases = prev.phases.map(phase => {
          const updatedMilestones = (phase.milestones || []).map(m => {
            if (m.id === milestoneId) {
              return { ...m, ...updated };
            }
            return m;
          });

          updatedMilestones.forEach(m => {
            total++;
            if (m.status === 'COMPLETED') completed++;
            else if (m.status === 'IN_PROGRESS') inProgress++;
          });

          return { ...phase, milestones: updatedMilestones };
        });

        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          ...prev,
          phases: updatedPhases,
          completedMilestones: completed,
          inProgressMilestones: inProgress,
          progressPercentage: pct,
        };
      });

      if (updates.status === 'COMPLETED') {
        setFeedbackMessage('Milestone marked as COMPLETED! Progress updated.');
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update milestone.');
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!currentTrack) return;
    setIsGeneratingRecs(true);
    setErrorMessage(null);
    try {
      const result = await careerIntelligenceService.generateRecommendations({
        careerTrackId: currentTrack.id,
        targetRole: currentTrack.targetRole,
        provider: aiPreferences?.selectedProvider,
        model: aiPreferences?.preferredModel,
      });
      setRecommendationsData(result);
      setFeedbackMessage('Actionable strategic recommendations generated.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      if (err.status === 403 || err.message?.includes('consent is required')) {
        setHasConsent(false);
      }
      setErrorMessage(err.message || 'Failed to generate recommendations.');
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleRecommendProjects = async () => {
    if (!currentTrack) return;
    setIsGeneratingProjects(true);
    setErrorMessage(null);
    try {
      const result = await careerIntelligenceService.recommendProjects(currentTrack.id);
      setProjectsData(result);
      setFeedbackMessage('Portfolio project blueprints generated.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      if (err.status === 403 || err.message?.includes('consent is required')) {
        setHasConsent(false);
      }
      setErrorMessage(err.message || 'Failed to recommend portfolio projects.');
    } finally {
      setIsGeneratingProjects(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Career Intelligence</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2 flex-wrap">
              <Compass className="w-6 h-6 text-primary" />
              <span>Career Intelligence &amp; Skill Gap Strategy</span>
              <Badge variant="outline" className="text-xs">Groq LPU Powered</Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-track gap diagnosis, formula-weighted skill prioritization, and dependency-ordered learning roadmaps.
            </p>
          </div>

          <Link
            to="/settings/ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted/60 transition-colors shadow-sm text-foreground shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span>AI Provider Settings</span>
          </Link>
        </div>
      </div>

      {/* Consent Warning Banner */}
      {!hasConsent && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Explicit AI Processing Consent Required
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-400/90 mt-0.5">
                External AI computation requires your explicit consent. Your verified career facts are never shared without permission.
              </p>
            </div>
          </div>
          <Link
            to="/settings/ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0"
          >
            <span>Grant Consent in Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Feedback & Error Toasts */}
      {feedbackMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg animate-in fade-in">
          {feedbackMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-lg flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Career Persona Switcher */}
      <CareerTrackSelector
        tracks={tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={id => setSelectedTrackId(id)}
        isLoading={isLoading}
      />

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'SKILL_GAPS' && (
          <div className="space-y-5">
            <SkillGapOverviewCard
              skillGapData={skillGapData}
              onAnalyze={handleAnalyzeSkillGaps}
              isAnalyzing={isAnalyzingGaps}
              provider={aiPreferences?.selectedProvider || 'GROQ'}
              model={aiPreferences?.preferredModel}
            />

            <SkillGapExplorer skillGapData={skillGapData} />
          </div>
        )}

        {activeTab === 'ROADMAP' && (
          <LearningRoadmapView
            roadmap={roadmapData}
            onGenerateRoadmap={handleGenerateRoadmap}
            onUpdateMilestone={handleUpdateMilestone}
            isGenerating={isGeneratingRoadmap}
            provider={aiPreferences?.selectedProvider || 'GROQ'}
            model={aiPreferences?.preferredModel}
          />
        )}

        {activeTab === 'RECOMMENDATIONS' && (
          <CareerRecommendationsView
            recommendationsData={recommendationsData}
            onGenerateRecommendations={handleGenerateRecommendations}
            isGenerating={isGeneratingRecs}
            provider={aiPreferences?.selectedProvider || 'GROQ'}
            model={aiPreferences?.preferredModel}
          />
        )}

        {activeTab === 'PROJECTS' && (
          <ProjectRecommendationsView
            projectsData={projectsData}
            onRecommendProjects={handleRecommendProjects}
            isGenerating={isGeneratingProjects}
            provider={aiPreferences?.selectedProvider || 'GROQ'}
            model={aiPreferences?.preferredModel}
          />
        )}
      </div>
    </div>
  );
}
