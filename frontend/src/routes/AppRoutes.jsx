import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/features/landing/LandingPage';
import { DesignSystemShowcase } from '@/pages/DesignSystemShowcase';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Dedicated Multi-Step Onboarding Wizard */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Authentication Suite (Asymmetric AuthLayout with Theme Support) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* General & Internal Views Wrapped in Standard AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/showcase" element={<DesignSystemShowcase />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
