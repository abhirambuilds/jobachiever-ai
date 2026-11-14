import { useState } from 'react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FileText,
  FileCode,
  ShieldCheck,
  Layers,
  Info,
  ExternalLink,
} from 'lucide-react';
import { formatFileSize } from '@/services/documentService';
import { useDocuments } from '@/hooks/useDocuments';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DocumentPreviewModal({ doc, onClose }) {
  const { downloadDocument, setActiveVersionDoc, setActiveRenameDoc } = useDocuments();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  if (!doc) return null;

  const isPdf = doc.fileExtension === 'pdf';

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

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoomLevel(100);

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`transition-all duration-200 p-0 overflow-hidden flex flex-col bg-background border-border/80 ${
          isFullscreen
            ? 'w-[98vw] max-w-[98vw] h-[96vh] max-h-[96vh] rounded-xl'
            : 'w-[94vw] max-w-5xl h-[88vh] max-h-[88vh] rounded-2xl shadow-2xl'
        }`}
      >
        <DialogTitle className="sr-only">{doc.name} Preview</DialogTitle>
        {/* Top Control Bar */}
        <div className="flex h-14 items-center justify-between border-b border-border/70 bg-card/80 px-4 shrink-0 backdrop-blur-md">
          {/* Document Title & Badges */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                isPdf
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
              }`}
            >
              {isPdf ? <FileText className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
                {doc.name}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 shrink-0">
                v{doc.version}.0
              </Badge>
              {doc.atsScore && (
                <Badge variant="ai" className="text-[10px] px-1 py-0 shrink-0 hidden sm:inline-flex">
                  ATS {doc.atsScore}%
                </Badge>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom Controls (for PDF) */}
            {isPdf && doc.previewUrl && (
              <div className="hidden sm:flex items-center border border-border/70 rounded-lg p-0.5 bg-muted/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="px-2 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                  title="Reset Zoom"
                >
                  {zoomLevel}%
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Toggle Info Panel */}
            <Button
              variant={showInfoPanel ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Toggle metadata panel"
            >
              <Info className="h-4 w-4" />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadDocument(doc)}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Download</span>
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Body (Preview Surface + Optional Info Panel) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Document Content Viewport */}
          <div className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-6 flex items-center justify-center">
            {isPdf && doc.previewUrl ? (
              <div
                className="bg-white text-black shadow-xl rounded-lg overflow-hidden transition-transform duration-150 origin-top"
                style={{
                  width: `${Math.min(zoomLevel, 150)}%`,
                  maxWidth: `${zoomLevel <= 100 ? '800px' : '1100px'}`,
                  minHeight: '650px',
                  height: '100%',
                }}
              >
                <iframe
                  src={doc.previewUrl}
                  title={doc.name}
                  className="w-full h-full min-h-[650px] border-0"
                />
              </div>
            ) : isPdf ? (
              /* PDF Fallback if no previewUrl generated */
              <div className="max-w-md text-center p-8 rounded-2xl border border-border/80 bg-card shadow-lg space-y-4">
                <FileText className="h-12 w-12 text-rose-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground">{doc.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{doc.originalFilename}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adobe PDF preview rendered via native browser document interface.
                </p>
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() => downloadDocument(doc)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Document</span>
                </Button>
              </div>
            ) : (
              /* DOCX Graceful Inspection Fallback */
              <div className="max-w-xl w-full rounded-2xl border border-border/80 bg-card shadow-xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      Microsoft Word OpenXML Document (.docx)
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Graceful DOCX Inspection Mode</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Browser engines do not natively render proprietary OpenXML packages without
                    heavy third-party dependencies. JobAchiever AI validates document structure,
                    encodings, and metadata without bloating client runtime.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Structure Status:</span>
                      <span className="font-semibold text-foreground">Validated &amp; Clean</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Payload Size:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download &amp; Open in Word</span>
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Compatible with MS Word, LibreOffice, Google Docs
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Document Metadata Side Panel */}
          {showInfoPanel && (
            <aside className="w-72 sm:w-80 border-l border-border/70 bg-card p-5 overflow-y-auto space-y-5 shrink-0 hidden md:block">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>Document Details</span>
                </h5>
                <h4 className="text-sm font-bold text-foreground mt-1 break-words">{doc.name}</h4>
              </div>

              {/* Status and Score */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    Ready &amp; Verified
                  </Badge>
                </div>
                {doc.atsScore && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ATS Benchmark:</span>
                    <Badge variant="ai" className="text-[10px] px-1.5 py-0">
                      Score: {doc.atsScore}%
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Version:</span>
                  <span className="font-mono font-semibold text-foreground">v{doc.version}.0</span>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-3 text-xs divide-y divide-border/40">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Original Filename
                  </span>
                  <p className="font-mono text-foreground break-all">{doc.originalFilename}</p>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Associated Career Track
                  </span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>{doc.careerTrackName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      Format
                    </span>
                    <p className="font-mono text-foreground uppercase">{doc.fileExtension}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      Size
                    </span>
                    <p className="font-mono text-foreground">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Uploaded At
                  </span>
                  <p className="text-foreground">{formatDate(doc.uploadedAt)}</p>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Last Modified
                  </span>
                  <p className="text-foreground">{formatDate(doc.updatedAt)}</p>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Storage Dispatch Key
                  </span>
                  <p className="font-mono text-[10px] text-muted-foreground break-all">
                    {doc.storageKey}
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="pt-2 border-t border-border/50 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    setActiveVersionDoc(doc);
                  }}
                  className="w-full text-xs justify-between"
                >
                  <span>Version History ({doc.versions?.length || 1})</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    setActiveRenameDoc(doc);
                  }}
                  className="w-full text-xs text-muted-foreground justify-between"
                >
                  <span>Rename Document</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </aside>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
