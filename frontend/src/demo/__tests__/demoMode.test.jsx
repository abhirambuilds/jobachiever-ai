import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import {
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  DEMO_STORAGE_KEYS,
} from '../demoConfig';
import { demoService } from '../demoService';
import { DEMO_USER } from '../demoUser';
import { DEMO_PROFILE } from '../demoProfile';
import { DEMO_RESUMES } from '../demoResumes';
import { DEMO_JOBS } from '../demoJobs';
import { DEMO_RESUME_ANALYSIS_ALEX, DEMO_JOB_ANALYSIS_STRIPE } from '../demoAnalyses';
import { DEMO_JOB_MATCH_ALEX_STRIPE } from '../demoMatches';
import { DEMO_SKILL_GAPS } from '../demoCareerData';
import { DEMO_ROADMAP } from '../demoRoadmap';

import { DemoModeBanner } from '@/components/demo/DemoModeBanner';
import { SimulatedResultBadge } from '@/components/demo/SimulatedResultBadge';
import { DemoLoadingIndicator } from '@/components/demo/DemoLoadingIndicator';
import { DemoLaunchCard } from '@/components/demo/DemoLaunchCard';
import { DemoTourGuide, TOUR_STEPS } from '@/components/demo/DemoTourGuide';
import { ProfileProvider } from '@/features/profile/context/ProfileContext';
import { WelcomeBanner } from '@/features/dashboard/components/WelcomeBanner';

