import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  normalizeBackendJobAnalysis,
} from '@/services/jobAnalysisService';
import { JobAnalysisResultView } from '../components/intelligence/JobAnalysisResultView';
import { JobDescriptionAnalyzerPage } from '@/pages/JobDescriptionAnalyzerPage';
import { aiPreferenceService } from '@/services/aiPreferenceService';

const MOCK_RAW_ANALYSIS = {
  id: 'ana-1234-uuid',
  jobId: null,
  provider: 'GROQ',
  model: 'llama-3.3-70b-versatile',
  jobTitle: 'Senior Distributed Systems Engineer',
  companyName: 'Acme Corp',
  seniority: 'SENIOR',
  employmentType: 'FULL_TIME',
  workArrangement: 'HYBRID',
  location: 'San Francisco, CA',
  experienceSummary: '5+ years',
  summary: 'Senior distributed systems engineering role requiring strong Java and Kafka skills.',
  report: {
    jobOverview: {
      jobTitle: 'Senior Distributed Systems Engineer',
      companyName: 'Acme Corp',
      roleCategory: 'BACKEND',
      seniority: 'SENIOR',
      employmentType: 'FULL_TIME',
      workArrangement: 'HYBRID',
      location: 'San Francisco, CA',
      experienceRange: {
        minimumYears: 5,
        maximumYears: null,
        rawRequirement: '5+ years',
      },
    },
    technicalSkills: {
      required: ['Java 21', 'Spring Boot 3', 'Apache Kafka', 'PostgreSQL'],
      preferred: ['Docker', 'Kubernetes'],
      mentioned: ['AWS'],
    },
    softSkills: ['Problem Solving', 'Collaboration'],
    responsibilities: ['Architect enterprise-scale microservices and distributed transaction pipelines'],
    qualifications: {
      education: ['BS in Computer Science or equivalent'],
      certifications: ['AWS Solutions Architect'],
      otherRequirements: [],
    },
    toolsAndTechnologies: ['Kafka', 'PostgreSQL', 'Docker'],
    keywords: {
      coreTechnical: ['Java 21', 'Spring Boot 3'],
      frameworksAndTools: ['Docker', 'Kubernetes'],
      domain: ['Distributed Systems'],
      softSkills: ['Collaboration'],
      roleAndResponsibility: ['Microservices Architecture'],
    },
    requirements: [
      {
        name: 'Java 21 & Spring Boot 3',
        category: 'TECHNICAL_SKILL',
        importance: 'CRITICAL',
        requirementType: 'EXPLICIT',
        evidenceExcerpt: '5+ years with Java 21, Spring Boot 3',
        section: 'Requirements',
        confidence: 0.98,
      },
    ],
    ambiguities: [
      {
        topic: 'On-Call Rotation',
        observation: 'Mentions 24/7 reliability without defining team rotation size or compensation.',
        classification: 'POTENTIAL_AMBIGUITY',
        recommendation: 'Inquire during initial screening about rotation frequency.',
      },
    ],
    redFlags: [],
    summary: 'Senior distributed systems engineering role requiring strong Java and Kafka skills.',
    warnings: [],
  },
  createdAt: '2026-11-15T12:00:00Z',
};

describe('Job Description Analyzer — Normalization & Results', () => {
  it('correctly normalizes backend JobAnalysisDto into client schema', () => {
    const normalized = normalizeBackendJobAnalysis(MOCK_RAW_ANALYSIS);

    expect(normalized).not.toBeNull();
    expect(normalized.id).toBe('ana-1234-uuid');
    expect(normalized.jobOverview.jobTitle).toBe('Senior Distributed Systems Engineer');
    expect(normalized.jobOverview.companyName).toBe('Acme Corp');
    expect(normalized.jobOverview.seniority).toBe('SENIOR');
    expect(normalized.jobOverview.workArrangement).toBe('HYBRID');
    expect(normalized.technicalSkills.required).toContain('Java 21');
    expect(normalized.technicalSkills.preferred).toContain('Docker');
    expect(normalized.qualifications.education).toContain('BS in Computer Science or equivalent');
    expect(normalized.requirements).toHaveLength(1);
    expect(normalized.requirements[0].importance).toBe('CRITICAL');
    expect(normalized.ambiguities).toHaveLength(1);
  });

  it('renders JobAnalysisResultView with overview, skills, and intelligence tabs', () => {
    const normalized = normalizeBackendJobAnalysis(MOCK_RAW_ANALYSIS);

    render(
      <BrowserRouter>
        <JobAnalysisResultView analysis={normalized} rawText="Sample raw text" />
      </BrowserRouter>
    );

    // Company and title
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Distributed Systems Engineer')).toBeInTheDocument();
    expect(screen.getByText('HYBRID')).toBeInTheDocument();
    expect(screen.getByText('FULL_TIME')).toBeInTheDocument();
    expect(screen.getByText('SENIOR')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText(/5\+ years/i)).toBeInTheDocument();

    // Required skills in active default tab
    expect(screen.getByText('Java 21')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot 3')).toBeInTheDocument();
    expect(screen.getByText('Apache Kafka')).toBeInTheDocument();

    // Verify all intelligence tab triggers are present
    expect(screen.getByRole('tab', { name: /Technical Skills/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Qualifications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Responsibilities/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Requirements \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Keywords/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ambiguities \(1\)/i })).toBeInTheDocument();

    // Copy Keywords and Resume Matcher buttons exist
    expect(screen.getByRole('button', { name: /Copy Keywords/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resume Matcher/i })).toBeInTheDocument();
  });
});

describe('JobDescriptionAnalyzerPage — User Interactions & State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(aiPreferenceService, 'getAiPreferences').mockResolvedValue({
      selectedProvider: 'GROQ',
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 4096,
      externalProcessingConsent: true,
      consentUpdatedAt: '2026-11-15T10:00:00Z',
    });
  });

  it('renders page layout, textarea, and character counter', async () => {
    render(
      <BrowserRouter>
        <JobDescriptionAnalyzerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job Description Analyzer')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/Paste the full job listing text here/i)).toBeInTheDocument();
    expect(screen.getByText(/Characters:/i)).toBeInTheDocument();
  });

  it('loads sample preset when preset button is clicked', async () => {
    render(
      <BrowserRouter>
        <JobDescriptionAnalyzerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Stripe' })).toBeInTheDocument();
    });

    const stripeButton = screen.getByRole('button', { name: 'Stripe' });
    fireEvent.click(stripeButton);

    const textarea = screen.getByPlaceholderText(/Paste the full job listing text here/i);
    expect(textarea.value).toContain('About Stripe:');
    expect(screen.getByDisplayValue('Senior Backend Engineer — Core Platform')).toBeInTheDocument();
  });

  it('enforces minimum 50 characters before enabling the Analyze button', async () => {
    render(
      <BrowserRouter>
        <JobDescriptionAnalyzerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Analyze Job Description/i })).toBeInTheDocument();
    });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Job Description/i });
    expect(analyzeBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Paste the full job listing text here/i);
    fireEvent.change(textarea, { target: { value: 'Too short text' } });

    expect(screen.getByText(/Minimum 50 characters required/i)).toBeInTheDocument();
    expect(analyzeBtn).toBeDisabled();
  });

  it('displays consent warning when user lacks external processing consent', async () => {
    vi.spyOn(aiPreferenceService, 'getAiPreferences').mockResolvedValue({
      selectedProvider: 'GROQ',
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 4096,
      externalProcessingConsent: false,
    });

    render(
      <BrowserRouter>
        <JobDescriptionAnalyzerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Data Processing Consent Required/i)).toBeInTheDocument();
    });
  });
});
