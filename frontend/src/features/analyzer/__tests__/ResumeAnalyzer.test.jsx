import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { normalizeBackendAnalysis } from '@/services/resumeAnalysisService';
import { AnalyzerProvider } from '@/features/analyzer/context/AnalyzerContext';
import { AnalysisConfigPanel } from '@/features/analyzer/components/setup/AnalysisConfigPanel';
import { ResumeSelector } from '@/features/analyzer/components/setup/ResumeSelector';
import { RecommendationsPanel } from '@/features/analyzer/components/recommendations/RecommendationsPanel';

// Mock DocumentContext
vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: () => ({
    documents: [
      {
        id: 'doc-uuid-1',
        name: 'Senior Full-Stack Resume',
        originalFilename: 'Alex_Mercer_Resume.pdf',
        fileExtension: 'pdf',
        fileSize: 1048576,
        isPrimary: true,
        version: 1,
        careerTrackName: 'Full-Stack Engineer',
      },
      {
        id: 'doc-uuid-2',
        name: 'Backend Specialist Resume',
        originalFilename: 'Alex_Backend.pdf',
        fileExtension: 'pdf',
        fileSize: 524288,
        isPrimary: false,
        version: 1,
        careerTrackName: 'Backend Engineer',
      },
    ],
    setIsUploadModalOpen: vi.fn(),
  }),
}));

// Mock ProfileContext
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: {
      careerTracks: [
        { id: 'track-1', name: 'Full-Stack Engineer', targetRole: 'Senior Full-Stack Engineer', isPrimary: true },
      ],
    },
  }),
}));

// Mock AiPreferences
let mockConsent = true;
let mockSelectedProvider = 'GROQ';

vi.mock('@/hooks/useAiPreferences', () => ({
  useAiPreferences: () => ({
    hasConsent: mockConsent,
    selectedProvider: mockSelectedProvider,
    preferences: {
      selectedProvider: mockSelectedProvider,
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 2048,
      externalProcessingConsent: mockConsent,
    },
  }),
}));

