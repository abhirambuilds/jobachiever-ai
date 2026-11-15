import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfileProvider } from '../../profile/context/ProfileContext';

describe('Dashboard Layout & Navigation', () => {
  it('renders QuickActionGrid with all 6 core workflow cards and correct routes', () => {
    render(
      <BrowserRouter>
        <QuickActionGrid />
      </BrowserRouter>
    );

    expect(screen.getByText('Quick Career Actions')).toBeInTheDocument();

    const expectedActions = [
      { name: 'Analyze Resume', href: '/resume-analyzer' },
      { name: 'Create Tailored Resume', href: '/resume-studio' },
      { name: 'Match Job Description', href: '/job-match' },
      { name: 'Discover Opportunities', href: '/jobs' },
      { name: 'Update Master Profile', href: '/profile' },
      { name: 'Practice Interviews', href: '/interviews' },
    ];

    expectedActions.forEach(({ name, href }) => {
      const cardTitle = screen.getByText(name);
      expect(cardTitle).toBeInTheDocument();
      const link = cardTitle.closest('a');
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders WelcomeBanner with user name and primary career track', () => {
    render(
      <BrowserRouter>
        <ProfileProvider>
          <WelcomeBanner />
        </ProfileProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText(/Backend Systems Engineer/)).toBeInTheDocument();
  });

  it('renders complete DashboardPage layout with all sections', () => {
    render(
      <BrowserRouter>
        <ProfileProvider>
          <DashboardPage />
        </ProfileProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Quick Career Actions')).toBeInTheDocument();
    expect(screen.getByText('Career Tracks & Personas')).toBeInTheDocument();
    expect(screen.getByText('Recommended Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity Timeline')).toBeInTheDocument();
    expect(screen.getByText('AI Career Strategist & Advisory')).toBeInTheDocument();
  });
});
