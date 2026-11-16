from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontSize=18,
    leading=22,
    textColor=colors.HexColor('#0f172a'),
    spaceAfter=2,
    fontName='Helvetica-Bold'
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontSize=10,
    leading=13,
    textColor=colors.HexColor('#2563eb'),
    spaceAfter=4,
    fontName='Helvetica-Bold'
)

contact_style = ParagraphStyle(
    'ContactInfo',
    parent=styles['Normal'],
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#475569'),
    spaceAfter=6,
    fontName='Helvetica'
)

section_heading = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontSize=11,
    leading=14,
    textColor=colors.HexColor('#0f172a'),
    spaceBefore=6,
    spaceAfter=3,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#334155'),
    spaceAfter=3,
    fontName='Helvetica'
)

bullet_style = ParagraphStyle(
    'BulletText',
    parent=styles['Normal'],
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#334155'),
    leftIndent=12,
    spaceAfter=2,
    fontName='Helvetica'
)

def make_resume(filename, data):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    elements = []

    # Header
    elements.append(Paragraph(data['name'], title_style))
    elements.append(Paragraph(data['title'], subtitle_style))
    elements.append(Paragraph(data['contact'], contact_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=6))

    # Summary
    elements.append(Paragraph("EXECUTIVE SUMMARY", section_heading))
    elements.append(Paragraph(data['summary'], body_style))
    elements.append(Spacer(1, 4))

    # Skills
    elements.append(Paragraph("TECHNICAL PROFICIENCIES", section_heading))
    for cat, sks in data['skills'].items():
        elements.append(Paragraph(f"<b>{cat}:</b> {sks}", body_style))
    elements.append(Spacer(1, 4))

    # Experience
    elements.append(Paragraph("PROFESSIONAL EXPERIENCE", section_heading))
    for exp in data['experience']:
        elements.append(Paragraph(f"<b>{exp['role']}</b> — {exp['company']} <i>({exp['period']})</i>", body_style))
        for b in exp['bullets']:
            elements.append(Paragraph(f"• {b}", bullet_style))
        elements.append(Spacer(1, 3))

    # Projects
    elements.append(Paragraph("FEATURED ENGINEERING PROJECTS", section_heading))
    for proj in data['projects']:
        elements.append(Paragraph(f"<b>{proj['name']}</b> | <i>{proj['stack']}</i>", body_style))
        for b in proj['bullets']:
            elements.append(Paragraph(f"• {b}", bullet_style))
        elements.append(Spacer(1, 3))

    # Education
    elements.append(Paragraph("EDUCATION & CERTIFICATIONS", section_heading))
    for edu in data['education']:
        elements.append(Paragraph(f"<b>{edu['degree']}</b> — {edu['school']} ({edu['year']})", body_style))

    doc.build(elements)
    print(f"Generated: {filename}")

os.makedirs('resumes', exist_ok=True)

