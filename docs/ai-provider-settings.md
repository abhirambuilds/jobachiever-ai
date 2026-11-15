# AI Provider Settings, User Preferences & Privacy Consent

**Milestone:** Prompt 24 — Build AI Provider Settings and User Preferences  
**Repository:** [jobachiever-ai](https://github.com/abhirambuilds/jobachiever-ai)  
**Status:** Implemented & Fully Verified  

---

## 1. Overview & Architectural Principles

JobAchiever AI provides a unified, user-controlled AI inference subsystem that empowers job seekers to configure their active LLM inference engine, tune generation hyperparameters, and manage explicit external data processing consent.

### Non-Negotiable Core Policies:
1. **Manual Provider Selection Strictly Enforced:** Users explicitly choose between **Groq** (Primary / Recommended) and **Google Gemini** (Secondary).
2. **Zero Silent Fallback:** The platform **never** automatically switches providers or silently routes requests to an alternate provider if the selected provider experiences rate limiting, quota exhaustion, or unconfigured credentials.
3. **Primary vs. Secondary Tiers:**
   - **Groq (Primary / Recommended):** Ultra-low-latency LPU inference with `llama-3.3-70b-versatile` as the platform workhorse for real-time extraction, ATS scoring, and high-throughput generation.
   - **Google Gemini (Secondary):** DeepMind frontier multimodal models (`gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`) with up to 1M token context windows for complex contextual career narratives.
   - **Ollama:** Excluded from initial public release.
4. **Mandatory Privacy & Consent Guardrails:** Career data (resume text, skills, target roles, job descriptions) is **never** dispatched to external AI providers without explicit, verified user consent. If consent is revoked or not granted, generation endpoints reject requests with a clear prompt linking to AI Settings.
5. **Absolute Secret Protection:** API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`) remain strictly server-side in backend/FastAPI environment variables. Keys are never transmitted to or accessible by the React frontend.
6. **Stateless AI Computation / Authoritative Persistence:** FastAPI computes extractions and completions statelessly; Spring Boot owns user identities, authorization checks, and preference persistence.

---

## 2. Database Schema (`user_ai_preferences`)

Flyway migration `V15__create_user_ai_preferences_table.sql` provisions the persistent preferences table:

```sql
CREATE TABLE user_ai_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    selected_provider VARCHAR(32) NOT NULL DEFAULT 'GROQ',
    preferred_model VARCHAR(128),
    temperature DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    max_tokens INTEGER NOT NULL DEFAULT 2048,
    external_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_ai_preferences_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_ai_preferences_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_selected_provider CHECK (
        selected_provider IN ('GROQ', 'GEMINI')
    ),
    CONSTRAINT chk_ai_temperature CHECK (
        temperature >= 0.0 AND temperature <= 2.0
    ),
    CONSTRAINT chk_ai_max_tokens CHECK (
        max_tokens >= 128 AND max_tokens <= 8192
    )
);

