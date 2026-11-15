import {
  FileText,
  FileCode,
  Download,
  Eye,
  History,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { formatFileSize, DOCUMENT_STATUS } from '@/services/documentService';
import { useDocuments } from '@/hooks/useDocuments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

export function ResumeListItem({ doc }) {
  const {
    setActivePreviewDoc,
    setActiveVersionDoc,
    setActiveRenameDoc,
    setActiveDeleteDoc,
    downloadDocument,
    updateDocumentTrack,
    setPrimaryResume,
    availableTracks,
  } = useDocuments();

  const isPdf = doc.fileExtension === 'pdf';

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case DOCUMENT_STATUS.PROCESSED:
        return (
          <Badge variant="success" className="text-[10px] px-1.5 py-0 gap-1">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>Ready</span>
          </Badge>
        );
      case DOCUMENT_STATUS.PROCESSING:
        return (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0 gap-1 animate-pulse">
            <Clock className="h-2.5 w-2.5" />
            <span>Processing</span>
          </Badge>
        );
      case DOCUMENT_STATUS.FAILED:
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Uploaded
          </Badge>
        );
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs">
      {/* Left: Icon & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            isPdf
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
              : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
          }`}
        >
          {isPdf ? <FileText className="h-5 w-5" /> : <FileCode className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              onClick={() => setActivePreviewDoc(doc)}
              className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate max-w-md"
              title={doc.name}
            >
              {doc.name}
            </h4>
            <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
              v{doc.version}.0
            </Badge>
            {doc.isPrimary && (
              <Badge variant="ai" className="text-[9px] px-1 py-0">
                Primary
              </Badge>
            )}
            {doc.atsScore && (
              <Badge variant="ai" className="text-[9px] font-mono px-1 py-0">
                <Sparkles className="h-2.5 w-2.5 text-cyan-400 mr-0.5 inline" />
                <span>{doc.atsScore}%</span>
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-mono">{doc.originalFilename}</span>
            <span>•</span>
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground/80">
              <Layers className="h-3 w-3 text-primary" />
              <span>{doc.careerTrackName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Dates, Status & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <div className="hidden lg:flex flex-col text-right text-[11px] text-muted-foreground">
          <span>Updated {formatDate(doc.updatedAt)}</span>
          <span className="text-[10px] text-muted-foreground/70">
            Uploaded {formatDate(doc.uploadedAt)}
          </span>
        </div>

        <div>{getStatusBadge(doc.processingStatus)}</div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePreviewDoc(doc)}
            className="h-8 text-xs gap-1"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => downloadDocument(doc)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Download document"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-semibold">
                Manage Document
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActivePreviewDoc(doc)}>
                <Eye className="mr-2 h-4 w-4 text-cyan-400" />
                <span>Preview Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadDocument(doc)}>
                <Download className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Download File</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveRenameDoc(doc)}>
                <Edit2 className="mr-2 h-4 w-4 text-primary" />
                <span>Rename Resume</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveVersionDoc(doc)}>
                <History className="mr-2 h-4 w-4 text-amber-400" />
                <span>Version History ({doc.versions?.length || 1})</span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Layers className="mr-2 h-4 w-4 text-primary" />
                  <span>Associate Track</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {availableTracks.map((track) => (
                    <DropdownMenuItem
                      key={track.id}
                      onClick={() => updateDocumentTrack(doc.id, track.id)}
                      className={doc.careerTrackId === track.id ? 'font-bold text-primary' : ''}
                    >
                      <span>{track.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {!doc.isPrimary && (
                <DropdownMenuItem onClick={() => setPrimaryResume(doc.id)}>
                  <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
                  <span>Set as Primary</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setActiveDeleteDoc(doc)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
