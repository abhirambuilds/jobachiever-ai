# JobAchiever AI

> **Prepare Smarter. Apply Better. Get Hired.**

JobAchiever AI is an enterprise-grade, multi-user, AI-powered **Career Operating System**. It is engineered to guide students, recent graduates, and experienced professionals through the complexities of the modern job market—from resume optimization and multi-track career planning to intelligent job compatibility matching and interview readiness.

---

## Problem Statement

The modern job search ecosystem is fragmented, opaque, and heavily automated against applicants:
- **Applicant Tracking Systems (ATS)** filter out qualified candidates due to subtle formatting discrepancies or missing keywords.
- **Generic Resumes** fail to highlight relevant achievements tailored to specific role expectations.
- **Black-box AI Tools** frequently hallucinate credentials, fabricate experiences, or provide ungrounded advice that risks candidate credibility.
- **Scattered Workflows** force job seekers to juggle disparate tools for resume crafting, job tracking, cover letters, and interview practice without cohesive data continuity.

JobAchiever AI resolves these pain points by offering an integrated, privacy-focused platform governed by strict anti-hallucination guardrails and user-in-the-loop verification.

---

## Core Capabilities (Roadmap)

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Comprehensive Profile Builder** | Master career repository aggregating verified skills, work history, education, and milestones. | *Planned* |
| **Intelligent Resume Ingestion** | Multi-format (PDF, DOCX) parser extracting structured career information. | *Planned* |
| **Resume Weakness & Gap Diagnosis** | Actionable diagnostic reports detailing ATS compatibility, phrasing flaws, and impact metrics. | *Planned* |
| **Multi-Career Track Management** | Manage distinct career tracks (e.g., Frontend vs. Full-Stack vs. Tech Lead) under one account. | *Planned* |
| **Tailored Resume Generator** | Generate targeted, role-specific resumes grounded strictly in verified profile achievements. | *Planned* |
| **Job Description Deconstruction** | Granular parsing of job listings to identify core competencies, required experience, and culture markers. | *Planned* |
| **Explainable Compatibility Engine** | Transparent, metric-driven match scores detailing alignment, transferable skills, and explicit gaps. | *Planned* |
| **Job Discovery & Pipeline Tracking** | Kanban-style application management from bookmark to offer negotiation. | *Planned* |
| **Tailored Cover Letter Builder** | Context-driven cover letters highlighting relevant milestones for targeted job listings. | *Planned* |
| **Professional Web Portfolios** | Generate and publish clean, modern personal career websites showcasing projects and credentials. | *Planned* |
| **Interactive Interview Suite** | AI mock interviews incorporating STAR methodology questions and technical role deep dives. | *Planned* |
| **AI Career Strategy Advisor** | Strategic career roadmap guidance with personalized skill acquisition recommendations. | *Planned* |

---

## Core Product Principles

1. **Zero Fabrication Policy:** The platform will **never** fabricate qualifications, technical proficiencies, or work achievements. All generated materials are strictly grounded in user-verified profile data.
2. **Human-in-the-Loop Verification:** AI-extracted data is treated as unverified until explicitly confirmed by the user.
3. **Explicit User Approval:** Consequential actions (application submission, public profile changes, document overwriting) require manual user confirmation.
4. **Data Isolation & Privacy:** Strict multi-user data segregation. No user can view or query another user's documents or career data.
5. **Commercial-Grade Polish:** Modern, accessible, high-performance UI crafted with shadcn/ui, Tailwind CSS, and Framer Motion.
6. **Real Functionality:** Every architectural component performs genuine computation and storage; no simulated demos.

---

## Technology Stack

### Frontend Client
- **Framework:** React 18+ (JavaScript / ESNext)
- **Build Tool:** Vite
- **Styling & Components:** Tailwind CSS, shadcn/ui (Radix UI primitives)
- **Animation & Icons:** Framer Motion, Lucide Icons
- **State & Networking:** React Context / Custom Hooks, Axios

### Main Backend (System of Record)
- **Language & Framework:** Java 21 LTS, Spring Boot 3.x
- **Security:** Spring Security 6.x, Stateless JWT Authentication, RBAC
- **Persistence:** Spring Data JPA, Hibernate
- **Migrations:** Flyway Database Migrations

