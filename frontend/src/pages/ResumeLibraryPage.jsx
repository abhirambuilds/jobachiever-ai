import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FilePlus2,
  Search,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { DocumentProvider, useDocuments } from '@/features/resumes/context/DocumentContext';
import { ResumeSummaryCards } from '@/features/resumes/components/library/ResumeSummaryCards';
import { ResumeFilterBar } from '@/features/resumes/components/library/ResumeFilterBar';
import { ResumeCard } from '@/features/resumes/components/library/ResumeCard';
import { ResumeListItem } from '@/features/resumes/components/library/ResumeListItem';
import { DocumentUploadModal } from '@/features/resumes/components/upload/DocumentUploadModal';
import { DocumentPreviewModal } from '@/features/resumes/components/preview/DocumentPreviewModal';
import { VersionHistoryModal } from '@/features/resumes/components/versions/VersionHistoryModal';
import { RenameDialog } from '@/features/resumes/components/dialogs/RenameDialog';
import { DeleteConfirmDialog } from '@/features/resumes/components/dialogs/DeleteConfirmDialog';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';

function ResumeLibraryContent() {
  const {
    filteredDocuments,
    documents,
    viewMode,
    isUploadModalOpen,
    setIsUploadModalOpen,
    activePreviewDoc,
    setActivePreviewDoc,
    activeVersionDoc,
    setActiveVersionDoc,
    activeRenameDoc,
    setActiveRenameDoc,
    activeDeleteDoc,
    setActiveDeleteDoc,
    setSearchQuery,
    setTrackFilter,
    setTypeFilter,
    setStatusFilter,
  } = useDocuments();

  const navigate = useNavigate();

  const handleCreateResumeNotice = () => {
    navigate('/resume-studio');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTrackFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ai" dot className="text-xs">
              Document Workspace
            </Badge>
            <Badge variant="outline" className="text-xs">
              Live Database Connected
            </Badge>
            <SimulatedResultBadge text="AI Parser Active" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Resume Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Manage your master and track-specific resumes. Track revision histories, inspect
            metadata, and associate documents with distinct career personas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateResumeNotice}
            className="text-xs gap-1.5"
          >
            <FilePlus2 className="h-4 w-4 text-cyan-400" />
            <span>Create Tailored Resume</span>
          </Button>

          <Button
            type="button"
            variant="ai"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs gap-2 shadow-glow-sm"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <ResumeSummaryCards />

      {/* Filter and Search Bar */}
      <ResumeFilterBar />

      {/* Resume Grid or List Display */}
      {filteredDocuments.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <ResumeCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDocuments.map((doc) => (
              <ResumeListItem key={doc.id} doc={doc} />
            ))}
          </div>
        )
      ) : documents.length > 0 ? (
        /* Empty Filter State */
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-10 text-center space-y-3">
          <Search className="h-10 w-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">No matching resumes found</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No resumes match your active search terms or filter constraints.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      ) : (
        /* Completely Empty State */
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-bold text-foreground">Your Resume Library is Empty</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your existing PDF or DOCX resumes to initiate structural ATS parsing, keyword
              alignment, and multi-track association.
            </p>
          </div>
          <Button
            variant="ai"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs gap-2 shadow-glow-sm"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Your First Resume</span>
          </Button>
        </div>
      )}

      {/* Modals & Dialogs */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <DocumentPreviewModal
        doc={activePreviewDoc}
        onClose={() => setActivePreviewDoc(null)}
      />

      <VersionHistoryModal
        doc={activeVersionDoc}
        onClose={() => setActiveVersionDoc(null)}
      />

      <RenameDialog
        doc={activeRenameDoc}
        onClose={() => setActiveRenameDoc(null)}
      />

      <DeleteConfirmDialog
        doc={activeDeleteDoc}
        onClose={() => setActiveDeleteDoc(null)}
      />
    </div>
  );
}

export function ResumeLibraryPage() {
  return (
    <DocumentProvider>
      <ResumeLibraryContent />
    </DocumentProvider>
  );
}
