/**
 * Resume Intelligence & Analysis Service Interface for JobAchiever AI.
 *
 * Defines contracts with the FastAPI AI Microservice (via Spring Boot 3.x Gateway)
 * under /api/v1/resumes/analyze.
 * Provides heuristic multi-dimensional scoring, explainable critique, prioritized
 * recommendations, sentence-level revision, and analysis history.
 *
 * All scores are clearly marked as heuristic estimates based on ATS readability
 * and best practices, and do NOT guarantee shortlisting or hiring probability.
 */

export const AI_SERVICE_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_AI_SERVICE_BASE_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  'http://localhost:8080/api/v1';

export const ANALYSIS_MODES = [
  {
    id: 'general',
    name: 'General Resume Analysis',
    description: 'Comprehensive evaluation of formatting, structural clarity, and baseline impact.',
    icon: 'Layers',
  },
  {
    id: 'role_specific',
    name: 'Role-Specific Resume Analysis',
    description: 'Evaluates alignment against a targeted career track or specific job role.',
    icon: 'Target',
  },
  {
    id: 'ats_readability',
    name: 'ATS Readability Analysis',
    description: 'Deep audit of parsing friendliness, font schemas, headings, and keyword layout.',
    icon: 'FileSearch',
  },
  {
    id: 'technical',
    name: 'Technical Resume Analysis',
    description: 'Evaluates architectural depth, stack categorization, and verifiable project evidence.',
    icon: 'Cpu',
  },
];

export const TARGET_INDUSTRIES = [
  'Software Engineering & Cloud Infrastructure',
  'Artificial Intelligence & Data Systems',
  'Enterprise SaaS & Product Platforms',
  'Fintech & Distributed Transactions',
  'Healthcare & Life Sciences Technology',
  'E-Commerce & Digital Marketplaces',
];

/**
 * 8 Required Heuristic Evaluation Categories
 */
export const CATEGORY_DEFINITIONS = [
  {
    id: 'ats_readability',
    name: 'ATS Readability',
    weight: 15,
    description: 'Machine parsing friendliness, layout linearity, standard section headers, and font integrity.',
  },
  {
    id: 'content_quality',
    name: 'Content Quality',
    weight: 15,
    description: 'Substantive descriptions conveying technical context and verified responsibilities.',
  },
  {
    id: 'skills_relevance',
    name: 'Skills Relevance',
    weight: 15,
    description: 'Organization, domain depth, and alignment of technical and professional proficiencies.',
  },
  {
    id: 'project_quality',
    name: 'Project Quality',
    weight: 15,
    description: 'Demonstration of architectural capability, verified deliverables, and technical rigor.',
  },
  {
    id: 'experience_presentation',
    name: 'Experience Presentation',
    weight: 15,
    description: 'Clarity of career timeline, role progression, and actionable impact statements.',
  },
  {
    id: 'education_certifications',
    name: 'Education & Certifications',
    weight: 10,
    description: 'Credentials, academic foundations, and accredited certifications properly accredited.',
  },
  {
    id: 'structure_formatting',
    name: 'Structure & Formatting',
    weight: 10,
    description: 'Whitespace balance, consistent chronological sequencing, and clean typographic rhythm.',
  },
  {
    id: 'language_clarity',
    name: 'Language & Clarity',
    weight: 5,
    description: 'Active verb choice, concise articulation, tone consistency, and zero grammatical ambiguity.',
  },
];

/**
 * Development baseline analysis history
 */
export const INITIAL_ANALYSIS_HISTORY = [
  {
    id: 'ana-hist-001',
    resumeId: 'res-101',
    resumeName: 'Full-Stack Engineer Resume — Master',
    filename: 'Abhiram_Reddy_FullStack_2026.pdf',
    analyzedAt: '2026-11-14T10:30:00Z',
    mode: 'role_specific',
    targetRole: 'Senior Full-Stack Engineer',
    targetTrack: 'Full-Stack Engineer',
    overallScore: 92,
    status: 'completed',
    summary: 'High architectural strength with strong Java 21 / Spring Boot 3 evidence.',
  },
  {
    id: 'ana-hist-002',
    resumeId: 'res-102',
    resumeName: 'Solutions Architect Resume — Cloud & Distributed',
    filename: 'Abhiram_Reddy_Solutions_Architect.pdf',
    analyzedAt: '2026-11-12T14:15:00Z',
    mode: 'technical',
    targetRole: 'Enterprise Solutions Architect',
    targetTrack: 'Solutions Architect',
    overallScore: 89,
    status: 'completed',
    summary: 'Strong zero-trust and distributed systems coverage; project metrics can be expanded.',
  },
  {
    id: 'ana-hist-003',
    resumeId: 'res-103',
    resumeName: 'Backend Core Platform Resume — ATS Clean',
    filename: 'Abhiram_Reddy_Backend_Core.docx',
    analyzedAt: '2026-11-09T08:45:00Z',
    mode: 'ats_readability',
    targetRole: 'Backend Systems Developer',
    targetTrack: 'Full-Stack Engineer',
    overallScore: 86,
    status: 'completed',
    summary: 'Flawless single-column ATS structure with strong keyword layout.',
  },
];

