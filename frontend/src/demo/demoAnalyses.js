/**
 * Consistent Demo Analyses for Aarav Sharma (Indian Product Ecosystem)
 * 1. Aarav Sharma's Master Senior Backend Resume (Overall Score: 94)
 * 2. Razorpay Lead Backend Engineer Job Description
 */

export const DEMO_RESUME_ANALYSIS_ALEX = {
  analysisId: 'demo-ana-aarav-001',
  resumeId: 'demo-res-1',
  resumeName: 'Aarav Sharma — Senior Backend Engineer (Master)',
  originalFilename: 'Aarav_Sharma_Senior_Backend_Resume.pdf',
  analyzedAt: '2026-11-15T16:30:00Z',
  config: {
    mode: 'role_specific',
    targetRole: 'Senior Backend Software Engineer',
    careerTrackName: 'Senior Backend Software Engineer',
    targetIndustry: 'Fintech, Distributed Systems, High-Scale Logistics',
    hasJobDescription: true,
  },
  overallScore: 94,
  scoreRating: 'Exceptional ATS & Technical Alignment',
  scoreSummary:
    'Aarav Sharma’s backend resume demonstrates exceptional structural machine-readability (96%), rigorous STAR-method achievement framing, and strong keyword density in Java 21 LTS, Spring Boot 3, Apache Kafka, and PostgreSQL. Measurable performance metrics (₹150+ Cr daily GMV, 24ms p99 latency, 25k UPI tx/sec) provide immediate proof of top-tier Indian unicorn technical competence.',
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
      score: 95,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'Nearly all bullet points incorporate quantified outcome metrics (e.g., ₹150+ Cr GMV, 140ms to 24ms p99 reduction, 25,000 tx/sec throughput).',
      strengths: [
        'Quantified latency improvements with specific percentile thresholds (p95, p99).',
        'Specific concurrency throughput metrics (25,000 UPI payments/second).',
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
      summary: 'Core backend technologies (Java 21, Spring Boot 3, PostgreSQL, Apache Kafka) are clearly grouped by engineering domain.',
      strengths: [
        'Defensive separation of languages, frameworks, databases, and DevOps tools.',
        'Explicit version annotations (Java 21 LTS, Spring Boot 3).',
      ],
      issues: [],
    },
    {
      id: 'experience_depth',
      name: 'Work Experience Alignment',
      score: 94,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'SDE-2 achievements at Razorpay Technologies illustrate production-grade financial settlement and distributed idempotency.',
      strengths: [
        'Action verbs paired with concrete business artifacts (settlement microservices, partitioned tables, Kafka webhooks).',
      ],
      issues: [],
    },
    {
      id: 'action_verbs',
      name: 'Action Verbs & Phrasing',
      score: 94,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'Every bullet begins with a commanding technical verb (Architected, Deployed, Optimized, Engineered, Scaled).',
      strengths: ['Eliminated passive voice across all experience items.'],
      issues: [],
    },
    {
      id: 'brevity_conciseness',
      name: 'Brevity & Conciseness',
      score: 93,
      maxScore: 100,
      rating: 'Strong',
      summary: 'Ideal density for a high-impact SDE-2 candidate with zero filler text or redundant buzzwords.',
      strengths: ['Tight 2-line bullet density maximizing white-space readability.'],
      issues: [],
    },
    {
      id: 'education_credentials',
      name: 'Education & Certifications',
      score: 98,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'B.Tech in Computer Science from IIT Bombay (CGPA 9.2) and active AWS Solutions Architect credential.',
      strengths: ['Top-tier Indian engineering credentials and All India Rank 142 in JEE Advanced.'],
      issues: [],
    },
    {
      id: 'keyword_coverage',
      name: 'Domain Keyword Coverage',
      score: 94,
      maxScore: 100,
      rating: 'Exceptional',
      summary: 'High density of essential distributed backend keywords: idempotency, serialization, p99 latency, Kafka consumer lag, connection pooling.',
      strengths: ['Direct keyword matching against top Indian unicorn backend job requisitions.'],
      issues: ['Could weave in distributed consensus (Raft/Paxos) keywords into project text.'],
    },
  ],
  strengths: [
    {
      id: 'str-1',
      title: 'STAR-Framed Quantifiable Achievements',
      description: 'Strong usage of measurable metrics: ₹150+ Crore daily GMV, 140ms to 24ms p99 latency reduction, and 25,000 tx/sec throughput.',
    },
    {
      id: 'str-2',
      title: 'High-Demand Indian Unicorn Technology Stack',
      description: 'Java 21 LTS, Spring Boot 3, Apache Kafka, and PostgreSQL represent the gold standard backend architecture across Bengaluru tech hubs.',
    },
    {
      id: 'str-3',
      title: 'Premier Academic & Industrial Credentialing',
      description: 'IIT Bombay CSE degree with 9.2 CGPA combined with verified tenure at Razorpay and Swiggy.',
    },
  ],
  weaknesses: [
    {
      id: 'weak-1',
      title: 'Distributed Consensus Protocol Evidence',
      description: 'Raft or Paxos leader election algorithms could be explicitly demonstrated in open-source systems projects.',
    },
  ],
  missingSections: [
    {
      id: 'sec-1',
      name: 'Open Source Systems Contributions',
      importance: 'Optional / Bonus',
      recommendation: 'Adding links to Apache Kafka or Spring Framework open-source PRs reinforces staff-level leadership.',
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      category: 'Project Enhancement',
      priority: 'High',
      title: 'Integrate Raft Consensus Engine to UPI Settlement Project',
      description: 'Implement a distributed leader election module to showcase fault-tolerant consensus readiness.',
    },
    {
      id: 'rec-2',
      category: 'Resume Phrasing',
      priority: 'Medium',
      title: 'Highlight RBI Compliance Automation in Experience Description',
      description: 'Explicitly describe automated banking reconciliation scripts adhering to RBI data localization guidelines.',
    },
  ],
  sentenceReviews: [
    {
      id: 'sent-1',
      original: 'Architect and scale the Core Payments & Settlement Switch handling ₹150+ Crore daily Gross Merchandise Value (GMV).',
      suggested: 'Architected and scaled the Core Payments & Settlement Switch in Java 21 / Spring Boot 3, processing ₹150+ Crore daily GMV across 28 banking partners at 99.995% uptime.',
      reasoning: 'Quantifies banking partner integrations and formalizes high-availability service SLA.',
      section: 'Professional Experience',
      impactChange: '+5% impact score',
    },
    {
      id: 'sent-2',
      original: 'Cut p99 settlement API response latency from 140ms to 24ms through proactive database indexing and connection pooling.',
      suggested: 'Optimized PostgreSQL partition strategy across 45M+ transaction records, slashing p99 settlement latency from 140ms to 24ms under peak flash-sale loads.',
      reasoning: 'Highlights table partition scale (45M+ records) and real-world stress conditions.',
      section: 'Professional Experience',
      impactChange: '+7% impact score',
    },
  ],
};

