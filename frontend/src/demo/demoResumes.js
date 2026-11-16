/**
 * Consistent Demo Resumes for Alex Morgan
 */

const STATUS_PROCESSED = 'processed';

export const DEMO_RESUMES = [
  {
    id: 'demo-res-1',
    ownerId: 'usr-demo-alex-morgan',
    name: 'Alex Morgan — Backend Software Engineer (Master)',
    originalFilename: 'Alex_Morgan_Backend_Resume.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1245000,
    storageKey: 'storage/demo/resumes/Alex_Morgan_Backend_Resume.pdf',
    careerTrackId: 'track-demo-backend',
    careerTrackName: 'Backend Software Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-15T16:30:00Z',
    isPrimary: true,
    atsScore: 94,
    extractedText: `ALEX MORGAN
San Francisco, CA | (555) 789-0123 | alex.morgan@demo.jobachiever.ai
LinkedIn: linkedin.com/in/alexmorgan-demo | GitHub: github.com/alexmorgandev | Portfolio: alexmorgan.dev

SUMMARY
Motivated entry-level backend software engineer with hands-on experience designing robust RESTful APIs and distributed data pipelines in Java 21, Spring Boot 3, and PostgreSQL. Proven ability to architect high-throughput services with zero-fabrication academic and internship project foundations.

TECHNICAL SKILLS
• Programming Languages: Java 21 LTS, Python 3, JavaScript (ES6+), SQL
• Frameworks & Libraries: Spring Boot 3, Spring Data JPA, Spring Security, FastAPI, JUnit 5, Mockito
• Databases & Storage: PostgreSQL, Redis, H2 Database
• Developer Tools & Cloud: Docker, Docker Compose, Git, GitHub Actions, AWS (Certified Cloud Practitioner), RESTful APIs, OpenAPI/Swagger

EDUCATION
San Jose State University — San Jose, CA
Bachelor of Science in Computer Science | GPA: 3.85 / 4.0 | Graduated: May 2024
Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Computer Networks, Operating Systems

PROFESSIONAL EXPERIENCE
TechVanguard Labs — San Francisco, CA (Hybrid)
Backend Engineering Intern | June 2023 – December 2023
• Developed high-throughput RESTful transaction endpoints using Java 21 and Spring Boot 3 serving 500,000+ daily requests.
• Optimized PostgreSQL database query execution plans and index strategies, reducing p95 API response times by 32% for transaction history queries.
• Designed 25+ automated integration and unit tests using JUnit 5 and Mockito, raising test coverage to 94%.
• Collaborated in cross-functional agile sprints, participated in code reviews, and containerized internal testing environments with Docker Compose.

FEATURED SOFTWARE PROJECTS
Distributed Order Processing Engine | Java 21, Spring Boot 3, PostgreSQL, Redis, Docker, Kafka
• Architected an event-driven transaction processing system capable of processing 10,000 orders/minute with guaranteed idempotency and fault tolerance.
• Prevented duplicate payments and concurrent transaction inconsistencies using Redis distributed locks and PostgreSQL serializable transaction isolation.
• Built structured logging, correlation IDs, and Prometheus metrics endpoints, achieving sub-45ms p99 latency under synthetic chaos simulations.

Cloud Task Scheduler Engine | Python, FastAPI, Redis, PostgreSQL, Docker
• Developed an asynchronous distributed task scheduling service with priority queues and exponential-backoff retries.
• Eliminated task backlog starvation through dynamic worker pool rebalancing and dead-letter queue routing.
• Maintained 99.98% task dispatch accuracy across 200,000 synthetic scheduled workloads with full OpenAPI documentation.

CERTIFICATIONS
• AWS Certified Cloud Practitioner — Amazon Web Services (February 2024)`,
    sections: {
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@demo.jobachiever.ai',
        phone: '(555) 789-0123',
        location: 'San Francisco, CA',
      },
      skills: [
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL',
        'REST APIs',
        'Python 3',
        'Docker',
        'Git',
        'Redis',
        'JUnit 5',
      ],
      experience: [
        {
          company: 'TechVanguard Labs',
          role: 'Backend Engineering Intern',
          duration: 'June 2023 – December 2023',
          highlights: [
            'Developed high-throughput transaction endpoints using Java 21 and Spring Boot 3.',
            'Reduced p95 API response times by 32% for transaction history queries.',
            'Designed 25+ automated integration tests in JUnit 5 achieving 94% test coverage.',
          ],
        },
      ],
      education: [
        {
          institution: 'San Jose State University',
          degree: 'B.S. in Computer Science',
          gpa: '3.85 / 4.0',
          graduationDate: 'May 2024',
        },
      ],
    },
    versions: [
      {
        versionId: 'demo-ver-1-1',
        versionNumber: 1,
        name: 'Alex Morgan — Backend SWE (v1.0)',
        updatedAt: '2026-11-15T16:30:00Z',
        description: 'Verified ATS baseline with quantified performance metrics.',
        source: 'Initial Master Document',
        fileSize: 1245000,
        careerTrackId: 'track-demo-backend',
      },
    ],
  },
  {
    id: 'demo-res-2',
    ownerId: 'usr-demo-alex-morgan',
    name: 'Alex Morgan — General Software Engineer',
    originalFilename: 'Alex_Morgan_General_SWE.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1120000,
    storageKey: 'storage/demo/resumes/Alex_Morgan_General_SWE.pdf',
    careerTrackId: 'track-demo-cloud',
    careerTrackName: 'Cloud Systems & DevOps',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-13T11:00:00Z',
    updatedAt: '2026-11-14T14:00:00Z',
    isPrimary: false,
    atsScore: 88,
    extractedText: `ALEX MORGAN
San Francisco, CA | alex.morgan@demo.jobachiever.ai
Software Engineer with hands-on experience in Python, Java, Docker, and Cloud infrastructure.`,
    sections: {
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@demo.jobachiever.ai',
      },
      skills: ['Python 3', 'Java 21', 'Docker', 'Git', 'PostgreSQL', 'Linux'],
    },
    versions: [
      {
        versionId: 'demo-ver-2-1',
        versionNumber: 1,
        name: 'Alex Morgan — General SWE (v1.0)',
        updatedAt: '2026-11-14T14:00:00Z',
        description: 'Secondary profile variant for cloud infrastructure roles.',
        source: 'Variant Generation',
        fileSize: 1120000,
        careerTrackId: 'track-demo-cloud',
      },
    ],
  },
];
