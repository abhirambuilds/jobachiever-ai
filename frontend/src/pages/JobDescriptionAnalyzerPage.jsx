import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  Sparkles,
  Settings,
  AlertTriangle,
  History,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { aiPreferenceService, DEFAULT_AI_PREFERENCES } from '@/services/aiPreferenceService';
import { jobAnalysisService } from '@/services/jobAnalysisService';
import { JobAnalysisResultView } from '@/features/matcher/components/intelligence/JobAnalysisResultView';

const SAMPLE_PRESETS = [
  {
    id: 'stripe-backend',
    label: 'Stripe — Senior Backend Engineer',
    company: 'Stripe',
    title: 'Senior Backend Engineer — Core Platform',
    text: `About Stripe:
Stripe is a financial infrastructure platform for the internet. Millions of companies use Stripe to accept payments, grow revenue, and accelerate new business opportunities.

About the Role:
We are looking for a Senior Backend Engineer to join our Core Platform engineering team. You will architect, build, and operate distributed systems that process billions of dollars in daily transactions with four-nines (99.99%) availability.

Requirements (Must-Have):
• 5+ years of software engineering experience building scalable backend platforms in Java, Go, or Python.
• Deep experience with modern distributed frameworks, especially Java 21, Spring Boot 3, and asynchronous messaging (Apache Kafka / RabbitMQ).
• Strong relational database fundamentals with PostgreSQL or MySQL, including schema optimization, indexing strategies, and locking.
• Hands-on familiarity with containerization (Docker, Kubernetes) and CI/CD pipelines.
• Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.

Preferred Qualifications (Nice-to-Have):
• Familiarity with semantic vector embeddings, pgvector, or distributed caching (Redis).
• Experience building zero-trust microservice communication with mTLS and OAuth 2.1.
• Prior experience in financial services, payment gateways, or distributed transaction saga patterns.

Responsibilities:
• Architect robust, low-latency APIs handling high-throughput transactional traffic.
• Collaborate with cross-functional product and infrastructure teams to decompose monolithic dependencies.
• Lead code reviews, mentor early-career engineers, and establish reliability best practices.`,
  },
  {
    id: 'databricks-ai',
    label: 'Databricks — AI Systems Engineer',
    company: 'Databricks',
    title: 'Staff AI Systems & Vector Search Engineer',
    text: `About Databricks:
Databricks is the data and AI company. More than 10,000 organizations worldwide rely on the Databricks Lakehouse Platform to unify their data, analytics, and AI.

Role Summary:
We are seeking an experienced AI Systems Engineer to scale our distributed vector database engine and neural retrieval infrastructure.

Key Requirements:
• 6+ years designing and maintaining high-performance low-latency data or AI systems in C++, Python, or Rust.
• In-depth knowledge of ANN (Approximate Nearest Neighbors) vector indexing algorithms (HNSW, IVFPQ).
• Experience with large-scale distributed consensus protocols and cloud-native infrastructure (AWS / GCP / Azure).
• Master's or Ph.D. in Computer Science, Applied Mathematics, or equivalent research background preferred.

Responsibilities:
• Optimize vector indexing performance and recall metrics across petabyte-scale customer indices.
• Partner with research scientists to integrate state-of-the-art embedding models into real-time serving pipelines.`,
  },
  {
    id: 'vercel-fullstack',
    label: 'Vercel — Full-Stack Product Engineer',
    company: 'Vercel',
    title: 'Senior Full-Stack Product Engineer',
    text: `About Vercel:
Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.

The Position:
We are looking for a Senior Full-Stack Product Engineer to join our Developer Experience organization.

What You'll Need:
• 4+ years of professional full-stack web application development experience.
• Mastery of modern React, TypeScript, Next.js App Router, and Tailwind CSS.
• Solid backend capabilities with Node.js, Serverless Edge functions, and PostgreSQL.
• Strong empathy for developer workflows and obsession with web performance metrics (Core Web Vitals).

What You'll Do:
• Build intuitive, responsive dashboards and workflows utilized daily by hundreds of thousands of engineers.
• Collaborate with design and product peers to deliver polished, commercially refined web experiences.`,
  },
];

