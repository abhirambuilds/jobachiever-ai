import {
  Bookmark,
  RotateCcw,
  Calendar,
  Layers,
  ShieldCheck,
  Building2,
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

export function SavedJobAnalysesModal({ isOpen, onClose }) {
  const { savedAnalyses, loadSavedAnalysis } = useJobMatcher();

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Saved Job Opportunities &amp; Alignment Reports
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Review previously matched job postings, benchmark scores, and reopen full gap analyses.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transparency Callout */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground font-semibold">Development Workspace: </strong>
              Saved opportunities are currently preserved in session memory and development baselines. Spring Boot Data JPA will manage persistence in future backend milestones.
            </p>
          </div>

          {/* List of Saved Analyses */}
          <div className="space-y-3">
            {savedAnalyses.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-bold text-primary text-xs">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{item.company}</span>
                    </span>
                    <span className="font-bold text-sm text-foreground truncate">
                      {item.title}
                    </span>
                    <Badge variant="ai" className="text-[10px] font-mono px-1.5 py-0">
                      Score: {item.compatibilityScore}%
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-primary" />
                      <span>{item.careerTrack}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-foreground/80">{item.resumeName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.analyzedAt)}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedAnalysis(item)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Reopen Report</span>
                  </Button>
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
