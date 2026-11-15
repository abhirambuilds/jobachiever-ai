import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiPreferenceProvider, useAiPreferences } from '../AiPreferenceContext';
import { aiPreferenceService } from '@/services/aiPreferenceService';

function TestConsumer() {
  const {
    preferences,
    selectedProvider,
    hasConsent,
    updatePreferences,
    resetToDefaults,
  } = useAiPreferences();

  return (
    <div>
      <span data-testid="provider">{selectedProvider}</span>
      <span data-testid="consent">{hasConsent ? 'true' : 'false'}</span>
      <span data-testid="temp">{preferences?.temperature}</span>
      <button
        onClick={() =>
          updatePreferences({
            selectedProvider: 'GEMINI',
            preferredModel: 'gemini-2.0-flash',
            externalProcessingConsent: true,
          })
        }
      >
        Select Gemini With Consent
      </button>
      <button onClick={() => resetToDefaults()}>Reset</button>
    </div>
  );
}

describe('AiPreferenceContext & Provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(aiPreferenceService, 'getAiPreferences').mockResolvedValue({
      selectedProvider: 'GROQ',
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 2048,
      externalProcessingConsent: false,
      consentUpdatedAt: null,
      updatedAt: '2026-11-15T10:00:00Z',
    });

    vi.spyOn(aiPreferenceService, 'getAiProviders').mockResolvedValue([
      { providerId: 'GROQ', displayName: 'Groq', isPrimary: true },
      { providerId: 'GEMINI', displayName: 'Google Gemini', isPrimary: false },
    ]);

    vi.spyOn(aiPreferenceService, 'updateAiPreferences').mockImplementation(async (payload) => {
      return {
        ...payload,
        consentUpdatedAt: payload.externalProcessingConsent ? '2026-11-15T10:05:00Z' : null,
        updatedAt: '2026-11-15T10:05:00Z',
      };
    });
  });

  it('initializes with fetched preferences and provides derived state', async () => {
    render(
      <AiPreferenceProvider>
        <TestConsumer />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GROQ');
    });

    expect(screen.getByTestId('consent').textContent).toBe('false');
    expect(screen.getByTestId('temp').textContent).toBe('0.2');
  });

  it('updates provider and consent state via updatePreferences', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <TestConsumer />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GROQ');
    });

    await user.click(screen.getByText('Select Gemini With Consent'));

    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GEMINI');
      expect(screen.getByTestId('consent').textContent).toBe('true');
    });
  });

  it('resets state to defaults via resetToDefaults', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <TestConsumer />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GROQ');
    });

    await user.click(screen.getByText('Select Gemini With Consent'));
    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GEMINI');
    });

    await user.click(screen.getByText('Reset'));
    await waitFor(() => {
      expect(screen.getByTestId('provider').textContent).toBe('GROQ');
      expect(screen.getByTestId('consent').textContent).toBe('false');
    });
  });
});
