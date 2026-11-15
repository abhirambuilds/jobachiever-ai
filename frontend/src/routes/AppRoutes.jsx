import { Routes, Route } from 'react-router-dom';
import {
  Layers,
  Compass,
  Kanban,
  FileSignature,
  Globe,
  GraduationCap,
} from 'lucide-react';

import { AppLayout } from '@/layouts/AppLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { LandingPage } from '@/features/landing/LandingPage';
import { DesignSystemShowcase } from '@/pages/DesignSystemShowcase';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ResumeLibraryPage } from '@/pages/ResumeLibraryPage';
import { ResumeAnalyzerPage } from '@/pages/ResumeAnalyzerPage';
import ResumeStudioPage from '@/pages/ResumeStudioPage';
import { JobMatcherPage } from '@/pages/JobMatcherPage';
import { JobDescriptionAnalyzerPage } from '@/pages/JobDescriptionAnalyzerPage';
import { AiSettingsPage } from '@/features/settings/AiSettingsPage';
import CareerIntelligencePage from '@/features/career/CareerIntelligencePage';
import { FeaturePlaceholderPage } from '@/pages/FeaturePlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Dedicated Multi-Step Onboarding Wizard */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Authentication Suite */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated Career Command Center Suite */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Milestone Features Routed to Polish Placeholders */}
        <Route
          path="/tracks"
          element={
            <FeaturePlaceholderPage
              title="Career Tracks &amp; Personas"
              description="Manage distinct professional personas (e.g. Full-Stack Engineer, Solutions Architect) with isolated skill alignments."
              milestone="Milestone 7"
              icon={Layers}
            />
          }
        />
        <Route path="/resumes" element={<ResumeLibraryPage />} />
        <Route path="/resume-studio" element={<ResumeStudioPage />} />
        <Route path="/studio" element={<ResumeStudioPage />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        <Route
          path="/jobs"
          element={
            <FeaturePlaceholderPage
              title="Job Opportunity Discovery"
              description="Aggregated real-world openings matched semantically against your active career personas."
              milestone="Milestone 8"
              icon={Compass}
            />
          }
        />
        <Route path="/jd-analyzer" element={<JobDescriptionAnalyzerPage />} />
        <Route path="/jobs/analyze" element={<JobDescriptionAnalyzerPage />} />
        <Route path="/job-match" element={<JobMatcherPage />} />
        <Route path="/job-matcher" element={<JobMatcherPage />} />
        <Route path="/matching" element={<JobMatcherPage />} />
        <Route
          path="/applications"
          element={
            <FeaturePlaceholderPage
              title="Application Kanban Pipeline"
              description="Full lifecycle tracking from wishlisted to applied, interview stages, offers, and decisions."
              milestone="Milestone 8"
              icon={Kanban}
            />
          }
        />
        <Route
          path="/cover-letters"
          element={
            <FeaturePlaceholderPage
              title="Targeted Cover Letter Generator"
              description="Context-aware, personalized cover letters highlighting role-relevant user achievements."
              milestone="Milestone 9"
              icon={FileSignature}
            />
          }
        />
        <Route
          path="/portfolio"
          element={
            <FeaturePlaceholderPage
              title="Professional Web Portfolio Builder"
              description="Clean, shareable web portfolio profiles showcasing projects, verified credentials, and milestones."
              milestone="Milestone 9"
              icon={Globe}
            />
          }
        />
        <Route
          path="/interviews"
          element={
            <FeaturePlaceholderPage
              title="Interview Preparation Suite"
              description="AI-powered mock interviews, behavioral STAR practice, and role-specific technical question banks."
              milestone="Milestone 9"
              icon={GraduationCap}
            />
          }
        />
        <Route path="/career/intelligence" element={<CareerIntelligencePage />} />
        <Route path="/career-assistant" element={<CareerIntelligencePage />} />
        <Route path="/settings" element={<AiSettingsPage />} />
        <Route path="/settings/ai" element={<AiSettingsPage />} />
      </Route>

      {/* General & Public Views Wrapped in Standard AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/showcase" element={<DesignSystemShowcase />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
