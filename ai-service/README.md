# JobAchiever AI — AI Microservice

Stateless, high-performance document parsing and AI computation microservice built with **FastAPI** (Python 3.11+).

---

## 1. Overview

The AI Microservice acts as a dedicated computational engine within the JobAchiever AI ecosystem. It is strictly stateless and internal:
- **Stateless Operation:** No documents, user records, or parsed contents are permanently stored here. Documents are processed in-memory (or via short-lived temporary files) and returned immediately to the Spring Boot backend.
- **Spring Boot as Single Source of Truth:** Spring Boot manages identity, document ownership, authorization, and persistence.
- **Service-to-Service Security:** Protected via pre-shared internal secret header (`X-Internal-Service-Key`).
- **Strict Verification Policy:** All extracted resume fields carry `verificationStatus: "UNVERIFIED"` until reviewed and approved by the user.

---

## 2. Supported Pipelines (Milestone 21)

- **PDF Extraction:** Layout-aware extraction via `pdfplumber`, page-level provenance tracking, multi-column and table handling.
- **DOCX Extraction:** Structural extraction via `python-docx` traversing paragraphs, heading styles (Heading 1-6), and tabular data row-by-row (` | ` cell delineation).
- **Rule-Based Parsing & Normalization:**
  - Section classifier detecting 10 standard resume sections (Contact, Summary, Education, Experience, Skills, Projects, Certifications, Publications, Achievements, Other).
  - Normalizers for email, phone, location, LinkedIn/GitHub links, degree types, majors, institutions, GPA, date ranges (ISO formatted), skills categorization (Languages, Frameworks, Cloud, Databases, Tools), and bullet points.
  - Granular provenance tracking (page number, bounding line, source raw text, confidence score: `HIGH`, `MEDIUM`, `LOW`).

---

## 3. Directory Layout

```
ai-service/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py             # GET /api/v1/health
│   │   │   └── resume_parser.py      # POST /api/v1/parse
│   ├── core/
│   │   ├── config.py                 # Pydantic BaseSettings & env configuration
│   │   ├── logging.py                # Redacted, secure logging filters
│   │   └── security.py               # X-Internal-Service-Key validation
│   ├── schemas/
│   │   ├── common.py                 # ConfidenceLevel, VerificationStatus, ProvenanceRecord
│   │   └── resume.py                 # ParsedResumeResponse, PersonalInfo, Education, etc.
│   ├── services/
│   │   ├── extraction/
│   │   │   ├── pdf_extractor.py      # pdfplumber layout-aware parser
│   │   │   └── docx_extractor.py     # python-docx structural parser
│   │   └── parsing/
│   │   │   ├── section_detector.py   # Resume section heuristics
│   │   │   ├── field_normalizer.py   # Regex & taxonomy normalization
│   │   │   └── resume_parser.py      # Pipeline orchestrator
│   └── utils/
│       └── file_validation.py        # Magic bytes, MIME, size, Zip-Slip prevention
├── tests/                            # 43 automated pytest unit & integration tests
├── .env.example                      # Configuration template
├── requirements.txt                  # Pinned Python dependencies
└── main.py                           # FastAPI application entrypoint
```

---

## 4. Setup & Running Locally

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Virtual environment tool (`venv`)

### Installation
```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```env
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=127.0.0.1
INTERNAL_SERVICE_KEY=dev-internal-service-key-change-in-production
ALLOWED_ORIGINS=["http://localhost:8080","http://127.0.0.1:8080"]
MAX_FILE_SIZE_MB=10
LOG_LEVEL=INFO
ENVIRONMENT=development
```

### Running the Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation is available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 5. API Endpoints

### 5.1 Health Check
- **Endpoint:** `GET /api/v1/health`
- **Authentication:** None required (public health probe)
- **Response (200 OK):**
```json
{
  "status": "UP",
  "service": "jobachiever-ai-service",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-11-15T14:30:00.000000Z"
}
```

### 5.2 Resume Parsing
- **Endpoint:** `POST /api/v1/parse`
- **Authentication:** `X-Internal-Service-Key: <key>` header
- **Content-Type:** `multipart/form-data`
- **Form Param:** `file` (Binary PDF or DOCX file, max 10MB)
- **Response (200 OK):**
```json
{
  "personalInformation": {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-123-4567",
    "location": "San Francisco, CA",
    "linkedIn": "https://linkedin.com/in/janedoe",
    "gitHub": "https://github.com/janedoe",
    "portfolio": null,
    "provenance": { ... }
  },
  "summary": "Experienced Full Stack Engineer...",
  "education": [ ... ],
  "skills": [ ... ],
  "workExperience": [ ... ],
  "projects": [ ... ],
  "certifications": [ ... ],
  "achievements": [ ... ],
  "publications": [ ... ],
  "otherSections": [ ... ],
  "metadata": {
    "fileType": "pdf",
    "fileSizeBytes": 1048576,
    "sha256": "abcdef...",
    "pageCount": 2,
    "lineCount": 85,
    "wordCount": 650,
    "processingTimeMs": 142.5,
    "overallConfidence": "HIGH",
    "verificationStatus": "UNVERIFIED"
  }
}
```

---

## 6. Testing

Run the automated test suite with pytest:
```bash
# In ai-service/ with active venv:
pytest -v
```
All tests use purely synthetic fixtures, mock files, and in-memory byte buffers.
