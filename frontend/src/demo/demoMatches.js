/**
 * Consistent Demo Match Results for Aarav Sharma & Razorpay Lead Backend Engineer
 */

export const DEMO_JOB_MATCH_ALEX_STRIPE = {
  matchId: 'demo-match-aarav-razorpay-001',
  jobId: 'job-demo-razorpay',
  matchedAt: '2026-11-15T17:15:00Z',
  resumeId: 'demo-res-1',
  resumeName: 'Aarav Sharma — Senior Backend Engineer (Master)',
  resumeTrack: 'Senior Backend Software Engineer',
  isSimulatedDemo: true,

  jobOverview: {
    company: 'Razorpay',
    title: 'Lead Backend Engineer — Core Payments & UPI Platform',
    location: 'Bengaluru, Karnataka (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior / SDE-2+ (3–6 years)',
    workMode: 'Hybrid',
    deadline: '2026-12-15',
    url: 'https://razorpay.com/jobs/lead-backend-engineer',
  },

  overallScore: 94,
  scoreRating: 'High Compatibility',
  scoreSummary:
    'Aarav Sharma demonstrates exceptional alignment with Razorpay Core Payments requirements: 100% match on mandatory skills (Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, REST APIs) substantiated by proven SDE-2 tenure at Razorpay and Swiggy. An actionable gap is identified in Raft distributed consensus protocols and multi-region Kubernetes service mesh.',
  disclaimer:
    'Compatibility evaluation computed using verified candidate evidence and structural role requirements.',

  decomposition: {
    requiredQualifications: [
      {
        id: 'req-1',
        category: 'Languages',
        text: 'Hands-on development experience in modern Java (Java 17/21).',
        isMandatory: true,
      },
      {
        id: 'req-2',
        category: 'Frameworks',
        text: 'Deep familiarity with Spring Boot 3 microservice patterns and RESTful APIs.',
        isMandatory: true,
      },
      {
        id: 'req-3',
        category: 'Databases',
        text: 'Solid relational database fundamentals with PostgreSQL and table partitioning.',
        isMandatory: true,
      },
      {
        id: 'req-4',
        category: 'Messaging',
        text: 'Production experience with Apache Kafka event streams and webhook delivery.',
        isMandatory: true,
      },
      {
        id: 'req-5',
        category: 'Education',
        text: 'B.Tech / B.E. in Computer Science or equivalent from premier Indian institutions (IIT/BITS/NIT).',
        isMandatory: true,
      },
    ],
    preferredQualifications: [
      {
        id: 'pref-1',
        category: 'Caching',
        text: 'Familiarity with distributed caching solutions such as Redis.',
        isMandatory: false,
      },
      {
        id: 'pref-2',
        category: 'Containers',
        text: 'Familiarity with containerization tooling (Docker, Kubernetes).',
        isMandatory: false,
      },
      {
        id: 'pref-3',
        category: 'Architecture',
        text: 'Experience with high-throughput UPI payment switches or banking reconciliation.',
        isMandatory: false,
      },
      {
        id: 'pref-4',
        category: 'Cloud',
        text: 'AWS cloud fundamentals or relevant cloud certifications.',
        isMandatory: false,
      },
    ],
    responsibilities: [
      {
        id: 'resp-1',
        text: 'Architect high-availability financial settlement microservices in Java 21 / Spring Boot 3.',
        importance: 'Primary',
      },
      {
        id: 'resp-2',
        text: 'Design and optimize PostgreSQL database schemas and transaction isolation.',
        importance: 'Primary',
      },
      {
        id: 'resp-3',
        text: 'Scale Apache Kafka event streaming pipelines for real-time payment reconciliation.',
        importance: 'Primary',
      },
    ],
  },

  categoryScores: [
    {
      id: 'technical_skills',
      name: 'Mandatory Technical Skills',
      score: 100,
      maxScore: 100,
      weight: 35,
      rating: 'Perfect Match',
      summary: 'All required core competencies (Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, REST APIs) are verified with strong production evidence.',
    },
    {
      id: 'project_experience',
      name: 'Preferred Skills & Bonus Alignment',
      score: 88,
      maxScore: 100,
      weight: 15,
      rating: 'Exceptional',
      summary: 'Docker, Redis, Kafka, and AWS are demonstrated in production at Razorpay. Raft consensus protocol is an optional bonus.',
    },
    {
      id: 'work_experience',
      name: 'Work Experience Alignment',
      score: 95,
      maxScore: 100,
      weight: 20,
      rating: 'Direct Match',
      summary: 'Current SDE-2 tenure at Razorpay Technologies and Swiggy directly aligns with high-throughput payment switch requirements.',
    },
    {
      id: 'role_responsibility',
      name: 'Role & Responsibility Alignment',
      score: 92,
      maxScore: 100,
      weight: 15,
      rating: 'Strong',
      summary: 'UPI Settlement Engine showcases transaction isolation, error recovery, and low-latency API contracts.',
    },
    {
      id: 'education_alignment',
      name: 'Education Alignment',
      score: 100,
      maxScore: 100,
      weight: 10,
      rating: 'Direct Match',
      summary: 'B.Tech in Computer Science from IIT Bombay (CGPA 9.2) fulfills educational requirements at the highest level.',
    },
    {
      id: 'keyword_coverage',
      name: 'Keyword Density & Coverage',
      score: 94,
      maxScore: 100,
      weight: 5,
      rating: 'High Density',
      summary: 'Strong coverage of backend platform terms (idempotency, latency percentiles, UPI switch, Kafka consumer lag).',
    },
  ],

  skillEvidenceMatrix: [
    {
      skillName: 'Java 21 LTS',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Used as primary language in Razorpay Core Payments switch handling ₹150+ Crore daily GMV.',
        'Core language for the High-Throughput UPI Settlement Engine with virtual threads & concurrency primitives.',
      ],
      recommendation: 'Highlight Java 21 virtual threads and zero-downtime migrations in interview discussions.',
    },
    {
      skillName: 'Spring Boot 3',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Built enterprise microservices, Spring Data JPA entities, and Spring Security configurations.',
        'Authored 35+ automated integration tests using @SpringBootTest and Mockito.',
      ],
      recommendation: 'Emphasize architectural familiarity with Spring Boot 3 AOT and observability metrics.',
    },
    {
      skillName: 'PostgreSQL & SQL',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Optimized table partition plans reducing p99 latency to 24ms at Razorpay across 45M+ transactions.',
        'Configured serializable transaction isolation in High-Throughput UPI Settlement Engine.',
      ],
      recommendation: 'Be ready to discuss composite indexing strategies and lock contention avoidance.',
    },
    {
      skillName: 'Apache Kafka',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Advanced',
      evidenceItems: [
        'Employed Kafka for event-driven webhook dispatch and banking reconciliation in Razorpay core switch.',
      ],
      recommendation: 'Highlight partition rebalancing and consumer lag monitoring experience.',
    },
    {
      skillName: 'REST APIs & gRPC',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Designed idempotent RESTful endpoints with OpenAPI schemas.',
        'Enforced strict DTO isolation between API boundaries and domain models.',
      ],
      recommendation: 'Strong alignment with Razorpay public API standards.',
    },
    {
      skillName: 'Docker & Kubernetes',
      requiredInJob: false,
      status: 'strong_evidence',
      proficiency: 'Advanced',
      evidenceItems: [
        'Containerized production testing environments and microservices with Helm manifests.',
      ],
      recommendation: 'Solid baseline for developer workstation and cluster containerization.',
    },
    {
      skillName: 'Distributed Consensus (Raft/Paxos)',
      requiredInJob: false,
      status: 'no_recorded_evidence',
      proficiency: 'None Recorded',
      evidenceItems: [],
      recommendation: 'Follow the Career Intelligence learning roadmap to implement a Raft leader election engine.',
    },
  ],

  gapAnalysis: {
    criticalGaps: [
      {
        skill: 'Distributed Consensus (Raft / Paxos)',
        category: 'System Architecture',
        severity: 'Moderate',
        impact: 'Bonus qualification for Staff Architect roles; demonstrated knowledge will differentiate you from other candidates.',
        advice: 'Deploy a Raft-based distributed key-value store and document leader election algorithms on GitHub.',
      },
    ],
    minorGaps: [
      {
        skill: 'eBPF Kernel Telemetry',
        category: 'Systems Observability',
        severity: 'Low',
        impact: 'Resume proves Prometheus and Grafana usage, but lacks socket-level kernel tracing details.',
        advice: 'Mention eBPF network socket tracing in the UPI Settlement Engine project description.',
      },
    ],
  },

  recommendations: [
    {
      id: 'rec-match-1',
      priority: 'High',
      title: 'Emphasize UPI Idempotency & Banking Gateway Integration',
      description: 'Highlight the High-Throughput UPI Settlement Engine’s Redis locking mechanisms right below the summary to align with Razorpay core values.',
    },
    {
      id: 'rec-match-2',
      priority: 'Medium',
      title: 'Address Distributed Consensus via Career Roadmap Project',
      description: 'Complete the Raft consensus milestone in the Career Intelligence tab to bridge the staff-level architecture gap.',
    },
  ],
};
