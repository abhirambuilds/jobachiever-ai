import {
  ArrowLeftRight,
  ShieldCheck,
  FileText,
  Layers,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function MultiResumeComparisonModal({ isOpen, onClose }) {
  const { comparisonResults, jobDetails } = useJobMatcher();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Multi-Resume Job Alignment Comparison
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Compare which resume version in your library matches &ldquo;{jobDetails.title}&rdquo; most effectively.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transparency Callout */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground font-semibold">Development Simulation: </strong>
              Illustrative comparative alignment based on career track personas. Full vector semantic ranking will be performed by FastAPI with pgvector embeddings in subsequent milestones.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/50 text-xs">
            {comparisonResults.map((item, idx) => (
              <div
                key={item.resumeId}
                className={`p-4 space-y-3 ${idx === 0 ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-card'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary border border-border/60">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{item.resumeName}</h4>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Layers className="h-3 w-3 text-primary" />
                        <span>{item.careerTrack}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="ai" className="font-mono text-xs font-bold px-2 py-0.5">
                      Overall: {item.overallScore}%
                    </Badge>
                    {idx === 0 && (
                      <Badge variant="success" className="text-[10px]">
                        Top Match
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="rounded-lg bg-background/50 border border-border/50 p-2">
                    <span className="text-muted-foreground block text-[10px]">Skills Alignment</span>
                    <span className="font-bold text-foreground font-mono">{item.skillAlignment}</span>
                  </div>
                  <div className="rounded-lg bg-background/50 border border-border/50 p-2">
                    <span className="text-muted-foreground block text-[10px]">Experience Alignment</span>
                    <span className="font-bold text-foreground font-mono">{item.experienceAlignment}</span>
                  </div>
                  <div className="rounded-lg bg-background/50 border border-border/50 p-2 col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground block text-[10px]">Key Strength</span>
                    <span className="text-foreground leading-snug">{item.strengths}</span>
                  </div>
                  <div className="rounded-lg bg-background/50 border border-border/50 p-2 col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground block text-[10px]">Primary Gap</span>
                    <span className="text-foreground leading-snug">{item.gaps}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
