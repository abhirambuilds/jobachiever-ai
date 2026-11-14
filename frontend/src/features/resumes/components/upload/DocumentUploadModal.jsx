import { useState } from 'react';
import {
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UploadCloud,
  Layers,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { formatFileSize, validateDocumentFile } from '@/services/documentService';
import { Dropzone } from './Dropzone';
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
import { Spinner } from '@/components/ui/spinner';

export function DocumentUploadModal({ isOpen, onClose }) {
  const { uploadDocuments, availableTracks, documents } = useDocuments();

  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(
    availableTracks.find((t) => t.isPrimary)?.id || availableTracks[0]?.id || 'track-1'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesSelected = (files) => {
    const newItems = files.map((file) => {
      const validation = validateDocumentFile(file);
      const isDuplicate = documents.some(
        (d) => d.originalFilename.toLowerCase() === file.name.toLowerCase()
      );

      return {
        id: `pending-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        extension: validation.extension,
        isValid: validation.valid,
        errors: validation.errors,
        isDuplicate,
        status: validation.valid ? 'ready' : 'invalid',
      };
    });

    setPendingFiles((prev) => [...prev, ...newItems]);
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUploadAll = async () => {
    const validItems = pendingFiles.filter((item) => item.isValid);
    if (validItems.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const filesToUpload = validItems.map((item) => item.file);

    try {
      await uploadDocuments(filesToUpload, selectedTrackId, (_filename, progress) => {
        setUploadProgress(progress);
      });

      // Clear state and close
      setPendingFiles([]);
      setUploadProgress(0);
      setIsUploading(false);
      onClose();
    } catch {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDialogChange = (open) => {
    if (!open && !isUploading) {
      setPendingFiles([]);
      setUploadProgress(0);
      onClose();
    }
  };

  const validCount = pendingFiles.filter((p) => p.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Upload Resumes &amp; Documents
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add PDF or Word documents to your unified Resume Library.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Career Track Selector */}
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="track-select"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Associate with Career Persona</span>
              </label>
              <Badge variant="outline" className="text-[10px]">
                Target Persona
              </Badge>
            </div>

            <select
              id="track-select"
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              disabled={isUploading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {availableTracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name} {track.isPrimary ? '(Primary Track)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Upload Zone */}
          <Dropzone onFilesSelected={handleFilesSelected} isUploading={isUploading} />

          {/* Pending Files List */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Selected Documents ({pendingFiles.length})
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {validCount} valid for ingestion
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-border/30 rounded-xl border border-border/70 bg-muted/20 p-2">
                {pendingFiles.map((item) => {
                  const isPdf = item.extension === '.pdf';
                  return (
                    <div
                      key={item.id}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5 ${
                            isPdf
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          }`}
                        >
                          {isPdf ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <FileCode className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{formatFileSize(item.size)}</span>
                            {item.isDuplicate && (
                              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Existing document with same name</span>
                              </span>
                            )}
                          </div>

                          {!item.isValid && (
                            <div className="space-y-0.5 pt-1">
                              {item.errors.map((err, i) => (
                                <p
                                  key={i}
                                  className="text-[10px] text-destructive flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  <span>{err}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.isValid ? (
                          <Badge variant="outline" className="text-[9px] text-emerald-500 gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>Ready</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[9px]">
                            Rejected
                          </Badge>
                        )}

                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => removePendingFile(item.id)}
                            className="text-muted-foreground hover:text-foreground p-1"
                            aria-label="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 rounded-xl border border-primary/40 bg-primary/5 p-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Spinner size="xs" />
                  <span>Validating and ingesting documents...</span>
                </span>
                <span className="font-mono text-primary font-bold">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Architectural Notice */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Development-Only In-Session Upload</span>
            </div>
            <p className="leading-relaxed">
              Files are held in temporary memory during this browser session for preview and
              testing. Full Spring Boot S3 / filesystem persistence and malware scanning will be
              wired in upcoming milestones. Sensitive documents are never stored in localStorage.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ai"
            onClick={handleUploadAll}
            disabled={validCount === 0 || isUploading}
            className="gap-2 text-xs shadow-glow-sm"
          >
            {isUploading ? (
              <>
                <Spinner size="xs" />
                <span>Ingesting...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>
                  Upload {validCount} Document{validCount === 1 ? '' : 's'}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
