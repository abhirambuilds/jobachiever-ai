/**
 * Consistent Demo Analyses for Alex Morgan
 *
 * Includes pre-computed, explainable analyses for:
 * 1. Alex Morgan's Master Backend Resume (Overall Score: 94)
 * 2. Stripe Backend Software Engineer Job Description
 */

export const DEMO_RESUME_ANALYSIS_ALEX = {
  analysisId: 'demo-ana-alex-001',
  resumeId: 'demo-res-1',
  resumeName: 'Alex Morgan — Backend Software Engineer (Master)',
  originalFilename: 'Alex_Morgan_Backend_Resume.pdf',
  analyzedAt: '2026-11-15T16:30:00Z',
  config: {
    mode: 'role_specific',
    targetRole: 'Backend Software Engineer',
    careerTrackName: 'Backend Software Engineer',
    targetIndustry: 'Financial Technology, Cloud Infrastructure',
    hasJobDescription: true,
  },
  overallScore: 94,
  scoreRating: 'Exceptional ATS & Technical Alignment',
  scoreSummary:
    'Alex Morgan’s backend resume demonstrates exceptional structural machine-readability (96%), rigorous STAR-method achievement framing, and strong keyword density in Java 21 LTS, Spring Boot 3, and PostgreSQL. Measurable performance metrics (e.g. 32% latency reduction, 10k orders/min idempotency) provide immediate proof of technical competence.',
  disclaimer:
    'Evaluation verified against ATS machine-parsing standards and role-specific technical requirements.',
  isSimulatedDemo: true,
  categories: [
    {
      id: 'ats_readability',
      name: 'ATS Readability',
      score: 96,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'Clean single-column layout, standard unicode bullet points, and compliant section headers ensure 100% parser compatibility.',
      strengths: [
        'Standard heading nomenclature (Summary, Technical Skills, Education, Experience, Projects).',
        'Zero problematic multi-column tables, text boxes, or embedded images.',
      ],
      issues: [],
    },
    {
      id: 'impact_metrics',
      name: 'Measurable Impact & Metrics',
      score: 92,
      maxScore: 100,
      rating: 'Strong',
      summary: 'Nearly all bullet points incorporate quantified outcome metrics (e.g., 500,000+ daily requests, 32% p95 reduction, 94% test coverage).',
      strengths: [
        'Quantified latency improvements with specific percentile thresholds (p95, p99).',
        'Specific concurrency throughput metrics (10,000 orders/minute).',
      ],
      issues: [
        'Academic project bullet points could highlight automated test counts more prominently.',
      ],
    },
    {
      id: 'skills_presentation',
      name: 'Skills Categorization & Depth',
      score: 95,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'Core backend technologies (Java 21, Spring Boot 3, PostgreSQL, REST APIs) are clearly grouped by engineering domain.',
      strengths: [
        'Defensive separation of languages, frameworks, databases, and DevOps tools.',
        'Explicit version annotations (Java 21 LTS, Spring Boot 3).',
      ],
      issues: [],
    },
    {
      id: 'experience_depth',
      name: 'Work Experience Alignment',
      score: 91,
      maxScore: 100,
      rating: 'Strong',
      summary: 'Internship achievements at TechVanguard Labs illustrate production-grade REST API and relational database optimization.',
      strengths: [
        'Action verbs paired with concrete business artifacts (endpoints, index strategies, integration tests).',
      ],
      issues: [
        'Could mention cross-functional stakeholder interaction or agile ceremony leadership.',
      ],
    },
    {
      id: 'action_verbs',
      name: 'Action Verbs & Phrasing',
      score: 94,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'Every bullet begins with a commanding technical verb (Architected, Developed, Optimized, Designed, Collaborated).',
      strengths: ['Eliminated passive voice across all experience items.'],
      issues: [],
    },
    {
      id: 'brevity_conciseness',
      name: 'Brevity & Conciseness',
      score: 93,
      maxScore: 100,
      rating: 'Strong',
      summary: 'Ideal 1-page length for an entry-level candidate with zero filler text or redundant buzzwords.',
      strengths: ['Tight 2-line bullet density maximizing white-space readability.'],
      issues: [],
    },
    {
      id: 'education_credentials',
      name: 'Education & Certifications',
      score: 96,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'B.S. in Computer Science with a high GPA (3.85) and an active AWS Certified Cloud Practitioner credential.',
      strengths: ['Verifiable GPA and accredited coursework listed.'],
      issues: [],
    },
    {
      id: 'keyword_coverage',
      name: 'Domain Keyword Coverage',
      score: 92,
      maxScore: 100,
      rating: 'Strong',
      summary: 'High density of essential distributed backend keywords: idempotency, serialization, p99 latency, connection pooling.',
      strengths: ['Direct keyword matching against top Silicon Valley backend job requisitions.'],
      issues: ['Could weave in Kubernetes and Kafka cluster tuning keywords into project text.'],
    },
  ],
  strengths: [
    {
      id: 'str-1',
      title: 'STAR-Framed Quantifiable Achievements',
      description: 'Strong usage of measurable metrics: 32% p95 latency reduction and 10k orders/minute processing with zero message loss.',
    },
    {
      id: 'str-2',
      title: 'Modern, Marketable Backend Technology Stack',
      description: 'Java 21 LTS and Spring Boot 3 represent the state-of-the-art enterprise stack, paired with relational PostgreSQL depth.',
    },
    {
      id: 'str-3',
      title: 'High Machine-Readability & Clean Heading Hierarchy',
      description: 'Standard single-column layout ensures flawless parsing across Greenhouse, Lever, and Workday ATS systems.',
    },
  ],
  weaknesses: [
    {
      id: 'weak-1',
      title: 'Container Orchestration Could Be Evidenced Further',
      description: 'Docker Compose is mentioned, but Kubernetes (K8s) or production container deployment is currently absent from project bullets.',
    },
    {
      id: 'weak-2',
      title: 'Internship Testing Metrics Could Highlight Automation Tools',
      description: 'Clarify whether CI/CD test automation was run via GitHub Actions or Jenkins in the TechVanguard Labs internship.',
    },
  ],
  missingSections: [
    {
      id: 'sec-1',
      name: 'Open Source Contributions',
      importance: 'Optional / Bonus',
      recommendation: 'Adding a link to public PRs or open-source issues reinforces code collaboration abilities.',
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      category: 'Project Enhancement',
      priority: 'High',
      title: 'Integrate Minikube / Kubernetes Deployment to Order Engine Project',
      description: 'Write a Helm chart or Kubernetes manifest for the Order Engine to demonstrate container orchestration readiness.',
    },
    {
      id: 'rec-2',
      category: 'Resume Phrasing',
      priority: 'Medium',
      title: 'Highlight CI/CD Pipeline Automation in Internship Description',
      description: 'Update the final bullet of the TechVanguard Labs experience to explicitly specify GitHub Actions or pipeline configuration.',
    },
  ],
  sentenceReviews: [
    {
      id: 'sent-1',
      original: 'Developed high-throughput RESTful transaction endpoints using Java 21 and Spring Boot 3 serving 500,000+ daily requests.',
      suggested: 'Architected and deployed 12+ high-concurrency RESTful transaction APIs in Java 21 and Spring Boot 3, sustaining 500,000+ daily requests at sub-50ms latency.',
      reasoning: 'Quantifies endpoint volume and introduces explicit latency service-level objectives (SLOs).',
      section: 'Professional Experience',
      impactChange: '+6% impact score',
    },
    {
      id: 'sent-2',
      original: 'Optimized PostgreSQL database query execution plans and index strategies, reducing p95 API response times by 32% for transaction history queries.',
      suggested: 'Optimized PostgreSQL execution plans via composite B-tree indexing and connection pooling, reducing p95 API response times by 32% across 2.4M records.',
      reasoning: 'Specifies index type (composite B-tree) and dataset scale (2.4M records) for enhanced architectural credibility.',
      section: 'Professional Experience',
      impactChange: '+8% impact score',
    },
  ],
};

