import { Trash2, AlertTriangle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteConfirmDialog({ doc, onClose }) {
  const { deleteDocument } = useDocuments();

  if (!doc) return null;

  const handleDelete = () => {
    deleteDocument(doc.id);
  };

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Delete Resume
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This document will be permanently removed from your library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-2 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-foreground font-semibold">&ldquo;{doc.name}&rdquo;</strong>?
          </p>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-destructive space-y-1">
            <p className="font-semibold">Associated Career Persona:</p>
            <p className="text-foreground/80 font-mono">
              {doc.careerTrackName} • {doc.originalFilename}
            </p>
            <p className="pt-1 text-muted-foreground">
              Any tailored variants anchored to this master document will require re-anchoring.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="text-xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Permanently</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
