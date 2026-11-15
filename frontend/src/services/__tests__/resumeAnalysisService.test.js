import { describe, it, expect } from 'vitest';
import {
  resumeAnalysisService,
  buildSimulatedAnalysisResult,
  CATEGORY_DEFINITIONS,
  ANALYSIS_MODES,
  TARGET_INDUSTRIES,
} from '../resumeAnalysisService.js';

describe('Resume Analysis Service Tests', () => {
  it('verifies category definitions completeness', () => {
    expect(CATEGORY_DEFINITIONS.length).toBe(8);
    const expectedCategoryIds = [
      'ats_readability',
      'content_quality',
      'skills_relevance',
      'project_quality',
      'experience_presentation',
      'education_certifications',
      'structure_formatting',
      'language_clarity',
    ];
    expectedCategoryIds.forEach((id) => {
      expect(CATEGORY_DEFINITIONS.some((cat) => cat.id === id)).toBe(true);
    });
  });

  it('verifies analysis modes completeness', () => {
    expect(ANALYSIS_MODES.length).toBe(4);
    const expectedModes = ['general', 'role_specific', 'ats_readability', 'technical'];
    expectedModes.forEach((modeId) => {
      expect(ANALYSIS_MODES.some((m) => m.id === modeId)).toBe(true);
    });
  });

  it('verifies simulated analysis result generation', () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Test Full-Stack Resume',
      originalFilename: 'Test_Resume.pdf',
      careerTrackName: 'Full-Stack Engineer',
    };
    const config = {
      mode: 'role_specific',
      targetRole: 'Senior Full-Stack Engineer',
      careerTrackName: 'Full-Stack Engineer',
      targetIndustry: TARGET_INDUSTRIES[0],
    };
    const analysis = buildSimulatedAnalysisResult(sampleResume, config);

    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);
    expect(analysis.categories.length).toBe(8);
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.weaknesses.length).toBeGreaterThan(0);
    expect(analysis.missingInformation.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
    expect(analysis.sentenceReviews.length).toBeGreaterThan(0);
  });

  it('verifies fact-preserving sentence suggestions', () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Test Full-Stack Resume',
      originalFilename: 'Test_Resume.pdf',
    };
    const config = {
      mode: 'role_specific',
      targetRole: 'Senior Full-Stack Engineer',
      targetIndustry: TARGET_INDUSTRIES[0],
    };
    const analysis = buildSimulatedAnalysisResult(sampleResume, config);

    analysis.sentenceReviews.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.originalText).toBeTruthy();
      expect(item.suggestedText).toBeTruthy();
      expect(item.issue).toBeTruthy();
      expect(item.status).toBe('pending');
    });
  });

  it('verifies service analyzeResume async progress lifecycle', async () => {
    const sampleResume = {
      id: 'res-test-1',
      name: 'Test Full-Stack Resume',
      originalFilename: 'Test_Resume.pdf',
    };
    const config = {
      mode: 'role_specific',
      targetRole: 'Senior Full-Stack Engineer',
      targetIndustry: TARGET_INDUSTRIES[0],
    };
    let lastProgress = 0;
    const asyncAnalysis = await resumeAnalysisService.analyzeResume(sampleResume, config, (p) => {
      expect(p).toBeGreaterThanOrEqual(lastProgress);
      lastProgress = p;
    });
    expect(lastProgress).toBe(100);
    expect(asyncAnalysis.overallScore).toBe(91);
  });

  it('verifies service getAnalysisHistory', async () => {
    const history = await resumeAnalysisService.getAnalysisHistory();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(3);
  });
});