describe('AI Resume Analyzer — Unit & Component Tests', () => {
  beforeEach(() => {
    mockConsent = true;
    mockSelectedProvider = 'GROQ';
    vi.clearAllMocks();
  });

  describe('Data Model Normalization (normalizeBackendAnalysis)', () => {
    it('correctly maps raw backend report into full UI structure', () => {
      const mockBackendDto = {
        id: 'analysis-uuid-123',
        resumeId: 'doc-uuid-1',
        versionId: 'ver-uuid-1',
        provider: 'GROQ',
        model: 'llama-3.3-70b-versatile',
        overallScore: 92,
        overallRating: 'EXCELLENT',
        summary: 'Outstanding technical profile with verified metrics.',
        report: {
          overallAssessment: {
            score: 92,
            rating: 'EXCELLENT',
            summary: 'Outstanding technical profile with verified metrics.',
            contentScore: 95,
            skillsScore: 90,
            experienceScore: 92,
            impactScore: 88,
            structureScore: 94,
            atsScore: 96,
            disclaimer: 'Standard transparency notice.',
          },
          sectionAnalysis: [
            {
              section: 'EXPERIENCE',
              status: 'PRESENT',
              strengths: ['Strong use of action verbs'],
              issues: [],
              recommendations: [],
            },
            {
              section: 'PUBLICATIONS',
              status: 'MISSING',
              strengths: [],
              issues: ['No publications detected'],
              recommendations: ['Add research papers or tech blogs if available'],
            },
          ],
          strengths: ['Deep Java and React proficiency', 'Clean single-column formatting'],
          weaknesses: ['Minor summary cliché'],
          skillsAnalysis: {
            identifiedSkills: ['Java', 'Spring Boot', 'React', 'PostgreSQL'],
            underrepresentedSkills: ['Docker'],
            notes: ['Strong framework coverage'],
          },
          impactAnalysis: {
            strongExamples: [
              {
                quote: 'Reduced query latency by 45%',
                impactExplanation: 'Clear metric demonstration',
                section: 'EXPERIENCE',
              },
            ],
            improvementOpportunities: [
              {
                originalExcerpt: 'Helped build backend APIs',
                issue: 'Passive verb with missing scale metric',
                suggestedRewrite: 'Architected REST APIs handling [actual metric] RPS',
                section: 'EXPERIENCE',
              },
            ],
          },
          atsAnalysis: {
            readability: 'GOOD',
            observations: ['Single column parseable without text collision'],
            warnings: [],
            disclaimer: 'ATS variation disclaimer.',
          },
          recommendations: [
            {
              id: 'rec-1',
              section: 'EXPERIENCE',
              priority: 'HIGH',
              issue: 'Passive verb usage in past role',
              why: 'Action verbs demonstrate direct ownership to hiring managers.',
              suggestedImprovement: 'Replace "Helped build" with "Architected" and add [actual metric].',
              originalExcerpt: 'Helped build backend APIs',
            },
          ],
          extractionWarnings: [],
        },
        createdAt: '2026-11-15T20:00:00Z',
      };

      const normalized = normalizeBackendAnalysis(mockBackendDto, { id: 'doc-uuid-1', name: 'Alex Resume' });

      expect(normalized.overallScore).toBe(92);
      expect(normalized.scoreRating).toBe('EXCELLENT');
      expect(normalized.provider).toBe('GROQ');
      expect(normalized.model).toBe('llama-3.3-70b-versatile');
      expect(normalized.categories.length).toBe(8);

      // Verify strengths & weaknesses mapping
      expect(normalized.strengths.length).toBe(2);
      expect(normalized.strengths[0].title).toBe('Deep Java and React proficiency');
      expect(normalized.weaknesses.length).toBe(1);

      // Verify missing section detection
      expect(normalized.missingInformation.length).toBe(1);
      expect(normalized.missingInformation[0].title).toContain('PUBLICATIONS');

      // Verify evidence panel fields
      expect(normalized.recommendations.length).toBe(1);
      expect(normalized.recommendations[0].originalExcerpt).toBe('Helped build backend APIs');
      expect(normalized.recommendations[0].suggestedImprovement).toContain('[actual metric]');

      // Verify sentence reviews with anti-fabrication placeholders
      expect(normalized.sentenceReviews.length).toBe(1);
      expect(normalized.sentenceReviews[0].originalText).toBe('Helped build backend APIs');
      expect(normalized.sentenceReviews[0].suggestedText).toContain('[actual metric]');
      expect(normalized.sentenceReviews[0].status).toBe('pending');
    });
  });

  describe('ResumeSelector Component', () => {
    it('renders selected resume details, filename, and primary badge', () => {
      render(
        <BrowserRouter>
          <AnalyzerProvider>
            <ResumeSelector />
          </AnalyzerProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Senior Full-Stack Resume')).toBeInTheDocument();
      expect(screen.getByText('Alex_Mercer_Resume.pdf')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  describe('AnalysisConfigPanel Component & Consent Verification', () => {
    it('renders provider badge and Run button when consent is enabled', () => {
      mockConsent = true;
      mockSelectedProvider = 'GROQ';

      render(
        <BrowserRouter>
          <AnalyzerProvider>
            <AnalysisConfigPanel />
          </AnalyzerProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Provider: GROQ/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero-Fabrication Guardrail/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run AI Resume Analysis/i })).toBeInTheDocument();
      expect(screen.queryByText(/External AI Processing Consent Disabled/i)).not.toBeInTheDocument();
    });

    it('renders consent warning banner and link to AI settings when consent is disabled', () => {
      mockConsent = false;
      mockSelectedProvider = 'GEMINI';

      render(
        <BrowserRouter>
          <AnalyzerProvider>
            <AnalysisConfigPanel />
          </AnalyzerProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/External AI Processing Consent Disabled/i)).toBeInTheDocument();
      expect(screen.getByText(/Configure AI Provider Settings & Grant Consent/i)).toBeInTheDocument();
      expect(screen.getByText(/Provider: GEMINI/i)).toBeInTheDocument();
    });
  });

  describe('RecommendationsPanel Component', () => {
    it('renders recommendations with candidate original excerpt in evidence panel', () => {
      render(
        <BrowserRouter>
          <AnalyzerProvider>
            <RecommendationsPanel />
          </AnalyzerProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Prioritized Engineering Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/Prescriptive, actionable adjustments/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Identified Issue/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Why it matters:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Recommended Action/i).length).toBeGreaterThan(0);
    });
  });
});
