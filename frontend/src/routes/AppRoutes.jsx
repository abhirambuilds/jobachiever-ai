import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/features/landing/LandingPage';
import { DesignSystemShowcase } from '@/pages/DesignSystemShowcase';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Landing page has its own dedicated rich navbar & footer */}
      <Route path="/" element={<LandingPage />} />

      {/* Internal & Secondary pages wrapped in AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/showcase" element={<DesignSystemShowcase />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