export function JobDescriptionAnalyzerPage() {
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [preferences, setPreferences] = useState(DEFAULT_AI_PREFERENCES);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load user AI preferences on mount
  useEffect(() => {
    let isMounted = true;
    aiPreferenceService
      .getAiPreferences()
      .then((data) => {
        if (isMounted) {
          setPreferences(data);
          setIsLoadingPreferences(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const charCount = jobText.length;
  const isTooShort = charCount > 0 && charCount < 50;
  const isTooLong = charCount > 50000;
  const canAnalyze = charCount >= 50 && charCount <= 50000 && !isAnalyzing;

  const handleSelectPreset = (preset) => {
    setJobText(preset.text);
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setAnalysisError(null);
  };

  const handleClear = () => {
    setJobText('');
    setJobTitle('');
    setCompanyName('');
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    if (!preferences.externalProcessingConsent) {
      toast.error('External AI processing consent is required to analyze job descriptions.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setProgressStep('Preparing job text for extraction...');

    try {
      const result = await jobAnalysisService.analyzeJobDescription(
        jobText,
        {
          jobTitle: jobTitle.trim() || undefined,
          companyName: companyName.trim() || undefined,
          provider: preferences.selectedProvider,
          model: preferences.preferredModel,
          temperature: preferences.temperature,
          maxTokens: preferences.maxTokens,
        },
        (_percent, msg) => setProgressStep(msg)
      );

      setAnalysisResult(result);
      toast.success('Job description analyzed successfully!');
    } catch (err) {
      setAnalysisError(err.message || 'Job description analysis failed.');
      toast.error(err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
      setProgressStep('');
    }
  };

  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      const items = await jobAnalysisService.getAnalyses();
      setHistoryList(items);
    } catch {
      toast.error('Failed to load analysis history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadHistoryItem = async (item) => {
    setIsHistoryOpen(false);
    setIsAnalyzing(true);
    setProgressStep('Loading saved analysis report...');
    try {
      const fullReport = await jobAnalysisService.getAnalysisDetails(item.id);
      setAnalysisResult(fullReport);
      setJobTitle(fullReport.jobOverview?.jobTitle || '');
      setCompanyName(fullReport.jobOverview?.companyName || '');
      toast.success('Loaded saved job analysis report.');
    } catch (err) {
      toast.error(err.message || 'Failed to load analysis details.');
    } finally {
      setIsAnalyzing(false);
      setProgressStep('');
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    try {
      await jobAnalysisService.deleteAnalysis(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (analysisResult?.id === id) {
        setAnalysisResult(null);
      }
      toast.success('Job analysis record deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              AI Job Intelligence
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Stateless Anti-Fabrication Parsing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Job Description Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Deconstruct complex job postings into atomic requirements, categorized technical skills,
            qualifications, and potential ambiguities with absolute fidelity.
          </p>
        </div>

        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Provider:</span>
            <strong className="text-foreground">{preferences.selectedProvider}</strong>
            <Link
              to="/settings/ai"
              className="text-muted-foreground hover:text-foreground ml-1 p-0.5 rounded hover:bg-muted"
              title="Configure AI Provider Settings"
            >
              <Settings className="h-3 w-3" />
            </Link>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenHistory}
            className="text-xs gap-1.5"
          >
            <History className="h-3.5 w-3.5 text-amber-400" />
            <span>Analysis History</span>
          </Button>
        </div>
      </div>

      {/* AI Consent Warning Banner */}
      {!isLoadingPreferences && !preferences.externalProcessingConsent && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-200">AI Data Processing Consent Required</strong>
              <p className="text-amber-300/80">
                To decompose job postings using Groq or Gemini, you must grant external AI processing consent.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs shrink-0">
            <Link to="/settings/ai">Open AI Settings</Link>
          </Button>
        </div>
      )}

      {/* Job Description Input Workspace */}
      <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Paste Job Description
              </h2>
            </div>

            {/* Quick Samples */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-1">Sample Presets:</span>
              {SAMPLE_PRESETS.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectPreset(p)}
                  className="text-[11px] h-7 px-2.5"
                >
                  {p.company}
                </Button>
              ))}
            </div>
          </div>

          {/* Textarea Input with Counter */}
          <div className="space-y-2">
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job listing text here (responsibilities, requirements, qualifications, company info)..."
              rows={10}
              className="font-sans text-xs sm:text-sm leading-relaxed resize-y border-border/80 focus:border-primary/80"
              disabled={isAnalyzing}
            />

            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <span>
                  Characters: <strong>{charCount.toLocaleString()}</strong> / 50,000
                </span>
                {isTooShort && (
                  <span className="text-amber-400 font-medium">
                    (Minimum 50 characters required — {50 - charCount} more needed)
                  </span>
                )}
                {isTooLong && (
                  <span className="text-destructive font-medium">
                    (Exceeds 50,000 character maximum limit)
                  </span>
                )}
              </div>

              {jobText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  disabled={isAnalyzing}
                >
                  Clear input
                </button>
              )}
            </div>
          </div>

          {/* Optional Hints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Role Title (Optional hint)
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="text-xs h-8"
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Company Name (Optional hint)
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="text-xs h-8"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          {/* Analysis Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/50 pt-4">
            <div className="text-xs text-muted-foreground">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{progressStep || 'Processing job description with AI microservice...'}</span>
                </div>
              ) : (
                <span>
                  AI extracts only explicitly stated qualifications without extrapolation or fabrication.
                </span>
              )}
            </div>

            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="gap-2 text-xs font-semibold px-6"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Job Description</span>
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {analysisError && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Structured Role Analysis</h3>
            <span className="text-xs text-muted-foreground">
              ID: <code className="font-mono">{analysisResult.id?.slice(0, 8)}</code>
            </span>
          </div>

          <JobAnalysisResultView
            analysis={analysisResult}
            rawText={jobText}
          />
        </div>
      )}

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-amber-400" />
              <span>Recent Job Analyses</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chronological log of job postings analyzed with Groq or Google Gemini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {isLoadingHistory ? (
              <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading past analyses...</span>
              </div>
            ) : historyList.length > 0 ? (
              historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadHistoryItem(item)}
                  className="p-3 rounded-lg border border-border/60 hover:border-primary/50 bg-card hover:bg-muted/40 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-foreground truncate">{item.jobTitle || 'Untitled Role'}</strong>
                      <Badge variant="outline" className="text-[10px] shrink-0">{item.seniority || 'ROLE'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <span>{item.companyName || 'Unspecified'}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-mono text-primary">{item.provider}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No past job analyses recorded yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default JobDescriptionAnalyzerPage;
