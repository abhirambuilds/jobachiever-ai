/**
 * Complete Master Career Profile for Demo User: Alex Morgan
 *
 * Ground-truth verified career facts:
 * - Degree: B.S. in Computer Science (GPA 3.85)
 * - Target Role: Backend Software Engineer
 * - Core Skills: Java 21, Spring Boot 3, PostgreSQL, REST APIs, Python, Docker, Git
 * - Real Projects: Distributed Order Processing Engine, Cloud Task Scheduler Engine
 * - Internship: Backend Engineering Intern at TechVanguard Labs
 */

export const DEMO_PROFILE = {
  personalInfo: {
    fullName: 'Alex Morgan',
    headline: 'Entry-Level Backend Engineer | Java 21, Spring Boot 3 & Distributed Systems',
    email: 'alex.morgan@demo.jobachiever.ai',
    phone: '+1 (555) 789-0123',
    country: 'United States',
    city: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexmorgan-demo',
    githubUrl: 'https://github.com/alexmorgandev',
    websiteUrl: 'https://alexmorgan.dev',
    summary:
      'Motivated entry-level backend software engineer with hands-on experience designing robust RESTful APIs and distributed data pipelines in Java 21, Spring Boot 3, and PostgreSQL. Proven ability to architect high-throughput services with zero-fabrication academic and internship project foundations.',
  },
  education: [
    {
      id: 'edu-demo-1',
      institution: 'San Jose State University',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      startDate: '2020-09',
      graduationDate: '2024-05',
      isCurrent: false,
      gpa: '3.85 / 4.0',
      coursework:
        'Data Structures & Algorithms, Distributed Systems, Database Management Systems, Computer Networks, Operating Systems',
    },
  ],
  skills: [
    {
      id: 'skill-demo-1',
      name: 'Java 21 LTS',
      category: 'Programming Languages',
      proficiency: 'Expert',
      yearsOfExperience: '2',
      evidence: 'Core language for all distributed backend services, concurrency primitives, and microservices.',
    },
    {
      id: 'skill-demo-2',
      name: 'Spring Boot 3',
      category: 'Backend Development',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Microservice architecture, Spring Data JPA, Spring Security, and REST controllers.',
    },
    {
      id: 'skill-demo-3',
      name: 'PostgreSQL & SQL',
      category: 'Databases',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Schema design, complex index tuning, transaction isolation, and connection pooling.',
    },
    {
      id: 'skill-demo-4',
      name: 'REST APIs',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '2',
      evidence: 'Idempotent API endpoint design with OpenAPI/Swagger contracts and strict DTO isolation.',
    },
    {
      id: 'skill-demo-5',
      name: 'Python 3',
      category: 'Programming Languages',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'FastAPI microservices, background task schedulers, and automated ingestion scripts.',
    },
    {
      id: 'skill-demo-6',
      name: 'Docker & Compose',
      category: 'Cloud and DevOps',
      proficiency: 'Intermediate',
      yearsOfExperience: '1',
      evidence: 'Multi-stage container builds, local microservice orchestration, and CI pipelines.',
    },
    {
      id: 'skill-demo-7',
      name: 'Git & Version Control',
      category: 'Developer Tools',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Trunk-based development, semantic branch management, and GitHub Actions automation.',
    },
    {
      id: 'skill-demo-8',
      name: 'JavaScript / Node.js',
      category: 'Programming Languages',
      proficiency: 'Intermediate',
      yearsOfExperience: '1',
      evidence: 'Full-stack utility scripts, lightweight dashboard integrations, and API testing.',
    },
  ],
  experience: [
    {
      id: 'exp-demo-1',
      company: 'TechVanguard Labs',
      jobTitle: 'Backend Engineering Intern',
      employmentType: 'Internship',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2023-06',
      endDate: '2023-12',
      isCurrent: false,
      responsibilities:
        'Developed high-throughput transaction endpoints using Java 21 and Spring Boot 3. Optimized PostgreSQL database query execution plans and eliminated slow table locks.',
      achievements:
        'Reduced p95 API response times by 32% for transaction history queries. Designed 25+ automated integration tests in JUnit 5 achieving 94% test coverage.',
      technologies: 'Java 21, Spring Boot 3, PostgreSQL, Docker, JUnit 5, Git',
    },
  ],
  projects: [
    {
      id: 'proj-demo-1',
      name: 'Distributed Order Processing Engine',
      description:
        'An event-driven transaction processing system capable of handling 10,000 orders/minute with guaranteed idempotency and fault tolerance.',
      problemSolved:
        'Prevented duplicate payments and transaction inconsistencies during concurrent peak loads using Redis distributed locks and PostgreSQL serializable isolation.',
      technologies: 'Java 21, Spring Boot 3, PostgreSQL, Redis, Docker, Kafka',
      githubUrl: 'https://github.com/alexmorgandev/order-processing-engine',
      liveDemoUrl: 'https://order-engine.demo.jobachiever.ai',
      role: 'Sole Architect & Developer',
      keyAchievements:
        'Achieved sub-45ms p99 response times and zero message loss under synthetic chaos testing simulations.',
      startDate: '2023-09',
      endDate: '2023-12',
    },
    {
      id: 'proj-demo-2',
      name: 'Cloud Task Scheduler Engine',
      description:
        'Asynchronous distributed task scheduler with priority execution queues and automatic exponential-backoff retries.',
      problemSolved:
        'Eliminated task backlog starvation through dynamic worker pool rebalancing and dead-letter queue routing.',
      technologies: 'Python, FastAPI, Redis, PostgreSQL, Docker',
      githubUrl: 'https://github.com/alexmorgandev/task-scheduler-engine',
      liveDemoUrl: 'https://tasks.demo.jobachiever.ai',
      role: 'Lead Backend Developer',
      keyAchievements:
        'Maintained 99.98% task dispatch accuracy across 200,000 synthetic scheduled workloads.',
      startDate: '2024-01',
      endDate: '2024-04',
    },
  ],
  certifications: [
    {
      id: 'cert-demo-1',
      name: 'AWS Certified Cloud Practitioner',
      issuingOrg: 'Amazon Web Services',
      issueDate: '2024-02',
      expirationDate: '2027-02',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
  ],
  achievements: [
    {
      id: 'ach-demo-1',
      title: 'Dean’s Honor List — San Jose State University',
      description: 'Recognized for top academic excellence across 4 consecutive semesters in Computer Science.',
      issuingOrg: 'SJSU College of Science',
      date: '2023-12',
    },
  ],
  careerPreferences: {
    targetRoles: ['Backend Software Engineer', 'Junior Software Engineer', 'API Platform Engineer'],
    employmentTypes: ['Full-time'],
    workArrangement: 'Hybrid or Remote',
    preferredLocations: 'San Francisco Bay Area, Seattle, Remote',
    preferredCountries: 'United States',
    expectedSalary: '$120,000 - $145,000',
    careerGoals:
      'Excel as a core backend contributor on high-throughput distributed systems, master event-driven microservices, and advance toward senior system architecture.',
  },
  careerTracks: [
    {
      id: 'track-demo-backend',
      name: 'Backend Software Engineer',
      targetRole: 'Backend Software Engineer',
      description:
        'Primary track focused on resilient distributed APIs, relational database design, asynchronous message streaming, and containerized deployment.',
      relevantSkills: [
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL & SQL',
        'REST APIs',
        'Docker & Compose',
        'Python 3',
      ],
      targetIndustries: 'Financial Technology, Cloud Infrastructure, Developer Tooling',
      careerObjectives: 'Deliver reliable, sub-50ms transaction APIs with high test coverage and robust schema migrations.',
      preferredOpportunities: 'Entry-to-Mid level Backend and Platform roles',
      isPrimary: true,
    },
    {
      id: 'track-demo-cloud',
      name: 'Cloud Systems & DevOps',
      targetRole: 'Junior Cloud Systems Engineer',
      description:
        'Secondary persona emphasizing container orchestration, CI/CD pipeline automation, and cloud infrastructure reliability.',
      relevantSkills: [
        'Docker & Compose',
        'Python 3',
        'Git & Version Control',
        'PostgreSQL & SQL',
      ],
      targetIndustries: 'Enterprise Cloud Platforms, SaaS Infrastructure',
      careerObjectives: 'Automate zero-downtime deployment workflows and strengthen infrastructure observability.',
      preferredOpportunities: 'Junior Infrastructure and DevOps Engineering roles',
      isPrimary: false,
    },
  ],
};
