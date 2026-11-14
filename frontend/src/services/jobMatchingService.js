/**
 * Job Description Decomposition & Intelligent Resume Matching Service Interface.
 *
 * Defines contracts with the FastAPI AI Microservice (via Spring Boot 3.x Gateway)
 * under /api/v1/jobs/match and /api/v1/jobs/decompose.
 *
 * Provides explainable multi-dimensional compatibility scoring, skill evidence mapping,
 * gap analysis, multi-resume comparison, and saved job analysis tracking.
 *
 * All compatibility scores are clearly marked as heuristic alignment estimates,
 * not probabilities of selection or guarantees of an interview.
 */

export const JOB_MATCHING_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_AI_SERVICE_BASE_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  'http://localhost:8080/api/v1';

export const ALLOWED_JD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ALLOWED_JD_EXTENSIONS = ['.pdf', '.docx', '.txt'];
export const MAX_JD_FILE_SIZE = 5 * 1024 * 1024; // 5 MB for JDs

export const MATCH_CATEGORIES = [
  { id: 'technical_skills', name: 'Technical Skills Alignment', weight: 25 },
  { id: 'project_experience', name: 'Project Experience Alignment', weight: 20 },
  { id: 'work_experience', name: 'Work Experience Alignment', weight: 20 },
  { id: 'role_responsibility', name: 'Role & Responsibility Alignment', weight: 15 },
  { id: 'education_alignment', name: 'Education Alignment', weight: 10 },
  { id: 'certification_alignment', name: 'Certification Alignment', weight: 5 },
  { id: 'keyword_coverage', name: 'Keyword Coverage', weight: 5 },
];

export const EVIDENCE_LEVELS = {
  STRONG: 'strong_evidence',
  PARTIAL: 'partial_evidence',
  NO_RECORDED: 'no_recorded_evidence',
  NOT_APPLICABLE: 'not_applicable',
};

/**
 * Pre-configured realistic sample Job Descriptions for immediate exploration
 */
export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'sample-jd-1',
    company: 'Stripe',
    title: 'Senior Backend Engineer — Core Platform & Financial Infrastructure',
    location: 'San Francisco, CA / Remote (US)',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Senior (5+ years)',
    deadline: '2026-12-15',
    url: 'https://stripe.com/jobs/senior-backend-core',
    text: `About Stripe:
Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world's largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.

About the Role:
We are looking for a Senior Backend Engineer to join our Core Platform engineering team. You will architect, build, and operate distributed systems that process billions of dollars in daily transactions with four-nines (99.99%) availability.

Requirements & Qualifications:
• 5+ years of software engineering experience building scalable backend platforms in Java, Go, or Python.
• Deep experience with modern distributed frameworks, especially Java 21, Spring Boot 3, and asynchronous messaging (Kafka / RabbitMQ).
• Strong relational database fundamentals with PostgreSQL or MySQL, including schema optimization and indexing strategies.
• Hands-on familiarity with containerization (Docker, Kubernetes) and CI/CD pipelines.
• Bachelor’s degree in Computer Science, Software Engineering, or equivalent practical experience.

Preferred Qualifications & Bonus Skills:
• Familiarity with semantic vector embeddings, pgvector, or distributed caching (Redis).
• Experience building zero-trust microservice communication with mTLS and OAuth 2.1.
• Prior experience in financial services, payment gateways, or distributed transaction saga patterns.

Responsibilities:
• Architect robust, low-latency APIs handling high-throughput transactional traffic.
• Collaborate with cross-functional product and infrastructure teams to decompose monolithic dependencies.
• Lead code reviews, mentor early-career engineers, and establish reliability best practices.
• Participate in lightweight on-call incident response and post-mortem analysis.`,
  },
  {
    id: 'sample-jd-2',
    company: 'Databricks',
    title: 'AI Systems & Vector Search Engineer',
    location: 'Mountain View, CA / Hybrid',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Mid-Senior (4+ years)',
    deadline: '2026-12-30',
    url: 'https://databricks.com/careers/ai-vector-search',
    text: `About Databricks:
Databricks is the data and AI company. More than 10,000 organizations worldwide rely on Databricks to unify their data, analytics, and AI.

The Role:
We are seeking an AI Systems Engineer to expand our semantic search and vector retrieval capabilities. You will design sub-50ms retrieval pipelines for generative AI agents and enterprise RAG platforms.

Requirements:
• 4+ years software engineering experience in Python or Java.
• Strong familiarity with vector search technologies (pgvector, HNSW indexing, Milvus, or Qdrant).
• Hands-on experience developing REST APIs in FastAPI or Spring Boot.
• Solid background in database performance tuning, distributed caching, and container orchestration.
• Degree in Computer Science, Math, or related STEM field.

Preferred Qualifications:
• Experience with LLM orchestration (LangChain, LlamaIndex, or custom pipelines).
• Contributions to open-source database or AI infrastructure tools.`,
  },
];

