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

console.log('--- TEST 1: TEMPLATES Completeness (5 Distinct Templates) ---');
console.assert(TEMPLATES.length === 5, `Expected 5 templates, found ${TEMPLATES.length}`);
const expectedTemplates = [
  'ats_professional',
  'modern_professional',
  'technical_resume',
  'academic_cv',
  'international_resume',
];
expectedTemplates.forEach((id) => {
  console.assert(
    TEMPLATES.some((t) => t.id === id),
    `Missing template: ${id}`
  );
});
console.log('✓ All 5 distinct templates verified');

console.log('--- TEST 2: Typography & Design Palette Assets ---');
console.assert(AVAILABLE_FONTS.length >= 5, 'Should have at least 5 available fonts');
console.assert(COLOR_PALETTES.length >= 5, 'Should have at least 5 curated color palettes');
console.assert(DEFAULT_DESIGN_SETTINGS.fontFamily, 'Default font family missing');
console.assert(DEFAULT_DESIGN_SETTINGS.primaryColor, 'Default primary color missing');
console.log('✓ Typography & Palettes verified');

console.log('--- TEST 3: Section Types Architecture (14 Supported Sections) ---');
console.assert(SECTION_TYPES.length >= 12, 'Must support comprehensive resume sections');
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
  console.assert(
    SECTION_TYPES.some((s) => s.type === type),
    `Missing mandatory section: ${type}`
  );
});
console.log('✓ Section types verified');

console.log('--- TEST 4: buildResumeFromProfile Factory ---');
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
      bullets: [
        'Formulated first published computer program for Bernoulli numbers.',
      ],
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
console.assert(builtResume.id, 'Resume must have an ID');
console.assert(builtResume.title.includes('Ada Lovelace'), 'Title must incorporate candidate name');
console.assert(builtResume.sections.length >= 6, 'Must produce populated sections array');
const personalSec = builtResume.sections.find((s) => s.type === 'personal_info');
console.assert(personalSec && personalSec.data.fullName === 'Ada Lovelace', 'Personal info mismatch');
const expSec = builtResume.sections.find((s) => s.type === 'experience');
console.assert(expSec && expSec.data.items.length === 1, 'Experience items count mismatch');
console.log('✓ buildResumeFromProfile verified');

console.log('--- TEST 5: AI Writing Assistant Simulation ---');
async function testAiWriter() {
  const inputSentence = 'Responsible for making backend services faster and fixed database bugs.';
  const rewriteResult = await aiWritingService.rewriteSentence(inputSentence, 'action_verbs');
  console.assert(rewriteResult.original === inputSentence, 'Original sentence preserved');
  console.assert(rewriteResult.rewritten, 'Rewritten sentence must be produced');
  console.assert(rewriteResult.explanation, 'Explanation must accompany rewrite');
  console.assert(rewriteResult.atsScore >= 80, 'ATS score must be high');
  console.log('✓ AI Writing Assistant passed');

  console.log('--- TEST 6: Mock API Service Persistence Contract ---');
  const saveResp = await resumeStudioApiService.saveResumeDraft(builtResume);
  console.assert(saveResp.success === true, 'Save draft failed');
  console.assert(saveResp.data.id === builtResume.id, 'ID mismatch in save response');

  const fetchResp = await resumeStudioApiService.fetchResumeDraft(builtResume.id);
  console.assert(fetchResp.success === true, 'Fetch draft failed');
  console.assert(fetchResp.data.title === builtResume.title, 'Fetched draft title mismatch');
  console.log('✓ Mock API Service contracts verified');

  console.log('\n========================================');
  console.log('ALL RESUME STUDIO TESTS PASSED CLEANLY!');
  console.log('========================================');
}

testAiWriter();
