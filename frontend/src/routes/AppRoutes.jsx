import { Routes, Route, Navigate } from 'react-router-dom';

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
import { JobDiscoveryPage } from '@/pages/JobDiscoveryPage';
import { AiSettingsPage } from '@/features/settings/AiSettingsPage';
import CareerIntelligencePage from '@/features/career/CareerIntelligencePage';
import CareerCopilotPage from '@/features/copilot/CareerCopilotPage';
import { ApplicationTrackerPage } from '@/pages/ApplicationTrackerPage';
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

        {/* Core Career Architecture Suite */}
        <Route path="/tracks" element={<ProfilePage initialTab="tracks" />} />
        <Route path="/career-tracks" element={<ProfilePage initialTab="tracks" />} />
        <Route path="/resumes" element={<ResumeLibraryPage />} />
        <Route path="/resume-studio" element={<ResumeStudioPage />} />
        <Route path="/studio" element={<ResumeStudioPage />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="/analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="/resumes/analyze" element={<ResumeAnalyzerPage />} />
        <Route path="/resumes/analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="/jobs" element={<JobDiscoveryPage />} />
        <Route path="/jobs/discover" element={<JobDiscoveryPage />} />
        <Route path="/jd-analyzer" element={<JobDescriptionAnalyzerPage />} />
        <Route path="/jobs/analyze" element={<JobDescriptionAnalyzerPage />} />
        <Route path="/job-match" element={<JobMatcherPage />} />
        <Route path="/job-matcher" element={<JobMatcherPage />} />
        <Route path="/matching" element={<JobMatcherPage />} />
        <Route path="/applications" element={<ApplicationTrackerPage />} />
        <Route path="/cover-letters" element={<Navigate to="/dashboard" replace />} />
        <Route path="/portfolio" element={<Navigate to="/dashboard" replace />} />
        <Route path="/interviews" element={<Navigate to="/copilot" replace />} />
        <Route path="/career" element={<CareerIntelligencePage />} />
        <Route path="/intelligence" element={<CareerIntelligencePage />} />
        <Route path="/career-intelligence" element={<CareerIntelligencePage />} />
        <Route path="/career/intelligence" element={<CareerIntelligencePage />} />
        <Route path="/career-assistant" element={<CareerIntelligencePage />} />
        <Route path="/copilot" element={<CareerCopilotPage />} />
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
