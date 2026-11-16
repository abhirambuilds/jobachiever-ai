/**
 * Centralized Demo Service for JobAchiever AI.
 *
 * Implements an isolated, simulated data and business logic facade for
 * Interactive Demo Presentation Mode.
 *
 * Key Guarantees:
 * 1. Zero Mutation of Real User Data: All demo mutations stay in isolated demo storage.
 * 2. Realistic Simulated Latency: 200–450ms network delay.
 * 3. Complete Consistency: Resume, profile, jobs, match scores, roadmap, and dashboard metrics align.
 * 4. Grounded Truthfulness: All demo results are explicitly marked with isSimulatedDemo: true.
 * 5. Instant Reset: One-click return to pristine demo baseline.
 */

import {
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  simulateDelay,
  DEMO_STORAGE_KEYS,
} from './demoConfig';
import { DEMO_USER } from './demoUser';
import { DEMO_PROFILE } from './demoProfile';
import { DEMO_RESUMES } from './demoResumes';
import { DEMO_JOBS } from './demoJobs';
import { DEMO_RESUME_ANALYSIS_ALEX, DEMO_JOB_ANALYSIS_STRIPE } from './demoAnalyses';
import { DEMO_JOB_MATCH_ALEX_STRIPE } from './demoMatches';
import { DEMO_SKILL_GAPS } from './demoCareerData';
import { DEMO_ROADMAP } from './demoRoadmap';
import { DEMO_APPLICATIONS } from './demoApplications';
import { DEMO_PROJECT_BLUEPRINTS } from './demoProjects';
import { DEMO_ACTIVITIES } from './demoActivity';

class DemoService {
  constructor() {
    this.storagePrefix = 'jobachiever_demo_';
  }

  isDemoMode() {
    return isDemoMode();
  }

  enableDemoMode() {
    enableDemoMode();
  }

  disableDemoMode() {
    disableDemoMode();
  }

