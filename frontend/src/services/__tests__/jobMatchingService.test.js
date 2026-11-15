import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  jobMatchingService,
  validateJdFile,
  buildSimulatedMatchAnalysis,
  normalizeBackendMatch,
  MATCH_CATEGORIES,
  EVIDENCE_LEVELS,
  SAMPLE_JOB_DESCRIPTIONS,
} from '../jobMatchingService.js';

describe('Job Matching Service Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('verifies match categories completeness', () => {
    expect(MATCH_CATEGORIES.length).toBe(7);
    const expectedCategoryIds = [
      'technical_skills',
      'project_experience',
      'work_experience',
      'role_responsibility',
      'education_alignment',
      'certification_alignment',
      'keyword_coverage',
    ];
    expectedCategoryIds.forEach((id) => {
      expect(MATCH_CATEGORIES.some((c) => c.id === id)).toBe(true);
    });
  });

  it('validates JD file uploads', () => {
    const validTxt = { name: 'job_description.txt', size: 1024, type: 'text/plain' };
    expect(validateJdFile(validTxt).valid).toBe(true);

    const validPdf = { name: 'job_posting.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' };
    expect(validateJdFile(validPdf).valid).toBe(true);

    const invalidExe = { name: 'job.exe', size: 1024, type: 'application/x-msdownload' };
    expect(validateJdFile(invalidExe).valid).toBe(false);

    const oversized = { name: 'huge_jd.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' };
    expect(validateJdFile(oversized).valid).toBe(false);
  });

  it('verifies sample job descriptions', () => {
    expect(SAMPLE_JOB_DESCRIPTIONS.length).toBeGreaterThanOrEqual(2);
    SAMPLE_JOB_DESCRIPTIONS.forEach((sample) => {
      expect(sample.company).toBeTruthy();
      expect(sample.title).toBeTruthy();
      expect(sample.text).toBeTruthy();
    });
  });

  it('verifies simulated match analysis structure', () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Master Resume',
      careerTrackName: 'Full-Stack Engineer',
    };
    const match = buildSimulatedMatchAnalysis(sampleResume, {
      company: 'Stripe',
      title: 'Senior Backend Engineer',
    });

    expect(match.overallScore).toBeGreaterThanOrEqual(0);
    expect(match.overallScore).toBeLessThanOrEqual(100);
    expect(match.categories.length).toBe(7);
    expect(match.decomposition.requiredQualifications.length).toBeGreaterThan(0);
    expect(match.decomposition.preferredQualifications.length).toBeGreaterThan(0);
    expect(match.decomposition.responsibilities.length).toBeGreaterThan(0);
    expect(match.decomposition.keywords.technical.length).toBeGreaterThan(0);
    expect(match.decomposition.eligibilityConstraints.length).toBeGreaterThan(0);
    expect(match.skillComparisons.length).toBeGreaterThan(0);
    expect(match.gaps.length).toBeGreaterThan(0);
  });

  it('verifies evidence level constraints', () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Master Resume',
    };
    const match = buildSimulatedMatchAnalysis(sampleResume, {
      company: 'Stripe',
      title: 'Senior Backend Engineer',
    });

    match.skillComparisons.forEach((item) => {
      expect(Object.values(EVIDENCE_LEVELS)).toContain(item.evidenceLevel);
    });
  });

  it('verifies async matching lifecycle', async () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Master Resume',
    };
    let lastProgress = 0;
    const asyncResult = await jobMatchingService.matchResumeToJob(
      sampleResume,
      { company: 'Stripe' },
      (p) => {
        expect(p).toBeGreaterThanOrEqual(lastProgress);
        lastProgress = p;
      }
    );
    expect(lastProgress).toBe(100);
    expect(asyncResult.overallScore).toBe(92);
  });

  it('verifies multi-resume comparison', async () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Master Resume',
    };
    const compareResults = await jobMatchingService.compareResumesForJob(
      [sampleResume, { id: 'res-2', name: 'Resume 2' }],
      {}
    );
    expect(compareResults.length).toBe(2);
    expect(compareResults[0].overallScore).toBeGreaterThanOrEqual(compareResults[1].overallScore);
  });

  it('verifies saved job analyses', async () => {
    const saved = await jobMatchingService.getSavedJobAnalyses();
    expect(saved.length).toBeGreaterThanOrEqual(3);
  });

  describe('normalizeBackendMatch Tests', () => {
    it('returns null for null or undefined input', () => {
      expect(normalizeBackendMatch(null)).toBeNull();
      expect(normalizeBackendMatch(undefined)).toBeNull();
    });

    it('transforms real backend JobMatchDto into comprehensive match view', () => {
      const mockDto = {
        id: '11111111-2222-3333-4444-555555555555',
        resumeId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        resumeName: 'Senior Distributed Engineer Resume',
        jobId: '99999999-8888-7777-6666-555555555555',
        jobTitle: 'Principal Backend Architect',
        companyName: 'Stripe Global',
        overallScore: 89,
        requiredSkillsScore: 92,
        preferredSkillsScore: 85,
        experienceScore: 88,
        qualificationsScore: 100,
        responsibilitiesScore: 85,
        confidenceScore: 0.95,
        matchSummary: 'Comprehensive alignment with distributed systems and transactional architecture.',
        report: {
          coverage_score: 91.2,
          disclaimer: 'Deterministic evaluation disclaimer',
          scores: {
            required_skills: { score: 92, notes: 'Direct Java & Spring Boot evidence' },
            preferred_skills: { score: 85, notes: 'Bonus skills found' },
            experience: { score: 88, notes: '5+ years verified' },
            responsibilities: { score: 85, notes: 'Architecture duties aligned' },
            qualifications: { score: 100, notes: 'Degree matched' },
            domain_knowledge: { score: 80, notes: 'FinTech and high-throughput systems' },
          },
          dimensions: {
            skills: {
              required: [
                {
                  requirement: 'Java 21',
                  category: 'Core Language',
                  classification: 'MATCHED',
                  evidence: 'Expert Java 21 LTS verified in Master Profile',
                  details: { section: 'Skills', job_quote: 'Experience with Java 21' },
                },
                {
                  requirement: 'Apache Kafka',
                  category: 'Messaging',
                  classification: 'PARTIALLY_MATCHED',
                  evidence: 'Kafka listed in preferences',
                  details: { section: 'Tracks', job_quote: 'Kafka streaming required' },
                },
                {
                  requirement: 'Rust',
                  category: 'Language',
                  classification: 'NOT_FOUND',
                  details: { section: 'Skills', job_quote: 'Rust for kernel modules' },
                },
              ],
              preferred: [
                {
                  requirement: 'pgvector',
                  category: 'Database / AI',
                  classification: 'MATCHED',
                  evidence: 'pgvector query engine project verified',
                  details: { section: 'Projects', job_quote: 'Bonus: vector search' },
                },
              ],
            },
            responsibilities: {
              duties: [
                {
                  requirement: 'Design sub-50ms payment APIs',
                  classification: 'MATCHED',
                  evidence: 'Documented 42ms p99 latency optimization',
                  details: { job_quote: 'Architect low-latency transactional APIs' },
                },
              ],
            },
          },
          missing_requirements: ['Rust kernel programming'],
          partial_matches: ['Apache Kafka throughput metrics'],
          recommendations: ['Quantify Kafka message throughput and partition counts'],
        },
      };

      const result = normalizeBackendMatch(mockDto);

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(89);
      expect(result.scoreRating).toBe('Strong Alignment');
      expect(result.jobOverview.company).toBe('Stripe Global');
      expect(result.jobOverview.title).toBe('Principal Backend Architect');
      expect(result.categories.length).toBe(7);
      expect(result.categories[0].score).toBe(92);
      expect(result.categories[1].score).toBe(85);

      // Verify skill comparisons evidence classification
      expect(result.skillComparisons.length).toBe(5); // 3 req + 1 pref + 1 duty
      const javaMatch = result.skillComparisons.find((s) => s.requirement === 'Java 21');
      expect(javaMatch.evidenceLevel).toBe(EVIDENCE_LEVELS.STRONG);

      const kafkaMatch = result.skillComparisons.find((s) => s.requirement === 'Apache Kafka');
      expect(kafkaMatch.evidenceLevel).toBe(EVIDENCE_LEVELS.PARTIAL);

      const rustMatch = result.skillComparisons.find((s) => s.requirement === 'Rust');
      expect(rustMatch.evidenceLevel).toBe(EVIDENCE_LEVELS.NO_RECORDED);

      // Verify gaps prioritization
      expect(result.gaps.length).toBe(2);
      expect(result.gaps[0].priority).toBe('high');
      expect(result.gaps[0].requirement).toBe('Rust kernel programming');
      expect(result.gaps[1].priority).toBe('medium');
    });

    it('handles createMatch and getMatchDetails via API when fetch is mocked', async () => {
      const mockResultDto = {
        id: '12345678-1234-1234-1234-123456789abc',
        overallScore: 84,
        report: { overall_score: 84, scores: {} },
      };

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockResultDto }),
      });

      try {
        const created = await jobMatchingService.createMatch({
          resumeId: '12345678-1234-1234-1234-123456789abc',
          rawJobDescription: 'Test job description with at least fifty characters for valid test input criteria.',
        });
        expect(created.overallScore).toBe(84);

        const details = await jobMatchingService.getMatchDetails('12345678-1234-1234-1234-123456789abc');
        expect(details.overallScore).toBe(84);

        const deleted = await jobMatchingService.deleteMatch('12345678-1234-1234-1234-123456789abc');
        expect(deleted).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
