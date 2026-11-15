import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { careerIntelligenceService } from '@/services/careerIntelligenceService';
import CareerTrackSelector from '../components/CareerTrackSelector';
import SkillGapOverviewCard from '../components/SkillGapOverviewCard';
import SkillGapExplorer from '../components/SkillGapExplorer';
import MilestoneCard from '../components/MilestoneCard';
import CareerRecommendationsView from '../components/CareerRecommendationsView';
import ProjectRecommendationsView from '../components/ProjectRecommendationsView';
import CareerIntelligencePage from '../CareerIntelligencePage';

describe('Career Intelligence & Skill Gap Strategy Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Service: careerIntelligenceService', () => {
    it('analyzes skill gaps and returns structured classifications', async () => {
      const res = await careerIntelligenceService.analyzeSkillGaps({
        careerTrackId: 'track-123',
        targetRole: 'Senior Backend Developer',
      });

      expect(res).toBeDefined();
      expect(res.targetRole).toBe('Senior Backend Developer');
      expect(res.demonstratedSkills).toBeDefined();
      expect(res.demonstratedSkills.length).toBeGreaterThan(0);
      expect(res.missingEvidenceSkills).toBeDefined();
      expect(res.missingEvidenceSkills.length).toBeGreaterThan(0);

      const javaSkill = res.demonstratedSkills.find(s => s.canonicalName === 'Java');
      expect(javaSkill).toBeDefined();
      expect(javaSkill.classification).toBe('STRONG');
      expect(javaSkill.evidenceStatus).toBe('CONFIRMED');
    });

    it('generates a phased learning roadmap with actionable tasks and criteria', async () => {
      const res = await careerIntelligenceService.generateRoadmap({
        careerTrackId: 'track-123',
        targetRole: 'Senior Backend Developer',
      });

      expect(res).toBeDefined();
      expect(res.phases).toHaveLength(2);
      expect(res.phases[0].milestones.length).toBeGreaterThan(0);

      const m = res.phases[0].milestones[0];
      expect(m.title).toBeDefined();
      expect(m.priority).toBeDefined();
      expect(m.tasks.length).toBeGreaterThan(0);
      expect(m.completionCriteria.length).toBeGreaterThan(0);
      expect(m.estimatedDuration).toBeNull(); // Strictly null per requirement
    });

    it('updates milestone status to COMPLETED with timestamp', async () => {
      const updated = await careerIntelligenceService.updateMilestone('m-101', {
        status: 'COMPLETED',
        personalNotes: 'Completed cluster setup',
      });

      expect(updated.status).toBe('COMPLETED');
      expect(updated.completedAt).toBeDefined();
      expect(updated.personalNotes).toBe('Completed cluster setup');
    });

    it('generates strategic recommendations across defined categories', async () => {
      const res = await careerIntelligenceService.generateRecommendations({
        careerTrackId: 'track-123',
        targetRole: 'Senior Backend Developer',
      });

      expect(res.recommendations.length).toBeGreaterThan(0);
      const rec = res.recommendations[0];
      expect(rec.title).toBeDefined();
      expect(rec.category).toBeDefined();
      expect(rec.targetSkills.length).toBeGreaterThan(0);
      expect(rec.actionableSteps.length).toBeGreaterThan(0);
    });

    it('recommends portfolio projects eliminating multiple missing skills', async () => {
      const res = await careerIntelligenceService.recommendProjects('track-123');

      expect(res.projects.length).toBeGreaterThan(0);
      const proj = res.projects[0];
      expect(proj.title).toBeDefined();
      expect(proj.targetMissingSkills).toContain('Kafka');
      expect(proj.targetMissingSkills).toContain('Kubernetes');
      expect(proj.architectureOverview).toBeDefined();
      expect(proj.keyDeliverables.length).toBeGreaterThan(0);
    });
  });

  describe('Component: CareerTrackSelector', () => {
    const mockTracks = [
      { id: 'track-1', name: 'Backend Engineering', targetRole: 'Backend Developer', primary: true },
      { id: 'track-2', name: 'AI / ML Track', targetRole: 'Machine Learning Engineer', primary: false },
    ];

    it('renders current track name and primary badge', () => {
      render(
        <MemoryRouter>
          <CareerTrackSelector
            tracks={mockTracks}
            selectedTrackId="track-1"
            onSelectTrack={vi.fn()}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Backend Engineering')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Target Role:')).toBeInTheDocument();
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    });

    it('allows switching between career personas without cross-contamination', () => {
      const onSelect = vi.fn();
      render(
        <MemoryRouter>
          <CareerTrackSelector
            tracks={mockTracks}
            selectedTrackId="track-1"
            onSelectTrack={onSelect}
          />
        </MemoryRouter>
      );

      const switchBtn = screen.getByText(/Switch Track/i);
      fireEvent.click(switchBtn);

      const aiTrackBtn = screen.getByText('AI / ML Track');
      fireEvent.click(aiTrackBtn);

      expect(onSelect).toHaveBeenCalledWith('track-2');
    });
  });

  describe('Component: SkillGapOverviewCard', () => {
    const mockGapData = {
      summary: 'Solid backend foundations. Opportunities in Kubernetes.',
      demonstratedSkills: [{ canonicalName: 'Java' }, { canonicalName: 'PostgreSQL' }],
      developingSkills: [{ canonicalName: 'Docker' }],
      missingEvidenceSkills: [{ canonicalName: 'Kubernetes' }, { canonicalName: 'Kafka' }],
      criticalPriorities: [{ canonicalName: 'Kubernetes' }],
    };

    it('renders readiness score, summary, and metric tiles', () => {
      render(
        <SkillGapOverviewCard
          skillGapData={mockGapData}
          onAnalyze={vi.fn()}
        />
      );

      expect(screen.getByText(/Role Readiness:/i)).toBeInTheDocument();
      expect(screen.getByText(/Solid backend foundations/i)).toBeInTheDocument();
      expect(screen.getByText('Demonstrated')).toBeInTheDocument();
      expect(screen.getByText('Missing Evidence')).toBeInTheDocument();
      expect(screen.getByText('Critical Priority')).toBeInTheDocument();
    });
  });

  describe('Component: SkillGapExplorer', () => {
    const mockGapData = {
      criticalPriorities: [
        {
          canonicalName: 'Kubernetes',
          category: 'TECHNICAL',
          classification: 'MISSING_EVIDENCE',
          evidenceStatus: 'MISSING',
          priorityScore: 95,
          priorityLevel: 'CRITICAL',
          importanceRationale: 'Cluster orchestration essential for microservices.',
          requiredForRoles: ['Senior Backend Engineer'],
          prerequisites: ['Docker'],
          candidateEvidence: [],
        },
      ],
      allEvaluatedSkills: [
        {
          canonicalName: 'Java',
          category: 'TECHNICAL',
          classification: 'STRONG',
          evidenceStatus: 'CONFIRMED',
          priorityScore: 90,
          priorityLevel: 'HIGH',
          importanceRationale: 'Primary language',
          requiredForRoles: ['Senior Backend Engineer'],
          prerequisites: [],
          candidateEvidence: ['Confirmed profile skill: Java'],
        },
        {
          canonicalName: 'Kubernetes',
          category: 'TECHNICAL',
          classification: 'MISSING_EVIDENCE',
          evidenceStatus: 'MISSING',
          priorityScore: 95,
          priorityLevel: 'CRITICAL',
          importanceRationale: 'Cluster orchestration essential for microservices.',
          requiredForRoles: ['Senior Backend Engineer'],
          prerequisites: ['Docker'],
          candidateEvidence: [],
        },
      ],
    };

    it('renders skill items with priority and classification badges', () => {
      render(<SkillGapExplorer skillGapData={mockGapData} />);

      expect(screen.getByText('Java')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
      expect(screen.getByText('Demonstrated')).toBeInTheDocument();
      expect(screen.getByText('Missing Evidence')).toBeInTheDocument();
    });

    it('opens detailed inspection modal when clicking a skill', () => {
      render(<SkillGapExplorer skillGapData={mockGapData} />);

      const k8sItem = screen.getByText('Kubernetes');
      fireEvent.click(k8sItem);

      expect(screen.getByText('Priority Score: 95 / 100')).toBeInTheDocument();
      expect(screen.getAllByText(/Cluster orchestration essential for microservices/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Prerequisite Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Docker')).toBeInTheDocument();
      expect(screen.getByText(/Zero evidence found in candidate verified profile/i)).toBeInTheDocument();
    });
  });

  describe('Component: MilestoneCard', () => {
    const mockMilestone = {
      id: 'm-1',
      phaseNumber: 1,
      title: 'Deploy Kubernetes Clusters with Helm',
      description: 'Set up local multi-service topology',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      relatedSkills: ['Kubernetes', 'Helm'],
      tasks: [{ description: 'Create Helm chart manifests', taskType: 'PRACTICE' }],
      completionCriteria: ['All pods reach healthy readiness status'],
      personalNotes: 'Testing on minikube',
      evidenceLinks: ['https://github.com/candidate/k8s-repo'],
    };

    it('renders title, status selector, and tasks', () => {
      render(
        <MilestoneCard
          milestone={mockMilestone}
          onUpdateStatus={vi.fn()}
          onSaveNotes={vi.fn()}
        />
      );

      expect(screen.getByText('Deploy Kubernetes Clusters with Helm')).toBeInTheDocument();
      expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
      expect(screen.getByText('Create Helm chart manifests')).toBeInTheDocument();
    });

    it('invokes onUpdateStatus when changing status dropdown', () => {
      const onUpdate = vi.fn();
      render(
        <MilestoneCard
          milestone={mockMilestone}
          onUpdateStatus={onUpdate}
          onSaveNotes={vi.fn()}
        />
      );

      const select = screen.getByDisplayValue('In Progress');
      fireEvent.change(select, { target: { value: 'COMPLETED' } });

      expect(onUpdate).toHaveBeenCalledWith('m-1', expect.objectContaining({ status: 'COMPLETED' }));
    });
  });

  describe('Component: CareerRecommendationsView', () => {
    const mockRecs = {
      recommendations: [
        {
          title: 'Master Apache Kafka Event Choreography',
          category: 'SKILL_DEVELOPMENT',
          priority: 'CRITICAL',
          rationale: 'High market demand in 80% of senior backend listings.',
          targetSkills: ['Kafka', 'Distributed Systems'],
          actionableSteps: ['Implement producer idempotency', 'Configure consumer group offsets'],
          estimatedEffort: '2-3 weeks',
        },
      ],
    };

    it('renders actionable recommendation with steps and market rationale', () => {
      render(
        <CareerRecommendationsView
          recommendationsData={mockRecs}
          onGenerateRecommendations={vi.fn()}
        />
      );

      expect(screen.getByText('Master Apache Kafka Event Choreography')).toBeInTheDocument();
      expect(screen.getByText(/High market demand in 80%/i)).toBeInTheDocument();
      expect(screen.getByText('Kafka')).toBeInTheDocument();
      expect(screen.getByText('Implement producer idempotency')).toBeInTheDocument();
      expect(screen.getByText('2-3 weeks')).toBeInTheDocument();
    });
  });

  describe('Component: ProjectRecommendationsView', () => {
    const mockProjects = {
      projects: [
        {
          title: 'Distributed Event-Driven Order Processing System',
          description: 'E-commerce transactional microservices pipeline.',
          targetMissingSkills: ['Kafka', 'Kubernetes'],
          architectureOverview: 'Spring Boot services interconnected via Kafka brokers.',
          keyDeliverables: ['Idempotent producer', 'Helm deployment manifests'],
          estimatedDifficulty: 'ADVANCED',
          portfolioImpact: 'Definitively proves senior distributed systems capability.',
        },
      ],
    };

    it('renders project blueprint with missing skills and architecture overview', () => {
      render(
        <ProjectRecommendationsView
          projectsData={mockProjects}
          onRecommendProjects={vi.fn()}
        />
      );

      expect(screen.getByText('Distributed Event-Driven Order Processing System')).toBeInTheDocument();
      expect(screen.getByText('Eliminates Skill Gaps for:')).toBeInTheDocument();
      expect(screen.getByText('Kafka')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
      expect(screen.getByText(/Spring Boot services interconnected/i)).toBeInTheDocument();
      expect(screen.getByText('ADVANCED')).toBeInTheDocument();
    });
  });

  describe('Page: CareerIntelligencePage Orchestration', () => {
    it('renders tabs, switching between Skill Gaps, Roadmap, Recommendations, and Projects', async () => {
      render(
        <MemoryRouter>
          <CareerIntelligencePage />
        </MemoryRouter>
      );

      // Verify page title
      expect(screen.getByText(/Career Intelligence & Skill Gap Strategy/i)).toBeInTheDocument();

      // Verify all tabs exist
      expect(screen.getByText('Skill Gap Analysis')).toBeInTheDocument();
      expect(screen.getByText('Learning Roadmap')).toBeInTheDocument();
      expect(screen.getByText('Strategic Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Blueprints')).toBeInTheDocument();

      // Switch to Roadmap tab
      fireEvent.click(screen.getByText('Learning Roadmap'));
      await waitFor(() => {
        expect(screen.getByText(/Personalized Phased Learning Roadmap/i)).toBeInTheDocument();
      });

      // Switch to Recommendations tab
      fireEvent.click(screen.getByText('Strategic Recommendations'));
      await waitFor(() => {
        expect(screen.getByText(/Targeted Career Strategy & Recommendations/i)).toBeInTheDocument();
      });

      // Switch to Projects tab
      fireEvent.click(screen.getByText('Portfolio Blueprints'));
      await waitFor(() => {
        expect(screen.getByText(/Production-Grade Portfolio Project Blueprints/i)).toBeInTheDocument();
      });
    });
  });
});
