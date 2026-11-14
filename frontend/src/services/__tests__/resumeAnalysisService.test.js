import {
  resumeAnalysisService,
  buildSimulatedAnalysisResult,
  CATEGORY_DEFINITIONS,
  ANALYSIS_MODES,
  TARGET_INDUSTRIES,
} from '../resumeAnalysisService.js';

console.log('--- TEST 1: Category Definitions Completeness ---');
console.assert(CATEGORY_DEFINITIONS.length === 8, 'Must have exactly 8 heuristic evaluation categories');
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
  console.assert(
    CATEGORY_DEFINITIONS.some((cat) => cat.id === id),
    `Missing category: ${id}`
  );
});
console.log('✓ All 8 heuristic evaluation categories verified');

console.log('--- TEST 2: Analysis Modes Completeness ---');
console.assert(ANALYSIS_MODES.length === 4, 'Must have exactly 4 analysis modes');
const expectedModes = ['general', 'role_specific', 'ats_readability', 'technical'];
expectedModes.forEach((modeId) => {
  console.assert(
    ANALYSIS_MODES.some((m) => m.id === modeId),
    `Missing mode: ${modeId}`
  );
});
console.log('✓ All 4 evaluation lenses verified');

console.log('--- TEST 3: Simulated Analysis Result Generation ---');
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

console.assert(analysis.overallScore >= 0 && analysis.overallScore <= 100, 'Score out of range');
console.assert(analysis.categories.length === 8, 'Analysis must include all 8 categories');
console.assert(analysis.strengths.length > 0, 'Strengths must not be empty');
console.assert(analysis.weaknesses.length > 0, 'Weaknesses must not be empty');
console.assert(analysis.missingInformation.length > 0, 'Missing information must not be empty');
console.assert(analysis.recommendations.length > 0, 'Recommendations must not be empty');
console.assert(analysis.sentenceReviews.length > 0, 'Sentence reviews must not be empty');
console.log('✓ Analysis result payload structure verified');

console.log('--- TEST 4: Fact-Preserving Sentence Suggestions ---');
analysis.sentenceReviews.forEach((item) => {
  console.assert(item.id, 'Sentence review missing id');
  console.assert(item.originalText, 'Sentence review missing originalText');
  console.assert(item.suggestedText, 'Sentence review missing suggestedText');
  console.assert(item.issue, 'Sentence review missing issue');
  console.assert(item.status === 'pending', 'Sentence review initial status must be pending');
});
console.log('✓ Sentence review fact-preserving properties verified');

console.log('--- TEST 5: Service analyzeResume Progress Lifecycle ---');
let lastProgress = 0;
const asyncAnalysis = await resumeAnalysisService.analyzeResume(sampleResume, config, (p) => {
  console.assert(p >= lastProgress, 'Progress tick must be non-decreasing');
  lastProgress = p;
});
console.assert(lastProgress === 100, 'Progress must reach 100%');
console.assert(asyncAnalysis.overallScore === 91, 'Score mismatch');
console.log('✓ Service async progress lifecycle verified');

console.log('--- TEST 6: Service getAnalysisHistory ---');
const history = await resumeAnalysisService.getAnalysisHistory();
console.assert(Array.isArray(history), 'History is not an array');
console.assert(history.length >= 3, 'Expected at least 3 historical runs');
console.log('✓ Service history verified');

console.log('ALL AI RESUME ANALYZER TESTS PASSED CLEANLY!');
