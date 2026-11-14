import { useState } from 'react';
import {
  History,
  RotateCcw,
  ShieldCheck,
  Calendar,
  ArrowLeftRight,
} from 'lucide-react';
import { formatFileSize } from '@/services/documentService';
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
import { Badge } from '@/components/ui/badge';

export function VersionHistoryModal({ doc, onClose }) {
  const { restoreVersion } = useDocuments();
  const [selectedVersionId, setSelectedVersionId] = useState(
    doc?.versions?.[0]?.versionId || null
  );
  const [compareVersionId, setCompareVersionId] = useState(
    doc?.versions?.[1]?.versionId || null
  );
  const [isComparing, setIsComparing] = useState(false);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState(null);

  if (!doc) return null;

  const versions = doc.versions || [];
  const selectedVersion =
    versions.find((v) => v.versionId === selectedVersionId) || versions[0];
  const compareVersion =
    versions.find((v) => v.versionId === compareVersionId) || versions[1] || versions[0];

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

  const handlePerformRestore = () => {
    if (confirmRestoreVersion) {
      restoreVersion(doc.id, confirmRestoreVersion.versionNumber);
      setConfirmRestoreVersion(null);
    }
  };

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <History className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Resume Version History
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Inspect revision milestones, compare changes, and safely restore historical versions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Confirmation prompt overlay if restoring */}
        {confirmRestoreVersion && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Confirm Version Rollback (v{confirmRestoreVersion.versionNumber}.0)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In accordance with our zero-silent-overwrite policy, this action will create a
                  new version record (v{doc.version + 1}.0) based on version{' '}
                  {confirmRestoreVersion.versionNumber}. No historical versions are deleted.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmRestoreVersion(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={handlePerformRestore}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Confirm Restore</span>
              </Button>
            </div>
          </div>
        )}

        {/* Mode Switcher: Timeline vs Compare */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Current: v{doc.version}.0
            </Badge>
            <span className="text-xs text-muted-foreground">
              {versions.length} recorded version{versions.length === 1 ? '' : 's'}
            </span>
          </div>

          {versions.length > 1 && (
            <Button
              variant={isComparing ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setIsComparing(!isComparing)}
              className="h-8 text-xs gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>{isComparing ? 'View Version Timeline' : 'Compare Versions'}</span>
            </Button>
          )}
        </div>

        {/* VIEW 1: COMPARISON MODE */}
        {isComparing && versions.length > 1 ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Base Version (A)
                </label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  {versions.map((v) => (
                    <option key={v.versionId} value={v.versionId}>
                      v{v.versionNumber}.0 — {formatDate(v.updatedAt)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Comparison Target (B)
                </label>
                <select
                  value={compareVersionId}
                  onChange={(e) => setCompareVersionId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  {versions.map((v) => (
                    <option key={v.versionId} value={v.versionId}>
                      v{v.versionNumber}.0 — {formatDate(v.updatedAt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div className="grid grid-cols-2 gap-4 border border-border/70 rounded-xl bg-card p-4 divide-x divide-border/50 text-xs">
              {/* Version A Card */}
              <div className="pr-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="ai" className="font-mono text-xs">
                    v{selectedVersion.versionNumber}.0
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDate(selectedVersion.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Description
                  </span>
                  <p className="text-foreground mt-0.5 leading-relaxed">
                    {selectedVersion.description}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Source
                  </span>
                  <p className="text-foreground">{selectedVersion.source}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    File Size
                  </span>
                  <p className="font-mono text-foreground">
                    {formatFileSize(selectedVersion.fileSize)}
                  </p>
                </div>
              </div>

              {/* Version B Card */}
              <div className="pl-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    v{compareVersion.versionNumber}.0
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatDate(compareVersion.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Description
                  </span>
                  <p className="text-foreground mt-0.5 leading-relaxed">
                    {compareVersion.description}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Source
                  </span>
                  <p className="text-foreground">{compareVersion.source}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    File Size
                  </span>
                  <p className="font-mono text-foreground">
                    {formatFileSize(compareVersion.fileSize)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: CHRONOLOGICAL VERSION TIMELINE */
          <div className="space-y-4 py-2">
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {versions.map((ver) => {
                const isCurrent = ver.versionNumber === doc.version;
                const isSelected = ver.versionId === selectedVersionId;

                return (
                  <div key={ver.versionId} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-background border-2 shadow-xs transition-transform ${
                        isCurrent
                          ? 'border-primary text-primary scale-110'
                          : 'border-muted-foreground/60 text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCurrent ? 'bg-primary' : 'bg-muted-foreground/60'
                        }`}
                      />
                    </div>

                    <div
                      onClick={() => setSelectedVersionId(ver.versionId)}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary/50 bg-primary/5 shadow-xs'
                          : 'border-border/70 bg-card hover:border-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCurrent ? 'ai' : 'outline'}
                            className="text-xs font-mono"
                          >
                            v{ver.versionNumber}.0
                          </Badge>
                          <span className="font-bold text-sm text-foreground">{ver.name}</span>
                          {isCurrent && (
                            <Badge variant="success" className="text-[9px] px-1 py-0">
                              Active Version
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ver.updatedAt)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                        {ver.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>
                            Source: <strong className="text-foreground">{ver.source}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Size: <strong>{formatFileSize(ver.fileSize)}</strong>
                          </span>
                        </div>

                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRestoreVersion(ver);
                            }}
                            className="h-7 text-xs text-primary hover:text-primary gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Restore this Version</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
