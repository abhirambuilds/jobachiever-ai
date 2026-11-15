import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  documentService,
  INITIAL_RESUMES,
  validateDocumentFile,
  DOCUMENT_STATUS,
} from '@/services/documentService';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/toast';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const { profile } = useProfile();
  const [documents, setDocuments] = useState(INITIAL_RESUMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent_upload');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal / Dialog States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [activeVersionDoc, setActiveVersionDoc] = useState(null);
  const [activeRenameDoc, setActiveRenameDoc] = useState(null);
  const [activeDeleteDoc, setActiveDeleteDoc] = useState(null);

  // Track created object URLs to revoke them and prevent memory leaks
  const createdUrlsRef = useRef(new Set());

  useEffect(() => {
    let isMounted = true;
    const urls = createdUrlsRef.current;
    INITIAL_RESUMES.forEach((doc) => {
      if (doc.previewUrl) urls.add(doc.previewUrl);
    });

    documentService.getDocuments().then((docs) => {
      if (isMounted && docs && docs.length > 0) {
        setDocuments(docs);
        docs.forEach((doc) => {
          if (doc.previewUrl) urls.add(doc.previewUrl);
        });
      }
    });

    return () => {
      isMounted = false;
      // Cleanup all temporary preview URLs on unmount
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  // Career tracks available from Master Career Profile
  const availableTracks = useMemo(() => {
    return profile?.careerTracks || [
      { id: 'track-1', name: 'Full-Stack Engineer', isPrimary: true },
      { id: 'track-2', name: 'Solutions Architect', isPrimary: false },
    ];
  }, [profile]);

  /**
   * Upload single or multiple documents
   */
  const uploadDocuments = async (files, trackId, onFileProgress) => {
    const trackObj = availableTracks.find((t) => t.id === trackId) || availableTracks[0];
    const uploadedDocs = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check duplicate filename
      const isDuplicate = documents.some(
        (d) => d.originalFilename.toLowerCase() === file.name.toLowerCase()
      );
      if (isDuplicate) {
        toast.warning(`Note: "${file.name}" has already been uploaded previously.`);
      }

      try {
        const newDoc = await documentService.uploadDocument(
          file,
          {
            careerTrackId: trackObj?.id || 'track-1',
            careerTrackName: trackObj?.name || 'General Career Track',
          },
          (progress) => {
            if (onFileProgress) onFileProgress(file.name, progress);
          }
        );

        if (newDoc.previewUrl) {
          createdUrlsRef.current.add(newDoc.previewUrl);
        }

        uploadedDocs.push(newDoc);
      } catch (err) {
        errors.push(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    if (uploadedDocs.length > 0) {
      setDocuments((prev) => [...uploadedDocs, ...prev]);
      toast.success(
        `Successfully added ${uploadedDocs.length} document${uploadedDocs.length > 1 ? 's' : ''} to your Resume Library.`
      );
    }

    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
    }

    return { successCount: uploadedDocs.length, errorCount: errors.length };
  };

  /**
   * Rename a document
   */
  const renameDocument = async (documentId, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error('Resume name cannot be empty.');
      return false;
    }

    try {
      await documentService.renameDocument(documentId, trimmed);
    } catch {
      // offline fallback
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentId) return doc;
        const updatedDoc = {
          ...doc,
          name: trimmed,
          updatedAt: new Date().toISOString(),
        };
        // Update active modal states if open
        if (activePreviewDoc?.id === documentId) setActivePreviewDoc(updatedDoc);
        if (activeVersionDoc?.id === documentId) setActiveVersionDoc(updatedDoc);
        return updatedDoc;
      })
    );

    toast.success(`Resume renamed to "${trimmed}".`);
    setActiveRenameDoc(null);
    return true;
  };

  /**
   * Re-associate document with a career track
   */
  const updateDocumentTrack = async (documentId, newTrackId) => {
    const trackObj = availableTracks.find((t) => t.id === newTrackId);
    if (!trackObj) return;

    try {
      await documentService.updateDocumentTrack(documentId, newTrackId);
    } catch {
      // offline fallback
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentId) return doc;
        const updated = {
          ...doc,
          careerTrackId: trackObj.id,
          careerTrackName: trackObj.name,
          updatedAt: new Date().toISOString(),
        };
        if (activePreviewDoc?.id === documentId) setActivePreviewDoc(updated);
        if (activeVersionDoc?.id === documentId) setActiveVersionDoc(updated);
        return updated;
      })
    );

    toast.success(`Associated with career track "${trackObj.name}".`);
  };

  /**
   * Delete a document with cleanup
   */
  const deleteDocument = async (documentId) => {
    const docToDelete = documents.find((d) => d.id === documentId);
    if (docToDelete?.previewUrl) {
      try {
        URL.revokeObjectURL(docToDelete.previewUrl);
        createdUrlsRef.current.delete(docToDelete.previewUrl);
      } catch {
        // ignore
      }
    }

    try {
      await documentService.deleteDocument(documentId);
    } catch {
      // offline fallback
    }

    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    if (activePreviewDoc?.id === documentId) setActivePreviewDoc(null);
    if (activeVersionDoc?.id === documentId) setActiveVersionDoc(null);
    setActiveDeleteDoc(null);

    toast.success(`"${docToDelete?.name || 'Document'}" permanently removed.`);
  };

  /**
   * Designate resume as user's primary master resume
   */
  const setPrimaryResume = async (documentId) => {
    try {
      await documentService.setPrimaryResume(documentId);
    } catch {
      // offline fallback
    }

    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        isPrimary: doc.id === documentId,
      }))
    );
    toast.success('Primary resume updated successfully.');
  };

  /**
   * Restore a historical version without silent overwrite
   */
  const restoreVersion = (documentId, versionNumber) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentId) return doc;
        const targetVersion = doc.versions.find((v) => v.versionNumber === versionNumber);
        if (!targetVersion) return doc;

        const nextVersionNumber = doc.version + 1;
        const updatedVersions = [
          {
            versionId: `ver-${doc.id}-${nextVersionNumber}`,
            versionNumber: nextVersionNumber,
            name: `${doc.name} (v${nextVersionNumber}.0)`,
            updatedAt: new Date().toISOString(),
            description: `Restored from version ${targetVersion.versionNumber} (${targetVersion.description})`,
            source: 'Version Restore',
            fileSize: targetVersion.fileSize,
            careerTrackId: targetVersion.careerTrackId,
          },
          ...doc.versions,
        ];

        const restoredDoc = {
          ...doc,
          version: nextVersionNumber,
          fileSize: targetVersion.fileSize,
          careerTrackId: targetVersion.careerTrackId,
          updatedAt: new Date().toISOString(),
          versions: updatedVersions,
        };

        if (activeVersionDoc?.id === documentId) setActiveVersionDoc(restoredDoc);
        if (activePreviewDoc?.id === documentId) setActivePreviewDoc(restoredDoc);
        return restoredDoc;
      })
    );

    toast.success(`Successfully rolled back to version ${versionNumber}. New version recorded.`);
  };

  /**
   * Download document trigger
   */
  const downloadDocument = (doc) => {
    documentService.downloadDocument(doc);
    toast.info(`Downloading "${doc.originalFilename}"...`);
  };

  /**
   * Filtered and sorted documents list
   */
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = doc.name.toLowerCase().includes(q);
          const matchesOrig = doc.originalFilename.toLowerCase().includes(q);
          const matchesTrack = doc.careerTrackName.toLowerCase().includes(q);
          if (!matchesName && !matchesOrig && !matchesTrack) return false;
        }

        // Track filter
        if (trackFilter !== 'all' && doc.careerTrackId !== trackFilter) {
          return false;
        }

        // Type filter
        if (typeFilter !== 'all' && doc.fileExtension.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && doc.processingStatus !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent_upload') {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        }
        if (sortBy === 'recent_update') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'alphabetical') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'file_size') {
          return b.fileSize - a.fileSize;
        }
        return 0;
      });
  }, [documents, searchQuery, trackFilter, typeFilter, statusFilter, sortBy]);

  /**
   * KPI Metrics calculation
   */
  const metrics = useMemo(() => {
    const total = documents.length;
    const uniqueTracks = new Set(documents.map((d) => d.careerTrackId)).size;
    const processed = documents.filter((d) => d.processingStatus === DOCUMENT_STATUS.PROCESSED).length;
    const processing = documents.filter((d) => d.processingStatus === DOCUMENT_STATUS.PROCESSING).length;

    // Latest update
    const sortedByUpdate = [...documents].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const lastUpdated = sortedByUpdate[0]?.updatedAt || null;

    return {
      total,
      uniqueTracks,
      processed,
      processing,
      lastUpdated,
    };
  }, [documents]);

  const value = {
    documents,
    filteredDocuments,
    availableTracks,
    metrics,
    // Filters & Sorting
    searchQuery,
    setSearchQuery,
    trackFilter,
    setTrackFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    // Operations
    uploadDocuments,
    renameDocument,
    updateDocumentTrack,
    deleteDocument,
    restoreVersion,
    downloadDocument,
    setPrimaryResume,
    validateDocumentFile,
    // Modal states
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
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
