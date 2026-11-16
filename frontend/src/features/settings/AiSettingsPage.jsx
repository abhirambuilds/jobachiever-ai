import { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Cpu,
  Info,
  ExternalLink,
  Sliders,
  Check,
} from 'lucide-react';

import { useAiPreferences } from '@/hooks/useAiPreferences';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { isDemoMode } from '@/demo/demoConfig';

export function AiSettingsPage() {
  const {
    preferences,
    providers,
    loading,
    saving,
    error: contextError,
    updatePreferences,
    resetToDefaults,
  } = useAiPreferences();

  // Local draft form state
  const [selectedProvider, setSelectedProvider] = useState('GROQ');
  const [preferredModel, setPreferredModel] = useState('llama-3.3-70b-versatile');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [externalProcessingConsent, setExternalProcessingConsent] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);

  // Sync draft form state when preferences load
  useEffect(() => {
    if (preferences) {
      setSelectedProvider((preferences.selectedProvider || 'GROQ').toUpperCase());
      setPreferredModel(preferences.preferredModel || '');
      setTemperature(Number(preferences.temperature ?? 0.2));
      setMaxTokens(Number(preferences.maxTokens ?? 2048));
      setExternalProcessingConsent(Boolean(preferences.externalProcessingConsent));
    }
  }, [preferences]);

  // Current active provider metadata
  const currentProviderMeta = useMemo(() => {
    return (
      providers.find(
        (p) => (p.providerId || p.id || '').toUpperCase() === selectedProvider
      ) || providers[0]
    );
  }, [providers, selectedProvider]);

  // Dynamic models for currently selected provider
  const supportedModels = useMemo(() => {
    if (currentProviderMeta?.supportedModels?.length) {
      return currentProviderMeta.supportedModels;
    }
    return selectedProvider === 'GROQ'
      ? ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']
      : ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }, [currentProviderMeta, selectedProvider]);

  // When provider changes, ensure the model is valid for that provider
  const handleProviderSelect = (providerId) => {
    const nextProv = providerId.toUpperCase();
    setSelectedProvider(nextProv);
    const targetMeta = providers.find(
      (p) => (p.providerId || p.id || '').toUpperCase() === nextProv
    );
    const validModels = targetMeta?.supportedModels?.length
      ? targetMeta.supportedModels
      : nextProv === 'GROQ'
      ? ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']
      : ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

    if (!validModels.includes(preferredModel)) {
      setPreferredModel(targetMeta?.defaultModel || validModels[0]);
    }
  };

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!preferences) return false;
    const currentProv = (preferences.selectedProvider || 'GROQ').toUpperCase();
    const currentMod = preferences.preferredModel || '';
    const currentTemp = Number(preferences.temperature ?? 0.2);
    const currentTokens = Number(preferences.maxTokens ?? 2048);
    const currentConsent = Boolean(preferences.externalProcessingConsent);

    return (
      selectedProvider !== currentProv ||
      preferredModel !== currentMod ||
      Math.abs(temperature - currentTemp) > 0.001 ||
      maxTokens !== currentTokens ||
      externalProcessingConsent !== currentConsent
    );
  }, [preferences, selectedProvider, preferredModel, temperature, maxTokens, externalProcessingConsent]);

  // Temperature description helper
  const temperatureDesc = useMemo(() => {
    if (temperature <= 0.3) {
      return 'Focused & Deterministic — Recommended for resume parsing, structural extraction, and ATS match scoring.';
    }
    if (temperature <= 0.7) {
      return 'Balanced Creativity — Recommended for summary crafting and bullet point enhancement.';
    }
    return 'High Creativity — Exploratory phrasing; may occasionally deviate from strict factual brevity.';
  }, [temperature]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setFormFeedback(null);

    // Validation
    if (temperature < 0.0 || temperature > 2.0) {
      setFormFeedback({ type: 'error', message: 'Temperature must be between 0.0 and 2.0.' });
      return;
    }
    if (maxTokens < 128 || maxTokens > 8192) {
      setFormFeedback({ type: 'error', message: 'Max tokens must be between 128 and 8192.' });
      return;
    }

    const payload = {
      selectedProvider,
      preferredModel: preferredModel || null,
      temperature,
      maxTokens,
      externalProcessingConsent,
    };

    const result = await updatePreferences(payload);
    if (result.success) {
      setFormFeedback({ type: 'success', message: 'AI provider preferences saved successfully.' });
      toast.success('AI preferences saved successfully');
    } else {
      setFormFeedback({ type: 'error', message: result.error || 'Failed to save preferences.' });
      toast.error(result.error || 'Failed to save preferences');
    }
  };

  const handleReset = async () => {
    setFormFeedback(null);
    const result = await resetToDefaults();
    if (result.success) {
      setSelectedProvider('GROQ');
      setPreferredModel('llama-3.3-70b-versatile');
      setTemperature(0.2);
      setMaxTokens(2048);
      setExternalProcessingConsent(false);
      setFormFeedback({ type: 'success', message: 'Preferences reset to platform defaults.' });
      toast.info('Preferences reset to platform defaults');
    }
  };

  if (loading && !preferences) {
    return (
      <div className="flex h-64 items-center justify-center space-x-3 text-muted-foreground">
        <Cpu className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading AI provider configuration...</span>
      </div>
    );
  }

  const groqMeta = providers.find((p) => (p.providerId || p.id || '').toUpperCase() === 'GROQ');
  const geminiMeta = providers.find((p) => (p.providerId || p.id || '').toUpperCase() === 'GEMINI');

  const isCurrentProviderAvailable = currentProviderMeta ? currentProviderMeta.isAvailable !== false : true;
  const isCurrentProviderConfigured = currentProviderMeta ? currentProviderMeta.isConfigured !== false : true;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                AI Provider Settings &amp; Preferences
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure your active AI inference engine, adjust generation parameters, and manage external processing consent.
              </p>
            </div>
          </div>
        </div>

        {/* Unsaved changes indicator */}
        {isDirty && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 px-2.5 py-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Unsaved Changes
            </Badge>
          </div>
        )}
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode() && (
        <div
          role="region"
          aria-label="Demo Mode Settings Information"
          className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm"
        >
          <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">Interactive Demo Mode Active</p>
            <p className="text-amber-300/80 leading-relaxed text-xs">
              Live Groq and Gemini API keys are optional during presentation mode. Precomputed, fact-preserving demonstration simulations are enabled for candidate persona Alex Morgan.
            </p>
          </div>
        </div>
      )}

      {/* Inline Feedback Banner */}
      {formFeedback && (
        <div
          role="alert"
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
            formFeedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {formFeedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span>{formFeedback.message}</span>
        </div>
      )}

      {contextError && !formFeedback && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{contextError}</span>
        </div>
      )}

      {/* SECTION A: Provider Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>AI Provider Selection</span>
              <span className="text-xs font-normal text-muted-foreground">(Manual selection strictly enforced)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose the inference engine for resume parsing, keyword matching, and tailoring. The platform never automatically switches providers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Groq Card (Primary / Recommended) */}
          <Card
            onClick={() => handleProviderSelect('GROQ')}
            className={`cursor-pointer transition-all duration-200 border-2 relative overflow-hidden ${
              selectedProvider === 'GROQ'
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-border/70 hover:border-border hover:bg-muted/10'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>Groq</span>
                      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                        Primary / Recommended
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Ultra-Fast LPU Inference
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider ${
                      groqMeta?.isConfigured !== false && groqMeta?.isAvailable !== false
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {groqMeta?.isConfigured !== false && groqMeta?.isAvailable !== false
                      ? 'Available'
                      : 'Not Configured'}
                  </Badge>

                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedProvider === 'GROQ'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40'
                    }`}
                  >
                    {selectedProvider === 'GROQ' && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
              <p>
                Ultra-fast inference powered by Groq LPU architecture. Ideal for real-time analysis, structured extraction, and rapid ATS scoring.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="font-semibold text-foreground block text-[11px]">Primary Model</span>
                  <span>Llama 3.3 70B Versatile</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block text-[11px]">Inference Speed</span>
                  <span className="text-emerald-400 font-mono">~300+ tokens/sec</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground/80 bg-muted/30 p-2 rounded-lg">
                Subject to Groq Cloud free-tier rate limits (~30 RPM / 14,400 RPD).
              </div>
            </CardContent>
          </Card>

          {/* 2. Google Gemini Card (Secondary) */}
          <Card
            onClick={() => handleProviderSelect('GEMINI')}
            className={`cursor-pointer transition-all duration-200 border-2 relative overflow-hidden ${
              selectedProvider === 'GEMINI'
                ? 'border-cyan-500 bg-cyan-500/5 shadow-md shadow-cyan-500/10'
                : 'border-border/70 hover:border-border hover:bg-muted/10'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>Google Gemini</span>
                      <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider">
                        Secondary
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Multimodal Frontier Models
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider ${
                      geminiMeta?.isConfigured !== false && geminiMeta?.isAvailable !== false
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {geminiMeta?.isConfigured !== false && geminiMeta?.isAvailable !== false
                      ? 'Available'
                      : 'Not Configured'}
                  </Badge>

                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedProvider === 'GEMINI'
                        ? 'border-cyan-500 bg-cyan-500 text-white'
                        : 'border-muted-foreground/40'
                    }`}
                  >
                    {selectedProvider === 'GEMINI' && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
              <p>
                Google DeepMind frontier multimodal models with large context windows. Optimal for complex contextual synthesis and deep career narratives.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="font-semibold text-foreground block text-[11px]">Primary Model</span>
                  <span>Gemini 2.0 Flash</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block text-[11px]">Context Window</span>
                  <span className="text-cyan-400 font-mono">Up to 1M Tokens</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground/80 bg-muted/30 p-2 rounded-lg">
                Subject to Google Gemini API free-tier quotas (15 RPM / 1M TPM).
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning if selected provider is not ready */}
        {(!isCurrentProviderAvailable || !isCurrentProviderConfigured) && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Selected provider ({selectedProvider}) is currently unconfigured or unavailable on the server.
              </p>
              <p className="mt-1 text-muted-foreground">
                Ensure the corresponding API key ({selectedProvider === 'GROQ' ? 'GROQ_API_KEY' : 'GEMINI_API_KEY'}) is configured in the backend environment. The platform will never silently fall back to an alternate provider.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* SECTION B: Generation Preferences */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <span>Generation Preferences</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Tune the default completion model, response creativity (temperature), and maximum token output for {selectedProvider}.
          </p>
        </div>

        <Card className="border-border/70">
          <CardContent className="space-y-6 pt-6">
            {/* Model Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="model-select" className="text-sm font-semibold text-foreground">
                  Default Completion Model
                </label>
                <span className="text-xs text-muted-foreground">
                  Populated dynamically from {selectedProvider} capabilities
                </span>
              </div>

              <select
                id="model-select"
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                {supportedModels.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === currentProviderMeta?.defaultModel ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="temp-slider" className="text-sm font-semibold text-foreground">
                    Temperature (Creativity vs. Determinism)
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Range: 0.0 (strictly deterministic) to 2.0 (maximum variability).
                  </p>
                </div>
                <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-md bg-muted border border-border text-foreground">
                  {temperature.toFixed(1)}
                </span>
              </div>

              <input
                id="temp-slider"
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>{temperatureDesc}</span>
              </div>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="tokens-input" className="text-sm font-semibold text-foreground">
                    Max Output Tokens
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Maximum token length allocated per completion (128 – 8,192). Default: 2,048.
                  </p>
                </div>
                <input
                  id="tokens-input"
                  type="number"
                  min="128"
                  max="8192"
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 2048)}
                  className="w-24 h-8 px-2 font-mono text-xs text-right rounded-md border border-border bg-background text-foreground"
                />
              </div>

              <input
                type="range"
                min="128"
                max="8192"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION C: Privacy & Consent */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Data Privacy &amp; External AI Processing Consent</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Strict human-in-the-loop protection. External AI processing requires your explicit authorization.
          </p>
        </div>

        <Card
          className={`border-2 transition-colors ${
            externalProcessingConsent
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-border/70 bg-card'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl border mt-0.5 ${
                    externalProcessingConsent
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {externalProcessingConsent ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">
                    Allow External AI Processing
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Authorize JobAchiever AI to transmit career documents and job prompts to the selected provider ({selectedProvider}).
                  </CardDescription>
                </div>
              </div>

              {/* Consent Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  role="switch"
                  checked={externalProcessingConsent}
                  onChange={(e) => setExternalProcessingConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-xs text-muted-foreground pt-0">
            <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 space-y-2">
              <span className="font-semibold text-foreground text-xs block">
                Explicit Disclosure of Data Transmission
              </span>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>
                  <strong>Transmitted Data:</strong> Uploaded resume text, categorized skills, work history descriptions, and target job specifications are transmitted to the active provider API for structured parsing, compatibility calculation, and tailoring.
                </li>
                <li>
                  <strong>Excluded Data:</strong> User account credentials, email verification tokens, and platform passwords are NEVER sent to external AI providers.
                </li>
                <li>
                  <strong>In-Memory Processing:</strong> Both Groq and Google Gemini enterprise APIs process requests in volatile memory without retaining candidate data for public foundation model training.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div>
                <span className="font-semibold text-foreground">Consent State: </span>
                {externalProcessingConsent ? (
                  <span className="text-emerald-400 font-medium">
                    Granted {preferences?.consentUpdatedAt ? `(${new Date(preferences.consentUpdatedAt).toLocaleString()})` : ''}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Not Granted (AI generation and parsing requests are blocked)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Groq Privacy</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-border">|</span>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Gemini Privacy</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION D: Save and Actions */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={saving}
          className="w-full sm:w-auto text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Reset to Defaults</span>
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="w-full sm:w-auto text-xs gap-2 min-w-[140px]"
          >
            {saving ? (
              <>
                <Cpu className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default AiSettingsPage;
