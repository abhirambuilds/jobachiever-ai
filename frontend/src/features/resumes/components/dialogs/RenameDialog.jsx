import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

export function RenameDialog({ doc, onClose }) {
  const { renameDocument } = useDocuments();
  const [name, setName] = useState('');

  useEffect(() => {
    if (doc) setName(doc.name);
  }, [doc]);

  if (!doc) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      renameDocument(doc.id, name);
    }
  };

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Edit2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Rename Resume
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update the title used across your Career Tracks and application match pipelines.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label htmlFor="rename-input" className="text-xs font-semibold text-foreground">
              Document Display Name
            </label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer Resume"
              className="text-xs"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Original file: <span className="font-mono">{doc.originalFilename}</span>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ai"
              disabled={!name.trim() || name.trim() === doc.name}
              className="text-xs"
            >
              Save New Name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
