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

  describe('2. Consistency of Demo Data & Persona (Alex Morgan)', () => {
    it('defines consistent fictional candidate Alex Morgan', () => {
      expect(DEMO_USER.name).toBe('Alex Morgan');
      expect(DEMO_USER.email).toBe('alex.morgan@demo.jobachiever.ai');
      expect(DEMO_PROFILE.personalInfo.fullName).toBe('Alex Morgan');
      expect(DEMO_PROFILE.education[0].institution).toBe('San Jose State University');
      expect(DEMO_PROFILE.education[0].degree).toBe('B.S.');
      expect(DEMO_PROFILE.education[0].gpa).toBe('3.85 / 4.0');
    });

    it('ensures cross-module skill consistency between profile, resume, match, and roadmap', () => {
      const profileSkills = DEMO_PROFILE.skills.map((s) => s.name);
      expect(profileSkills).toContain('Java 21 LTS');
      expect(profileSkills).toContain('Spring Boot 3');
      expect(profileSkills).toContain('PostgreSQL & SQL');
      expect(profileSkills).toContain('REST APIs');

      // Primary resume matches ATS score 94%
      const primaryResume = DEMO_RESUMES.find((r) => r.isPrimary);
      expect(primaryResume).toBeDefined();
      expect(primaryResume.atsScore).toBe(94);
      expect(primaryResume.extractedText).toContain('ALEX MORGAN');

      // Stripe job description requires Java 21 and Spring Boot 3
      const stripeJob = DEMO_JOBS.find((j) => j.company === 'Stripe');
      expect(stripeJob).toBeDefined();
      expect(stripeJob.requiredSkills).toContain('Java 21');
      expect(stripeJob.requiredSkills).toContain('Spring Boot 3');

      // Precomputed resume analysis reflects 94 overall score
      expect(DEMO_RESUME_ANALYSIS_ALEX.overallScore).toBe(94);
      expect(DEMO_RESUME_ANALYSIS_ALEX.isSimulatedDemo).toBe(true);

      // Precomputed job decomposition aligns with Stripe requirements
      expect(DEMO_JOB_ANALYSIS_STRIPE.company).toBe('Stripe');
      expect(DEMO_JOB_ANALYSIS_STRIPE.requiredTechnicalSkills.map((s) => s.name)).toContain('Java 21');

      // Explainable match achieves 91% with 100% mandatory skills
      expect(DEMO_JOB_MATCH_ALEX_STRIPE.overallScore).toBe(91);
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
      expect(demoProf.personalInfo.fullName).toBe('Alex Morgan');

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
      expect(user.name).toBe('Alex Morgan');

      const resumes = await demoService.getResumes();
      expect(resumes.length).toBeGreaterThanOrEqual(2);

      const jobs = await demoService.getJobs();
      expect(jobs.length).toBeGreaterThanOrEqual(2);

      const analysis = await demoService.getResumeAnalysis('demo-res-1');
      expect(analysis.overallScore).toBe(94);
      expect(analysis.isSimulatedDemo).toBe(true);

      const match = await demoService.getJobMatch('demo-res-1', 'job-demo-stripe');
      expect(match.overallScore).toBe(91);
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
      expect(screen.getByText(/Alex Morgan/i)).toBeInTheDocument();
      expect(screen.getByText(/Reset Demo State/i)).toBeInTheDocument();
      expect(screen.getByText(/Exit Demo/i)).toBeInTheDocument();
    });

    it('renders SimulatedResultBadge with ground-truth disclosure', () => {
      render(<SimulatedResultBadge />);
      expect(screen.getByText(/Demo Preview — Illustrative AI Result/i)).toBeInTheDocument();
    });

    it('renders DemoLoadingIndicator with informative message', () => {
      render(
        <DemoLoadingIndicator
          message="Evaluating ATS structure..."
          subMessage="Simulating 8-point rubric"
        />
      );
      expect(screen.getByText('Evaluating ATS structure...')).toBeInTheDocument();
      expect(screen.getByText('Simulating 8-point rubric')).toBeInTheDocument();
      expect(screen.getByText(/Demo Sandbox Mode/i)).toBeInTheDocument();
    });

    it('renders DemoLaunchCard and allows 1-click entry into demo mode', () => {
      render(
        <BrowserRouter>
          <DemoLaunchCard />
        </BrowserRouter>
      );

      expect(screen.getByText(/Explore JobAchiever AI as/i)).toBeInTheDocument();
      expect(screen.getByText(/Alex Morgan/i)).toBeInTheDocument();
      expect(screen.getByText(/No API Keys Required/i)).toBeInTheDocument();

      const enterButton = screen.getByRole('button', { name: /Enter Demo Mode/i });
      fireEvent.click(enterButton);
      expect(isDemoMode()).toBe(true);
    });
  });

  describe('6. Integration with Contexts (Profile & Dashboard)', () => {
    it('renders Jane Doe in normal mode and Alex Morgan in Demo Mode', () => {
      // 1. Normal mode
      disableDemoMode();
      const { unmount } = render(
        <BrowserRouter>
          <ProfileProvider>
            <WelcomeBanner />
          </ProfileProvider>
        </BrowserRouter>
      );
      expect(screen.getByText('Jane')).toBeInTheDocument();
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
      expect(screen.getByText('Alex')).toBeInTheDocument();
      expect(screen.getByText(/Backend Software Engineer/)).toBeInTheDocument();
    });
  });
});
