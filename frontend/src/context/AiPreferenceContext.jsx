import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  aiPreferenceService,
  DEFAULT_AI_PREFERENCES,
  FALLBACK_AI_PROVIDERS,
} from '@/services/aiPreferenceService';

const AiPreferenceContext = createContext(null);

export function AiPreferenceProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_AI_PREFERENCES);
  const [providers, setProviders] = useState(FALLBACK_AI_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshProviders = useCallback(async () => {
    try {
      const providerList = await aiPreferenceService.getAiProviders();
      if (Array.isArray(providerList) && providerList.length > 0) {
        setProviders(providerList);
      }
    } catch {
      // Retain fallback providers on fetch error
    }
  }, []);

  const refreshPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prefs] = await Promise.all([
        aiPreferenceService.getAiPreferences(),
        refreshProviders(),
      ]);
      setPreferences(prefs || DEFAULT_AI_PREFERENCES);
    } catch (err) {
      setError(err.message || 'Failed to load AI preferences');
      setPreferences(DEFAULT_AI_PREFERENCES);
    } finally {
      setLoading(false);
    }
  }, [refreshProviders]);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  const updatePreferences = useCallback(async (updatedValues) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        selectedProvider: (updatedValues.selectedProvider || preferences?.selectedProvider || 'GROQ').toUpperCase(),
        preferredModel: updatedValues.preferredModel !== undefined ? updatedValues.preferredModel : preferences?.preferredModel,
        temperature: updatedValues.temperature !== undefined ? Number(updatedValues.temperature) : Number(preferences?.temperature ?? 0.2),
        maxTokens: updatedValues.maxTokens !== undefined ? Number(updatedValues.maxTokens) : Number(preferences?.maxTokens ?? 2048),
        externalProcessingConsent: updatedValues.externalProcessingConsent !== undefined
          ? Boolean(updatedValues.externalProcessingConsent)
          : Boolean(preferences?.externalProcessingConsent),
      };
      const saved = await aiPreferenceService.updateAiPreferences(payload);
      setPreferences(saved);
      return { success: true, data: saved };
    } catch (err) {
      const message = err.message || 'Failed to update AI preferences';
      setError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  const resetToDefaults = useCallback(async () => {
    return updatePreferences({
      selectedProvider: 'GROQ',
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 2048,
      externalProcessingConsent: false,
    });
  }, [updatePreferences]);

  const selectedProviderId = useMemo(
    () => (preferences?.selectedProvider || 'GROQ').toUpperCase(),
    [preferences?.selectedProvider]
  );

  const activeProviderMetadata = useMemo(() => {
    return (
      providers.find(
        (p) => (p.providerId || p.id || '').toUpperCase() === selectedProviderId
      ) || providers[0]
    );
  }, [providers, selectedProviderId]);

  const hasConsent = useMemo(() => {
    return Boolean(preferences?.externalProcessingConsent);
  }, [preferences?.externalProcessingConsent]);

  const value = useMemo(
    () => ({
      preferences,
      providers,
      selectedProvider: selectedProviderId,
      activeProviderMetadata,
      hasConsent,
      consentUpdatedAt: preferences?.consentUpdatedAt || null,
      loading,
      saving,
      error,
      refreshPreferences,
      updatePreferences,
      resetToDefaults,
    }),
    [
      preferences,
      providers,
      selectedProviderId,
      activeProviderMetadata,
      hasConsent,
      loading,
      saving,
      error,
      refreshPreferences,
      updatePreferences,
      resetToDefaults,
    ]
  );

  return (
    <AiPreferenceContext.Provider value={value}>
      {children}
    </AiPreferenceContext.Provider>
  );
}

AiPreferenceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAiPreferences() {
  const context = useContext(AiPreferenceContext);
  if (!context) {
    throw new Error('useAiPreferences must be used within an AiPreferenceProvider');
  }
  return context;
}
