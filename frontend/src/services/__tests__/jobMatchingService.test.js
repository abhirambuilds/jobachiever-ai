import { describe, it, expect } from 'vitest';
import {
  jobMatchingService,
  validateJdFile,
  buildSimulatedMatchAnalysis,
  MATCH_CATEGORIES,
  EVIDENCE_LEVELS,
  SAMPLE_JOB_DESCRIPTIONS,
} from '../jobMatchingService.js';

describe('Job Matching Service Tests', () => {
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
});
