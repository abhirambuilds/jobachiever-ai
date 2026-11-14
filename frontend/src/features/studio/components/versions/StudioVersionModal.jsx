import { useState } from 'react';
import {
  Clock,
  History,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';

export function StudioVersionModal() {
  const {
    versionModalOpen,
    setVersionModalOpen,
    versions,
    restoreVersion,
    saveCurrentVersion,
  } = useResumeStudio();

  const [selectedVerId, setSelectedVerId] = useState(versions[0]?.id);
  const [newSnapshotNote, setNewSnapshotNote] = useState('');

  if (!versionModalOpen) return null;

  const selectedVersion = versions.find((v) => v.id === selectedVerId) || versions[0];

  const handleCreateSnapshot = (e) => {
    e.preventDefault();
    if (newSnapshotNote.trim()) {
      saveCurrentVersion(newSnapshotNote.trim());
      setNewSnapshotNote('');
    }
  };

  const handleRestore = () => {
    if (!selectedVersion) return;
    if (window.confirm(`Restore checkpoint ${selectedVersion.versionNumber}? Your current canvas will be updated to this version.`)) {
      restoreVersion(selectedVersion.id);
      setVersionModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Resume Version History</h3>
              <p className="text-[11px] text-muted-foreground">Review, compare and restore previous resume states</p>
            </div>
          </div>
          <button
            onClick={() => setVersionModalOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Left Column: Version list */}
          <div className="p-3 overflow-y-auto space-y-2 max-h-[50vh] sm:max-h-[60vh]">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              Checkpoints ({versions.length})
            </div>

            <div className="space-y-1.5">
              {versions.map((ver) => {
                const isSelected = ver.id === selectedVersion?.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVerId(ver.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary ring-1 ring-primary'
                        : 'bg-card border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground font-mono">
                        {ver.versionNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {ver.note}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick manual snapshot create */}
            <form onSubmit={handleCreateSnapshot} className="pt-3 border-t border-border/60 space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Save Checkpoint
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Checkpoint note..."
                  value={newSnapshotNote}
                  onChange={(e) => setNewSnapshotNote(e.target.value)}
                  className="flex-1 text-xs px-2 py-1 bg-background border border-border rounded focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!newSnapshotNote.trim()}
                  className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold rounded disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Version preview & actions */}
          <div className="p-4 flex flex-col justify-between overflow-y-auto space-y-4">
            {selectedVersion ? (
              <div className="space-y-3">
                <div className="border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground font-mono">
                      {selectedVersion.versionNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                      {selectedVersion.templateId || 'ATS Professional'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Recorded on {new Date(selectedVersion.timestamp).toLocaleDateString()} at{' '}
                    {new Date(selectedVersion.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Checkpoint Description
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-muted/40 p-2.5 rounded-lg border border-border">
                    {selectedVersion.note}
                  </p>
                </div>

                {selectedVersion.resumeSnapshot && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      Snapshot Metadata
                    </span>
                    <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
                      <div>Title: {selectedVersion.resumeSnapshot.title}</div>
                      <div>Sections: {selectedVersion.resumeSnapshot.sections?.length || 0}</div>
                      <div>Font: {selectedVersion.resumeSnapshot.designSettings?.fontFamily || 'Inter'}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Select a version to inspect.</div>
            )}

            {/* Restore button */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleRestore}
                disabled={!selectedVersion?.resumeSnapshot}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore This Version</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