/**
 * Validate an uploaded Job Description file
 */
export function validateJdFile(file) {
  const errors = [];
  if (!file) return { valid: false, errors: ['No file selected.'] };

  if (file.size > MAX_JD_FILE_SIZE) {
    errors.push('File exceeds maximum size of 5 MB.');
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_JD_EXTENSIONS.includes(extension)) {
    errors.push(`Unsupported format "${extension}". Only PDF, DOCX, and TXT files are accepted.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    extension,
    mimeType: file.type || 'text/plain',
  };
}

/**
 * Detailed explainable match engine simulation
 * Strictly factual: maps requirement to recorded evidence without fabricating experience
 */
export function buildSimulatedMatchAnalysis(resume, jobDetails, _config = {}) {
  const company = jobDetails.company || 'Stripe';
  const title = jobDetails.title || 'Senior Backend Engineer — Core Platform';

  return {
    matchId: `match-${Date.now().toString(36)}`,
    jobId: jobDetails.id || `job-${Date.now().toString(36)}`,
    matchedAt: new Date().toISOString(),
    resumeId: resume.id,
    resumeName: resume.name,
    resumeTrack: resume.careerTrackName,

    // Job Profile Overview
    jobOverview: {
      company,
      title,
      location: jobDetails.location || 'San Francisco, CA / Remote (US)',
      employmentType: jobDetails.employmentType || 'Full-time',
      experienceLevel: jobDetails.experienceLevel || 'Senior (5+ years)',
      workMode: jobDetails.workMode || 'Hybrid',
      deadline: jobDetails.deadline || '2026-12-15',
      url: jobDetails.url || '',
    },

    // Overall Heuristic Compatibility Score (0-100)
    overallScore: 92,
    scoreRating: 'High Compatibility',
    scoreSummary:
      'Strong alignment with core backend architecture (Java 21, Spring Boot 3, PostgreSQL). Verified project evidence demonstrates distributed system capabilities. Minor gap identified in enterprise Kafka streaming telemetry.',
    disclaimer:
      'This compatibility score is a heuristic alignment estimate comparing your verified profile evidence with extracted job requirements. It is NOT an ATS screening pass guarantee, selection probability, or employer endorsement.',

    // Structural Job Decomposition
    decomposition: {
      requiredQualifications: [
        {
          id: 'req-1',
          category: 'Experience',
          text: '5+ years software engineering experience in Java or distributed backends.',
          isMandatory: true,
        },
        {
          id: 'req-2',
          category: 'Frameworks',
          text: 'Proficiency in modern Java (Java 17/21) and Spring Boot 3 microservices.',
          isMandatory: true,
        },
        {
          id: 'req-3',
          category: 'Databases',
          text: 'Relational database fundamentals with PostgreSQL and schema optimization.',
          isMandatory: true,
        },
        {
          id: 'req-4',
          category: 'DevOps',
          text: 'Containerization with Docker and deployment through automated CI/CD.',
          isMandatory: true,
        },
        {
          id: 'req-5',
          category: 'Education',
          text: 'Bachelor’s degree in Computer Science or equivalent practical experience.',
          isMandatory: true,
        },
      ],
      preferredQualifications: [
        {
          id: 'pref-1',
          category: 'AI & Vector',
          text: 'Familiarity with semantic search, vector embeddings, and pgvector.',
          isBonus: true,
        },
        {
          id: 'pref-2',
          category: 'Streaming',
          text: 'Hands-on experience with Apache Kafka, event streaming, or saga patterns.',
          isBonus: true,
        },
        {
          id: 'pref-3',
          category: 'Security',
          text: 'Knowledge of zero-trust network architectures, mTLS, and OAuth 2.1.',
          isBonus: true,
        },
      ],
      responsibilities: [
        {
          id: 'resp-1',
          text: 'Architect robust, low-latency APIs handling high-throughput transactional traffic.',
        },
        {
          id: 'resp-2',
          text: 'Decompose monolithic dependencies and optimize PostgreSQL query execution.',
        },
        {
          id: 'resp-3',
          text: 'Lead architectural code reviews and establish testing best practices.',
        },
        {
          id: 'resp-4',
          text: 'Participate in incident triage, observability tuning, and root-cause post-mortems.',
        },
      ],
      keywords: {
        technical: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'REST APIs', 'Microservices'],
        tools: ['Git', 'Maven/Gradle', 'Docker', 'pgvector', 'Postman'],
        softSkills: ['System Design', 'Cross-functional Collaboration', 'Technical Mentorship'],
        industry: ['Distributed Systems', 'Transactional Consistency', 'High Availability'],
      },
      eligibilityConstraints: [
        { id: 'el-1', label: 'Degree Requirement', value: 'B.S. in CS or equivalent field', met: true },
        { id: 'el-2', label: 'Minimum Seniority', value: '5+ years professional experience', met: true },
        { id: 'el-3', label: 'Work Arrangement', value: 'Hybrid / Remote US eligible', met: true },
        { id: 'el-4', label: 'Work Authorization', value: 'Standard authorization (if required)', met: true },
      ],
    },

    // Category Match Breakdown (7 Categories)
    categories: [
      {
        id: 'technical_skills',
        name: 'Technical Skills Alignment',
        score: 96,
        matchedCount: 5,
        totalCount: 5,
        status: 'Strong',
        explanation: 'Direct verified evidence for Java 21 LTS, Spring Boot 3, PostgreSQL, and REST microservices in Master Profile.',
      },
      {
        id: 'project_experience',
        name: 'Project Experience Alignment',
        score: 92,
        matchedCount: 3,
        totalCount: 4,
        status: 'High',
        explanation: 'Your VectorDB Query Engine and Microservices Architecture projects directly prove scalable backend competence.',
      },
      {
        id: 'work_experience',
        name: 'Work Experience Alignment',
        score: 90,
        matchedCount: 3,
        totalCount: 3,
        status: 'High',
        explanation: '5+ years tenure across CloudScale Technologies and prior engineering roles fulfills senior experience requirements.',
      },
      {
        id: 'role_responsibility',
        name: 'Role & Responsibility Alignment',
        score: 91,
        matchedCount: 4,
        totalCount: 4,
        status: 'Strong',
        explanation: 'Documented responsibilities match requirements for architectural leadership and query latency optimization.',
      },
      {
        id: 'education_alignment',
        name: 'Education Alignment',
        score: 95,
        matchedCount: 1,
        totalCount: 1,
        status: 'Verified',
        explanation: 'Bachelor of Technology in Computer Science meets the stated educational requirement.',
      },
      {
        id: 'certification_alignment',
        name: 'Certification Alignment',
        score: 85,
        matchedCount: 1,
        totalCount: 2,
        status: 'Adequate',
        explanation: 'AWS Solutions Architect Associate aligns well; optional Kafka developer credential is not recorded.',
      },
      {
        id: 'keyword_coverage',
        name: 'Keyword Coverage',
        score: 94,
        matchedCount: 12,
        totalCount: 14,
        status: 'High',
        explanation: '86% semantic keyword overlap across technical and architectural terminology.',
      },
    ],

    // Granular Skill Comparison Table
    skillComparisons: [
      {
        id: 'sk-1',
        requirement: 'Java (Java 17/21)',
        category: 'Language / Core',
        evidenceLevel: EVIDENCE_LEVELS.STRONG,
        profileEvidence: 'Java 21 LTS listed as Expert in Master Profile. Core language of CloudScale backend.',
        supportingSection: 'Skills & Experience',
        supportingItem: 'CloudScale Technologies — Senior Software Engineer',
      },
      {
        id: 'sk-2',
        requirement: 'Spring Boot 3',
        category: 'Framework',
        evidenceLevel: EVIDENCE_LEVELS.STRONG,
        profileEvidence: 'Featured across work history and highlighted in VectorDB Query Engine project.',
        supportingSection: 'Projects & Experience',
        supportingItem: 'VectorDB Query Engine Project',
      },
      {
        id: 'sk-3',
        requirement: 'PostgreSQL & Schema Optimization',
        category: 'Database',
        evidenceLevel: EVIDENCE_LEVELS.STRONG,
        profileEvidence: 'PostgreSQL + pgvector listed under Databases. Documented 1.2M query throughput tuning.',
        supportingSection: 'Experience',
        supportingItem: 'Senior Software Engineer (2023 – Present)',
      },
      {
        id: 'sk-4',
        requirement: 'Docker & Containerization',
        category: 'DevOps / Tooling',
        evidenceLevel: EVIDENCE_LEVELS.STRONG,
        profileEvidence: 'Multi-stage Docker builds documented across projects and CI/CD pipelines.',
        supportingSection: 'Skills',
        supportingItem: 'DevOps & Tooling Category',
      },
      {
        id: 'sk-5',
        requirement: 'pgvector / Vector Search',
        category: 'Bonus / Preferred',
        evidenceLevel: EVIDENCE_LEVELS.STRONG,
        profileEvidence: 'pgvector listed as Advanced skill in Databases category.',
        supportingSection: 'Skills & Projects',
        supportingItem: 'Master Career Profile',
      },
      {
        id: 'sk-6',
        requirement: 'Apache Kafka / Message Streaming',
        category: 'Bonus / Preferred',
        evidenceLevel: EVIDENCE_LEVELS.PARTIAL,
        profileEvidence: 'Kafka mentioned in Solutions Architect persona notes; no standalone project dedicated to streaming.',
        supportingSection: 'Career Track Personas',
        supportingItem: 'Solutions Architect Persona',
      },
      {
        id: 'sk-7',
        requirement: 'Kubernetes Cluster Orchestration',
        category: 'Infrastructure',
        evidenceLevel: EVIDENCE_LEVELS.PARTIAL,
        profileEvidence: 'Basic container orchestration noted, but Helm chart authorship is not explicitly detailed.',
        supportingSection: 'Experience',
        supportingItem: 'General DevOps Scope',
      },
      {
        id: 'sk-8',
        requirement: 'Payment Gateway Protocol (ISO 8583)',
        category: 'Domain Knowledge',
        evidenceLevel: EVIDENCE_LEVELS.NO_RECORDED,
        profileEvidence: 'No recorded evidence in profile or uploaded resume.',
        supportingSection: 'None',
        supportingItem: null,
      },
    ],

    // Prioritized Gap Analysis
    gaps: [
      {
        id: 'gap-1',
        type: 'weak_evidence',
        priority: 'high',
        requirement: 'Distributed Messaging & Event Sourcing (Kafka)',
        currentEvidence: 'Kafka noted in career track preferences, but specific event-driven throughput metrics are absent.',
        whyItMatters: 'The Core Platform role heavily relies on asynchronous transaction queues to handle surge traffic.',
        recommendedStep: 'Link an existing project or work snippet demonstrating asynchronous event publishing or dead-letter queue handling.',
        profileSection: 'Projects & Work Experience',
        actionLabel: 'Add Project Evidence',
        actionRoute: '/profile',
      },
      {
        id: 'gap-2',
        type: 'missing_technical_skill',
        priority: 'medium',
        requirement: 'Observability & Distributed Tracing (OpenTelemetry)',
        currentEvidence: 'No recorded evidence of OpenTelemetry or Jaeger tracing in your active skills graph.',
        whyItMatters: 'Large-scale microservices require distributed trace propagation for latency diagnosis.',
        recommendedStep: 'If you have worked with distributed logging (MDC, Micrometer, Zipkin), record it under Tools in your profile.',
        profileSection: 'Master Skills Matrix',
        actionLabel: 'Update Profile Skills',
        actionRoute: '/profile',
      },
      {
        id: 'gap-3',
        type: 'resume_presentation_gap',
        priority: 'medium',
        requirement: 'Quantifiable Latency Reduction Metrics',
        currentEvidence: 'Your resume states "optimized database queries" without specifying the percentage reduction.',
        whyItMatters: 'Stripe engineering managers look for measurable engineering impact (e.g. "reduced p99 latency by 35%").',
        recommendedStep: 'Add baseline context in your bullet point using the Resume Analyzer rewrite tool.',
        profileSection: 'Resume Bullet Points',
        actionLabel: 'Tune in Resume Analyzer',
        actionRoute: '/resume-analyzer',
      },
      {
        id: 'gap-4',
        type: 'critical_eligibility',
        priority: 'optional',
        requirement: 'Financial Gateway Experience',
        currentEvidence: 'No recorded banking or FinTech domain experience.',
        whyItMatters: 'This is a nice-to-have bonus; general high-throughput distributed systems experience compensates effectively.',
        recommendedStep: 'Emphasize transactional consistency (ACID guarantees, idempotent endpoints) in your cover letter.',
        profileSection: 'Application Narrative',
        actionLabel: 'Draft Tailored Narrative',
        actionRoute: '/profile',
      },
    ],
  };
}

/**
 * Service implementation for Job Description Matching
 */
export const jobMatchingService = {
  /**
   * Decompose and analyze a Job Description
   * Target endpoint: POST /api/v1/jobs/decompose
   */
  async analyzeJobDescription(jobText, jobDetails = {}) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return buildSimulatedMatchAnalysis({ id: 'res-default', name: 'Master Resume' }, jobDetails);
  },

  /**
   * Perform intelligent matching between a resume and a job description
   * Target endpoint: POST /api/v1/jobs/match
   */
  async matchResumeToJob(resume, jobDetails, onProgress = () => {}) {
    const steps = [
      { progress: 20, message: 'Ingesting and parsing job description requirements...' },
      { progress: 45, message: 'Extracting mandatory qualifications and bonus skills...' },
      { progress: 70, message: 'Correlating profile evidence against role deliverables...' },
      { progress: 90, message: 'Calculating explainable match scores and gap analysis...' },
      { progress: 100, message: 'Matching complete!' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      onProgress(step.progress, step.message);
    }

    return buildSimulatedMatchAnalysis(resume, jobDetails);
  },

  /**
   * Compare multiple resumes against the same job description
   * Target endpoint: POST /api/v1/jobs/match/compare
   */
  async compareResumesForJob(resumes, _jobDetails) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return resumes.map((resume, idx) => {
      const score = idx === 0 ? 92 : idx === 1 ? 88 : 84;
      return {
        resumeId: resume.id,
        resumeName: resume.name,
        careerTrack: resume.careerTrackName,
        overallScore: score,
        skillAlignment: score >= 90 ? '96%' : '88%',
        experienceAlignment: score >= 90 ? '90%' : '85%',
        strengths: score >= 90 ? 'Direct Java 21 & Spring Boot 3 evidence' : 'Good foundational architecture',
        gaps: score >= 90 ? 'Kafka telemetry metrics' : 'Less explicit vector search evidence',
      };
    });
  },

  /**
   * Retrieve saved job analyses
   * Target endpoint: GET /api/v1/jobs/saved-analyses
   */
  async getSavedJobAnalyses() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [
      {
        id: 'saved-match-1',
        company: 'Stripe',
        title: 'Senior Backend Engineer — Core Platform',
        analyzedAt: '2026-11-14T11:00:00Z',
        resumeName: 'Full-Stack Engineer Resume — Master',
        careerTrack: 'Full-Stack Engineer',
        compatibilityScore: 92,
        status: 'high_match',
      },
      {
        id: 'saved-match-2',
        company: 'Databricks',
        title: 'AI Systems & Vector Search Engineer',
        analyzedAt: '2026-11-12T15:30:00Z',
        resumeName: 'Solutions Architect Resume — Cloud',
        careerTrack: 'Solutions Architect',
        compatibilityScore: 89,
        status: 'good_match',
      },
      {
        id: 'saved-match-3',
        company: 'Vercel',
        title: 'Full-Stack Product Engineer',
        analyzedAt: '2026-11-10T09:20:00Z',
        resumeName: 'Full-Stack Engineer Resume — Master',
        careerTrack: 'Full-Stack Engineer',
        compatibilityScore: 94,
        status: 'high_match',
      },
    ];
  },
};
