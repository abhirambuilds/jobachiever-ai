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
import { Card, CardContent } from '@/components/ui/card';
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

export function ResumeCard({ doc }) {
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
      case DOCUMENT_STATUS.ARCHIVED:
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Archived
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
    <Card className="group relative overflow-hidden border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col justify-between">
      {/* Top Banner & Thumbnail Mock */}
      <div className="relative h-28 w-full border-b border-border/60 bg-gradient-to-br from-muted/50 via-muted/30 to-background flex items-center justify-center overflow-hidden">
        {/* Subtle document graphic representation */}
        <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-xs border ${
              isPdf
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            }`}
          >
            {isPdf ? <FileText className="h-6 w-6" /> : <FileCode className="h-6 w-6" />}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            {doc.fileExtension.toUpperCase()} • {formatFileSize(doc.fileSize)}
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] bg-background/80 font-mono">
            v{doc.version}.0
          </Badge>
          {doc.isPrimary && (
            <Badge variant="ai" className="text-[9px] px-1.5 py-0">
              Primary
            </Badge>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {getStatusBadge(doc.processingStatus)}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground bg-background/70 backdrop-blur-xs"
                aria-label="Document options"
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

      {/* Main Content Area */}
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Associated Career Track */}
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 truncate max-w-full">
              <Layers className="h-2.5 w-2.5 text-primary shrink-0" />
              <span className="truncate">{doc.careerTrackName}</span>
            </Badge>
            {doc.atsScore && (
              <Badge variant="ai" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                <span>ATS {doc.atsScore}%</span>
              </Badge>
            )}
          </div>

          {/* Title */}
          <h4
            onClick={() => setActivePreviewDoc(doc)}
            className="text-sm font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
            title={doc.name}
          >
            {doc.name}
          </h4>

          {/* File Meta */}
          <p className="text-[11px] text-muted-foreground truncate font-mono">
            {doc.originalFilename}
          </p>

          <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
            <div className="flex items-center justify-between">
              <span>Uploaded:</span>
              <span className="text-foreground/80 font-mono">{formatDate(doc.uploadedAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Updated:</span>
              <span className="text-foreground/80 font-mono">{formatDate(doc.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePreviewDoc(doc)}
            className="h-8 text-xs flex-1 gap-1.5"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Preview</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadDocument(doc)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            title="Download document"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
