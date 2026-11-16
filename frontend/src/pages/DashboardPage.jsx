import { WelcomeBanner } from '@/features/dashboard/components/WelcomeBanner';
import { ResumeActivationBanner } from '@/features/dashboard/components/ResumeActivationBanner';
import { CareerOverviewCards } from '@/features/dashboard/components/CareerOverviewCards';
import { QuickActionGrid } from '@/features/dashboard/components/QuickActionGrid';
import { CareerTrackSummary } from '@/features/dashboard/components/CareerTrackSummary';
import { OpportunityPreviewList } from '@/features/dashboard/components/OpportunityPreviewList';
import { RecentActivityTimeline } from '@/features/dashboard/components/RecentActivityTimeline';
import { CareerInsightsPanel } from '@/features/dashboard/components/CareerInsightsPanel';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('jobachiever_needs_onboarding') === 'true') {
      navigate('/onboarding');
    }
  }, [navigate]);
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Personalized Welcome Banner */}
      <WelcomeBanner />

      {/* Single Source of Truth Resume Activation & Multi-Persona Switcher */}
      <ResumeActivationBanner />

      {/* High-Level Career Metric Cards */}
      <CareerOverviewCards />

      {/* Primary Workflow Quick Actions */}
      <QuickActionGrid />

      {/* Multi-Track Personas Overview */}
      <CareerTrackSummary />

      {/* Operational Two-Column Grid: Opportunities & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <OpportunityPreviewList />
        <RecentActivityTimeline />
      </div>

      {/* AI Career Strategist & Advisory Panel */}
      <CareerInsightsPanel />
    </div>
  );
}
