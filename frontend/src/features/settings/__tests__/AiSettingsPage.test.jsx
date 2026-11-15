import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiPreferenceProvider } from '@/context/AiPreferenceContext';
import { AiSettingsPage } from '../AiSettingsPage';
import { aiPreferenceService } from '@/services/aiPreferenceService';

describe('AiSettingsPage Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete window.__JA_MOCK_PREFERENCES__;

    vi.spyOn(aiPreferenceService, 'getAiPreferences').mockResolvedValue({
      selectedProvider: 'GROQ',
      preferredModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxTokens: 2048,
      externalProcessingConsent: false,
      consentUpdatedAt: null,
      updatedAt: '2026-11-15T12:00:00Z',
    });

    vi.spyOn(aiPreferenceService, 'getAiProviders').mockResolvedValue([
      {
        providerId: 'GROQ',
        displayName: 'Groq',
        isPrimary: true,
        isConfigured: true,
        isAvailable: true,
        defaultModel: 'llama-3.3-70b-versatile',
        supportedModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
        description: 'Ultra-fast inference powered by Groq LPU architecture.',
        rateLimitNotice: '~30 RPM',
        privacyNotice: 'Processed in memory.',
      },
      {
        providerId: 'GEMINI',
        displayName: 'Google Gemini',
        isPrimary: false,
        isConfigured: true,
        isAvailable: true,
        defaultModel: 'gemini-2.0-flash',
        supportedModels: ['gemini-2.0-flash', 'gemini-1.5-pro'],
        description: 'Google DeepMind frontier multimodal models.',
        rateLimitNotice: '15 RPM',
        privacyNotice: 'Enterprise privacy.',
      },
    ]);

    vi.spyOn(aiPreferenceService, 'updateAiPreferences').mockImplementation(async (payload) => {
      return {
        ...payload,
        consentUpdatedAt: payload.externalProcessingConsent ? '2026-11-15T12:30:00Z' : null,
        updatedAt: '2026-11-15T12:30:00Z',
      };
    });
  });

  it('renders provider selection cards and marks Groq as Primary / Recommended', async () => {
    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('AI Provider Settings & Preferences')).toBeInTheDocument();
    });

    // Both providers rendered
    expect(screen.getByText('Groq')).toBeInTheDocument();
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();

    // Groq has Primary / Recommended badge
    expect(screen.getByText('Primary / Recommended')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('switches active provider and updates model dropdown when Gemini card is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Groq')).toBeInTheDocument();
    });

    // Click Google Gemini card
    const geminiCard = screen.getByText('Google Gemini').closest('div');
    await user.click(geminiCard);

    // Model select should now contain Gemini models
    const select = screen.getByLabelText(/Default Completion Model/i);
    expect(select.value).toBe('gemini-2.0-flash');
    expect(screen.getByText(/gemini-2.0-flash/)).toBeInTheDocument();
    expect(screen.getByText(/gemini-1.5-pro/)).toBeInTheDocument();
  });

  it('updates temperature slider value and displays guidance description', async () => {
    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Groq')).toBeInTheDocument();
    });

    const tempSlider = screen.getByLabelText(/Temperature/i);
    expect(tempSlider).toBeInTheDocument();

    // Change temperature to 0.7
    fireEvent.change(tempSlider, { target: { value: '0.7' } });

    await waitFor(() => {
      expect(screen.getByText('0.7')).toBeInTheDocument();
      expect(screen.getByText(/Balanced Creativity/i)).toBeInTheDocument();
    });
  });

  it('toggles external AI data processing consent switch and updates dirty indicator', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    const consentSwitch = screen.getByRole('switch');
    expect(consentSwitch.checked).toBe(false);

    // Toggle switch on
    await user.click(consentSwitch);
    expect(consentSwitch.checked).toBe(true);

    // Unsaved Changes badge appears
    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
  });

  it('calls updateAiPreferences with correct payload when Save Changes is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const consentSwitch = screen.getByRole('switch');
    await user.click(consentSwitch);

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(aiPreferenceService.updateAiPreferences).toHaveBeenCalledWith({
        selectedProvider: 'GROQ',
        preferredModel: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        maxTokens: 2048,
        externalProcessingConsent: true,
      });
      expect(screen.getByText(/AI provider preferences saved successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error feedback message when saving fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(aiPreferenceService, 'updateAiPreferences').mockRejectedValueOnce(
      new Error('Network error: unable to save AI settings.')
    );

    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const consentSwitch = screen.getByRole('switch');
    await user.click(consentSwitch);

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Network error: unable to save AI settings/i)).toBeInTheDocument();
    });
  });

  it('resets form to defaults when Reset to Defaults is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AiPreferenceProvider>
        <AiSettingsPage />
      </AiPreferenceProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset to Defaults/i });
    await user.click(resetBtn);

    await waitFor(() => {
      expect(aiPreferenceService.updateAiPreferences).toHaveBeenCalledWith({
        selectedProvider: 'GROQ',
        preferredModel: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        maxTokens: 2048,
        externalProcessingConsent: false,
      });
      expect(screen.getByText(/Preferences reset to platform defaults/i)).toBeInTheDocument();
    });
  });
});
