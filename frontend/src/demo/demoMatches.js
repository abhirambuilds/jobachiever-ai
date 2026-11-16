/**
 * Consistent Demo Match Results for Alex Morgan & Stripe Backend Software Engineer
 */

export const DEMO_JOB_MATCH_ALEX_STRIPE = {
  matchId: 'demo-match-alex-stripe-001',
  jobId: 'job-demo-stripe',
  matchedAt: '2026-11-15T17:15:00Z',
  resumeId: 'demo-res-1',
  resumeName: 'Alex Morgan — Backend Software Engineer (Master)',
  resumeTrack: 'Backend Software Engineer',
  isSimulatedDemo: true,

  jobOverview: {
    company: 'Stripe',
    title: 'Backend Software Engineer — Core Platform',
    location: 'San Francisco, CA (Hybrid / Remote Option)',
    employmentType: 'Full-time',
    experienceLevel: 'Entry-to-Mid (0–3 years)',
    workMode: 'Hybrid',
    deadline: '2026-12-15',
    url: 'https://stripe.com/jobs/backend-engineer-platform',
  },

  overallScore: 91,
  scoreRating: 'High Compatibility',
  scoreSummary:
    'Alex Morgan demonstrates exceptional alignment with Stripe Core Platform requirements: 100% match on mandatory skills (Java 21, Spring Boot 3, PostgreSQL, REST APIs) substantiated by both internship experience and complex distributed systems projects. An actionable gap is identified in container orchestration (Kubernetes) and production Kafka cluster monitoring.',
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
        text: 'Solid relational database fundamentals with PostgreSQL and index optimization.',
        isMandatory: true,
      },
      {
        id: 'req-4',
        category: 'Education',
        text: 'Bachelor’s degree in Computer Science, Software Engineering, or equivalent.',
        isMandatory: true,
      },
    ],
    preferredQualifications: [
      {
        id: 'pref-1',
        category: 'Messaging',
        text: 'Experience with message streaming frameworks such as Apache Kafka.',
        isMandatory: false,
      },
      {
        id: 'pref-2',
        category: 'Caching',
        text: 'Familiarity with distributed caching solutions such as Redis.',
        isMandatory: false,
      },
      {
        id: 'pref-3',
        category: 'Containers',
        text: 'Familiarity with containerization tooling (Docker, Kubernetes).',
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
        text: 'Build high-availability RESTful APIs in Java 21 / Spring Boot 3.',
        importance: 'Primary',
      },
      {
        id: 'resp-2',
        text: 'Design and optimize PostgreSQL database schemas and transaction isolation.',
        importance: 'Primary',
      },
      {
        id: 'resp-3',
        text: 'Implement defensive test suites using JUnit 5 and integration testing.',
        importance: 'High',
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
      summary: 'All 4 required core competencies (Java 21, Spring Boot 3, PostgreSQL, REST APIs) are verified with strong evidence.',
    },
    {
      id: 'project_experience',
      name: 'Preferred Skills & Bonus Alignment',
      score: 75,
      maxScore: 100,
      weight: 15,
      rating: 'Strong',
      summary: 'Docker, Redis, Kafka, and AWS are demonstrated in projects and certifications. Kubernetes is not yet evidenced.',
    },
    {
      id: 'work_experience',
      name: 'Work Experience Alignment',
      score: 88,
      maxScore: 100,
      weight: 20,
      rating: 'Strong',
      summary: 'TechVanguard Labs internship directly mirrors high-throughput REST API development and query optimization requirements.',
    },
    {
      id: 'role_responsibility',
      name: 'Role & Responsibility Alignment',
      score: 90,
      maxScore: 100,
      weight: 15,
      rating: 'Strong',
      summary: 'Order processing engine showcases transaction isolation, error recovery, and low-latency API contracts.',
    },
    {
      id: 'education_alignment',
      name: 'Education Alignment',
      score: 100,
      maxScore: 100,
      weight: 10,
      rating: 'Direct Match',
      summary: 'B.S. in Computer Science with a 3.85 GPA fulfills the educational requirement cleanly.',
    },
    {
      id: 'keyword_coverage',
      name: 'Keyword Density & Coverage',
      score: 92,
      maxScore: 100,
      weight: 5,
      rating: 'High Density',
      summary: 'Strong coverage of backend platform terms (idempotency, latency percentiles, integration testing).',
    },
  ],

  skillEvidenceMatrix: [
    {
      skillName: 'Java 21 LTS',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Used as primary language in TechVanguard Labs internship serving 500k daily requests.',
        'Core language for the Distributed Order Processing Engine with virtual threads & concurrency primitives.',
      ],
      recommendation: 'Highlight Java 21 concurrency features prominently in interview discussions.',
    },
    {
      skillName: 'Spring Boot 3',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Advanced',
      evidenceItems: [
        'Built enterprise microservices, Spring Data JPA entities, and Spring Security configurations.',
        'Authored 25+ automated integration tests using @SpringBootTest and Mockito.',
      ],
      recommendation: 'Emphasize architectural familiarity with Spring Boot 3 AOT and observability metrics.',
    },
    {
      skillName: 'PostgreSQL & SQL',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Advanced',
      evidenceItems: [
        'Optimized query execution plans reducing p95 latency by 32% at TechVanguard Labs.',
        'Configured serializable transaction isolation in Distributed Order Processing Engine.',
      ],
      recommendation: 'Be ready to discuss composite indexing strategies and lock contention avoidance.',
    },
    {
      skillName: 'REST APIs',
      requiredInJob: true,
      status: 'strong_evidence',
      proficiency: 'Expert',
      evidenceItems: [
        'Designed idempotent RESTful endpoints with OpenAPI/Swagger schemas.',
        'Enforced strict DTO isolation between API boundaries and domain models.',
      ],
      recommendation: 'Strong alignment with Stripe’s public API standards.',
    },
    {
      skillName: 'Apache Kafka',
      requiredInJob: false,
      status: 'partial_evidence',
      proficiency: 'Intermediate',
      evidenceItems: [
        'Employed Kafka for event-driven message dispatching in Order Processing project.',
      ],
      recommendation: 'Clarify partition rebalancing and consumer lag monitoring experience.',
    },
    {
      skillName: 'Docker & Compose',
      requiredInJob: false,
      status: 'strong_evidence',
      proficiency: 'Intermediate',
      evidenceItems: [
        'Containerized local testing environments and microservices across all featured projects.',
      ],
      recommendation: 'Solid baseline for developer workstation containerization.',
    },
    {
      skillName: 'Kubernetes',
      requiredInJob: false,
      status: 'no_recorded_evidence',
      proficiency: 'None Recorded',
      evidenceItems: [],
      recommendation: 'Critical gap: Follow the Career Intelligence learning roadmap to build and deploy a Minikube Helm chart.',
    },
  ],

  gapAnalysis: {
    criticalGaps: [
      {
        skill: 'Kubernetes (K8s)',
        category: 'Container Orchestration',
        severity: 'Moderate',
        impact: 'Preferred qualification at Stripe; demonstrated knowledge will differentiate you from other candidates.',
        advice: 'Deploy your Distributed Order Engine to a local Minikube cluster using Helm and document the manifest in GitHub.',
      },
    ],
    minorGaps: [
      {
        skill: 'Kafka Cluster Monitoring',
        category: 'Message Streaming',
        severity: 'Low',
        impact: 'Resume proves Kafka usage, but lacks details on consumer lag or cluster partition tuning.',
        advice: 'Mention consumer lag metrics and Prometheus exporter in the Order Processing project description.',
      },
    ],
  },

  recommendations: [
    {
      id: 'rec-match-1',
      priority: 'High',
      title: 'Emphasize Idempotent Payment Processing in Tailored Resume',
      description: 'Highlight the Distributed Order Processing Engine’s Redis locking mechanisms right below the summary to align with Stripe core values.',
    },
    {
      id: 'rec-match-2',
      priority: 'Medium',
      title: 'Address Kubernetes via Career Roadmap Project',
      description: 'Complete the Minikube milestone in the Career Intelligence tab to bridge the container orchestration gap.',
    },
  ],
};