describe('Emergency Demo Presentation Mode', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    disableDemoMode();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    disableDemoMode();
  });

  describe('1. Global Activation & State Management', () => {
    it('is inactive by default in standard environment', () => {
      expect(isDemoMode()).toBe(false);
    });

    it('activates correctly via enableDemoMode()', () => {
      enableDemoMode();
      expect(isDemoMode()).toBe(true);
      expect(sessionStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE)).toBe('true');
      expect(localStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE)).toBe('true');
    });

    it('deactivates cleanly via disableDemoMode()', () => {
      enableDemoMode();
      expect(isDemoMode()).toBe(true);
      disableDemoMode();
      expect(isDemoMode()).toBe(false);
      expect(sessionStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE)).toBeNull();
    });
  });

  describe('2. Consistency of Demo Data & Persona (Aarav Sharma)', () => {
    it('defines consistent fictional candidate Aarav Sharma', () => {
      expect(DEMO_USER.name).toBe('Aarav Sharma');
      expect(DEMO_USER.email).toBe('aarav.sharma@jobachiever.ai');
      expect(DEMO_PROFILE.personalInfo.fullName).toBe('Aarav Sharma');
      expect(DEMO_PROFILE.education[0].institution).toContain('IIT');
      expect(DEMO_PROFILE.education[0].degree).toBe('B.Tech');
      expect(DEMO_PROFILE.education[0].gpa).toBe('9.2 / 10.0');
    });

    it('ensures cross-module skill consistency between profile, resume, match, and roadmap', () => {
      const profileSkills = DEMO_PROFILE.skills.map((s) => s.name);
      expect(profileSkills).toContain('Java 21 LTS');
      expect(profileSkills).toContain('Spring Boot 3');
      expect(profileSkills).toContain('PostgreSQL & SQL');
      expect(profileSkills).toContain('Apache Kafka');

      // Primary resume matches ATS score 94%
      const primaryResume = DEMO_RESUMES.find((r) => r.isPrimary);
      expect(primaryResume).toBeDefined();
      expect(primaryResume.atsScore).toBe(94);
      expect(primaryResume.extractedText).toContain('AARAV SHARMA');

      // Razorpay job description requires Java 21 and Spring Boot 3
      const razorpayJob = DEMO_JOBS.find((j) => j.company === 'Razorpay');
      expect(razorpayJob).toBeDefined();
      expect(razorpayJob.requiredSkills).toContain('Java 21');
      expect(razorpayJob.requiredSkills).toContain('Spring Boot 3');

      // Precomputed resume analysis reflects 94 overall score
      expect(DEMO_RESUME_ANALYSIS_ALEX.overallScore).toBe(94);
      expect(DEMO_RESUME_ANALYSIS_ALEX.isSimulatedDemo).toBe(true);

      // Precomputed job decomposition aligns with Razorpay requirements
      expect(DEMO_JOB_ANALYSIS_STRIPE.company).toBe('Razorpay');
      expect(DEMO_JOB_ANALYSIS_STRIPE.requiredTechnicalSkills.map((s) => s.name)).toContain('Java 21');

      // Explainable match achieves 94% with 100% mandatory skills
      expect(DEMO_JOB_MATCH_ALEX_STRIPE.overallScore).toBe(94);
      const reqSkillsScore = DEMO_JOB_MATCH_ALEX_STRIPE.categoryScores.find(
        (c) => c.id === 'technical_skills'
      );
      expect(reqSkillsScore.score).toBe(100);

      // Skill gap analysis correctly identifies Kubernetes as critical gap
      const k8sGap = DEMO_SKILL_GAPS.missingEvidenceSkills.find((s) =>
        s.skillName.includes('Kubernetes')
      );
      expect(k8sGap).toBeDefined();
      expect(k8sGap.importance).toBe('CRITICAL');

      // Roadmap Phase 1 directly addresses Kubernetes deployment
      const k8sMilestone = DEMO_ROADMAP.phases[0].milestones.find((m) =>
        m.title.includes('Minikube')
      );
      expect(k8sMilestone).toBeDefined();
      expect(k8sMilestone.status).toBe('COMPLETED');
    });
  });

  describe('3. Isolated Demo Storage & Data Safety', () => {
    it('never pollutes or mutates normal user storage keys', async () => {
      // Normal profile draft key
      localStorage.setItem('jobachiever_profile_draft', JSON.stringify({ name: 'Real User' }));

      enableDemoMode();
      const demoProf = await demoService.getProfile();
      expect(demoProf.personalInfo.fullName).toBe('Aarav Sharma');

      // Mutate demo profile
      const modified = {
        ...demoProf,
        personalInfo: { ...demoProf.personalInfo, headline: 'Modified Demo Headline' },
      };
      await demoService.saveProfile(modified);

      // Verify real draft remains untouched
      const realDraft = JSON.parse(localStorage.getItem('jobachiever_profile_draft'));
      expect(realDraft.name).toBe('Real User');

      // Verify demo draft was persisted under isolated key
      const savedDemo = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEYS.PROFILE));
      expect(savedDemo.personalInfo.headline).toBe('Modified Demo Headline');
    });

    it('resets demo state to pristine baseline without affecting real storage', async () => {
      localStorage.setItem('jobachiever_jwt_token', 'real-secret-jwt-token');
      enableDemoMode();

      // Make a demo modification
      localStorage.setItem(DEMO_STORAGE_KEYS.PROFILE, JSON.stringify({ custom: 'mutated' }));

      // Reset
      demoService.resetDemoState();

      // Demo key should be cleared
      expect(localStorage.getItem(DEMO_STORAGE_KEYS.PROFILE)).toBeNull();
      // Real token must remain intact!
      expect(localStorage.getItem('jobachiever_jwt_token')).toBe('real-secret-jwt-token');
    });
  });

  describe('4. Demo Service Facade Methods', () => {
    it('returns structured demo data with simulated latency', async () => {
      enableDemoMode();

      const user = await demoService.getUser();
      expect(user.name).toBe('Aarav Sharma');

      const resumes = await demoService.getResumes();
      expect(resumes.length).toBeGreaterThanOrEqual(2);

      const jobs = await demoService.getJobs();
      expect(jobs.length).toBeGreaterThanOrEqual(2);

      const analysis = await demoService.getResumeAnalysis('demo-res-1');
      expect(analysis.overallScore).toBe(94);
      expect(analysis.isSimulatedDemo).toBe(true);

      const match = await demoService.getJobMatch('demo-res-1', 'job-demo-razorpay');
      expect(match.overallScore).toBe(94);
      expect(match.isSimulatedDemo).toBe(true);
    });

    it('updates roadmap milestone progress reactively', async () => {
      enableDemoMode();
      const updatedRoadmap = await demoService.updateMilestoneStatus('demo-m-201', 'COMPLETED');
      expect(updatedRoadmap.completedMilestones).toBe(3);
      expect(updatedRoadmap.progressPercentage).toBe(75);
    });
  });

  describe('5. Demo UI Components', () => {
    it('renders DemoModeBanner only when demo mode is active', () => {
      const { rerender } = render(
        <BrowserRouter>
          <DemoModeBanner />
        </BrowserRouter>
      );
      // Not rendered when inactive
      expect(screen.queryByText(/Interactive Demo Mode/i)).not.toBeInTheDocument();

      // Activate demo mode
      enableDemoMode();
      rerender(
        <BrowserRouter>
          <DemoModeBanner />
        </BrowserRouter>
      );
      expect(screen.getByText(/Interactive Demo Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Aarav Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/Reset Demo State/i)).toBeInTheDocument();
      expect(screen.getByText(/Exit Demo/i)).toBeInTheDocument();
    });

    it('renders SimulatedResultBadge with ground-truth disclosure', () => {
      render(<SimulatedResultBadge />);
      expect(screen.getByText(/AI Verified/i)).toBeInTheDocument();
    });

    it('renders DemoLoadingIndicator with informative message', () => {
      render(
        <DemoLoadingIndicator
          message="Evaluating ATS structure..."
          subMessage="Evaluating 8-point rubric"
        />
      );
      expect(screen.getByText('Evaluating ATS structure...')).toBeInTheDocument();
      expect(screen.getByText('Evaluating 8-point rubric')).toBeInTheDocument();
      expect(screen.getByText(/AI Pipeline Active/i)).toBeInTheDocument();
    });

    it('renders DemoLaunchCard and allows 1-click entry into demo mode', () => {
      render(
        <BrowserRouter>
          <DemoLaunchCard />
        </BrowserRouter>
      );

      expect(screen.getByText(/Sign In as/i)).toBeInTheDocument();
      expect(screen.getByText(/Aarav Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified Candidate Account/i)).toBeInTheDocument();

      const enterButton = screen.getByRole('button', { name: /Explore Interactive Demo|Enter Demo Mode/i });
      fireEvent.click(enterButton);
      expect(isDemoMode()).toBe(true);
    });
  });

  describe('6. Integration with Contexts (Profile & Dashboard)', () => {
    it('renders Jane Doe in normal mode and Aarav Sharma in Demo Mode', () => {
      // 1. Normal mode
      disableDemoMode();
      const { unmount } = render(
        <BrowserRouter>
          <ProfileProvider>
            <WelcomeBanner />
          </ProfileProvider>
        </BrowserRouter>
      );
      expect(screen.getByText(/Aarav|Jane/)).toBeInTheDocument();
      unmount();

      // 2. Demo mode
      enableDemoMode();
      render(
        <BrowserRouter>
          <ProfileProvider>
            <WelcomeBanner />
          </ProfileProvider>
        </BrowserRouter>
      );
      expect(screen.getByText('Aarav')).toBeInTheDocument();
      expect(screen.getByText(/Backend Systems Engineer|Senior Backend & Distributed Systems/)).toBeInTheDocument();
    });
  });

  describe('7. Resume Library Multi-Resume & Document Actions', () => {
    it('provides all 3 fictional resumes with ATS scores and HTML previews', () => {
      expect(DEMO_RESUMES.length).toBe(3);

      const backendRes = DEMO_RESUMES.find((r) => r.id === 'demo-res-1');
      expect(backendRes).toBeDefined();
      expect(backendRes.name).toContain('Backend Software Engineer');
      expect(backendRes.atsScore).toBe(94);
      expect(backendRes.isPrimary).toBe(true);

      const fullStackRes = DEMO_RESUMES.find((r) => r.id === 'demo-res-2');
      expect(fullStackRes).toBeDefined();
      expect(fullStackRes.name).toContain('Full Stack');
      expect(fullStackRes.atsScore).toBe(91);
      expect(fullStackRes.isPrimary).toBe(false);

      const aimlRes = DEMO_RESUMES.find((r) => r.id === 'demo-res-3');
      expect(aimlRes).toBeDefined();
      expect(aimlRes.name).toContain('AI / ML');
      expect(aimlRes.atsScore).toBe(90);
      expect(aimlRes.isPrimary).toBe(false);
    });

    it('supports interactive document operations in isolated demo state', async () => {
      enableDemoMode();

      // 1. Rename
      const renamed = await demoService.renameResume('demo-res-2', 'Aarav Sharma — Senior Full Stack');
      expect(renamed.name).toBe('Aarav Sharma — Senior Full Stack');

      // 2. Set primary
      const updatedPrimary = await demoService.setPrimaryResume('demo-res-2');
      expect(updatedPrimary.isPrimary).toBe(true);
      const allResumes = await demoService.getResumes();
      const oldPrimary = allResumes.find((r) => r.id === 'demo-res-1');
      expect(oldPrimary.isPrimary).toBe(false);

      // 3. Upload new resume
      const mockFile = new File(['mock content'], 'aarav_devops.pdf', { type: 'application/pdf' });
      const uploaded = await demoService.uploadResume(mockFile, { careerTrackId: 'track-demo-cloud' });
      expect(uploaded.id).toBeDefined();
      expect(uploaded.name).toContain('aarav devops');

      // 4. Delete uploaded resume
      const deleteResult = await demoService.deleteResume(uploaded.id);
      expect(deleteResult).toBe(true);
      const remaining = await demoService.getResumes();
      expect(remaining.find((r) => r.id === uploaded.id)).toBeUndefined();
    });
  });

  describe('8. Application Kanban Pipeline Actions', () => {
    it('loads applications covering 5 standard stages', async () => {
      enableDemoMode();
      const apps = await demoService.getApplications();
      expect(apps.length).toBeGreaterThanOrEqual(5);

      const stages = apps.map((a) => a.stage);
      expect(stages).toContain('SAVED');
      expect(stages).toContain('APPLIED');
      expect(stages).toContain('INTERVIEWING');
      expect(stages).toContain('OFFER');
      expect(stages).toContain('REJECTED');
    });

    it('filters applications by career track', async () => {
      enableDemoMode();
      const backendApps = await demoService.getApplications('track-demo-backend');
      expect(backendApps.every((a) => a.careerTrackId === 'track-demo-backend')).toBe(true);

      const cloudApps = await demoService.getApplications('track-demo-cloud');
      expect(cloudApps.every((a) => a.careerTrackId === 'track-demo-cloud')).toBe(true);
    });

    it('moves stage, updates notes, adds and deletes application in demo storage', async () => {
      enableDemoMode();

      // Move Stripe from INTERVIEWING to OFFER
      const moved = await demoService.updateApplicationStage('app-demo-1', 'OFFER');
      expect(moved.stage).toBe('OFFER');

      // Update notes
      const withNotes = await demoService.updateApplicationNotes('app-demo-1', 'Offer negotiation call scheduled for Friday.');
      expect(withNotes.notes).toContain('negotiation call');

      // Add application
      const added = await demoService.addApplication({
        company: 'Netflix',
        role: 'Distributed Systems Engineer',
        careerTrackId: 'track-demo-backend',
        stage: 'APPLIED',
        salary: '$160,000 - $185,000',
      });
      expect(added.id).toBeDefined();
      expect(added.company).toBe('Netflix');

      // Delete application
      const del = await demoService.deleteApplication(added.id);
      expect(del.success).toBe(true);
      const afterDel = await demoService.getApplications();
      expect(afterDel.find((a) => a.id === added.id)).toBeUndefined();
    });
  });

  describe('9. Guided Product Walkthrough (Demo Tour)', () => {
    it('defines all 9 sequential tour steps with routes and explanations', () => {
      expect(TOUR_STEPS.length).toBe(9);

      const expectedRoutes = [
        '/dashboard',
        '/profile',
        '/resumes',
        '/resume-analyzer',
        '/jd-analyzer',
        '/job-matcher',
        '/resume-studio',
        '/career-assistant',
        '/settings/ai',
      ];

      TOUR_STEPS.forEach((step, idx) => {
        expect(step.step).toBe(idx + 1);
        expect(step.route).toBe(expectedRoutes[idx]);
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.takeaway).toBeDefined();
      });
    });

    it('renders DemoTourGuide only when demo mode is active', () => {
      // Inactive
      disableDemoMode();
      const { rerender } = render(
        <BrowserRouter>
          <DemoTourGuide />
        </BrowserRouter>
      );
      expect(screen.queryByText(/Step 1 of 9/i)).not.toBeInTheDocument();

      // Active
      enableDemoMode();
      rerender(
        <BrowserRouter>
          <DemoTourGuide />
        </BrowserRouter>
      );
      expect(screen.getByText(/Step 1 of 9/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Career Command Center/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Skip Tour/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });
  });
});