/**
 * Generates realistic, explainable evaluation analysis for a given resume and config.
 * Fact-preserving: never fabricates claims.
 */
export function buildSimulatedAnalysisResult(resume, config = {}) {
  const role = config.targetRole || resume.careerTrackName || 'Full-Stack Engineer';
  const track = config.careerTrackName || resume.careerTrackName || 'Engineering Track';
  const mode = config.mode || 'role_specific';

  return {
    analysisId: `ana-${Date.now().toString(36)}`,
    resumeId: resume.id,
    resumeName: resume.name,
    originalFilename: resume.originalFilename,
    analyzedAt: new Date().toISOString(),
    config: {
      mode,
      targetRole: role,
      careerTrackName: track,
      targetIndustry: config.targetIndustry || 'Software Engineering & Cloud Infrastructure',
      hasJobDescription: Boolean(config.jobDescription?.trim()),
    },
    // Overall heuristic score (0-100)
    overallScore: 91,
    scoreRating: 'Excellent',
    scoreSummary:
      'Your resume demonstrates high machine-readability, crisp technical categorization, and relevant stack alignment. Key opportunities lie in clarifying individual project ownership and replacing generic summary phrases with concrete focus areas.',
    disclaimer:
      'Heuristic evaluation estimate based on ATS readability criteria and industry engineering benchmarks. This score is an advisory guide and does not predict candidate shortlisting or employer decisions.',

    // Category breakdown (8 categories)
    categories: [
      {
        id: 'ats_readability',
        name: 'ATS Readability',
        score: 95,
        rating: 'Outstanding',
        explanation:
          'Single-column structure, standard section headers (Experience, Projects, Education), and cleanly extracted plain text enable sub-millisecond ATS parsing with zero text collisions.',
        opportunity:
          'Ensure custom font glyphs are standard sans-serif to prevent optical character confusion in legacy parsers.',
      },
      {
        id: 'content_quality',
        name: 'Content Quality',
        score: 90,
        rating: 'High',
        explanation:
          'High density of real engineering responsibilities. Strong framing of distributed architecture challenges in Java and Spring Boot.',
        opportunity:
          'Clarify the specific technical scope of your recent microservices refactor to emphasize individual contributions.',
      },
      {
        id: 'skills_relevance',
        name: 'Skills Relevance',
        score: 94,
        rating: 'Outstanding',
        explanation:
          'Explicit technical proficiencies grouped logically into Frontend, Backend, Databases, and AI Infrastructure matching modern full-stack requirements.',
        opportunity:
          'Highlight experience with vector search and pgvector in the summary to immediately flag emerging AI competencies.',
      },
      {
        id: 'project_quality',
        name: 'Project Quality',
        score: 88,
        rating: 'Strong',
        explanation:
          'Projects showcase practical full-stack execution with real frameworks (Spring Boot 3, React 18, PostgreSQL).',
        opportunity:
          'Explicitly detail your role in project decisions (e.g. why pgvector was selected over standalone vector DBs) to demonstrate architectural depth.',
      },
      {
        id: 'experience_presentation',
        name: 'Experience Presentation',
        score: 89,
        rating: 'Strong',
        explanation:
          'Chronological reverse-order presentation with clear company headers and tenure boundaries.',
        opportunity:
          'Expand on STAR (Situation, Task, Action, Result) progression in your senior engineering entries.',
      },
      {
        id: 'education_certifications',
        name: 'Education & Certifications',
        score: 92,
        rating: 'High',
        explanation:
          'Accredited degree, graduation timeline, and relevant technical coursework clearly delineated.',
        opportunity:
          'Add credential verification links or license IDs for active cloud architecture certifications if available.',
      },
      {
        id: 'structure_formatting',
        name: 'Structure & Formatting',
        score: 93,
        rating: 'Outstanding',
        explanation:
          'Clean typographic hierarchy, consistent bullet point indentations, and well-proportioned margins.',
        opportunity:
          'Maintain uniform date notation across all roles (e.g., standardizing on "Jan 2024 – Present").',
      },
      {
        id: 'language_clarity',
        name: 'Language & Clarity',
        score: 87,
        rating: 'Strong',
        explanation:
          'Clear, professional technical vocabulary with minimal passive phrasing and zero typos detected.',
        opportunity:
          'Replace weak action verbs like "Assisted with" or "Helped maintain" with precise verbs such as "Architected", "Engineered", and "Refactored".',
      },
    ],

    // Qualitative Analysis Sections
    strengths: [
      {
        id: 'str-1',
        title: 'Modern Architecture & Stack Relevance',
        description:
          'Your resume features modern, commercially demanded technologies (Java 21 LTS, Spring Boot 3, React 18, PostgreSQL, pgvector) with clear versioning.',
        section: 'Skills & Experience',
      },
      {
        id: 'str-2',
        title: 'Linear ATS-Compliant Layout',
        description:
          'No complex multi-column tables, text boxes, or embedded graphical icons that confuse enterprise parsing filters.',
        section: 'Structure & Formatting',
      },
      {
        id: 'str-3',
        title: 'Cohesive Full-Stack Career Persona',
        description:
          'Experience seamlessly bridges client-side component architecture and robust server-side distributed orchestration.',
        section: 'Career Persona Alignment',
      },
      {
        id: 'str-4',
        title: 'Action-Driven Project Narrative',
        description:
          'Project portfolio highlights real implementations rather than generic academic tutorials.',
        section: 'Projects & Portfolios',
      },
    ],

    weaknesses: [
      {
        id: 'weak-1',
        title: 'Generic Professional Summary Opening',
        description:
          'The initial headline lacks immediate differentiation. Leading with specific architectural specializations (e.g., "High-Throughput Distributed Systems") creates a stronger first impression.',
        section: 'Professional Summary',
        severity: 'high',
      },
      {
        id: 'weak-2',
        title: 'Missing Context for Performance Milestones',
        description:
          'Statements like "improved query performance" lack baseline context. Explaining the previous bottleneck strengthens credibility without inventing claims.',
        section: 'Professional Experience',
        severity: 'critical',
      },
      {
        id: 'weak-3',
        title: 'Unclarified Individual Ownership in Team Projects',
        description:
          'Descriptions use passive collective phrasing ("The team deployed..."). Clarifying what you personally authored reinforces individual capability.',
        section: 'Projects',
        severity: 'medium',
      },
    ],

    missingInformation: [
      {
        id: 'miss-1',
        title: 'Public Repository / Code Evidence Links',
        description:
          'Reviewers often look for direct GitHub links to inspect clean code conventions and architectural patterns.',
        section: 'Projects & Personal Info',
        status: 'recommended',
      },
      {
        id: 'miss-2',
        title: 'Explicit Testing Methodology',
        description:
          'Target role emphasizes reliability, but unit, integration, or contract testing frameworks (e.g. JUnit 5, Mockito, Vitest) are not explicitly called out.',
        section: 'Skills & Competencies',
        status: 'opportunity',
      },
      {
        id: 'miss-3',
        title: 'CI/CD Pipeline Interaction Scope',
        description:
          'Your backend profile notes Docker, but does not state your familiarity with automated build, test, and release workflows.',
        section: 'Work History',
        status: 'optional',
      },
    ],

    languageAndClarity: [
      {
        id: 'lang-1',
        title: 'Passive Verb Pattern Detected',
        description:
          'Found 3 occurrences of passive phrasing ("was responsible for", "helped assist"). Replacing these with proactive ownership verbs immediately sharpens readability.',
        count: 3,
      },
      {
        id: 'lang-2',
        title: 'Repetitive Transition Phrases',
        description:
          'The phrase "designed and implemented" appears 4 times across bullet points. Diversify with "architected", "formulated", "spearheaded", and "engineered".',
        count: 4,
      },
      {
        id: 'lang-3',
        title: 'Clear Technical Nomenclature',
        description:
          'Technical names and acronyms (JWT, REST, API, PostgreSQL) are capitalized correctly with zero grammatical misspellings.',
        count: 0,
      },
    ],

    // Prioritized Recommendations (Critical, High, Medium, Optional)
    recommendations: [
      {
        id: 'rec-1',
        priority: 'critical',
        issue: 'Experience bullet points lack individual ownership clarity.',
        why: 'Hiring managers cannot distinguish your personal technical contribution from general team activities.',
        suggestedImprovement:
          'Rewrite bullet points to focus on the problem you identified, the specific service you engineered, and the resulting system outcome.',
        section: 'Experience Presentation',
        actionLabel: 'Review Sentences',
        actionType: 'sentence_review',
      },
      {
        id: 'rec-2',
        priority: 'high',
        issue: 'Professional summary does not highlight emerging AI vector competencies.',
        why: 'Your target role values semantic search and modern AI integrations, but your summary is framed conventionally.',
        suggestedImprovement:
          'Add a crisp one-sentence focus highlighting your hands-on experience with pgvector semantic similarity search.',
        section: 'Professional Summary',
        actionLabel: 'Update Profile Summary',
        actionType: 'profile_link',
      },
      {
        id: 'rec-3',
        priority: 'medium',
        issue: 'Passive verbs dilute your technical authority in project descriptions.',
        why: 'Passive verbs like "worked on" make strong architectural contributions read like junior assistance.',
        suggestedImprovement:
          'Replace "worked on backend services" with "engineered high-concurrency Spring Boot REST services".',
        section: 'Language & Clarity',
        actionLabel: 'Review Sentences',
        actionType: 'sentence_review',
      },
      {
        id: 'rec-4',
        priority: 'optional',
        issue: 'Testing frameworks omitted from core skills matrix.',
        why: 'Explicitly noting JUnit 5, Mockito, and Testcontainers signals disciplined engineering culture.',
        suggestedImprovement:
          'List testing frameworks under a dedicated Testing & Quality subsection in Skills.',
        section: 'Skills Matrix',
        actionLabel: 'Edit Skills in Profile',
        actionType: 'profile_link',
      },
    ],

    // Interactive Sentence-Level Review Items
    sentenceReviews: [
      {
        id: 'sent-1',
        section: 'Experience — Senior Software Engineer',
        originalText:
          'Worked on the backend architecture and was responsible for helping the database performance.',
        issue: 'Passive phrasing and vague technical ownership ("worked on", "responsible for helping").',
        explanation:
          'Fails to communicate the specific technology stack or the concrete technical actions you took.',
        suggestedText:
          'Architected Spring Boot 3 microservices and optimized PostgreSQL database queries, reducing query execution bottlenecks.',
        status: 'pending', // 'pending' | 'accepted' | 'rejected' | 'modified'
        revisedText: null,
      },
      {
        id: 'sent-2',
        section: 'Experience — CloudScale Technologies',
        originalText:
          'Helped the team deploy containerized microservices to cloud environments using Docker.',
        issue: 'Diminutive phrasing ("helped the team") obscures your engineering impact.',
        explanation:
          'Hiring teams look for individual technical agency. Describe your direct deployment contribution.',
        suggestedText:
          'Containerized core platform services using multi-stage Docker builds and streamlined deployment pipelines across cloud clusters.',
        status: 'pending',
        revisedText: null,
      },
      {
        id: 'sent-3',
        section: 'Professional Summary',
        originalText:
          'Hardworking software engineer with good experience in full stack web development and modern tools.',
        issue: 'Generic clichés ("hardworking", "good experience") that fail ATS keyword filters.',
        explanation:
          'Modern ATS scans for explicit frameworks, years of focus, and core engineering specializations.',
        suggestedText:
          'Senior Full-Stack Engineer with 5+ years of experience architecting distributed systems in Java 21, Spring Boot 3, React 18, and PostgreSQL.',
        status: 'pending',
        revisedText: null,
      },
    ],
  };
}

