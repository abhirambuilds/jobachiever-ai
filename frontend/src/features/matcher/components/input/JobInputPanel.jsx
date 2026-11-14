import { useState, useRef } from 'react';
import {
  UploadCloud,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import {
  SAMPLE_JOB_DESCRIPTIONS,
  validateJdFile,
} from '@/services/jobMatchingService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function JobInputPanel() {
  const {
    jobText,
    setJobText,
    jobDetails,
    setJobDetails,
    uploadedJdFile,
    setUploadedJdFile,
    loadSampleJd,
    runMatching,
    isMatching,
    matchingProgress,
    matchingStepMessage,
    matchingError,
    saveCurrentAnalysis,
  } = useJobMatcher();

  const [inputTab, setInputTab] = useState('paste');
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateJdFile(file);
    if (!validation.valid) {
      alert(validation.errors.join(' '));
      return;
    }

    setUploadedJdFile(file);
    // Read text if plain text, or simulate ingestion
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJobText(event.target.result || '');
      };
      reader.readAsText(file);
    } else {
      setJobText(`[Ingested Document: ${file.name} (${file.size} bytes)]\nIngesting structural requirements...`);
    }
  };

  const wordCount = jobText.trim() ? jobText.trim().split(/\s+/).length : 0;

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm shadow-md">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Header & Quick Samples */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Job Description Ingestion</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Paste or upload a target job listing to decompose requirements and calculate explainable fit.
            </p>
          </div>

          {/* Quick-fill sample pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-1">
              Quick Test:
            </span>
            {SAMPLE_JOB_DESCRIPTIONS.map((sample) => (
              <Button
                key={sample.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadSampleJd(sample.id)}
                className="h-7 text-xs gap-1 bg-background/50 hover:bg-accent"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>{sample.company}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input Method Tabs: Paste vs Upload */}
        <Tabs value={inputTab} onValueChange={setInputTab} className="space-y-3">
          <TabsList className="grid grid-cols-2 h-9 w-64">
            <TabsTrigger value="paste" className="text-xs font-semibold">
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs font-semibold">
              Upload Document
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PASTE TEXT */}
          <TabsContent value="paste" className="space-y-2 pt-1">
            <div className="relative">
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job description here (Responsibilities, Requirements, Tech Stack, Qualifications)..."
                rows={7}
                className="w-full rounded-xl border border-input bg-background/80 p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pt-1">
                <span>{wordCount} words • {jobText.length} characters</span>
                <span className="text-primary font-medium">Decomposition parser ready</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: UPLOAD DOCUMENT */}
          <TabsContent value="upload" className="space-y-3 pt-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center hover:border-primary/50 transition-all flex flex-col items-center justify-center space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                {uploadedJdFile ? uploadedJdFile.name : 'Select Job Description Document (PDF, DOCX, TXT)'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Maximum size: 5 MB. Files are processed in temporary session memory.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Optional Job Metadata Drawer */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowMetadataForm(!showMetadataForm)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {showMetadataForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>
              {showMetadataForm ? 'Hide Role Metadata Fields' : '+ Edit Company, Title & Compensation Metadata'}
            </span>
          </button>

          {showMetadataForm && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-xl border border-border/70 bg-card/60 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Company</label>
                <Input
                  value={jobDetails.company}
                  onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
                  placeholder="e.g. Stripe"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Role Title</label>
                <Input
                  value={jobDetails.title}
                  onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Location</label>
                <Input
                  value={jobDetails.location}
                  onChange={(e) => setJobDetails({ ...jobDetails, location: e.target.value })}
                  placeholder="e.g. San Francisco / Remote"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Work Mode</label>
                <select
                  value={jobDetails.workMode}
                  onChange={(e) => setJobDetails({ ...jobDetails, workMode: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Employment Type</label>
                <select
                  value={jobDetails.employmentType}
                  onChange={(e) => setJobDetails({ ...jobDetails, employmentType: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Experience Req</label>
                <Input
                  value={jobDetails.experienceLevel}
                  onChange={(e) => setJobDetails({ ...jobDetails, experienceLevel: e.target.value })}
                  placeholder="e.g. 5+ years"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Original Job URL</label>
                <Input
                  value={jobDetails.url}
                  onChange={(e) => setJobDetails({ ...jobDetails, url: e.target.value })}
                  placeholder="https://company.com/jobs/..."
                  className="text-xs h-8"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Run Matching */}
        <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveCurrentAnalysis}
              className="text-xs gap-1.5"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-400" />
              <span>Save Job Posting</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ai"
            size="lg"
            onClick={runMatching}
            disabled={isMatching || (!jobText.trim() && !uploadedJdFile)}
            className="text-xs sm:text-sm font-semibold gap-2 shadow-glow-sm px-6"
          >
            {isMatching ? (
              <>
                <Spinner size="xs" />
                <span>Decomposing &amp; Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>Analyze Job &amp; Calculate Match</span>
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar during Matching */}
        {isMatching && (
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Spinner size="xs" />
                <span>{matchingStepMessage}</span>
              </span>
              <span className="font-mono text-primary font-bold">{matchingProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                style={{ width: `${matchingProgress}%` }}
              />
            </div>
          </div>
        )}

        {matchingError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{matchingError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
