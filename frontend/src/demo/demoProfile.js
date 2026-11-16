/**
 * Complete Master Career Profile for Candidate: Aarav Sharma
 *
 * Ground-truth verified career facts (Indian Tech Ecosystem):
 * - Degree: B.Tech in Computer Science & Engineering, IIT Bombay (CGPA 9.2 / 10.0)
 * - Target Role: Senior Backend Software Engineer / Distributed Systems
 * - Core Skills: Java 21, Spring Boot 3, Apache Kafka, PostgreSQL, Redis, Docker, Kubernetes
 * - Real Experience: SDE-2 at Razorpay (Bengaluru), SDE-1 at Swiggy (Bengaluru), Intern at Flipkart
 * - Real Projects: High-Throughput UPI Settlement Engine, Distributed Event Notification Switch
 */

export const DEMO_PROFILE = {
  personalInfo: {
    fullName: 'Aarav Sharma',
    headline: 'Senior Backend Engineer | Java 21, Spring Boot 3 & High-Throughput Distributed Systems',
    email: 'aarav.sharma@jobachiever.ai',
    phone: '+91 98765 43210',
    country: 'India',
    city: 'Bengaluru, Karnataka',
    linkedinUrl: 'https://linkedin.com/in/aaravsharma-tech',
    githubUrl: 'https://github.com/aaravsharmadev',
    websiteUrl: 'https://aaravsharma.dev',
    summary:
      'High-performing Senior Backend Software Engineer with deep expertise in architecting resilient microservices, high-throughput financial switches, and low-latency API platforms with Java 21, Spring Boot 3, Apache Kafka, and PostgreSQL. Proven track record at Razorpay and Swiggy scaling fintech and logistics pipelines to 150M+ daily events across Bengaluru tech hubs.',
  },
  education: [
    {
      id: 'edu-demo-1',
      institution: 'Indian Institute of Technology (IIT) Bombay',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science and Engineering',
      startDate: '2019-07',
      graduationDate: '2023-05',
      isCurrent: false,
      gpa: '9.2 / 10.0',
      coursework:
        'Advanced Data Structures & Algorithms, Distributed Systems, Database Management Internals, Operating Systems, Computer Networks, High-Performance Computing',
    },
  ],
  skills: [
    {
      id: 'skill-demo-1',
      name: 'Java 21 LTS',
      category: 'Programming Languages',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Core language for all distributed backend services, virtual threads, and high-concurrency microservices.',
    },
    {
      id: 'skill-demo-2',
      name: 'Spring Boot 3',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Production microservice architecture, Spring Data JPA, Spring Security, and REST controllers.',
    },
    {
      id: 'skill-demo-3',
      name: 'PostgreSQL & SQL',
      category: 'Databases',
      proficiency: 'Expert',
      yearsOfExperience: '3',
      evidence: 'Table partitioning for 45M+ transactions, index optimization, query tuning, and connection pooling.',
    },
    {
      id: 'skill-demo-4',
      name: 'Apache Kafka',
      category: 'Backend Development',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Partitioned event streaming, idempotency guarantees, and dead-letter queues for payment webhooks.',
    },
    {
      id: 'skill-demo-5',
      name: 'Redis',
      category: 'Databases',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Distributed locking, rate-limiting algorithms (Token Bucket), and distributed session state.',
    },
    {
      id: 'skill-demo-6',
      name: 'REST APIs & gRPC',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Contract-first OpenAPI design, strictly typed DTOs, and high-speed binary RPC protocols.',
    },
    {
      id: 'skill-demo-7',
      name: 'Docker & Kubernetes',
      category: 'Cloud and DevOps',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Multi-stage container builds, Helm chart configuration, and pod auto-scaling on Kubernetes.',
    },
    {
      id: 'skill-demo-8',
      name: 'Python 3',
      category: 'Programming Languages',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'FastAPI microservices, distributed worker orchestration, and automated ETL data ingestion.',
    },
  ],
  experience: [
    {
      id: 'exp-demo-1',
      company: 'Razorpay Technologies',
      jobTitle: 'Senior Software Development Engineer (SDE-2)',
      employmentType: 'Full-time',
      location: 'Bengaluru, Karnataka (Hybrid)',
      startDate: '2023-06',
      endDate: null,
      isCurrent: true,
      responsibilities:
        'Architect and scale the Core Payments & Settlement Switch handling ₹150+ Crore daily Gross Merchandise Value (GMV). Implement resilient distributed consensus and transactional idempotency across banking partners.',
      achievements:
        'Cut p99 settlement API response latency from 140ms to 24ms. Designed automated failover pipelines maintaining 99.995% service uptime across RBI banking reconciliation windows.',
      technologies: 'Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, Redis, Docker, Kubernetes',
    },
    {
      id: 'exp-demo-2',
      company: 'Swiggy',
      jobTitle: 'Software Development Engineer (SDE-1)',
      employmentType: 'Full-time',
      location: 'Bengaluru, Karnataka',
      startDate: '2022-01',
      endDate: '2023-05',
      isCurrent: false,
      responsibilities:
        'Engineered real-time order dispatch and delivery partner routing microservices handling 15,000+ orders/minute during peak surge hours.',
      achievements:
        'Reduced database read contention by 65% via distributed Redis caching. Authored 35+ integration tests achieving 96% critical path coverage.',
      technologies: 'Java 17, Spring Boot, PostgreSQL, Redis, Apache Kafka, AWS',
    },
  ],
  projects: [
    {
      id: 'proj-demo-1',
      name: 'High-Throughput UPI Settlement Engine',
      description:
        'An event-driven transaction settlement switch capable of processing 25,000 UPI payments/second with guaranteed zero-loss idempotency.',
      problemSolved:
        'Prevented duplicate banking debits and race conditions under peak flash-sale loads using Redis Redlock and PostgreSQL serializable transactions.',
      technologies: 'Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, Redis, Docker',
      githubUrl: 'https://github.com/aaravsharmadev/upi-settlement-engine',
      liveDemoUrl: 'https://upi-settlement.demo.jobachiever.ai',
      role: 'Lead Architect & Sole Developer',
      keyAchievements:
        'Sustained sub-35ms p99 latency with zero transaction discrepancies across 5 million synthetic bank debit simulations.',
      startDate: '2023-09',
      endDate: '2023-12',
    },
    {
      id: 'proj-demo-2',
      name: 'Distributed Cloud Task Scheduler Engine',
      description:
        'Asynchronous distributed task scheduler with priority execution queues, dead-letter routing, and automatic exponential backoff.',
      problemSolved:
        'Eliminated job starvation during background banking reconciliation runs through dynamic worker pool rebalancing.',
      technologies: 'Python 3, FastAPI, Redis, PostgreSQL, Docker',
      githubUrl: 'https://github.com/aaravsharmadev/task-scheduler-engine',
      liveDemoUrl: 'https://scheduler.demo.jobachiever.ai',
      role: 'Lead Backend Developer',
      keyAchievements:
        'Maintained 99.99% dispatch accuracy across 500,000 synthetic banking reconciliation events.',
      startDate: '2024-01',
      endDate: '2024-04',
    },
  ],
  certifications: [
    {
      id: 'cert-demo-1',
      name: 'AWS Certified Solutions Architect — Associate',
      issuingOrg: 'Amazon Web Services',
      issueDate: '2024-02',
      expirationDate: '2027-02',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
  ],
  achievements: [
    {
      id: 'ach-demo-1',
      title: 'All India Rank (AIR) 142 — JEE Advanced',
      description: 'Secured top 0.08 percentile nationally among 180,000+ candidates for admission into IIT Bombay CSE.',
      issuingOrg: 'Joint Entrance Examination Board',
      date: '2019-06',
    },
    {
      id: 'ach-demo-2',
      title: 'Razorpay Technical Excellence Award 2024',
      description: 'Awarded for architecting zero-downtime payments migration to Java 21 virtual threads.',
      issuingOrg: 'Razorpay Technologies',
      date: '2024-08',
    },
  ],
  careerPreferences: {
    targetRoles: ['Lead Backend Software Engineer', 'Staff Distributed Systems Engineer', 'Engineering Manager'],
    employmentTypes: ['Full-time'],
    workArrangement: 'Hybrid or Remote',
    preferredLocations: 'Bengaluru, Hyderabad, Pune, Gurugram, Remote (India)',
    preferredCountries: 'India',
    expectedSalary: '₹35,00,000 - ₹50,00,000 / year (₹35 - ₹50 LPA)',
    careerGoals:
      'Lead backend platform architecture across high-throughput distributed systems, master zero-trust financial infrastructure, and advance toward Principal Engineer at premier Indian product companies.',
  },
  careerTracks: [
    {
      id: 'track-demo-backend',
      name: 'Backend Systems Engineer',
      targetRole: 'Senior Backend Software Engineer',
      description:
        'Primary track focused on resilient distributed APIs, high-throughput payment switches, event streaming with Kafka, and Kubernetes deployment.',
      relevantSkills: [
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL & SQL',
        'Apache Kafka',
        'Redis',
        'Docker & Kubernetes',
      ],
      targetIndustries: 'Fintech, High-Scale Logistics, Cloud Infrastructure',
      careerObjectives: 'Deliver reliable sub-30ms banking transaction APIs with high test coverage and zero-downtime database migrations.',
      preferredOpportunities: 'Senior SDE-2 and Lead Backend Engineering roles at top Indian tech unicorns',
      isPrimary: true,
    },
    {
      id: 'track-demo-cloud',
      name: 'Cloud Infrastructure & DevOps',
      targetRole: 'Senior Cloud Platform Engineer',
      description:
        'Secondary persona emphasizing Kubernetes orchestration, Terraform infrastructure as code, and site reliability engineering.',
      relevantSkills: [
        'Docker & Kubernetes',
        'Python 3',
        'Apache Kafka',
        'PostgreSQL & SQL',
      ],
      targetIndustries: 'Developer Tooling, Enterprise SaaS',
      careerObjectives: 'Automate multi-region failover and maintain 99.99% service uptime.',
      preferredOpportunities: 'Senior Platform and Infrastructure Engineering roles',
      isPrimary: false,
    },
    {
      id: 'track-demo-fullstack',
      name: 'Full-Stack Product Engineer',
      targetRole: 'Full-Stack Developer',
      description:
        'Product engineering track combining modern React/Tailwind frontends with Spring Boot and distributed APIs.',
      relevantSkills: [
        'React 18',
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL & SQL',
        'Docker & Kubernetes',
      ],
      targetIndustries: 'Commercial SaaS, Enterprise Software',
      careerObjectives: 'Deliver polished, user-delighting SaaS products from concept to scale.',
      preferredOpportunities: 'Product-focused engineering teams',
      isPrimary: false,
    },
  ],
};