  /**
   * Resets all demo storage keys back to pristine defaults.
   */
  resetDemoState() {
    if (typeof window === 'undefined') return;
    try {
      Object.values(DEMO_STORAGE_KEYS).forEach((key) => {
        if (key !== DEMO_STORAGE_KEYS.ACTIVE) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        }
      });
      window.dispatchEvent(new CustomEvent('jobachiever:demo-state-reset'));
    } catch {
      // Ignore storage errors
    }
  }

  // ==========================================
  // USER & PROFILE
  // ==========================================

  async getUser() {
    await simulateDelay();
    return { ...DEMO_USER };
  }

  getProfileSync() {
    if (typeof window === 'undefined') return { ...DEMO_PROFILE };
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore read errors
    }
    return { ...DEMO_PROFILE };
  }

  async getProfile() {
    await simulateDelay();
    return this.getProfileSync();
  }

  async saveProfile(profile) {
    await simulateDelay();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      } catch {
        // Ignore write errors
      }
    }
    return { success: true, profile, isSimulatedDemo: true };
  }

  // ==========================================
  // RESUME DOCUMENTS
  // ==========================================

  getResumesSync() {
    if (typeof window === 'undefined') return [...DEMO_RESUMES];
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.RESUMES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback to default fixtures
    }
    return [...DEMO_RESUMES];
  }

  async getResumes() {
    await simulateDelay();
    return this.getResumesSync();
  }

  async getResumeById(id) {
    await simulateDelay();
    const list = this.getResumesSync();
    return list.find((r) => r.id === id) || list[0] || null;
  }

  // ==========================================
  // JOB OPPORTUNITIES
  // ==========================================

  getJobsSync() {
    if (typeof window === 'undefined') return [...DEMO_JOBS];
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.JOBS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [...DEMO_JOBS];
  }

  async getJobs() {
    await simulateDelay();
    return this.getJobsSync();
  }

  async getJobById(id) {
    await simulateDelay();
    const list = this.getJobsSync();
    return list.find((j) => j.id === id) || list[0] || null;
  }

  // ==========================================
  // RESUME ANALYZER
  // ==========================================

  async getResumeAnalysis(resumeId) {
    await simulateDelay(350);
    // Return precomputed rich analysis for Alex Morgan
    if (resumeId === 'demo-res-1' || !resumeId) {
      return { ...DEMO_RESUME_ANALYSIS_ALEX };
    }
    // Return modified analysis for secondary variant
    return {
      ...DEMO_RESUME_ANALYSIS_ALEX,
      analysisId: `demo-ana-${resumeId}`,
      resumeId,
      overallScore: 88,
      scoreRating: 'Strong Baseline',
      isSimulatedDemo: true,
    };
  }

  // ==========================================
  // JOB DESCRIPTION ANALYZER
  // ==========================================

  async getJobAnalysis(jobId = 'job-demo-stripe') {
    await simulateDelay(350);
    if (jobId === 'job-demo-stripe' || !jobId) {
      return { ...DEMO_JOB_ANALYSIS_STRIPE };
    }
    return {
      ...DEMO_JOB_ANALYSIS_STRIPE,
      jobId,
      roleTitle: 'Junior Cloud Infrastructure Engineer',
      company: 'Datadog',
      isSimulatedDemo: true,
    };
  }

  // ==========================================
  // RESUME–JOB MATCHING
  // ==========================================

  async getJobMatch(resumeId = 'demo-res-1', jobId = 'job-demo-stripe') {
    await simulateDelay(400);
    return {
      ...DEMO_JOB_MATCH_ALEX_STRIPE,
      matchId: `demo-match-${resumeId}-${jobId}`,
      resumeId,
      jobId,
      isSimulatedDemo: true,
    };
  }

  // ==========================================
  // CAREER INTELLIGENCE & ROADMAP
  // ==========================================

  async getSkillGaps(careerTrackId = 'track-demo-backend') {
    await simulateDelay(350);
    return {
      ...DEMO_SKILL_GAPS,
      careerTrackId,
      isSimulatedDemo: true,
    };
  }

  getRoadmapSync() {
    if (typeof window === 'undefined') return { ...DEMO_ROADMAP };
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.ROADMAP);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return { ...DEMO_ROADMAP };
  }

  async getRoadmap(careerTrackId = 'track-demo-backend') {
    await simulateDelay(350);
    const roadmap = this.getRoadmapSync();
    return {
      ...roadmap,
      careerTrackId,
      isSimulatedDemo: true,
    };
  }

  async updateMilestoneStatus(milestoneId, newStatus) {
    await simulateDelay(250);
    const roadmap = this.getRoadmapSync();
    let updated = false;

    const newPhases = roadmap.phases.map((phase) => ({
      ...phase,
      milestones: phase.milestones.map((m) => {
        if (m.id === milestoneId) {
          updated = true;
          return {
            ...m,
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
          };
        }
        return m;
      }),
    }));

    if (updated) {
      const allMilestones = newPhases.flatMap((p) => p.milestones);
      const completed = allMilestones.filter((m) => m.status === 'COMPLETED').length;
      const progress = Math.round((completed / allMilestones.length) * 100);

      const updatedRoadmap = {
        ...roadmap,
        phases: newPhases,
        completedMilestones: completed,
        progressPercentage: progress,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(DEMO_STORAGE_KEYS.ROADMAP, JSON.stringify(updatedRoadmap));
        } catch {
          // Ignore write errors
        }
      }
      return updatedRoadmap;
    }

    return roadmap;
  }

  async getProjectBlueprints() {
    await simulateDelay(200);
    return [...DEMO_PROJECT_BLUEPRINTS];
  }

  // ==========================================
  // DASHBOARD & ACTIVITY
  // ==========================================

  async getDashboardActivities() {
    await simulateDelay(200);
    return [...DEMO_ACTIVITIES];
  }

  async getDashboardSummary() {
    await simulateDelay(250);
    const roadmap = this.getRoadmapSync();
    return {
      targetRole: 'Backend Software Engineer',
      criticalGapsCount: 2,
      topCriticalGaps: [
        { skillName: 'Kubernetes', canonicalName: 'Kubernetes' },
        { skillName: 'Kafka Partition Tuning', canonicalName: 'Kafka' },
      ],
      hasActiveRoadmap: true,
      roadmapProgressPercentage: roadmap.progressPercentage || 45,
      completedMilestones: roadmap.completedMilestones || 2,
      totalMilestones: roadmap.totalMilestones || 4,
      upcomingMilestones: [
        {
          id: 'demo-m-201',
          title: 'Kafka Consumer Lag Telemetry & Rebalance Handling',
        },
      ],
      isSimulatedDemo: true,
    };
  }

  async getApplications() {
    await simulateDelay(200);
    return [...DEMO_APPLICATIONS];
  }
}

export const demoService = new DemoService();