# 1. Frontend Architect Resume
rohan_data = {
    'name': "Rohan Verma",
    'title': "Senior Frontend & Web Performance Engineer",
    'contact': "Bengaluru, India • +91 98765 43210 • rohan.verma@gmail.com • linkedin.com/in/rohanverma-ui • github.com/rohan-ui",
    'summary': "Frontend Specialist with 4.5+ years architecting web applications, modern single-page apps, and design systems with React 19, Next.js, and TypeScript. Reduced Core Web Vitals LCP by 42% across 2M+ monthly active users at Swiggy.",
    'skills': {
        "Frontend Core": "React 19, TypeScript, JavaScript (ESNext), Next.js 15, Vue.js, HTML5, CSS3/SCSS",
        "State & Styling": "Redux Toolkit, Zustand, React Query (TanStack), Tailwind CSS, shadcn/ui, Framer Motion",
        "Performance & Tooling": "Webpack 5, Vite, Turborepo, Module Federation, Lighthouse, Jest, React Testing Library, Cypress",
        "Architecture": "Micro-Frontends, Server-Side Rendering (SSR), Progressive Web Apps (PWA), CI/CD GitHub Actions"
    },
    'experience': [
        {
            'role': "Senior Frontend Engineer",
            'company': "Swiggy Consumer Platforms (Bengaluru)",
            'period': "2022 – Present",
            'bullets': [
                "Architected checkout and cart micro-frontend servicing 180,000 requests per minute with 99.98% render availability.",
                "Championed migration of legacy bundle to Vite and Turborepo, slashing incremental build times from 4.2m to 28s.",
                "Engineered responsive design tokens and component library using Radix UI primitives and Tailwind CSS used across 6 product squads."
            ]
        },
        {
            'role': "Frontend Developer",
            'company': "Flipkart Internet Pvt Ltd (Bengaluru)",
            'period': "2020 – 2022",
            'bullets': [
                "Developed interactive product discovery filters improving user engagement conversion by 14.8%.",
                "Built automated Cypress end-to-end integration test suites boosting code release confidence from bi-weekly to daily deployments."
            ]
        }
    ],
    'projects': [
        {
            'name': "PulseUI Design System",
            'stack': "React 19, TypeScript, Storybook, Tailwind CSS",
            'bullets': [
                "Open-source accessible UI library with 45+ components adhering strictly to WAI-ARIA 2.1 compliance.",
                "Published to NPM with 12,000+ monthly downloads; integrated zero-runtime CSS tree-shaking."
            ]
        }
    ],
    'education': [
        {
            'degree': "B.Tech in Computer Science & Engineering",
            'school': "National Institute of Technology Karnataka (NIT Surathkal)",
            'year': "2016 – 2020 • CGPA: 8.8/10"
        }
    ]
}

# 2. Backend & Cloud Engineer Resume
ananya_data = {
    'name': "Ananya Iyer",
    'title': "Senior Backend & Distributed Systems Engineer",
    'contact': "Bengaluru, India • +91 99887 76655 • ananya.iyer@gmail.com • linkedin.com/in/ananyaiyer-cloud • github.com/ananya-dev",
    'summary': "Distributed Systems Architect with 5+ years specializing in high-throughput transactional backends, event-driven microservices, and cloud infrastructure using Java 21, Spring Boot 3, Go, Apache Kafka, and Kubernetes at Razorpay.",
    'skills': {
        "Languages & Frameworks": "Java 21 LTS, Go (Golang), Spring Boot 3.x, Spring Cloud, Hibernate/JPA, Node.js",
        "Distributed & Messaging": "Apache Kafka, RabbitMQ, Redis Streams, gRPC, RESTful APIs, Event Sourcing",
        "Databases & Storage": "PostgreSQL 16, pgvector, MySQL, MongoDB, Redis Caching, Flyway Migrations",
        "DevOps & Cloud": "Docker, Kubernetes, AWS (EKS, RDS, S3), Terraform, Prometheus, Grafana, Jenkins"
    },
    'experience': [
        {
            'role': "Senior Backend Engineer",
            'company': "Razorpay Software (Bengaluru)",
            'period': "2022 – Present",
            'bullets': [
                "Architected distributed payment reconciliation microservice handling 4,500 transactions per second with sub-80ms p99 latency.",
                "Implemented Kafka consumer idempotency and dead-letter queues reducing failed transaction disputes by 38%.",
                "Containerized 14 core backend services using Docker and Helm charts deployed across multi-zone Kubernetes clusters."
            ]
        },
        {
            'role': "Software Development Engineer",
            'company': "PhonePe Payments (Bengaluru)",
            'period': "2019 – 2022",
            'bullets': [
                "Optimized PostgreSQL connection pooling and B-tree indexes, mitigating connection spikes during Big Billion Day traffic surges.",
                "Developed Spring Security OAuth2 / JWT authentication layer enforcing tenant data isolation across 80,000 merchant accounts."
            ]
        }
    ],
    'projects': [
        {
            'name': "CloudScale Distributed Rate Limiter",
            'stack': "Go, Redis Cluster, gRPC, Docker",
            'bullets': [
                "Built sliding-window distributed rate limiting middleware benchmarked at 120,000 RPS with 1.2ms latency.",
                "Integrated Prometheus metrics exporter with Grafana alerting dashboards for live throughput monitoring."
            ]
        }
    ],
    'education': [
        {
            'degree': "B.E. in Computer Science",
            'school': "BITS Pilani (Pilani Campus)",
            'year': "2015 – 2019 • CGPA: 9.1/10"
        }
    ]
}

