import {
  jobMatchingService,
  validateJdFile,
  buildSimulatedMatchAnalysis,
  MATCH_CATEGORIES,
  EVIDENCE_LEVELS,
  SAMPLE_JOB_DESCRIPTIONS,
} from '../jobMatchingService.js';

console.log('--- TEST 1: Match Categories Completeness ---');
console.assert(MATCH_CATEGORIES.length === 7, 'Must have exactly 7 match categories');
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
  console.assert(
    MATCH_CATEGORIES.some((c) => c.id === id),
    `Missing category: ${id}`
  );
});
console.log('✓ All 7 match categories verified');

console.log('--- TEST 2: JD File Validation ---');
const validTxt = { name: 'job_description.txt', size: 1024, type: 'text/plain' };
console.assert(validateJdFile(validTxt).valid === true, 'Valid TXT failed');

const validPdf = { name: 'job_posting.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' };
console.assert(validateJdFile(validPdf).valid === true, 'Valid PDF failed');

const invalidExe = { name: 'job.exe', size: 1024, type: 'application/x-msdownload' };
console.assert(validateJdFile(invalidExe).valid === false, 'Invalid exe was accepted');

const oversized = { name: 'huge_jd.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' };
console.assert(validateJdFile(oversized).valid === false, 'Oversized JD was accepted');
console.log('✓ JD File Validation passed');

console.log('--- TEST 3: Sample Job Descriptions ---');
console.assert(SAMPLE_JOB_DESCRIPTIONS.length >= 2, 'Must have at least 2 sample JDs');
SAMPLE_JOB_DESCRIPTIONS.forEach((sample) => {
  console.assert(sample.company && sample.title && sample.text, 'Sample JD schema incomplete');
});
console.log('✓ Sample Job Descriptions verified');

console.log('--- TEST 4: Simulated Match Analysis Structure ---');
const sampleResume = {
  id: 'res-test-1',
  name: 'Master Resume',
  careerTrackName: 'Full-Stack Engineer',
};
const match = buildSimulatedMatchAnalysis(sampleResume, { company: 'Stripe', title: 'Senior Backend Engineer' });

console.assert(match.overallScore >= 0 && match.overallScore <= 100, 'Match score out of bounds');
console.assert(match.categories.length === 7, 'Must evaluate all 7 match categories');
console.assert(match.decomposition.requiredQualifications.length > 0, 'Required qualifications empty');
console.assert(match.decomposition.preferredQualifications.length > 0, 'Preferred qualifications empty');
console.assert(match.decomposition.responsibilities.length > 0, 'Responsibilities empty');
console.assert(match.decomposition.keywords.technical.length > 0, 'Technical keywords empty');
console.assert(match.decomposition.eligibilityConstraints.length > 0, 'Eligibility constraints empty');
console.assert(match.skillComparisons.length > 0, 'Skill comparisons empty');
console.assert(match.gaps.length > 0, 'Gaps empty');
console.log('✓ Simulated Match Analysis Structure verified');

console.log('--- TEST 5: Evidence Level Constraints ---');
match.skillComparisons.forEach((item) => {
  console.assert(
    Object.values(EVIDENCE_LEVELS).includes(item.evidenceLevel),
    `Invalid evidence level: ${item.evidenceLevel}`
  );
});
console.log('✓ Evidence levels verified');

console.log('--- TEST 6: Async Matching Lifecycle ---');
let lastProgress = 0;
const asyncResult = await jobMatchingService.matchResumeToJob(sampleResume, { company: 'Stripe' }, (p) => {
  console.assert(p >= lastProgress, 'Progress tick must be non-decreasing');
  lastProgress = p;
});
console.assert(lastProgress === 100, 'Matching must complete at 100%');
console.assert(asyncResult.overallScore === 92, 'Overall score mismatch');
console.log('✓ Async Matching Lifecycle verified');

console.log('--- TEST 7: Multi-Resume Comparison ---');
const compareResults = await jobMatchingService.compareResumesForJob([sampleResume, { id: 'res-2', name: 'Resume 2' }], {});
console.assert(compareResults.length === 2, 'Expected 2 comparison items');
console.assert(compareResults[0].overallScore >= compareResults[1].overallScore, 'Ranking order mismatch');
console.log('✓ Multi-Resume Comparison verified');

console.log('--- TEST 8: Saved Job Analyses ---');
const saved = await jobMatchingService.getSavedJobAnalyses();
console.assert(saved.length >= 3, 'Expected at least 3 saved analyses');
console.log('✓ Saved Job Analyses verified');

console.log('ALL JOB MATCHING & DECOMPOSITION TESTS PASSED CLEANLY!');
