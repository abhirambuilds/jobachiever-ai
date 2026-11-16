/**
 * Consistent Demo Resumes for Alex Morgan
 * Meets Prompt D2 Section 3 requirements:
 * 1. Backend Developer Resume (Master, 94% ATS)
 * 2. Full Stack Developer Resume (91% ATS)
 * 3. AI/ML Engineer Resume (89% ATS)
 */

const STATUS_PROCESSED = 'processed';

function createDemoDocBlob(title, body) {
  if (
    typeof window === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof Blob === 'undefined'
  ) {
    return null;
  }
  const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 36px; color: #1e293b; background: #ffffff; line-height: 1.5; font-size: 13px; }
    h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 6px; font-size: 22px; margin-bottom: 4px; }
    .contact { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    h2 { color: #334155; font-size: 14px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
    .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
    ul { padding-left: 18px; margin: 4px 0 12px 0; }
    li { margin-bottom: 4px; }
    .watermark { margin-top: 32px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="badge">JobAchiever AI Demo Master Document • ATS Standard Compliant</div>
  <h1>${title}</h1>
  <div class="contact">San Francisco, CA • alex.morgan@demo.jobachiever.ai • (555) 789-0123 • github.com/alexmorgandev</div>
  ${body}
  <div class="watermark">Demonstration Sandbox Document • Ground-truth verification enabled. Zero-fabrication principle enforced.</div>
</body>
</html>`;
  return URL.createObjectURL(new Blob([content], { type: 'text/html' }));
}

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
    previewUrl: createDemoDocBlob(
      'Alex Morgan — Backend Software Engineer',
      `<h2>Executive Summary</h2>
       <p>Motivated entry-level backend engineer with hands-on experience designing robust RESTful APIs and distributed pipelines in Java 21, Spring Boot 3, and PostgreSQL. Demonstrates proven ability to architect high-throughput services with zero fabrication.</p>
       <h2>Technical Skills</h2>
       <ul>
         <li><strong>Languages:</strong> Java 21 LTS, Python 3, JavaScript (ES6+), SQL</li>
         <li><strong>Frameworks:</strong> Spring Boot 3, Spring Data JPA, Spring Security, FastAPI, JUnit 5</li>
         <li><strong>Data &amp; Cloud:</strong> PostgreSQL, Redis, Docker, Kafka, AWS (Certified Cloud Practitioner)</li>
       </ul>
       <h2>Professional Experience</h2>
       <p><strong>Backend Engineering Intern</strong> | TechVanguard Labs (Jun 2023 – Dec 2023)</p>
       <ul>
         <li>Developed high-throughput transaction endpoints using Java 21 &amp; Spring Boot 3 serving 500k+ daily requests.</li>
         <li>Optimized PostgreSQL queries, reducing p95 latency by 32% for transaction history queries.</li>
         <li>Designed 25+ automated integration tests in JUnit 5 achieving 94% test coverage.</li>
       </ul>
       <h2>Featured Projects</h2>
       <p><strong>Distributed Order Processing Engine</strong> (Java 21, Spring Boot 3, PostgreSQL, Redis, Kafka)</p>
       <ul>
         <li>Processed 10,000 orders/minute with guaranteed idempotency and Redis distributed locks.</li>
         <li>Sub-45ms p99 latency under chaos testing simulation.</li>
       </ul>`
    ),
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
    name: 'Alex Morgan — Full Stack Developer Resume',
    originalFilename: 'Alex_Morgan_FullStack_Resume.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1180000,
    storageKey: 'storage/demo/resumes/Alex_Morgan_FullStack_Resume.pdf',
    careerTrackId: 'track-1',
    careerTrackName: 'Full-Stack Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-13T11:00:00Z',
    updatedAt: '2026-11-14T14:00:00Z',
    isPrimary: false,
    atsScore: 91,
    previewUrl: createDemoDocBlob(
      'Alex Morgan — Full Stack Developer',
      `<h2>Professional Summary</h2>
       <p>Full-Stack Software Engineer with robust competencies across Java/Spring Boot microservices, modern React (TypeScript/Tailwind CSS), and relational database modeling in PostgreSQL.</p>
       <h2>Core Competencies</h2>
       <ul>
         <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS, Vite, Radix UI, TanStack Query</li>
         <li><strong>Backend:</strong> Java 21, Spring Boot 3, REST APIs, Node.js, Express</li>
         <li><strong>Databases &amp; DevOps:</strong> PostgreSQL, Docker, Git, CI/CD with GitHub Actions</li>
       </ul>
       <h2>Full-Stack Projects</h2>
       <p><strong>Career Operating Dashboard</strong> (React, Spring Boot, PostgreSQL, Tailwind CSS)</p>
       <ul>
         <li>Engineered responsive SPA with real-time analytics and optimistic UI updates.</li>
         <li>Architected strict JWT stateless auth and connection-pooled backend services.</li>
       </ul>`
    ),
    extractedText: `ALEX MORGAN — Full Stack Developer
San Francisco, CA | alex.morgan@demo.jobachiever.ai
Skills: React 18, TypeScript, Tailwind CSS, Java 21, Spring Boot 3, PostgreSQL, Node.js, REST APIs, Docker, Git.
Summary: Full-stack engineer experienced in responsive SPA interfaces and Spring Boot REST microservices.`,
    sections: {
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@demo.jobachiever.ai',
      },
      skills: ['React 18', 'TypeScript', 'Java 21', 'Spring Boot 3', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Git'],
    },
    versions: [
      {
        versionId: 'demo-ver-2-1',
        versionNumber: 1,
        name: 'Alex Morgan — Full Stack (v1.0)',
        updatedAt: '2026-11-14T14:00:00Z',
        description: 'Full-stack targeted persona emphasizing React and Spring Boot integration.',
        source: 'Variant Generation',
        fileSize: 1180000,
        careerTrackId: 'track-1',
      },
    ],
  },
  {
    id: 'demo-res-3',
    ownerId: 'usr-demo-alex-morgan',
    name: 'Alex Morgan — AI / ML Systems Engineer Resume',
    originalFilename: 'Alex_Morgan_AIML_Engineer.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1310000,
    storageKey: 'storage/demo/resumes/Alex_Morgan_AIML_Engineer.pdf',
    careerTrackId: 'track-3',
    careerTrackName: 'AI & Vector Solutions Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-14T09:00:00Z',
    updatedAt: '2026-11-15T11:00:00Z',
    isPrimary: false,
    atsScore: 89,
    previewUrl: createDemoDocBlob(
      'Alex Morgan — AI / ML Systems Engineer',
      `<h2>Executive Profile</h2>
       <p>AI Systems Engineer specializing in semantic search pipelines, vector embeddings with pgvector/HNSW, FastAPI microservices, and reliable LLM provider integration.</p>
       <h2>Key Competencies</h2>
       <ul>
         <li><strong>AI &amp; Embeddings:</strong> Python 3.11, FastAPI, pgvector, HNSW indexing, LangChain, SentenceTransformers</li>
         <li><strong>Backend &amp; Data:</strong> PostgreSQL, Redis, Docker Compose, Uvicorn, Pydantic v2</li>
         <li><strong>LLM Providers:</strong> Groq (Llama 3.3), Google Gemini 2.0 Flash, Structured Outputs</li>
       </ul>
       <h2>Featured AI Systems Projects</h2>
       <p><strong>VectorDB Semantic Search &amp; Retrieval Engine</strong> (Python, FastAPI, pgvector, Docker)</p>
       <ul>
         <li>Achieved sub-40ms vector similarity lookups across 250,000 document chunks using cosine distance.</li>
         <li>Designed anti-fabrication grounding filter enforcing strict citations for synthesized answers.</li>
       </ul>`
    ),
    extractedText: `ALEX MORGAN — AI & ML Systems Engineer
San Francisco, CA | alex.morgan@demo.jobachiever.ai
Skills: Python 3.11, FastAPI, pgvector, PostgreSQL, HNSW Indexing, Docker, Groq, Google Gemini, Redis.
Summary: AI Systems Engineer focused on semantic embeddings, low-latency vector retrieval, and structured LLM outputs.`,
    sections: {
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@demo.jobachiever.ai',
      },
      skills: ['Python 3.11', 'FastAPI', 'pgvector', 'PostgreSQL', 'Docker', 'Redis', 'HNSW Indexing'],
    },
    versions: [
      {
        versionId: 'demo-ver-3-1',
        versionNumber: 1,
        name: 'Alex Morgan — AI/ML Engineer (v1.0)',
        updatedAt: '2026-11-15T11:00:00Z',
        description: 'Applied AI track focusing on semantic search and pgvector indexing.',
        source: 'Track Optimization',
        fileSize: 1310000,
        careerTrackId: 'track-3',
      },
    ],
  },
];