CREATE INDEX idx_user_ai_preferences_user_id ON user_ai_preferences (user_id);
```

---

## 3. Spring Boot Backend Endpoints & Service Layer

All endpoints reside under `/api/v1/` and enforce stateless Bearer JWT authentication:

### 1. `GET /api/v1/users/me/ai-preferences`
Retrieves the authenticated user's current AI settings. If the user has not explicitly configured preferences, deterministic platform defaults are returned.

**Response Schema (`200 OK`):**
```json
{
  "success": true,
  "message": "AI preferences retrieved successfully",
  "data": {
    "selectedProvider": "GROQ",
    "preferredModel": "llama-3.3-70b-versatile",
    "temperature": 0.2,
    "maxTokens": 2048,
    "externalProcessingConsent": false,
    "consentUpdatedAt": null,
    "updatedAt": "2026-11-15T12:00:00Z"
  }
}
```

### 2. `PUT /api/v1/users/me/ai-preferences`
Updates the authenticated user's preferences. Identity is resolved exclusively via `CurrentUserService` / Security Context.

**Validation Rules:**
- `selectedProvider`: Required, pattern `^(GROQ|GEMINI)$` (case-insensitive).
- `preferredModel`: Optional string; if provided, must belong to the selected provider's supported model list.
- `temperature`: Required double, range `0.0` to `2.0`.
- `maxTokens`: Required integer, range `128` to `8192`.
- `externalProcessingConsent`: Required boolean.
- **Audit Tracking:** When `externalProcessingConsent` state changes, `consentUpdatedAt` is stamped with `Instant.now()`.

### 3. `GET /api/v1/ai/providers`
Discovers registered AI providers and dynamic capabilities, proxying to the internal FastAPI microservice with catalog fallback if offline.

**Response Schema (`200 OK`):**
```json
{
  "success": true,
  "message": "AI providers retrieved successfully",
  "data": [
    {
      "providerId": "GROQ",
      "displayName": "Groq",
      "isPrimary": true,
      "isConfigured": true,
      "isAvailable": true,
      "defaultModel": "llama-3.3-70b-versatile",
      "supportedModels": [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
      ],
      "description": "Ultra-fast inference powered by Groq LPU architecture...",
      "rateLimitNotice": "Subject to Groq Cloud free-tier rate limits (~30 RPM / 14,400 RPD).",
      "privacyNotice": "Data sent to Groq Cloud is processed in memory. No user resume data is used for model training."
    },
    {
      "providerId": "GEMINI",
      "displayName": "Google Gemini",
      "isPrimary": false,
      "isConfigured": true,
      "isAvailable": true,
      "defaultModel": "gemini-2.0-flash",
      "supportedModels": [
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
      ],
      "description": "Google DeepMind frontier multimodal models with large context windows...",
      "rateLimitNotice": "Subject to Google Gemini API free-tier quotas (15 RPM / 1M TPM).",
      "privacyNotice": "Data processed under Google Cloud & Gemini enterprise privacy commitments."
    }
  ]
}
```

---

## 4. Frontend State & UI Architecture

### 1. `AiPreferenceContext` & `useAiPreferences` Hook
- **Context Location:** `frontend/src/context/AiPreferenceContext.jsx`
- **Hook Location:** `frontend/src/hooks/useAiPreferences.js`
- **State Exposed:**
  - `preferences`: full preferences entity from Spring Boot.
  - `selectedProvider`: current normalized provider ID (`"GROQ"` or `"GEMINI"`).
  - `hasConsent`: boolean flag verifying external processing consent.
  - `activeProviderMetadata`: active provider capabilities, descriptions, and limits.
  - `updatePreferences(newValues)`: async save action.
  - `resetToDefaults()`: resets to platform defaults.

### 2. Dedicated Settings Page (`/settings/ai` & `/settings`)
Located in `frontend/src/features/settings/AiSettingsPage.jsx`:
- **Section A: AI Provider Selection:**
  - Interactive radio-cards for Groq and Google Gemini.
  - Badges: `Primary / Recommended` (Groq) vs `Secondary` (Gemini).
  - Status Pills: `Available` vs `Not Configured`.
  - Unavailable banner informing user of missing server keys without silent switching.
- **Section B: Generation Preferences:**
  - Dynamic model select populated with the active provider's supported models.
  - Temperature slider (`0.0` to `2.0`, step `0.1`) with qualitative guidance (Low/Deterministic vs Balanced vs High Creativity).
  - Max tokens slider and numeric input (`128` to `8192`, default `2048`).
- **Section C: Data Privacy & Consent Card:**
  - High-visibility toggle switch for "Allow External AI Processing".
  - Explicit disclosure of transmitted vs excluded data (passwords never leave database).
  - External links to Groq and Google Gemini Privacy Policies.
  - Audit timestamp showing when consent was granted.
- **Section D: Action Bar:**
  - "Save Changes" with dirty-state detection and loading spinner.
  - "Reset to Defaults" button.
  - Toast and inline feedback alerts.

### 3. Application-Wide Integration:
- **`DashboardLayout.jsx` Top Bar:** Active AI Inference Engine dropdown synchronized with `AiPreferenceContext`, allowing instant provider switching and quick link to `/settings/ai`.
- **Navigation Sidebar:** Active `/settings/ai` link with Settings icon.

---

## 5. Verification & Test Suite Summary

| Layer | Test Suite | Pass Count | Status |
| :--- | :--- | :--- | :--- |
| **Backend** | `UserAiPreferenceServiceTest` (Unit) | 12 / 12 | PASS |
| **Backend** | `UserAiPreferenceControllerIntegrationTests` (Integration) | 9 / 9 | PASS |
| **Backend** | `FlywayMigrationVerificationTests` (Schema) | 6 / 6 | PASS |
| **Backend** | Full Suite (`mvn test`) | 214 / 215 (1 skipped Testcontainers) | PASS |
| **Frontend** | `AiSettingsPage.test.jsx` | 7 / 7 | PASS |
| **Frontend** | `AiPreferenceContext.test.jsx` | 3 / 3 | PASS |
| **Frontend** | Full Suite (`npm run test -- --run`) | 92 / 92 | PASS |
| **AI Service** | Full Suite (`pytest`) | 95 / 95 | PASS |
| **Frontend** | Linter (`npm run lint`) | 0 errors, 0 warnings | PASS |
| **Frontend** | Production Build (`npm run build`) | Built in 4.70s | PASS |