/**
 * Service implementation for Resume Intelligence & Analysis
 */
export const resumeAnalysisService = {
  /**
   * Run full resume analysis
   * Target endpoint: POST /api/v1/resumes/analyze
   */
  async analyzeResume(resume, config = {}, onProgress = () => {}) {
    const steps = [
      { progress: 20, message: 'Reading document structure and layout hierarchy...' },
      { progress: 45, message: 'Auditing single-column ATS readability and fonts...' },
      { progress: 70, message: 'Evaluating technical evidence, keywords, and stack alignment...' },
      { progress: 90, message: 'Synthesizing fact-preserving critique and recommendations...' },
      { progress: 100, message: 'Analysis complete!' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      onProgress(step.progress, step.message);
    }

    return buildSimulatedAnalysisResult(resume, config);
  },

  /**
   * Fetch analysis history
   * Target endpoint: GET /api/v1/resumes/analyze/history
   */
  async getAnalysisHistory() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...INITIAL_ANALYSIS_HISTORY];
  },

  /**
   * Fetch specific historical analysis report
   * Target endpoint: GET /api/v1/resumes/analyze/{id}
   */
  async getAnalysisDetails(analysisId, sampleResume) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return buildSimulatedAnalysisResult(sampleResume, { mode: 'role_specific' });
  },
};
