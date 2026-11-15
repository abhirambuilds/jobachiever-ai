/**
 * AI Provider Preferences and Discovery Service Interface for JobAchiever AI.
 *
 * Interfaces with Spring Boot 3.x backend endpoints:
 * - GET  /api/v1/users/me/ai-preferences (Retrieve current user's AI settings & consent)
 * - PUT  /api/v1/users/me/ai-preferences (Update AI settings & explicit consent)
 * - GET  /api/v1/ai/providers           (Discover registered providers and capabilities)
 */

export const AI_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1')) ||
  'http://localhost:8080/api/v1';

export const DEFAULT_AI_PREFERENCES = {
  selectedProvider: 'GROQ',
  preferredModel: 'llama-3.3-70b-versatile',
  temperature: 0.2,
  maxTokens: 2048,
  externalProcessingConsent: false,
  consentUpdatedAt: null,
  updatedAt: new Date().toISOString(),
};

export const FALLBACK_AI_PROVIDERS = [
  {
    providerId: 'GROQ',
    displayName: 'Groq',
    isPrimary: true,
    isConfigured: true,
    isAvailable: true,
    defaultModel: 'llama-3.3-70b-versatile',
    supportedModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    description:
      'Ultra-fast inference powered by Groq LPU architecture. Ideal for real-time analysis, structured extraction, and rapid ATS scoring.',
    rateLimitNotice: 'Subject to Groq Cloud free-tier rate limits (~30 RPM / 14,400 RPD).',
    privacyNotice:
      'Data sent to Groq Cloud is processed in memory. No user resume data is used for model training.',
  },
  {
    providerId: 'GEMINI',
    displayName: 'Google Gemini',
    isPrimary: false,
    isConfigured: true,
    isAvailable: true,
    defaultModel: 'gemini-2.0-flash',
    supportedModels: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    description:
      'Google DeepMind frontier multimodal models with large context windows. Optimal for complex contextual synthesis and deep career narratives.',
    rateLimitNotice: 'Subject to Google Gemini API free-tier quotas (15 RPM / 1M TPM).',
    privacyNotice:
      'Data processed under Google Cloud & Gemini enterprise privacy commitments. Transmitted only with explicit user consent.',
  },
];

export const aiPreferenceService = {
  /**
   * Retrieves the current authenticated user's AI preferences and consent status.
   * Target endpoint: GET /api/v1/users/me/ai-preferences
   */
  async getAiPreferences() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_jwt_token') : null;
    const url = `${AI_API_BASE}/users/me/ai-preferences`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required to retrieve AI preferences.');
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to fetch AI preferences (status ${response.status})`);
      }

      const body = await response.json();
      return body.data || body;
    } catch (err) {
      // In offline / mock development environments, return fallback defaults
      if (typeof window !== 'undefined' && window.__JA_MOCK_PREFERENCES__) {
        return window.__JA_MOCK_PREFERENCES__;
      }
      if (err.message && err.message.includes('Authentication')) {
        throw err;
      }
      return DEFAULT_AI_PREFERENCES;
    }
  },

  /**
   * Updates the current authenticated user's AI preferences and consent setting.
   * Target endpoint: PUT /api/v1/users/me/ai-preferences
   */
  async updateAiPreferences(preferences) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_jwt_token') : null;
    const url = `${AI_API_BASE}/users/me/ai-preferences`;

    const payload = {
      selectedProvider: (preferences.selectedProvider || 'GROQ').toUpperCase(),
      preferredModel: preferences.preferredModel || null,
      temperature: Number(preferences.temperature ?? 0.2),
      maxTokens: Number(preferences.maxTokens ?? 2048),
      externalProcessingConsent: Boolean(preferences.externalProcessingConsent),
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to update AI preferences (status ${response.status})`);
      }

      const body = await response.json();
      return body.data || body;
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.__JA_MOCK_PREFERENCES__ = {
          ...payload,
          consentUpdatedAt: payload.externalProcessingConsent ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        };
        // If simulated in demo/test mode, return simulated state
        if (!err.message || !err.message.includes('Failed to update')) {
          return window.__JA_MOCK_PREFERENCES__;
        }
      }
      throw err;
    }
  },

  /**
   * Fetches the registered AI provider catalog with capability metadata and operational status.
   * Target endpoint: GET /api/v1/ai/providers
   */
  async getAiProviders() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_jwt_token') : null;
    const url = `${AI_API_BASE}/ai/providers`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        return FALLBACK_AI_PROVIDERS;
      }

      const body = await response.json();
      const list = body.data || body;
      return Array.isArray(list) && list.length > 0 ? list : FALLBACK_AI_PROVIDERS;
    } catch {
      return FALLBACK_AI_PROVIDERS;
    }
  },
};
