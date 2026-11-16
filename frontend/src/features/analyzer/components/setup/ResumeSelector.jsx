import { useState } from 'react';
import {
  FileText,
  FileCode,
  Layers,
  RefreshCw,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { useDocuments } from '@/hooks/useDocuments';
import { formatFileSize } from '@/services/documentService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const BENCHMARK_RESUMES = [
  {
    id: 'bench-rohan',
    name: 'Rohan Verma — Frontend Architect',
    originalFilename: '1_Rohan_Verma_Frontend_Architect.pdf',
    careerTrackName: 'Frontend Architecture & Web Performance',
    fileSize: 45000,
    fileExtension: 'pdf',
    isPrimary: true,
  },
  {
    id: 'bench-ananya',
    name: 'Ananya Iyer — Backend Cloud Engineer',
    originalFilename: '2_Ananya_Iyer_Backend_Cloud_Engineer.pdf',
    careerTrackName: 'Distributed Systems & Cloud Infrastructure',
    fileSize: 52000,
    fileExtension: 'pdf',
    isPrimary: false,
  },
  {
    id: 'bench-vikram',
    name: 'Vikram Malhotra — AI & Data Scientist',
    originalFilename: '3_Vikram_Malhotra_AI_DataScientist.pdf',
    careerTrackName: 'AI & Machine Learning Systems',
    fileSize: 48000,
    fileExtension: 'pdf',
    isPrimary: false,
  },
];

export function ResumeSelector() {
  const { selectedResume, setSelectedResume, availableResumes, setCurrentAnalysis } = useAnalyzer();
  const { setIsUploadModalOpen } = useDocuments();
  const [isChanging, setIsChanging] = useState(false);

  const isPdf = selectedResume?.fileExtension === 'pdf';

  const handleSelectBenchmark = (bench) => {
    setSelectedResume(bench);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('jobachiever_active_resume', bench.originalFilename);
    }
    toast.success(`Selected ${bench.name} for AI analysis!`);
  };

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm space-y-3">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Active Resume Details */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                isPdf
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
              }`}
            >
              {isPdf ? <FileText className="h-6 w-6" /> : <FileCode className="h-6 w-6" />}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Target Document for Analysis
                </span>
                {selectedResume?.isPrimary && (
                  <Badge variant="ai" className="text-[9px] px-1 py-0">
                    Primary
                  </Badge>
                )}
                {selectedResume?.version && (
                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                    v{selectedResume.version}.0
                  </Badge>
                )}
              </div>

              {isChanging ? (
                /* Resume Dropdown Switcher */
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedResume?.id || ''}
                    onChange={(e) => {
                      const allOptions = [...availableResumes, ...BENCHMARK_RESUMES];
                      const found = allOptions.find((r) => r.id === e.target.value);
                      if (found) {
                        setSelectedResume(found);
                        if (typeof localStorage !== 'undefined') {
                          localStorage.setItem('jobachiever_active_resume', found.originalFilename);
                        }
                      }
                      setIsChanging(false);
                    }}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary max-w-sm"
                  >
                    {[...availableResumes, ...BENCHMARK_RESUMES].map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name} ({res.originalFilename})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChanging(false)}
                    className="h-7 text-xs"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                /* Static Selected Resume View */
                <div>
                  <h3 className="text-base font-bold text-foreground truncate">
                    {selectedResume?.name || 'No Resume Selected'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                    <span className="font-mono text-foreground/80">
                      {selectedResume?.originalFilename || 'Select an archetype below or upload your PDF'}
                    </span>
                    {selectedResume && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(selectedResume.fileSize)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Layers className="h-3 w-3" />
                          <span>{selectedResume.careerTrackName}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions to Change or Upload */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChanging(true)}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Switch Resume</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Custom PDF</span>
            </Button>
          </div>
        </div>

        {/* Benchmark Archetypes 1-Click Strip */}
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Quick Select Benchmark Archetype:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {BENCHMARK_RESUMES.map((bench) => {
              const isSelected = selectedResume?.originalFilename === bench.originalFilename || selectedResume?.id === bench.id;
              return (
                <button
                  key={bench.id}
                  onClick={() => handleSelectBenchmark(bench)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70'
                  }`}
                >
                  {bench.name.split('—')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