export const DEMO_JOB_ANALYSIS_STRIPE = {
  jobId: 'job-demo-stripe',
  analyzedAt: '2026-11-15T17:00:00Z',
  company: 'Stripe',
  roleTitle: 'Backend Software Engineer — Core Platform',
  experienceLevel: 'Entry-to-Mid (0–3 years)',
  workMode: 'Hybrid / Remote',
  salaryRange: '$135,000 - $165,000',
  isSimulatedDemo: true,
  summary:
    'Stripe is seeking an Entry-to-Mid Backend Software Engineer for its Core Platform. The role demands production-grade competency in Java 21 / Spring Boot 3, PostgreSQL schema architecture, and high-availability RESTful API development.',
  requiredTechnicalSkills: [
    { name: 'Java 21', category: 'Languages', importance: 'Critical' },
    { name: 'Spring Boot 3', category: 'Backend Frameworks', importance: 'Critical' },
    { name: 'PostgreSQL', category: 'Databases', importance: 'Critical' },
    { name: 'REST APIs', category: 'Architecture', importance: 'Critical' },
  ],
  preferredTechnicalSkills: [
    { name: 'Apache Kafka', category: 'Message Streaming', importance: 'High' },
    { name: 'Docker', category: 'Containers', importance: 'High' },
    { name: 'Redis', category: 'Caching', importance: 'Medium' },
    { name: 'Kubernetes', category: 'Orchestration', importance: 'Medium' },
  ],
  responsibilities: [
    'Build high-availability RESTful APIs in Java 21 and Spring Boot 3 handling critical transaction traffic.',
    'Design, optimize, and maintain relational PostgreSQL database schemas with defensive indexing.',
    'Implement unit and integration testing suites to guarantee 99.99% service reliability.',
    'Collaborate across cross-functional engineering teams to uphold microservice boundaries.',
  ],
  cultureSignals: [
    'Rigorous focus on correctness and transaction precision.',
    'Zero tolerance for unverified assumptions or data corruption.',
    'Defensive engineering mindset with comprehensive automated test suites.',
  ],
};
