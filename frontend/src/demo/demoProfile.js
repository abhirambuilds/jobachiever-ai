/**
 * Authentic Master Career Profile for Candidate: K. Abhiram Reddy
 * Sourced directly from verified resumes in /resumes:
 * - Degree: B.Tech in Computer Science & Engineering, SRM Institute of Science & Technology (KTR), Chennai (CGPA 9.48 / 10.0)
 * - Target Role: Software Engineer / Backend & Distributed Systems Intern & SDE-1
 * - Core Skills: Java, Python, Spring Boot, React, PostgreSQL, Docker, AWS, FastAPI, Node.js, Kubernetes, REST APIs
 * - Real Experience: Freelance Software Developer (10+ client projects), Backend Developer Intern at Corizo
 * - Real Projects: SRM Secure Exam App (3k+ concurrent users), Financial Transaction Processing Service, AegisCommerce AI, StablePay 2.0
 * - Certifications: AWS Certified Cloud Practitioner, MongoDB Associate Developer, NPTEL Java (Elite + Gold)
 */

export const DEMO_PROFILE = {
  personalInfo: {
    fullName: 'K. Abhiram Reddy',
    headline: 'Computer Science Undergraduate | Full-Stack & Backend Systems Developer',
    email: 'k.abhiram9999@gmail.com',
    phone: '+91-8331823668',
    country: 'India',
    city: 'Chennai, Tamil Nadu',
    linkedinUrl: 'https://linkedin.com/in/abhirambuilds',
    githubUrl: 'https://github.com/abhirambuilds',
    websiteUrl: 'https://abhirambuilds.github.io',
    summary:
      'Backend-leaning Computer Science undergraduate (B.Tech 2028, CGPA 9.48) and AWS Certified Cloud Practitioner with strong applied experience building scalable, secure full-stack systems in Java, Spring Boot, React, Node.js, FastAPI, and PostgreSQL. Shipped an offline-first App Store exam platform for 3,000+ concurrent users with zero data loss and delivered 10+ production client projects in Agile teams.',
  },
  education: [
    {
      id: 'edu-abhiram-1',
      institution: 'SRM Institute of Science & Technology (KTR), Chennai',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science and Engineering',
      startDate: '2024-07',
      graduationDate: '2028-05',
      isCurrent: true,
      gpa: 'CGPA: 9.48 / 10.0',
      coursework:
        'Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Computer Networks, Distributed Systems, Cloud Architecture',
    },
  ],
  skills: [
    {
      id: 'skill-abhiram-1',
      name: 'Java (Java 17/21)',
      category: 'Programming Languages',
      proficiency: 'Expert',
      yearsOfExperience: '3',
      evidence: 'Core language for idempotent backend microservices, Spring Data JPA, and transactional banking switch platforms.',
    },
    {
      id: 'skill-abhiram-2',
      name: 'Spring Boot 3',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '3',
      evidence: 'Architected enterprise REST APIs, Spring Security authentication, Hibernate ORM, and resilient transaction processing.',
    },
    {
      id: 'skill-abhiram-3',
      name: 'Python & FastAPI',
      category: 'Programming Languages',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Engineered high-throughput asynchronous REST services, AI agent coordination, and automation scripts.',
    },
    {
      id: 'skill-abhiram-4',
      name: 'PostgreSQL & SQL',
      category: 'Databases',
      proficiency: 'Expert',
      yearsOfExperience: '3',
      evidence: 'Relational data modeling, ACID transaction guarantees, index tuning, and pgvector semantic query execution.',
    },
    {
      id: 'skill-abhiram-5',
      name: 'React 18 & Next.js',
      category: 'Frontend Development',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Built responsive single-page web applications with React, Tailwind CSS, component state management, and API integrations.',
    },
    {
      id: 'skill-abhiram-6',
      name: 'AWS Cloud & Docker',
      category: 'Cloud and DevOps',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'AWS Certified Cloud Practitioner. Containerized multi-tier microservices with Docker, multi-stage builds, and CI/CD pipelines.',
    },
    {
      id: 'skill-abhiram-7',
      name: 'AI Agents & LLMs (RAG, LangChain)',
      category: 'AI and Machine Learning',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Implemented agentic workflows, contextual retrieval-augmented generation (RAG), and deterministic control planes.',
    },
    {
      id: 'skill-abhiram-8',
      name: 'Node.js & Express',
      category: 'Backend Development',
      proficiency: 'Advanced',
      yearsOfExperience: '2',
      evidence: 'Developed asynchronous backend services and APIs powering the SRM Secure Exam App for 3,000+ users.',
    },
  ],
  experience: [
    {
      id: 'exp-abhiram-1',
      company: 'Freelance Software Developer',
      jobTitle: 'Full-Stack Software Developer',
      employmentType: 'Contract / Freelance',
      location: 'Remote / Chennai, India',
      startDate: '2026-01',
      endDate: null,
      isCurrent: true,
      responsibilities:
        'Owned the entire software development lifecycle for 10+ client projects from requirements elicitation through architectural design, implementation, automated testing, and cloud deployment.',
      achievements:
        'Translated diverse business needs into reliable technology solutions; delivered production platforms on schedule with high client satisfaction and zero critical post-release bugs.',
      technologies: 'React, Node.js, Spring Boot, PostgreSQL, MongoDB, AWS, Docker, Git',
    },
    {
      id: 'exp-abhiram-2',
      company: 'Corizo',
      jobTitle: 'Backend Developer Intern',
      employmentType: 'Internship',
      location: 'Bengaluru, India (Remote)',
      startDate: '2026-05',
      endDate: '2026-07',
      isCurrent: false,
      responsibilities:
        'Developed and tested RESTful backend APIs and database-driven services in an Agile team. Implemented server-side business logic, request validation schemas, and external API integrations.',
      achievements:
        'Authored robust unit and integration tests using clean code and SDLC best practices; improved API endpoint response times and validated data consistency across microservices.',
      technologies: 'Java, Spring Boot, REST APIs, PostgreSQL, Git, Postman, Agile/Scrum',
    },
  ],
  projects: [
    {
      id: 'proj-abhiram-1',
      name: 'SRM Secure Exam App',
      description:
        'Architected an offline-first App Store exam platform for 3,000+ concurrent students with guaranteed zero data loss during network outages.',
      problemSolved:
        'Eliminated exam submission failures during campus Wi-Fi drops by implementing local SQLite caching, automatic transactional synchronization, and tamper-resistant anti-cheat controls.',
      technologies: 'Flutter, Node.js, AWS, PostgreSQL, REST APIs',
      githubUrl: 'https://github.com/abhirambuilds/srm-secure-exam-app',
      liveDemoUrl: 'https://exam.srmist.edu.in',
      role: 'Lead Architect & Mobile/Backend Developer',
      keyAchievements:
        'Successfully supported 3,000+ concurrent student sessions with 100% submission reliability and sub-second sync latency.',
      startDate: '2025-08',
      endDate: '2025-12',
    },
    {
      id: 'proj-abhiram-2',
      name: 'Financial Transaction Processing Service',
      description:
        'Architected a full-stack platform for real-time transaction tracking, reconciliation, and automated settlement with idempotent REST APIs.',
      problemSolved:
        'Prevented duplicate payments and race conditions under concurrent request loads using database constraints, JPA transactional locks, and Docker containerization.',
      technologies: 'Java 21, Spring Boot 3, JPA, React 18, PostgreSQL, Docker',
      githubUrl: 'https://github.com/abhirambuilds/financial-transaction-service',
      liveDemoUrl: 'https://fin-service.demo.jobachiever.ai',
      role: 'Full-Stack Developer & Backend Architect',
      keyAchievements:
        'Engineered idempotent REST endpoints guaranteeing zero financial discrepancies across 10,000+ automated test transactions.',
      startDate: '2025-10',
      endDate: '2026-02',
    },
    {
      id: 'proj-abhiram-3',
      name: 'AegisCommerce AI — Agentic Commerce Platform',
      description:
        'Separated probabilistic AI recommendations from a deterministic Spring Boot control plane for authentication, RBAC, approval, execution, and audit logging.',
      problemSolved:
        'Eliminated unpredictable LLM hallucinations in commercial workflows by enforcing strict JSON validation and append-only database audit logs.',
      technologies: 'Java 21, Spring Boot 3, FastAPI, React 18, MongoDB, JUnit',
      githubUrl: 'https://github.com/abhirambuilds/aegiscommerce-ai',
      liveDemoUrl: 'https://aegiscommerce.demo.jobachiever.ai',
      role: 'Lead Developer',
      keyAchievements:
        'Built concurrency-safe workflows with unique database constraints and achieved 95%+ JUnit test coverage.',
      startDate: '2026-01',
      endDate: '2026-04',
    },
    {
      id: 'proj-abhiram-4',
      name: 'StablePay 2.0 — UPI to USDT Settlement Bridge',
      description:
        'Implemented a UPI-to-USDT settlement pipeline with backend reconciliation APIs and merchant verification dashboards.',
      problemSolved:
        'Bridged fiat Indian UPI payment gateways with decentralized stablecoin settlement rails with automated exchange rate locking.',
      technologies: 'React, TypeScript, Node.js, Supabase, Solidity',
      githubUrl: 'https://github.com/abhirambuilds/stablepay-bridge',
      liveDemoUrl: 'https://stablepay.demo.jobachiever.ai',
      role: 'Full-Stack & Web3 Developer',
      keyAchievements:
        'Benchmarked sub-5s merchant settlement under simulated test loads with verified ledger balance reconciliation.',
      startDate: '2025-11',
      endDate: '2026-03',
    },
  ],
  certifications: [
    {
      id: 'cert-abhiram-1',
      name: 'AWS Certified Cloud Practitioner',
      issuingOrg: 'Amazon Web Services (AWS)',
      issueDate: '2025-06',
      expirationDate: '2028-06',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-abhiram-2',
      name: 'MongoDB Associate Developer',
      issuingOrg: 'MongoDB Inc.',
      issueDate: '2025-08',
      expirationDate: '2028-08',
      credentialUrl: 'https://learn.mongodb.com/verification',
    },
    {
      id: 'cert-abhiram-3',
      name: 'NPTEL Java & Object Oriented Programming (Elite + Gold)',
      issuingOrg: 'NPTEL / IIT Kharagpur',
      issueDate: '2024-11',
      expirationDate: null,
      credentialUrl: 'https://nptel.ac.in',
    },
  ],
  achievements: [
    {
      id: 'ach-abhiram-1',
      title: '1st Place — HackRush National Hackathon',
      description: 'Built a real-time decentralized payment bridge prototype and won first place among 120+ collegiate engineering teams.',
      issuingOrg: 'HackRush',
      date: '2025-09',
    },
    {
      id: 'ach-abhiram-2',
      title: '300+ LeetCode Algorithms & Data Structures Solved',
      description: 'Active problem solver with demonstrated competence across graph theory, dynamic programming, trees, and concurrency.',
      issuingOrg: 'LeetCode',
      date: '2026-02',
    },
    {
      id: 'ach-abhiram-3',
      title: 'SRM Top Achiever Academic Excellence Award',
      description: 'Recognized for achieving top 1% academic standing with a cumulative CGPA of 9.48 / 10.0 in Computer Science.',
      issuingOrg: 'SRM Institute of Science & Technology',
      date: '2025-12',
    },
  ],
  careerPreferences: {
    targetRoles: [
      'Software Engineer Intern',
      'Backend Software Engineer',
      'Full-Stack Systems Engineer',
      'Cloud & DevOps Engineer',
    ],
    employmentTypes: ['Internship', 'Full-time'],
    workArrangement: 'Hybrid or Remote',
    preferredLocations: 'Chennai, Bengaluru, Hyderabad, Pune, Remote (India)',
    preferredCountries: 'India',
    expectedSalary: '₹18,00,000 - ₹32,00,000 / year (₹18 - ₹32 LPA)',
    careerGoals:
      'Build resilient, high-throughput backend microservices and cloud infrastructure. Expand expertise in distributed event-driven systems (Kafka), container orchestration (Kubernetes), and production AI agent workflows.',
  },
  careerTracks: [
    {
      id: 'track-abhiram-backend',
      name: 'Backend & Systems Engineer',
      targetRole: 'Backend Software Engineer',
      description:
        'Core track focused on high-throughput REST microservices in Java 21 & Spring Boot 3, FastAPI, PostgreSQL ACID transactions, and containerized deployment.',
      relevantSkills: [
        'Java (Java 17/21)',
        'Spring Boot 3',
        'PostgreSQL & SQL',
        'Python & FastAPI',
        'AWS Cloud & Docker',
        'Node.js & Express',
      ],
      targetIndustries: 'Fintech, Cloud Platforms, Enterprise SaaS, High-Scale Tech',
      careerObjectives: 'Deliver idempotent REST APIs with sub-30ms latency, high test coverage, and reliable database transactions.',
      preferredOpportunities: 'Software Engineer Intern and SDE-1 roles at tier-1 product companies',
      isPrimary: true,
    },
    {
      id: 'track-abhiram-fullstack',
      name: 'Full-Stack Software Engineer',
      targetRole: 'Full-Stack Developer',
      description:
        'Track combining modern React/Next.js/Flutter user interfaces with robust Spring Boot and Node.js microservices.',
      relevantSkills: [
        'React 18 & Next.js',
        'Java (Java 17/21)',
        'Spring Boot 3',
        'PostgreSQL & SQL',
        'AWS Cloud & Docker',
      ],
      targetIndustries: 'Commercial SaaS, Mobile Apps, Enterprise Systems',
      careerObjectives: 'Build seamless, offline-first user experiences backed by resilient cloud APIs.',
      preferredOpportunities: 'Full-Stack Engineer positions in innovative product engineering teams',
      isPrimary: false,
    },
    {
      id: 'track-abhiram-cloud',
      name: 'Cloud & AI Systems Engineer',
      targetRole: 'Cloud / AI Engineer',
      description:
        'Modern infrastructure track incorporating AWS cloud services, Docker containers, and AI agent LLM pipelines.',
      relevantSkills: [
        'AWS Cloud & Docker',
        'AI Agents & LLMs (RAG, LangChain)',
        'Python & FastAPI',
        'PostgreSQL & SQL',
      ],
      targetIndustries: 'Cloud Infrastructure, AI Developer Tooling',
      careerObjectives: 'Automate scalable cloud deployments and build reliable AI agentic architectures.',
      preferredOpportunities: 'Cloud Platform and AI Systems Engineering roles',
      isPrimary: false,
    },
  ],
};
