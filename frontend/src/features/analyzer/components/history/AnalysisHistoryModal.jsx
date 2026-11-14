import {
  History,
  RotateCcw,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
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

export function AnalysisHistoryModal({ isOpen, onClose }) {
  const { history, loadHistoryItem } = useAnalyzer();

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
              <History className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Resume Intelligence Analysis History
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Revisit historical evaluation runs, compare progress across revisions, and reload previous reports.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transparency note */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground font-semibold">Development Baseline: </strong>
              Past sessions are stored in session memory and initial development records. Spring
              Boot persistence will archive full history trees under `/api/v1/resumes/analyze/history`.
            </p>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.resumeName}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {item.mode.toUpperCase()}
                    </Badge>
                    <Badge variant="ai" className="text-[10px] font-mono px-1.5 py-0">
                      Score: {item.overallScore}%
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Layers className="h-3 w-3 text-primary" />
                      <span>{item.targetRole}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.analyzedAt)}</span>
                    </span>
                  </div>

                  {item.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-1 pt-0.5">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadHistoryItem(item)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <RotateCcw className="h-3 w-3 text-cyan-400" />
                    <span>Reload Report</span>
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
