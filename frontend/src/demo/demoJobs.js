/**
 * Consistent Demo Job Descriptions for Alex Morgan
 */

export const DEMO_JOBS = [
  {
    id: 'job-demo-stripe',
    company: 'Stripe',
    title: 'Backend Software Engineer — Core Platform',
    location: 'San Francisco, CA (Hybrid / Remote Option)',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Entry-to-Mid (0–3 years)',
    salaryRange: '$135,000 - $165,000',
    deadline: '2026-12-15',
    url: 'https://stripe.com/jobs/backend-engineer-platform',
    postedAgo: '1d ago',
    requiredSkills: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'REST APIs'],
    preferredSkills: ['Kafka', 'Docker', 'Redis', 'Kubernetes'],
    matchScore: 91,
    matchedSkillsCount: 4,
    totalSkillsCount: 4,
    rawText: `About Stripe:
Stripe is a financial infrastructure platform for the internet. Millions of companies—from ambitious startups to the world's largest enterprises—use Stripe to accept payments, grow revenue, and accelerate new business opportunities.

About the Role:
We are looking for a Backend Software Engineer to join our Core Platform team. You will help build and operate resilient distributed backend services that process high volumes of transaction data with reliability, precision, and low latency.

Key Responsibilities:
• Build high-availability RESTful APIs in Java 21 / Spring Boot 3 handling critical payment transactions.
• Design, optimize, and maintain relational database schemas in PostgreSQL with careful index and transaction planning.
• Implement defensive engineering practices with thorough unit and integration test coverage.
• Collaborate with cross-functional engineering teams to maintain microservice boundaries and API contracts.

Required Qualifications:
• B.S. in Computer Science, Software Engineering, or equivalent practical experience.
• Hands-on development experience in Java (Java 17/21) and Spring Boot frameworks.
• Solid relational database fundamentals with PostgreSQL or SQL databases.
• Experience building and consuming RESTful APIs with strict validation.
• Strong foundation in data structures, algorithms, and software testing.

Preferred & Bonus Qualifications:
• Experience with message streaming frameworks such as Apache Kafka.
• Familiarity with distributed caching solutions such as Redis.
• Familiarity with containerization tooling (Docker, Kubernetes).
• AWS cloud fundamentals or relevant cloud certifications.`,
    extractedData: {
      roleTitle: 'Backend Software Engineer — Core Platform',
      company: 'Stripe',
      experienceLevel: 'Entry-to-Mid (0–3 years)',
      requiredTechnicalSkills: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'REST APIs'],
      preferredTechnicalSkills: ['Kafka', 'Docker', 'Redis', 'Kubernetes'],
      softSkills: ['Collaborative Problem Solving', 'Attention to Precision', 'Agile Mindset'],
      responsibilities: [
        'Build high-availability RESTful APIs in Java 21 and Spring Boot 3.',
        'Design and optimize PostgreSQL database schemas and transaction isolation.',
        'Implement defensive test suites using JUnit 5 and integration testing.',
        'Collaborate across cross-functional teams to maintain resilient microservice boundaries.',
      ],
      educationRequirements: 'B.S. in Computer Science, Software Engineering, or equivalent.',
      certifications: ['AWS Cloud certification is a bonus.'],
    },
  },
  {
    id: 'job-demo-datadog',
    company: 'Datadog',
    title: 'Junior Cloud Infrastructure Engineer',
    location: 'Remote (US)',
    employmentType: 'Full-time',
    workMode: 'Remote',
    experienceLevel: 'Entry-level (0–2 years)',
    salaryRange: '$120,000 - $145,000',
    deadline: '2026-12-28',
    url: 'https://datadoghq.com/careers/junior-cloud-infrastructure',
    postedAgo: '3d ago',
    requiredSkills: ['Python 3', 'Docker', 'Linux', 'Git'],
    preferredSkills: ['Kubernetes', 'Terraform', 'PostgreSQL', 'CI/CD Pipelines'],
    matchScore: 84,
    matchedSkillsCount: 3,
    totalSkillsCount: 4,
    rawText: `About Datadog:
Datadog is the monitoring and security platform for cloud applications. We bring together data from servers, containers, databases, and third-party services to make your stack entirely observable.

About the Role:
We are seeking a Junior Cloud Infrastructure Engineer to help maintain our developer infrastructure and telemetry pipeline tools.

Requirements:
• 0–2 years of hands-on software development or DevOps experience in Python or Go.
• Solid understanding of Linux systems and containerization with Docker.
• Version control fluency in Git and continuous integration workflows.
• Bachelor’s degree in Computer Science or related STEM field.`,
    extractedData: {
      roleTitle: 'Junior Cloud Infrastructure Engineer',
      company: 'Datadog',
      experienceLevel: 'Entry-level (0–2 years)',
      requiredTechnicalSkills: ['Python 3', 'Docker', 'Linux', 'Git'],
      preferredTechnicalSkills: ['Kubernetes', 'Terraform', 'PostgreSQL', 'CI/CD Pipelines'],
      softSkills: ['Systems Curiosity', 'Analytical Troubleshooting'],
      responsibilities: [
        'Maintain automated deployment containers and developer pipelines.',
        'Monitor cloud infrastructure telemetry and diagnose performance bottlenecks.',
      ],
      educationRequirements: 'B.S. in Computer Science or equivalent.',
      certifications: [],
    },
  },
];
