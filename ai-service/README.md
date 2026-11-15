# JobAchiever AI — AI Microservice

Stateless, high-performance document parsing and AI computation microservice built with **FastAPI** (Python 3.11+).

---

## 1. Overview

The AI Microservice acts as a dedicated computational engine within the JobAchiever AI ecosystem. It is strictly stateless and internal:
- **Stateless Operation:** No documents, user records, or parsed contents are permanently stored here. Documents and prompts are processed in-memory and returned immediately to the Spring Boot backend.
- **Spring Boot as Single Source of Truth:** Spring Boot manages identity, document ownership, authorization, and persistence.
- **Service-to-Service Security:** Protected via pre-shared internal secret header (`X-Internal-Service-Key`).
- **Provider-Independent AI Architecture:** Modular architecture decoupling high-level career advisory features from concrete LLM providers.
- **Groq as Primary Provider (Milestone 22):** Leverages Groq Cloud LPU inference (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) for fast career advice and structured JSON analysis.
- **Zero Silent Fallback & Strict Selection:** User selects their provider explicitly; the platform never automatically routes or falls back silently.
- **Strict Verification Policy:** All extracted resume fields carry `verificationStatus: "UNVERIFIED"` until reviewed and approved by the user.

---

## 2. Supported Pipelines

### 2.1 Document Extraction & Resume Parsing (Milestone 21)
- **PDF Extraction:** Layout-aware extraction via `pdfplumber`, page-level provenance tracking, empty document safeguards.
- **DOCX Extraction:** Structural extraction via `python-docx` traversing paragraphs, heading styles (Heading 1-6), and tabular data row-by-row (` | ` cell delineation).
- **Rule-Based Parsing & Normalization:** Section classifier detecting 10 resume sections, normalizers for contact details, degree taxonomies, GPA, date ranges, and skills categorization.

### 2.2 LLM Generation & Groq Engine (Milestone 22)
- **Text Generation:** Unstructured creative drafting (executive summaries, cover letters, STAR response phrasing).
- **Structured JSON Generation:** Strict JSON output mode (`response_format={"type": "json_object"}`) with markdown stripping and bounded 1-shot repair.
- **Model Flexibility:** Configurable default model (`llama-3.3-70b-versatile`) with support for `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, and `gemma2-9b-it`.
- **Resource & Concurrency Control:** Concurrency bounded via `asyncio.Semaphore`, retry limits on transient errors, and token limit clamping.
- **Privacy Enforcement:** Full prompts and candidate data are masked in diagnostic logs; explicit user consent is required before invoking external AI endpoints.

---

## 3. Directory Layout

```
ai-service/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── generation.py         # POST /api/v1/generate
│   │   │   ├── health.py             # GET /api/v1/health
│   │   │   ├── providers.py          # GET /api/v1/providers
│   │   │   └── resume_parser.py      # POST /api/v1/parse
│   ├── core/
│   │   ├── ai_config.py              # Groq settings & environment parsing
│   │   ├── config.py                 # Central Pydantic BaseSettings
│   │   ├── logging.py                # Redacted, secure logging filters
│   │   ├── model_config.py           # Model definitions and token limits
│   │   └── security.py               # X-Internal-Service-Key validation
│   ├── providers/
│   │   ├── base.py                   # BaseLLMProvider & domain exceptions
│   │   ├── groq_provider.py          # Groq Cloud concrete implementation
│   │   └── provider_registry.py      # Provider registry & manual selection
│   ├── schemas/
│   │   ├── ai_request.py             # AIGenerationRequest (camelCase aliased)
│   │   ├── ai_response.py            # AIGenerationResponse, TokenUsage, ProviderMetadata
│   │   ├── common.py                 # ConfidenceLevel, VerificationStatus, ProvenanceRecord
│   │   └── resume.py                 # ParsedResumeResponse, PersonalInfo, etc.
│   ├── services/
│   │   ├── ai_service.py             # High-level AI generation coordinator
│   │   ├── extraction/
│   │   │   ├── docx_extractor.py     # python-docx structural parser
│   │   │   └── pdf_extractor.py      # pdfplumber layout-aware parser
│   │   └── parsing/
│   │       ├── field_normalizer.py   # Regex & taxonomy normalization
│   │       ├── resume_parser.py      # Resume parsing orchestrator
│   │       └── section_detector.py   # Section heuristic classifier
│   └── utils/
│       └── file_validation.py        # Magic bytes, MIME, size, Zip-Slip prevention
├── tests/                            # 78 automated pytest unit & integration tests
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

# Create and activate virtual environment
python -m venv .venv

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
Key configuration settings:
```env
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0
INTERNAL_SERVICE_KEY=dev-internal-service-secret-key-change-in-prod
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Groq Cloud Settings
GROQ_API_KEY=gsk_your_groq_api_key_placeholder
GROQ_DEFAULT_MODEL=llama-3.3-70b-versatile
GROQ_TIMEOUT_SECONDS=30.0
GROQ_MAX_RETRIES=2
GROQ_MAX_OUTPUT_TOKENS=4096
GROQ_MAX_CONCURRENCY=10
```

### Running the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 5. API Endpoints

### 5.1 Provider Discovery
- **Endpoint:** `GET /api/v1/providers`
- **Authentication:** None required
- **Response (200 OK):** Returns metadata for registered providers (`GROQ`, and upcoming `GEMINI`).

### 5.2 Text & Structured Generation
- **Endpoint:** `POST /api/v1/generate`
- **Authentication:** `X-Internal-Service-Key: <key>` header
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "provider": "GROQ",
  "model": "llama-3.3-70b-versatile",
  "task": "TEXT_GENERATION",
  "prompt": "Draft an executive summary.",
  "systemPrompt": "You are a senior career advisor.",
  "temperature": 0.2,
  "maxTokens": 1024,
  "userConsent": true
}
```

### 5.3 Resume Parsing
- **Endpoint:** `POST /api/v1/parse`
- **Authentication:** `X-Internal-Service-Key: <key>` header
- **Content-Type:** `multipart/form-data`
- **Form Param:** `file` (Binary PDF or DOCX file, max 10MB)

---

## 6. Testing

Run the automated test suite with pytest:
```bash
# In ai-service/ with active venv:
pytest -v
```
All 78 tests execute using mock fixtures, in-memory buffers, and synthetic test data without requiring live API keys.
