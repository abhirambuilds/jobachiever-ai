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

  async setPrimaryResume(id) {
    await simulateDelay(200);
    const list = this.getResumesSync().map((r) => ({
      ...r,
      isPrimary: r.id === id,
    }));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.RESUMES, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return list.find((r) => r.id === id) || null;
  }

  async deleteResume(id) {
    await simulateDelay(200);
    const list = this.getResumesSync().filter((r) => r.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.RESUMES, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return true;
  }

  async uploadResume(file, metadata = {}) {
    await simulateDelay(350);
    const cleanName =
      metadata.name ||
      file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
    const extension = file.name.split('.').pop().toLowerCase();
    const newDoc = {
      id: `demo-res-${Date.now().toString(36)}`,
      ownerId: 'usr-demo-aarav-sharma',
      name: cleanName,
      originalFilename: file.name,
      mimeType: file.type || 'application/pdf',
      fileExtension: extension,
      fileSize: file.size || 500000,
      storageKey: `storage/resumes/${file.name}`,
      careerTrackId: metadata.careerTrackId || 'track-demo-backend',
      careerTrackName: metadata.careerTrackName || 'Senior Backend Software Engineer',
      version: 1,
      processingStatus: 'processed',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false,
      atsScore: 92,
      previewUrl:
        typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && file instanceof Blob
          ? URL.createObjectURL(file)
          : null,
      extractedText: `AARAV SHARMA\nUploaded document: ${file.name}\nParsed sections: Summary, Experience, Education, Technical Skills.`,
      sections: {
        personalInfo: { fullName: 'Aarav Sharma', email: 'aarav.sharma@jobachiever.ai' },
        skills: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Docker'],
      },
      versions: [
        {
          versionId: `demo-ver-${Date.now()}`,
          versionNumber: 1,
          name: `${cleanName} (v1.0)`,
          updatedAt: new Date().toISOString(),
          description: 'Document uploaded and parsed.',
          source: 'User Upload',
          fileSize: file.size || 500000,
          careerTrackId: metadata.careerTrackId || 'track-demo-backend',
        },
      ],
    };

    const list = [newDoc, ...this.getResumesSync()];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.RESUMES, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return newDoc;
  }

  async renameResume(id, newTitle) {
    await simulateDelay(150);
    let updated = null;
    const list = this.getResumesSync().map((r) => {
      if (r.id === id) {
        updated = { ...r, name: newTitle, updatedAt: new Date().toISOString() };
        return updated;
      }
      return r;
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.RESUMES, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return updated;
  }

  async updateResumeTrack(id, newTrackId, newTrackName = 'Backend Software Engineer') {
    await simulateDelay(150);
    let updated = null;
    const list = this.getResumesSync().map((r) => {
      if (r.id === id) {
        updated = { ...r, careerTrackId: newTrackId, careerTrackName: newTrackName, updatedAt: new Date().toISOString() };
        return updated;
      }
      return r;
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.RESUMES, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return updated;
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

  async getJobAnalysis(jobId = 'job-demo-razorpay') {
    await simulateDelay(350);
    if (jobId === 'job-demo-razorpay' || jobId === 'job-demo-stripe' || !jobId) {
      return { ...DEMO_JOB_ANALYSIS_STRIPE };
    }
    return {
      ...DEMO_JOB_ANALYSIS_STRIPE,
      jobId,
      roleTitle: 'Senior SDE-2 — Distributed Logistics',
      company: 'Swiggy',
      isSimulatedDemo: true,
    };
  }

  // ==========================================
  // RESUME–JOB MATCHING
  // ==========================================

  async getJobMatch(resumeId = 'demo-res-1', jobId = 'job-demo-razorpay') {
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

  // ==========================================
  // APPLICATIONS PIPELINE
  // ==========================================

  getApplicationsSync() {
    if (typeof window === 'undefined') return [...DEMO_APPLICATIONS];
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEYS.APPLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [...DEMO_APPLICATIONS];
  }

  async getApplications(careerTrackId = null) {
    await simulateDelay(200);
    const list = this.getApplicationsSync();
    if (careerTrackId && careerTrackId !== 'all') {
      return list.filter((app) => app.careerTrackId === careerTrackId);
    }
    return list;
  }

  async updateApplicationStage(appId, newStage) {
    await simulateDelay(200);
    const validStages = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];
    const stage = validStages.includes(newStage) ? newStage : 'SAVED';
    let updatedApp = null;

    const list = this.getApplicationsSync().map((app) => {
      if (app.id === appId) {
        updatedApp = {
          ...app,
          stage,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updatedApp;
      }
      return app;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return updatedApp;
  }

  async updateApplicationNotes(appId, notes) {
    await simulateDelay(150);
    let updatedApp = null;
    const list = this.getApplicationsSync().map((app) => {
      if (app.id === appId) {
        updatedApp = {
          ...app,
          notes,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updatedApp;
      }
      return app;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return updatedApp;
  }

  async addApplication(appData) {
    await simulateDelay(200);
    const newApp = {
      id: `app-demo-${Date.now()}`,
      company: appData.company || 'Innovative Tech Corp',
      role: appData.role || 'Backend Engineer',
      careerTrackId: appData.careerTrackId || 'track-demo-backend',
      careerTrackName: appData.careerTrackName || 'Backend Software Engineer',
      stage: appData.stage || 'SAVED',
      stageLabel: appData.stage || 'Saved Opportunity',
      location: appData.location || 'Remote',
      salary: appData.salary || '$130,000 - $150,000',
      appliedDate: appData.stage === 'APPLIED' || appData.stage === 'INTERVIEWING' ? new Date().toISOString().split('T')[0] : null,
      lastUpdated: new Date().toISOString().split('T')[0],
      matchScore: appData.matchScore || 85,
      nextStep: appData.nextStep || 'Review role details',
      notes: appData.notes || '',
    };

    const list = [newApp, ...this.getApplicationsSync()];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return newApp;
  }

  async deleteApplication(appId) {
    await simulateDelay(150);
    const list = this.getApplicationsSync().filter((app) => app.id !== appId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DEMO_STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
      } catch {
        // ignore
      }
    }
    return { success: true };
  }
}

export const demoService = new DemoService();
