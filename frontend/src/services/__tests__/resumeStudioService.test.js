import { describe, it, expect } from 'vitest';
import {
  TEMPLATES,
  AVAILABLE_FONTS,
  COLOR_PALETTES,
  SECTION_TYPES,
  DEFAULT_DESIGN_SETTINGS,
  buildResumeFromProfile,
  aiWritingService,
  resumeStudioApiService,
} from '../resumeStudioService.js';

describe('Resume Studio Service Tests', () => {
  it('verifies TEMPLATES completeness (5 distinct templates)', () => {
    expect(TEMPLATES.length).toBe(5);
    const expectedTemplates = [
      'ats_professional',
      'modern_professional',
      'technical_resume',
      'academic_cv',
      'international_resume',
    ];
    expectedTemplates.forEach((id) => {
      expect(TEMPLATES.some((t) => t.id === id)).toBe(true);
    });
  });

  it('verifies typography and design palette assets', () => {
    expect(AVAILABLE_FONTS.length).toBeGreaterThanOrEqual(5);
    expect(COLOR_PALETTES.length).toBeGreaterThanOrEqual(5);
    expect(DEFAULT_DESIGN_SETTINGS.fontFamily).toBeTruthy();
    expect(DEFAULT_DESIGN_SETTINGS.primaryColor).toBeTruthy();
  });

  it('verifies section types architecture', () => {
    expect(SECTION_TYPES.length).toBeGreaterThanOrEqual(12);
    const mandatorySectionTypes = [
      'personal_info',
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'certifications',
    ];
    mandatorySectionTypes.forEach((type) => {
      expect(SECTION_TYPES.some((s) => s.type === type)).toBe(true);
    });
  });

  it('verifies buildResumeFromProfile factory', () => {
    const mockProfile = {
      personalInfo: {
        fullName: 'Ada Lovelace',
        headline: 'Computational Systems Engineer',
        email: 'ada@example.com',
        phone: '+1 555 0199',
        city: 'London',
        country: 'United Kingdom',
        linkedinUrl: 'https://linkedin.com/in/ada-lovelace',
        githubUrl: 'https://github.com/ada-lovelace',
        websiteUrl: 'https://ada.dev',
        summary: 'Pioneer of computational algorithms with deep mathematical foundations.',
      },
      skills: [
        { id: 'sk-1', name: 'Algorithm Design', category: 'Engineering' },
        { id: 'sk-2', name: 'Symbolic Computation', category: 'Engineering' },
      ],
      experience: [
        {
          id: 'exp-1',
          jobTitle: 'Lead Analytical Architect',
          company: 'Babbage Engine Laboratories',
          startDate: '1842-01',
          endDate: '1843-12',
          isCurrent: false,
          location: 'London, UK',
          bullets: ['Formulated first published computer program for Bernoulli numbers.'],
          skillsUsed: ['Algorithm Design'],
        },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of London',
          degree: 'Master of Mathematics',
          fieldOfStudy: 'Mathematical Foundations',
          graduationDate: '1840-06',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Analytical Engine Instruction Pipeline',
          description: 'Pioneered step-by-step memory punched-card calculation architecture.',
          technologies: ['Mechanics', 'Logic'],
        },
      ],
    };

    const builtResume = buildResumeFromProfile(mockProfile, 'track-analytical');
    expect(builtResume.id).toBeTruthy();
    expect(builtResume.title).toContain('Ada Lovelace');
    expect(builtResume.sections.length).toBeGreaterThanOrEqual(6);

    const personalSec = builtResume.sections.find((s) => s.type === 'personal_info');
    expect(personalSec).toBeDefined();
    expect(personalSec.data.fullName).toBe('Ada Lovelace');

    const expSec = builtResume.sections.find((s) => s.type === 'experience');
    expect(expSec).toBeDefined();
    expect(expSec.data.items.length).toBe(1);
    expect(expSec.data.entries.length).toBe(1);
  });

  it('verifies AI writing assistant simulation', async () => {
    const inputSentence = 'Responsible for making backend services faster and fixed database bugs.';
    const rewriteResult = await aiWritingService.rewriteSentence(inputSentence, 'action_verbs');
    expect(rewriteResult.original).toBe(inputSentence);
    expect(rewriteResult.rewritten).toBeTruthy();
    expect(rewriteResult.explanation).toBeTruthy();
    expect(rewriteResult.atsScore).toBeGreaterThanOrEqual(80);
  });

  it('verifies mock API service persistence contract', async () => {
    const mockResume = {
      id: 'res-test-persist',
      title: 'Persistent Resume Draft',
      sections: [],
    };
    const saveResp = await resumeStudioApiService.saveResumeDraft(mockResume);
    expect(saveResp.success).toBe(true);
    expect(saveResp.data.id).toBe(mockResume.id);

    const fetchResp = await resumeStudioApiService.fetchResumeDraft(mockResume.id);
    expect(fetchResp.success).toBe(true);
    expect(fetchResp.data.title).toBe(mockResume.title);
  });
});
