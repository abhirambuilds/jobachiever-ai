import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  buildSimulatedMatchAnalysis,
  EVIDENCE_LEVELS,
  MATCH_CATEGORIES,
} from '@/services/jobMatchingService';
import { JobMatcherProvider } from '../context/JobMatcherContext';
import { SkillComparisonMatrix } from '../components/skills/SkillComparisonMatrix';
import { GapAnalysisPanel } from '../components/gaps/GapAnalysisPanel';
import { ProfileProvider } from '../../profile/context/ProfileContext';
import { DocumentProvider } from '../../resumes/context/DocumentContext';

describe('Job Matching & Evidence Classification', () => {
  const sampleCandidate = {
    id: 'res-1',
    name: 'Jane Doe Resume',
    careerTrackName: 'Full-Stack Engineer',
  };

  const sampleJob = {
    company: 'Stripe',
    title: 'Staff Backend Infrastructure Engineer',
  };

  it('generates explainable match analysis with all 7 evaluation dimensions', () => {
    const analysis = buildSimulatedMatchAnalysis(sampleCandidate, sampleJob);

    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);
    expect(analysis.categories.length).toBe(MATCH_CATEGORIES.length);
    expect(analysis.categories.every((c) => c.score >= 0 && c.score <= 100)).toBe(true);
  });

  it('enforces strict evidence classification (STRONG, PARTIAL, NO_RECORDED)', () => {
    const analysis = buildSimulatedMatchAnalysis(sampleCandidate, sampleJob);
    const validLevels = Object.values(EVIDENCE_LEVELS);

    expect(analysis.skillComparisons.length).toBeGreaterThan(0);
    analysis.skillComparisons.forEach((skill) => {
      expect(validLevels).toContain(skill.evidenceLevel);
      expect(skill.requirement).toBeTruthy();
      expect(skill.profileEvidence).toBeDefined();
    });
  });

  it('categorizes gaps by priority and provides actionable bridge suggestions', () => {
    const analysis = buildSimulatedMatchAnalysis(sampleCandidate, sampleJob);

    expect(analysis.gaps.length).toBeGreaterThan(0);
    analysis.gaps.forEach((gap) => {
      expect(['high', 'medium', 'low', 'optional']).toContain(gap.priority);
      expect(gap.requirement).toBeTruthy();
      expect(gap.recommendedStep).toBeTruthy();
    });
  });

  it('renders SkillComparisonMatrix and GapAnalysisPanel within MatcherProvider', () => {
    render(
      <BrowserRouter>
        <ProfileProvider>
          <DocumentProvider>
            <JobMatcherProvider>
              <SkillComparisonMatrix />
              <GapAnalysisPanel />
            </JobMatcherProvider>
          </DocumentProvider>
        </ProfileProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Granular Skill Evidence Matrix')).toBeInTheDocument();
    expect(screen.getByText('Prioritized Gap & Evidence Analysis')).toBeInTheDocument();
  });
});