# 3. AI & Data Scientist Resume
vikram_data = {
    'name': "Vikram Malhotra",
    'title': "Lead AI/ML & LLM Systems Engineer",
    'contact': "Hyderabad, India • +91 91234 56789 • vikram.malhotra@gmail.com • linkedin.com/in/vikram-ai • github.com/vikram-ml",
    'summary': "AI Systems Engineer with 4+ years driving Generative AI pipelines, Retrieval-Augmented Generation (RAG), vector similarity search, and model fine-tuning. Productionized LangChain and PyTorch solutions serving enterprise intelligence at CRED.",
    'skills': {
        "AI / ML Core": "Python 3.11, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, HuggingFace Transformers",
        "LLMs & GenAI": "LangChain, LlamaIndex, OpenAI / Groq APIs, RAG Architectures, Vector Embeddings, Prompt Engineering",
        "Vector & Cloud": "pgvector, Pinecone, Milvus, ChromaDB, FastAPI, Docker, AWS SageMaker, MLflow",
        "Data Engineering": "Apache Spark, SQL, Airflow, Feature Stores, Data Pipelines, Model Serving (Triton)"
    },
    'experience': [
        {
            'role': "Lead AI Engineer",
            'company': "CRED Technologies (Bengaluru)",
            'period': "2022 – Present",
            'bullets': [
                "Engineered hybrid RAG conversational advisory platform using pgvector and Llama-3-70B achieving 94% user query satisfaction.",
                "Reduced LLM inference latency by 65% via semantic caching with Redis and quantization techniques.",
                "Designed hallucination guardrails and automated evaluation framework leveraging RAGAS and customized validation probes."
            ]
        },
        {
            'role': "Machine Learning Engineer",
            'company': "Fractal Analytics (Mumbai / Bengaluru)",
            'period': "2020 – 2022",
            'bullets': [
                "Developed predictive customer churn models using XGBoost and SHAP explainability deployed to AWS SageMaker endpoints.",
                "Automated end-to-end retraining pipelines with MLflow and Airflow tracking model drift and dataset shifts."
            ]
        }
    ],
    'projects': [
        {
            'name': "OmniSearch Vector Engine",
            'stack': "Python, FastAPI, pgvector, PyTorch, Docker",
            'bullets': [
                "Sub-50ms hybrid sparse-dense neural search engine indexing 500,000 unstructured technical research articles.",
                "Benchmarked against Qdrant and Milvus, achieving 0.92 Mean Reciprocal Rank (MRR) on domain-specific benchmarks."
            ]
        }
    ],
    'education': [
        {
            'degree': "B.Tech in Data Science & Artificial Intelligence",
            'school': "Indian Institute of Technology Madras (IIT Madras)",
            'year': "2016 – 2020 • CGPA: 9.3/10"
        }
    ]
}

make_resume('resumes/1_Rohan_Verma_Frontend_Architect.pdf', rohan_data)
make_resume('resumes/2_Ananya_Iyer_Backend_Cloud_Engineer.pdf', ananya_data)
make_resume('resumes/3_Vikram_Malhotra_AI_DataScientist.pdf', vikram_data)
print("All 3 resumes created successfully!")