export const DEMO_JOB_ANALYSIS_STRIPE = {
  jobId: 'job-demo-razorpay',
  analyzedAt: '2026-11-15T17:00:00Z',
  company: 'Razorpay',
  roleTitle: 'Lead Backend Engineer — Core Payments & UPI Platform',
  experienceLevel: 'Senior / SDE-2+ (3–6 years)',
  workMode: 'Hybrid (Bengaluru)',
  salaryRange: '₹32 LPA - ₹48 LPA (₹32,00,000 - ₹48,00,000)',
  isSimulatedDemo: true,
  summary:
    'Razorpay is seeking an experienced Lead Backend Engineer for its Core Payments & UPI Settlement switch in Bengaluru. The role demands production-grade competency in Java 21 / Spring Boot 3, partitioned PostgreSQL databases, and high-velocity Apache Kafka event streams.',
  requiredTechnicalSkills: [
    { name: 'Java 21', category: 'Languages', importance: 'Critical' },
    { name: 'Spring Boot 3', category: 'Backend Frameworks', importance: 'Critical' },
    { name: 'PostgreSQL', category: 'Databases', importance: 'Critical' },
    { name: 'Apache Kafka', category: 'Message Streaming', importance: 'Critical' },
    { name: 'REST APIs', category: 'Architecture', importance: 'Critical' },
  ],
  preferredTechnicalSkills: [
    { name: 'Redis', category: 'Caching', importance: 'High' },
    { name: 'Docker & Kubernetes', category: 'DevOps', importance: 'High' },
    { name: 'Distributed Systems', category: 'Architecture', importance: 'High' },
  ],
  responsibilities: [
    'Architect high-availability financial settlement microservices in Java 21 and Spring Boot 3.',
    'Design and optimize partitioned PostgreSQL databases handling 50M+ daily records.',
    'Scale Apache Kafka event streaming pipelines for real-time webhook dispatch and banking reconciliation.',
    'Maintain 99.999% uptime SLA across NPCI and banking partner switches.',
  ],
  cultureSignals: [
    'Extreme ownership and high accountability under high transaction surges.',
    'Zero tolerance for financial ledger discrepancies or unhandled exceptions.',
    'Deep engineering curiosity and systems craftsmanship.',
  ],
};
