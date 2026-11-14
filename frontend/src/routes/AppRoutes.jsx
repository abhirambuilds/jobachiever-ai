import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { DesignSystemShowcase } from '@/pages/DesignSystemShowcase';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Showcase is the initial landing view for Milestone 2 */}
        <Route path="/" element={<Navigate to="/showcase" replace />} />
        <Route path="/showcase" element={<DesignSystemShowcase />} />
        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
