/**
 * Consistent Demo Resumes for Aarav Sharma (Indian Origin - English Text)
 * 1. Senior Backend & Distributed Systems Engineer Resume (Master, 94% ATS)
 * 2. Full Stack Systems Engineer Resume (91% ATS)
 * 3. AI / ML Data Platform Engineer Resume (90% ATS)
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
  <div class="badge">JobAchiever AI • Master Verified Document • ATS Standard Compliant</div>
  <h1>${title}</h1>
  <div class="contact">Bengaluru, Karnataka, India • aarav.sharma@jobachiever.ai • +91 98765 43210 • github.com/aaravsharmadev</div>
  ${body}
  <div class="watermark">Ground-truth verified portfolio. Zero-fabrication principle strictly enforced.</div>
</body>
</html>`;
  return URL.createObjectURL(new Blob([content], { type: 'text/html' }));
}

export const DEMO_RESUMES = [
  {
    id: 'demo-res-1',
    ownerId: 'usr-demo-aarav-sharma',
    name: 'Aarav Sharma — Senior Backend Software Engineer (Master)',
    originalFilename: 'Aarav_Sharma_Senior_Backend_Resume.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1245000,
    storageKey: 'storage/demo/resumes/Aarav_Sharma_Senior_Backend_Resume.pdf',
    careerTrackId: 'track-demo-backend',
    careerTrackName: 'Senior Backend Software Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-15T16:30:00Z',
    isPrimary: true,
    atsScore: 94,
    previewUrl: createDemoDocBlob(
      'Aarav Sharma — Senior Backend & Distributed Systems Engineer',
      `<h2>Executive Summary</h2>
       <p>High-performing Senior Backend Software Engineer with 4+ years of hands-on production experience designing high-throughput payment settlement microservices, event-driven streaming with Apache Kafka, and partitioned PostgreSQL schemas in Java 21 and Spring Boot 3. Proven track record at Razorpay and Swiggy scaling fintech systems across India.</p>
       <h2>Technical Skills</h2>
       <ul>
         <li><strong>Languages:</strong> Java 21 LTS, Python 3, SQL, Go (Basics)</li>
         <li><strong>Frameworks:</strong> Spring Boot 3, Spring Data JPA, Spring Security, FastAPI, JUnit 5</li>
         <li><strong>Data &amp; Streaming:</strong> PostgreSQL (Partitioning &amp; Query Tuning), Apache Kafka, Redis, Docker, Kubernetes</li>
       </ul>
       <h2>Professional Experience</h2>
       <p><strong>Senior Software Development Engineer (SDE-2)</strong> | Razorpay Technologies, Bengaluru (Jun 2023 – Present)</p>
       <ul>
         <li>Architected core settlement microservices in Java 21 &amp; Spring Boot 3 processing ₹150+ Crore daily GMV.</li>
         <li>Reduced p99 checkout authorization latency from 140ms to 24ms via advanced table partitioning and index optimization.</li>
         <li>Engineered distributed idempotency and webhook delivery using Apache Kafka and Redis cluster.</li>
       </ul>
       <p><strong>Software Development Engineer (SDE-1)</strong> | Swiggy, Bengaluru (Jan 2022 – May 2023)</p>
       <ul>
         <li>Built real-time logistics dispatch and driver routing pipelines handling 15,000+ orders/minute during peak surge hours.</li>
         <li>Reduced database read contention by 65% through intelligent Redis caching strategies.</li>
       </ul>
       <h2>Education</h2>
       <p><strong>B.Tech in Computer Science and Engineering</strong> | Indian Institute of Technology (IIT) Bombay (CGPA: 9.2 / 10.0)</p>`
    ),
    extractedText: `AARAV SHARMA
Bengaluru, Karnataka, India | +91 98765 43210 | aarav.sharma@jobachiever.ai
LinkedIn: linkedin.com/in/aaravsharma-tech | GitHub: github.com/aaravsharmadev | Portfolio: aaravsharma.dev

SUMMARY
High-performing Senior Backend Software Engineer with deep expertise in architecting resilient microservices, high-throughput financial switches, and low-latency API platforms with Java 21, Spring Boot 3, Apache Kafka, and PostgreSQL. Proven track record at Razorpay and Swiggy scaling fintech and logistics pipelines across Bengaluru tech hubs.

TECHNICAL SKILLS
• Programming Languages: Java 21 LTS, Python 3, SQL, Go
• Frameworks & Libraries: Spring Boot 3, Spring Data JPA, Spring Security, FastAPI, JUnit 5, Mockito
• Databases & Storage: PostgreSQL, Redis, Apache Kafka
• Developer Tools & Cloud: Docker, Kubernetes, Git, GitHub Actions, AWS Solutions Architect, RESTful APIs, OpenAPI

EDUCATION
Indian Institute of Technology (IIT) Bombay — Mumbai, India
Bachelor of Technology in Computer Science and Engineering | CGPA: 9.2 / 10.0 | Graduated: May 2023
Coursework: Advanced Data Structures & Algorithms, Distributed Systems, Database Management Internals, High-Performance Computing, Operating Systems, Computer Networks

PROFESSIONAL EXPERIENCE
Razorpay Technologies — Bengaluru, Karnataka (Hybrid)
Senior Software Development Engineer (SDE-2) | June 2023 – Present
• Architect and scale the Core Payments & Settlement Switch handling ₹150+ Crore daily Gross Merchandise Value (GMV).
• Cut p99 settlement API response latency from 140ms to 24ms through proactive database indexing and connection pooling.
• Designed automated failover pipelines maintaining 99.995% service uptime across RBI banking reconciliation windows.

Swiggy — Bengaluru, Karnataka
Software Development Engineer (SDE-1) | January 2022 – May 2023
• Engineered real-time order dispatch and delivery partner routing microservices handling 15,000+ orders/minute during peak surge hours.
• Reduced database read contention by 65% via distributed Redis caching; authored 35+ integration tests achieving 96% coverage.

FEATURED SOFTWARE PROJECTS
High-Throughput UPI Settlement Engine | Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, Redis, Docker
• Architected an event-driven transaction settlement switch capable of processing 25,000 UPI payments/second with guaranteed idempotency.
• Prevented duplicate banking debits and race conditions under peak flash-sale loads using Redis Redlock and PostgreSQL serializable transactions.

Distributed Cloud Task Scheduler Engine | Python 3, FastAPI, Redis, PostgreSQL, Docker
• Developed asynchronous distributed task scheduler with priority execution queues and automatic exponential backoff.
• Maintained 99.99% dispatch accuracy across 500,000 synthetic banking reconciliation events.

CERTIFICATIONS
• AWS Certified Solutions Architect — Associate (Amazon Web Services, February 2024)`,
    sections: {
      personalInfo: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@jobachiever.ai',
        phone: '+91 98765 43210',
        location: 'Bengaluru, Karnataka, India',
      },
      skills: [
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL',
        'Apache Kafka',
        'Redis',
        'REST APIs',
        'Docker & Kubernetes',
        'Python 3',
      ],
      experience: [
        {
          company: 'Razorpay Technologies',
          role: 'Senior Software Development Engineer (SDE-2)',
          duration: 'June 2023 – Present',
          highlights: [
            'Architected payment settlement microservices in Java 21 handling ₹150+ Crore daily GMV.',
            'Reduced p99 latency from 140ms to 24ms via PostgreSQL table partitioning.',
            'Engineered distributed idempotency using Apache Kafka and Redis cluster.',
          ],
        },
        {
          company: 'Swiggy',
          role: 'Software Development Engineer (SDE-1)',
          duration: 'January 2022 – May 2023',
          highlights: [
            'Engineered real-time logistics dispatch microservices handling 15,000+ orders/minute.',
            'Reduced database read contention by 65% via distributed Redis caching.',
          ],
        },
      ],
      education: [
        {
          institution: 'Indian Institute of Technology (IIT) Bombay',
          degree: 'B.Tech in Computer Science and Engineering',
          gpa: '9.2 / 10.0',
          graduationDate: 'May 2023',
        },
      ],
    },
    versions: [
      {
        versionId: 'demo-ver-1-1',
        versionNumber: 1,
        name: 'Aarav Sharma — Senior Backend (v1.0)',
        updatedAt: '2026-11-15T16:30:00Z',
        description: 'Verified ATS baseline with quantified performance metrics for Indian product giants.',
        source: 'Initial Master Document',
        fileSize: 1245000,
        careerTrackId: 'track-demo-backend',
      },
    ],
  },
  {
    id: 'demo-res-2',
    ownerId: 'usr-demo-aarav-sharma',
    name: 'Aarav Sharma — Full Stack Systems Engineer Resume',
    originalFilename: 'Aarav_Sharma_FullStack_Resume.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1180000,
    storageKey: 'storage/demo/resumes/Aarav_Sharma_FullStack_Resume.pdf',
    careerTrackId: 'track-1',
    careerTrackName: 'Full-Stack Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-13T11:00:00Z',
    updatedAt: '2026-11-14T14:00:00Z',
    isPrimary: false,
    atsScore: 91,
    previewUrl: createDemoDocBlob(
      'Aarav Sharma — Full Stack Systems Engineer',
      `<h2>Professional Summary</h2>
       <p>Full-Stack Software Engineer with robust competencies across Java/Spring Boot microservices, modern React (TypeScript/Tailwind CSS), and relational database modeling in PostgreSQL.</p>
       <h2>Core Competencies</h2>
       <ul>
         <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS, Vite, Radix UI, TanStack Query</li>
         <li><strong>Backend:</strong> Java 21, Spring Boot 3, REST APIs, Node.js, Express</li>
         <li><strong>Databases &amp; DevOps:</strong> PostgreSQL, Docker, Git, CI/CD with GitHub Actions</li>
       </ul>`
    ),
    extractedText: `AARAV SHARMA — Full Stack Systems Engineer
Bengaluru, Karnataka, India | aarav.sharma@jobachiever.ai
Skills: React 18, TypeScript, Tailwind CSS, Java 21, Spring Boot 3, PostgreSQL, Apache Kafka, Docker, Git.
Summary: Full-stack engineer experienced in responsive SPA interfaces and Spring Boot REST microservices.`,
    sections: {
      personalInfo: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@jobachiever.ai',
      },
      skills: ['React 18', 'TypeScript', 'Java 21', 'Spring Boot 3', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Git'],
    },
    versions: [
      {
        versionId: 'demo-ver-2-1',
        versionNumber: 1,
        name: 'Aarav Sharma — Full Stack (v1.0)',
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
    ownerId: 'usr-demo-aarav-sharma',
    name: 'Aarav Sharma — AI / ML Data Systems Engineer Resume',
    originalFilename: 'Aarav_Sharma_AIML_Engineer.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1310000,
    storageKey: 'storage/demo/resumes/Aarav_Sharma_AIML_Engineer.pdf',
    careerTrackId: 'track-3',
    careerTrackName: 'AI & Vector Solutions Engineer',
    version: 1,
    processingStatus: STATUS_PROCESSED,
    uploadedAt: '2026-11-14T09:00:00Z',
    updatedAt: '2026-11-15T11:00:00Z',
    isPrimary: false,
    atsScore: 90,
    previewUrl: createDemoDocBlob(
      'Aarav Sharma — AI / ML Systems Engineer',
      `<h2>Executive Profile</h2>
       <p>AI Systems Engineer specializing in semantic search pipelines, vector embeddings with pgvector/HNSW, FastAPI microservices, and Groq LPU LLM inference.</p>
       <h2>Key Competencies</h2>
       <ul>
         <li><strong>AI &amp; Embeddings:</strong> Python 3.11, FastAPI, pgvector, HNSW indexing, Groq Cloud (Llama 3.3)</li>
         <li><strong>Backend &amp; Data:</strong> PostgreSQL, Redis, Docker, Apache Kafka</li>
       </ul>`
    ),
    extractedText: `AARAV SHARMA — AI & ML Systems Engineer
Bengaluru, Karnataka, India | aarav.sharma@jobachiever.ai
Skills: Python 3.11, FastAPI, pgvector, PostgreSQL, HNSW Indexing, Docker, Groq LPU, Redis.
Summary: AI Systems Engineer focused on semantic embeddings, low-latency vector retrieval, and structured Groq Llama 3.3 outputs.`,
    sections: {
      personalInfo: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@jobachiever.ai',
      },
      skills: ['Python 3.11', 'FastAPI', 'pgvector', 'PostgreSQL', 'Docker', 'Redis', 'Groq LPU'],
    },
    versions: [
      {
        versionId: 'demo-ver-3-1',
        versionNumber: 1,
        name: 'Aarav Sharma — AI/ML Engineer (v1.0)',
        updatedAt: '2026-11-15T11:00:00Z',
        description: 'Applied AI track focusing on semantic search and Groq LPU inference.',
        source: 'Track Optimization',
        fileSize: 1310000,
        careerTrackId: 'track-3',
      },
    ],
  },
];
