import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
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
import { toast } from '@/components/ui/toast';

export function BeforeAfterComparisonModal({ isOpen, onClose }) {
  const { sentenceReviews, selectedResume } = useAnalyzer();

  const accepted = sentenceReviews.filter((s) => s.status === 'accepted' || s.status === 'modified');
  const rejected = sentenceReviews.filter((s) => s.status === 'rejected');
  const pending = sentenceReviews.filter((s) => s.status === 'pending');

  const handleExportStaged = () => {
    toast.success('Staged revision delta exported to memory. Tailored Resume Generation will compile this in Milestone 9.');
    onClose();
  };

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
                Before &amp; After Resume Comparison
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Side-by-side inspection of staged revisions. Your original master resume remains intact.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Change Tracker Summary */}
        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground">Accepted Changes</span>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              {accepted.length}
            </Badge>
          </div>

          <div className="rounded-xl border border-muted bg-muted/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Rejected Changes</span>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {rejected.length}
            </Badge>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-foreground">Pending Review</span>
            </div>
            <Badge variant="warning" className="font-mono text-xs">
              {pending.length}
            </Badge>
          </div>
        </div>

        {/* Side-by-side Comparison Table */}
        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/50 text-xs">
            {sentenceReviews.map((item) => {
              const isAccepted = item.status === 'accepted' || item.status === 'modified';
              const isRejected = item.status === 'rejected';

              return (
                <div key={item.id} className="p-4 space-y-3 bg-card/60">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {item.section}
                    </Badge>
                    <Badge
                      variant={isAccepted ? 'success' : isRejected ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {isAccepted
                        ? item.status === 'modified'
                          ? 'Custom Rewrite'
                          : 'Accepted'
                        : isRejected
                        ? 'Rejected'
                        : 'Unmodified'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Original Content
                      </span>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 leading-relaxed text-muted-foreground line-through decoration-rose-500/60">
                        {item.originalText}
                      </div>
                    </div>

                    {/* After */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary block">
                        Revised Content
                      </span>
                      <div
                        className={`rounded-lg border p-3 leading-relaxed font-medium ${
                          isAccepted
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-foreground'
                            : 'border-border/60 bg-muted/20 text-muted-foreground'
                        }`}
                      >
                        {isAccepted
                          ? item.revisedText || item.suggestedText
                          : item.originalText}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground font-semibold">Non-Destructive Guarantee: </strong>
              Applying staged changes creates a tailored revision candidate. Your original source resume{' '}
              <span className="font-mono text-foreground font-semibold">
                &ldquo;{selectedResume?.name}&rdquo;
              </span>{' '}
              is never overwritten without explicit user approval.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close View
          </Button>
          <Button
            variant="ai"
            size="sm"
            onClick={handleExportStaged}
            disabled={accepted.length === 0}
            className="text-xs gap-1.5 shadow-glow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Confirm &amp; Stage {accepted.length} Rewrites</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
