import { useState, useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, formatFileSize } from '@/services/documentService';
import { Badge } from '@/components/ui/badge';

export function Dropzone({ onFilesSelected, isUploading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-primary bg-primary/10 shadow-glow-sm scale-[1.01]'
          : 'border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform ${
            isDragOver ? 'scale-110 bg-primary text-white' : 'bg-primary/15 text-primary border border-primary/20'
          }`}
        >
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            {isDragOver ? (
              <span className="text-primary font-extrabold">Drop your resumes here</span>
            ) : (
              <span>
                Drag and drop your resumes here, or{' '}
                <span className="text-primary underline font-semibold">browse files</span>
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Support for multiple documents. Maximum file size: {formatFileSize(MAX_FILE_SIZE_BYTES)}.
          </p>
        </div>

        {/* Accepted Formats */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Badge variant="outline" className="text-[10px] gap-1 font-mono">
            <FileText className="h-3 w-3 text-rose-500" />
            <span>Adobe PDF (.pdf)</span>
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1 font-mono">
            <FileText className="h-3 w-3 text-blue-500" />
            <span>Microsoft Word (.docx)</span>
          </Badge>
          <Badge variant="ai" className="text-[10px] font-mono">
            Zero-Fabrication Guardrail
          </Badge>
        </div>
      </div>
    </div>
  );
}