### AI Microservice (Processing Engine)
- **Language & Framework:** Python 3.11+, FastAPI, Uvicorn
- **Data Validation:** Pydantic v2
- **Document Extraction:** PyPDF, pdfplumber, python-docx
- **HTTP Client:** HTTPX

### Database & Storage
- **Relational Database:** PostgreSQL 16+
- **Vector Search:** `pgvector` extension for semantic profile and job matching
- **File Storage:** Local filesystem storage abstraction (extensible to S3)

### AI Providers (User-Selected)
- **Groq:** Ultra-low-latency Llama 3 models for real-time analysis and drafting.
- **Google Gemini:** Multimodal intelligence (Gemini 1.5/2.0 Flash and Pro).
- **Ollama:** Local, privacy-first inference with open-weights models.
*(Note: Users manually select their preferred provider. Automatic provider fallback is deliberately disabled.)*

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Client                       │
│            React + Vite + Tailwind + shadcn/ui              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Main Backend (Spring Boot 3.x)              │
│                 * Authoritative Source of Truth *           │
│  - Authentication & JWT Validation                          │
│  - Multi-User Isolation & Role-Based Access Control         │
│  - Career Profiles, Applications & Document Metadata        │
│  - Transactional Persistence via Spring Data JPA            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Internal Service Calls       │ JDBC / SQL
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   AI Service (FastAPI)       │ │  PostgreSQL 16 + pgvector  │
│  - Document Extraction       │ │  - User & Profile Data     │
│  - Compatibility Engine      │ │  - Career Tracks & Resumes │
│  - Cover Letter & Resume Gen │ │  - Vector Embeddings       │
│  - AI Career Strategist      │ └────────────────────────────┘
└──────────────┬───────────────┘
               │
               ▼ User-Selected Provider
┌─────────────────────────────────────────────────────────────┐
│             External AI Engines (Manual Selection)           │
│             [ Groq Cloud ]  [ Google Gemini ]  [ Ollama ]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
jobachiever-ai/
│
├── frontend/               # React client application (Vite, Tailwind CSS, shadcn/ui)
│
├── backend/                # Primary Spring Boot backend (REST API, Auth, Data Persistence)
│
├── ai-service/             # FastAPI microservice (Resume parsing, AI matching, Generation)
│
├── infrastructure/         # Docker Compose, environment configuration, deployment scripts
│
├── docs/                   # Architecture decision records, API specifications, and guides
│
├── .gitignore              # Monorepo git ignore rules
│
├── AGENTS.md               # Developer & AI Agent operating guide
│
└── README.md               # Project documentation and roadmap
```

---

## Development Status

| Milestone | Scope | Status |
| :--- | :--- | :---: |
| **Milestone 1** | Git Initialization & Remote Setup | **Completed** |
| **Milestone 2** | Monorepo Structure & Directory Setup | **Completed** |
| **Milestone 3** | Developer & Agent Operating Guide (`AGENTS.md`) | **Completed** |
| **Milestone 4** | Professional Documentation (`README.md`) | **Completed** |
| **Milestone 5** | Comprehensive `.gitignore` | **Completed** |
| **Milestone 6** | Frontend Prototype & Architecture (Prompts 1–10) | **Completed** |
| **Milestone 7** | Comprehensive Frontend Audit & Testing Resolution | **Completed** |
| **Milestone 8** | Java Spring Boot Backend Foundation (Prompt 12) | **Completed** |
| **Milestone 9+** | Authentication, Profile Persistence, Database & AI Integration | *Upcoming* |

> *Current State:* Frontend client application and Spring Boot backend foundation initialized with automated test suites, health endpoints, and zero-fabrication guardrails. Live PostgreSQL and external AI API keys will be configured in subsequent milestones.

---

## Local Development Prerequisites

When development begins, the following dependencies will be required on your host machine:

- **Git:** Version 2.40 or higher
- **Node.js & npm:** Node.js 20+ LTS and npm 10+
- **Java Development Kit (JDK):** OpenJDK or Eclipse Temurin 21 LTS
- **Python:** Python 3.11 or higher with `pip`
- **Docker & Docker Compose:** For running containerized services
- **PostgreSQL Client (Optional):** psql 16+ *(Database will be configured in a dedicated milestone)*

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
