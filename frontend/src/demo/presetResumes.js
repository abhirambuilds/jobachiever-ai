/**
 * Predefined Demonstration Resumes for JobAchiever AI.
 *
 * Provides 3 diverse, production-ready career profiles:
 * 1. Rohan Verma — Senior Frontend & Web Architect
 * 2. Ananya Iyer — Senior Backend & Cloud Engineer
 * 3. Vikram Malhotra — Lead AI/ML & LLM Systems Engineer
 */

export const PRESET_RESUMES = [
  {
    id: 'resume-preset-frontend',
    fileName: '1_Rohan_Verma_Frontend_Architect.pdf',
    name: 'Rohan Verma',
    title: 'Senior Frontend & Web Performance Engineer',
    targetRole: 'Senior Frontend Engineer',
    email: 'rohan.verma@gmail.com',
    phone: '+91 98765 43210',
    city: 'Bengaluru, India',
    summary: 'Frontend Specialist with 4.5+ years architecting web applications, modern single-page apps, and design systems with React 19, Next.js, and TypeScript. Reduced Core Web Vitals LCP by 42% across 2M+ monthly active users at Swiggy.',
    skills: ['React 19', 'TypeScript', 'Next.js 15', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'Vite', 'Turborepo', 'Cypress', 'WAI-ARIA', 'Module Federation'],
    experience: [
      {
        company: 'Swiggy Consumer Platforms',
        role: 'Senior Frontend Engineer',
        location: 'Bengaluru, India',
        startDate: '2022-04-01',
        endDate: null,
        current: true,
        bullets: [
          'Architected checkout and cart micro-frontend servicing 180,000 requests per minute with 99.98% render availability.',
          'Championed migration of legacy bundle to Vite and Turborepo, slashing incremental build times from 4.2m to 28s.',
          'Engineered responsive design tokens and component library using Radix UI primitives and Tailwind CSS used across 6 product squads.',
        ],
      },
      {
        company: 'Flipkart Internet Pvt Ltd',
        role: 'Frontend Developer',
        location: 'Bengaluru, India',
        startDate: '2020-07-01',
        endDate: '2022-03-31',
        current: false,
        bullets: [
          'Developed interactive product discovery filters improving user engagement conversion by 14.8%.',
          'Built automated Cypress end-to-end integration test suites boosting code release confidence from bi-weekly to daily deployments.',
        ],
      },
    ],
    projects: [
      {
        name: 'PulseUI Design System',
        technologies: ['React 19', 'TypeScript', 'Storybook', 'Tailwind CSS'],
        link: 'https://github.com/rohan-ui/pulse-ui',
        description: 'Open-source accessible UI library with 45+ components adhering strictly to WAI-ARIA 2.1 compliance.',
        bullets: [
          'Published to NPM with 12,000+ monthly downloads; integrated zero-runtime CSS tree-shaking.',
        ],
      },
    ],
    education: [
      {
        institution: 'NIT Surathkal',
        degree: 'B.Tech in Computer Science & Engineering',
        fieldOfStudy: 'Computer Science',
        startYear: '2016',
        endYear: '2020',
        grade: '8.8 / 10 CGPA',
      },
    ],
  },
  {
    id: 'resume-preset-backend',
    fileName: '2_Ananya_Iyer_Backend_Cloud_Engineer.pdf',
    name: 'Ananya Iyer',
    title: 'Senior Backend & Distributed Systems Engineer',
    targetRole: 'Senior Backend Platform Engineer',
    email: 'ananya.iyer@gmail.com',
    phone: '+91 99887 76655',
    city: 'Bengaluru, India',
    summary: 'Distributed Systems Architect with 5+ years specializing in high-throughput transactional backends, event-driven microservices, and cloud infrastructure using Java 21, Spring Boot 3, Go, Apache Kafka, and Kubernetes at Razorpay.',
    skills: ['Java 21', 'Spring Boot 3', 'Go (Golang)', 'Apache Kafka', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'AWS EKS', 'Prometheus', 'gRPC'],
    experience: [
      {
        company: 'Razorpay Software',
        role: 'Senior Backend Engineer',
        location: 'Bengaluru, India',
        startDate: '2022-01-01',
        endDate: null,
        current: true,
        bullets: [
          'Architected distributed payment reconciliation microservice handling 4,500 transactions per second with sub-80ms p99 latency.',
          'Implemented Kafka consumer idempotency and dead-letter queues reducing failed transaction disputes by 38%.',
          'Containerized 14 core backend services using Docker and Helm charts deployed across multi-zone Kubernetes clusters.',
        ],
      },
      {
        company: 'PhonePe Payments',
        role: 'Software Development Engineer',
        location: 'Bengaluru, India',
        startDate: '2019-06-01',
        endDate: '2021-12-31',
        current: false,
        bullets: [
          'Optimized PostgreSQL connection pooling and B-tree indexes, mitigating connection spikes during Big Billion Day traffic surges.',
          'Developed Spring Security OAuth2 / JWT authentication layer enforcing tenant data isolation across 80,000 merchant accounts.',
        ],
      },
    ],
    projects: [
      {
        name: 'CloudScale Distributed Rate Limiter',
        technologies: ['Go', 'Redis Cluster', 'gRPC', 'Docker'],
        link: 'https://github.com/ananya-dev/cloudscale-limiter',
        description: 'Sliding-window distributed rate limiting middleware benchmarked at 120,000 RPS with 1.2ms latency.',
        bullets: [
          'Integrated Prometheus metrics exporter with Grafana alerting dashboards for live throughput monitoring.',
        ],
      },
    ],
    education: [
      {
        institution: 'BITS Pilani',
        degree: 'B.E. in Computer Science',
        fieldOfStudy: 'Computer Science',
        startYear: '2015',
        endYear: '2019',
        grade: '9.1 / 10 CGPA',
      },
    ],
  },
  {
    id: 'resume-preset-aiml',
    fileName: '3_Vikram_Malhotra_AI_DataScientist.pdf',
    name: 'Vikram Malhotra',
    title: 'Lead AI/ML & LLM Systems Engineer',
    targetRole: 'Lead AI/ML Systems Engineer',
    email: 'vikram.malhotra@gmail.com',
    phone: '+91 91234 56789',
    city: 'Hyderabad, India',
    summary: 'AI Systems Engineer with 4+ years driving Generative AI pipelines, Retrieval-Augmented Generation (RAG), vector similarity search, and model fine-tuning. Productionized LangChain and PyTorch solutions serving enterprise intelligence at CRED.',
    skills: ['Python 3.11', 'PyTorch', 'LangChain', 'FastAPI', 'pgvector', 'RAG Architectures', 'Docker', 'AWS SageMaker', 'HuggingFace', 'MLflow', 'Spark'],
    experience: [
      {
        company: 'CRED Technologies',
        role: 'Lead AI Engineer',
        location: 'Bengaluru, India',
        startDate: '2022-03-01',
        endDate: null,
        current: true,
        bullets: [
          'Engineered hybrid RAG conversational advisory platform using pgvector and Llama-3-70B achieving 94% user query satisfaction.',
          'Reduced LLM inference latency by 65% via semantic caching with Redis and quantization techniques.',
          'Designed hallucination guardrails and automated evaluation framework leveraging RAGAS and customized validation probes.',
        ],
      },
      {
        company: 'Fractal Analytics',
        role: 'Machine Learning Engineer',
        location: 'Mumbai / Bengaluru',
        startDate: '2020-08-01',
        endDate: '2022-02-28',
        current: false,
        bullets: [
          'Developed predictive customer churn models using XGBoost and SHAP explainability deployed to AWS SageMaker endpoints.',
          'Automated end-to-end retraining pipelines with MLflow and Airflow tracking model drift and dataset shifts.',
        ],
      },
    ],
    projects: [
      {
        name: 'OmniSearch Vector Engine',
        technologies: ['Python', 'FastAPI', 'pgvector', 'PyTorch', 'Docker'],
        link: 'https://github.com/vikram-ml/omnisearch-vector',
        description: 'Sub-50ms hybrid sparse-dense neural search engine indexing 500,000 unstructured technical research articles.',
        bullets: [
          'Benchmarked against Qdrant and Milvus, achieving 0.92 Mean Reciprocal Rank (MRR) on domain-specific benchmarks.',
        ],
      },
    ],
    education: [
      {
        institution: 'IIT Madras',
        degree: 'B.Tech in Data Science & Artificial Intelligence',
        fieldOfStudy: 'Data Science',
        startYear: '2016',
        endYear: '2020',
        grade: '9.3 / 10 CGPA',
      },
    ],
  },
];
