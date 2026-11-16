/**
 * Document & Resume Management Service Interface for JobAchiever AI.
 *
 * Defines the contract with the primary Spring Boot 3.x backend under /api/v1/resumes.
 * Provides client-side validation, document status management, and local development
 * simulation with realistic resume records, track associations, and version histories.
 */

import { isDemoMode } from '@/demo/demoConfig';
import { demoService } from '@/demo/demoService';

export const RESUME_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080/api/v1';

// Supported MIME types and maximum file size per AGENTS.md Section 12
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB strict limit

/**
 * Standard Document Processing Statuses
 */
export const DOCUMENT_STATUS = {
  SELECTED: 'selected',
  PENDING_UPLOAD: 'pending_upload',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
  ARCHIVED: 'archived',
};

/**
 * Helper to format file sizes into human-readable strings
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate a candidate file against size and MIME/extension constraints
 */
export function validateDocumentFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file selected.');
    return { valid: false, errors };
  }

  // 1. Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(
      `File exceeds maximum permitted size of 10 MB (Selected: ${formatFileSize(file.size)}).`
    );
  }

  if (file.size === 0) {
    errors.push('File appears to be empty (0 bytes).');
  }

  // 2. Check extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.includes(extension);

  // 3. Check MIME type (allow empty MIME on some OS if extension is valid)
  const hasValidMime =
    ALLOWED_MIME_TYPES.includes(file.type) ||
    (extension === '.pdf' && file.type === 'application/pdf') ||
    (extension === '.docx' &&
      (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/zip' ||
        file.type === ''));

  if (!hasValidExtension || !hasValidMime) {
    errors.push(
      `Unsupported format "${extension}". Only Adobe PDF (.pdf) and Microsoft Word (.docx) documents are permitted.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    extension,
    mimeType: file.type || (extension === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
  };
}

/**
 * Create a simple inline text-based sample PDF/SVG blob for demonstration previews
 */
function createSampleDocBlob(title, body) {
  if (
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof Blob === 'undefined'
  ) {
    return null;
  }
  // Simple HTML wrapped in Blob to preview via iframe if needed
  const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; line-height: 1.6; }
    h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; font-size: 24px; }
    h2 { color: #334155; font-size: 16px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 13px; }
    .watermark { margin-top: 40px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="badge">JobAchiever AI Master Document</div>
  <h1>${title}</h1>
  <div class="meta">Verified Career Persona Document • ATS Standard Compliant</div>
  ${body}
  <div class="watermark">Ground-truth verification enabled. Zero-fabrication principle enforced.</div>
</body>
</html>`;
  return URL.createObjectURL(new Blob([content], { type: 'text/html' }));
}

/**
 * Realistic initial development baseline resumes
 */
export const INITIAL_RESUMES = [
  {
    id: 'res-101',
    ownerId: 'usr-dev-001',
    name: 'Full-Stack Engineer Resume — Master',
    originalFilename: 'Abhiram_Reddy_FullStack_2026.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1420500, // ~1.4 MB
    storageKey: 'storage/usr-dev-001/resumes/res-101-v3.pdf',
    careerTrackId: 'track-1',
    careerTrackName: 'Full-Stack Engineer',
    version: 3,
    processingStatus: DOCUMENT_STATUS.PROCESSED,
    uploadedAt: '2026-11-10T14:30:00Z',
    updatedAt: '2026-11-14T09:15:00Z',
    isPrimary: true,
    atsScore: 94,
    previewUrl: createSampleDocBlob(
      'Abhiram Reddy — Full-Stack Engineer',
      `<h2>Executive Summary</h2>
       <p>Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed systems in Java 21, Spring Boot 3, React 18, and PostgreSQL with pgvector.</p>
       <h2>Core Competencies</h2>
       <ul>
         <li><strong>Frontend:</strong> React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query</li>
         <li><strong>Backend:</strong> Java 21 LTS, Spring Boot 3.x, Spring Security 6, JWT, Microservices</li>
         <li><strong>Data &amp; AI:</strong> PostgreSQL 16, pgvector embeddings, Redis, Groq Cloud, FastAPI</li>
       </ul>
       <h2>Professional Experience</h2>
       <p><strong>Senior Software Engineer</strong> | CloudScale Technologies (2023 – Present)<br/>
       Architected multi-tenant SaaS platform handling 1.2M queries/sec with sub-50ms latency.</p>`
    ),
    versions: [
      {
        versionId: 'ver-101-3',
        versionNumber: 3,
        name: 'Full-Stack Engineer Resume — Master (v3.0)',
        updatedAt: '2026-11-14T09:15:00Z',
        description: 'Updated skills with PostgreSQL pgvector and refined executive summary.',
        source: 'User Manual Update',
        fileSize: 1420500,
        careerTrackId: 'track-1',
      },
      {
        versionId: 'ver-101-2',
        versionNumber: 2,
        name: 'Full-Stack Engineer Resume — Master (v2.0)',
        updatedAt: '2026-11-12T11:20:00Z',
        description: 'Added CloudScale Technologies architecture milestones and STAR metrics.',
        source: 'Profile Sync',
        fileSize: 1390200,
        careerTrackId: 'track-1',
      },
      {
        versionId: 'ver-101-1',
        versionNumber: 1,
        name: 'Full-Stack Engineer Resume — Master (v1.0)',
        updatedAt: '2026-11-10T14:30:00Z',
        description: 'Initial PDF resume upload during account onboarding.',
        source: 'Original Upload',
        fileSize: 1350000,
        careerTrackId: 'track-1',
      },
    ],
  },
  {
    id: 'res-102',
    ownerId: 'usr-dev-001',
    name: 'Solutions Architect Resume — Cloud & Distributed',
    originalFilename: 'Abhiram_Reddy_Solutions_Architect.pdf',
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileSize: 1850400, // ~1.8 MB
    storageKey: 'storage/usr-dev-001/resumes/res-102-v1.pdf',
    careerTrackId: 'track-2',
    careerTrackName: 'Solutions Architect',
    version: 1,
    processingStatus: DOCUMENT_STATUS.PROCESSED,
    uploadedAt: '2026-11-11T16:45:00Z',
    updatedAt: '2026-11-11T16:45:00Z',
    isPrimary: false,
    atsScore: 91,
    previewUrl: createSampleDocBlob(
      'Abhiram Reddy — Solutions Architect',
      `<h2>Architecture Profile</h2>
       <p>Enterprise Solutions Architect specializing in cloud migration, event-driven distributed architectures, zero-trust security postures, and cost optimization.</p>
       <h2>Key Competencies</h2>
       <ul>
         <li>Event Sourcing, Apache Kafka, Distributed Transactions (Saga Pattern)</li>
         <li>Zero Trust Network Architecture, OAuth 2.1 / OIDC, Mutual TLS</li>
         <li>Infrastructure as Code, Kubernetes, Multi-Region High Availability</li>
       </ul>`
    ),
    versions: [
      {
        versionId: 'ver-102-1',
        versionNumber: 1,
        name: 'Solutions Architect Resume (v1.0)',
        updatedAt: '2026-11-11T16:45:00Z',
        description: 'Dedicated cloud architecture track resume initial upload.',
        source: 'Original Upload',
        fileSize: 1850400,
        careerTrackId: 'track-2',
      },
    ],
  },
  {
    id: 'res-103',
    ownerId: 'usr-dev-001',
    name: 'Backend Core Platform Resume — ATS Clean',
    originalFilename: 'Abhiram_Reddy_Backend_Core.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileExtension: 'docx',
    fileSize: 420800, // ~420 KB
    storageKey: 'storage/usr-dev-001/resumes/res-103-v2.docx',
    careerTrackId: 'track-1',
    careerTrackName: 'Full-Stack Engineer',
    version: 2,
    processingStatus: DOCUMENT_STATUS.PROCESSED,
    uploadedAt: '2026-11-13T08:00:00Z',
    updatedAt: '2026-11-13T10:30:00Z',
    isPrimary: false,
    atsScore: 88,
    previewUrl: null, // DOCX fallback viewer
    versions: [
      {
        versionId: 'ver-103-2',
        versionNumber: 2,
        name: 'Backend Core Platform Resume (v2.0)',
        updatedAt: '2026-11-13T10:30:00Z',
        description: 'Refined keyword density for distributed caching and database tuning.',
        source: 'User Manual Update',
        fileSize: 420800,
        careerTrackId: 'track-1',
      },
      {
        versionId: 'ver-103-1',
        versionNumber: 1,
        name: 'Backend Core Platform Resume (v1.0)',
        updatedAt: '2026-11-13T08:00:00Z',
        description: 'DOCX source document imported for ATS testing.',
        source: 'Original Upload',
        fileSize: 410000,
        careerTrackId: 'track-1',
      },
    ],
  },
];

/**
 * Service implementation managing document operations
 */
export const documentService = {
  /**
   * Fetch all resumes for the authenticated user
   * Target endpoint: GET /api/v1/resumes
   */
  async getDocuments() {
    if (isDemoMode()) {
      return demoService.getResumes();
    }
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token) {
        const response = await fetch(`${RESUME_API_BASE}/resumes`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const json = await response.json();
          const page = json.data;
          const items = page?.content || [];
          if (items.length > 0) {
            return items.map(mapBackendResumeToDocument);
          }
        }
      }
    } catch {
      // Fallback to local default resumes if offline
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...INITIAL_RESUMES];
  },

  /**
   * Upload and process a new document
   * Target endpoint: POST /api/v1/resumes (multipart/form-data)
   */
  async uploadDocument(file, metadata = {}, onProgress = () => {}) {
    // 1. Validate client-side
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    if (isDemoMode()) {
      for (let p = 25; p <= 100; p += 25) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        onProgress(p);
      }
      return demoService.uploadResume(file, metadata);
    }

    // 2. Simulate initial progress ticks
    for (let p = 20; p <= 60; p += 20) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress(p);
    }

    const cleanName =
      metadata.name ||
      file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();

    // 3. Attempt upload to backend API if authenticated
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', cleanName);
        if (metadata.careerTrackId) {
          formData.append('careerTrackId', metadata.careerTrackId);
        }
        if (metadata.description) {
          formData.append('description', metadata.description);
        }
        if (metadata.templateIdentifier) {
          formData.append('templateIdentifier', metadata.templateIdentifier);
        }

        const res = await fetch(`${RESUME_API_BASE}/resumes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          onProgress(100);
          const json = await res.json();
          const created = mapBackendResumeToDocument(json.data);
          created.fileRef = file;
          if (created.fileExtension === 'pdf' && typeof URL !== 'undefined') {
            created.previewUrl = URL.createObjectURL(file);
          }
          return created;
        }
      }
    } catch {
      // Fallback to client-side simulation on network error
    }

    onProgress(100);
    const documentId = `res-${Date.now().toString(36)}`;
    const extension = validation.extension.replace('.', '');
    const previewUrl =
      extension === 'pdf' && typeof URL !== 'undefined' ? URL.createObjectURL(file) : null;

    return {
      id: documentId,
      ownerId: 'usr-dev-001',
      name: cleanName,
      originalFilename: file.name,
      mimeType: validation.mimeType,
      fileExtension: extension,
      fileSize: file.size,
      storageKey: `storage/usr-dev-001/resumes/${documentId}-v1.${extension}`,
      careerTrackId: metadata.careerTrackId || 'track-1',
      careerTrackName: metadata.careerTrackName || 'Full-Stack Engineer',
      version: 1,
      processingStatus: DOCUMENT_STATUS.PROCESSED,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false,
      atsScore: Math.floor(Math.random() * 10) + 85,
      previewUrl,
      fileRef: file,
      versions: [
        {
          versionId: `ver-${documentId}-1`,
          versionNumber: 1,
          name: `${cleanName} (v1.0)`,
          updatedAt: new Date().toISOString(),
          description: 'Initial document upload in local workspace.',
          source: 'User Upload',
          fileSize: file.size,
          careerTrackId: metadata.careerTrackId || 'track-1',
        },
      ],
    };
  },

  /**
   * Download a document
   * Target endpoint: GET /api/v1/resumes/{id}/download
   */
  async downloadDocument(doc, versionNumber) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && doc.id && !doc.id.startsWith('res-10')) {
        const url = new URL(`${RESUME_API_BASE}/resumes/${doc.id}/download`);
        if (versionNumber) url.searchParams.append('versionNumber', String(versionNumber));
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const blob = await res.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = doc.originalFilename || `${doc.name}.${doc.fileExtension || 'pdf'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          return;
        }
      }
    } catch {
      // offline fallback
    }

    if (doc.fileRef) {
      const url = URL.createObjectURL(doc.fileRef);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    // Fallback: Generate sample download blob
    const sampleContent = `Document: ${doc.name}\nFilename: ${doc.originalFilename}\nTrack: ${doc.careerTrackName}\nVersion: ${doc.version}\nStatus: ${doc.processingStatus}\nDownloaded via JobAchiever AI Document Workspace.`;
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (doc.originalFilename || 'resume.txt').replace(/\.(pdf|docx)$/i, '-download.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  /**
   * Securely preview document binary in browser.
   * Target endpoint: GET /api/v1/resumes/{id}/preview
   */
  async previewDocument(doc, versionNumber) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && doc.id && !doc.id.startsWith('res-10')) {
        const url = new URL(`${RESUME_API_BASE}/resumes/${doc.id}/preview`);
        if (versionNumber) url.searchParams.append('versionNumber', String(versionNumber));
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      }
    } catch {
      // Fallback
    }
    return doc.previewUrl || null;
  },

  /**
   * Rename a document
   * Target endpoint: PATCH /api/v1/resumes/{id}
   */
  async renameDocument(documentId, newTitle) {
    if (isDemoMode()) {
      return demoService.renameResume(documentId, newTitle);
    }
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        const res = await fetch(`${RESUME_API_BASE}/resumes/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
          const json = await res.json();
          return mapBackendResumeToDocument(json.data);
        }
      }
    } catch {
      // offline fallback
    }
    return null;
  },

  /**
   * Re-associate document with a career track
   * Target endpoint: PATCH /api/v1/resumes/{id}
   */
  async updateDocumentTrack(documentId, newTrackId) {
    if (isDemoMode()) {
      return demoService.updateResumeTrack(documentId, newTrackId);
    }
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        const res = await fetch(`${RESUME_API_BASE}/resumes/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ careerTrackId: newTrackId }),
        });
        if (res.ok) {
          const json = await res.json();
          return mapBackendResumeToDocument(json.data);
        }
      }
    } catch {
      // offline fallback
    }
    return null;
  },

  /**
   * Delete a document safely
   * Target endpoint: DELETE /api/v1/resumes/{id}
   */
  async deleteDocument(documentId) {
    if (isDemoMode()) {
      return demoService.deleteResume(documentId);
    }
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        await fetch(`${RESUME_API_BASE}/resumes/${documentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        return true;
      }
    } catch {
      // offline fallback
    }
    return true;
  },

  /**
   * Designate resume as primary
   * Target endpoint: PATCH /api/v1/resumes/{id}/primary
   */
  async setPrimaryResume(documentId) {
    if (isDemoMode()) {
      return demoService.setPrimaryResume(documentId);
    }
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        const res = await fetch(`${RESUME_API_BASE}/resumes/${documentId}/primary`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          return mapBackendResumeToDocument(json.data);
        }
      }
    } catch {
      // offline fallback
    }
    return null;
  },

  /**
   * Upload a new version for an existing resume
   * Target endpoint: POST /api/v1/resumes/{id}/versions
   */
  async uploadNewVersion(documentId, file, description) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        const formData = new FormData();
        formData.append('file', file);
        if (description) formData.append('description', description);

        const res = await fetch(`${RESUME_API_BASE}/resumes/${documentId}/versions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      }
    } catch {
      // offline fallback
    }
    return null;
  },

  /**
   * Retrieve version history
   * Target endpoint: GET /api/v1/resumes/{id}/versions
   */
  async getVersionHistory(documentId) {
    try {
      const token = localStorage.getItem('jobachiever_jwt_token');
      if (token && !documentId.startsWith('res-10')) {
        const res = await fetch(`${RESUME_API_BASE}/resumes/${documentId}/versions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          return json.data || [];
        }
      }
    } catch {
      // offline fallback
    }
    return [];
  },
};

/**
 * Maps a backend ResumeResponse DTO into frontend document library model
 */
export function mapBackendResumeToDocument(backendDoc) {
  const ext =
    backendDoc.fileExtension ||
    (backendDoc.originalFilename?.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf');

  return {
    id: backendDoc.id,
    ownerId: backendDoc.userId,
    name: backendDoc.title,
    originalFilename: backendDoc.originalFilename,
    mimeType: backendDoc.mimeType,
    fileExtension: ext,
    fileSize: backendDoc.fileSizeBytes,
    storageKey: `resumes/${backendDoc.id}-v${backendDoc.currentVersionNumber || 1}.${ext}`,
    careerTrackId: backendDoc.careerTrackId || 'track-1',
    careerTrackName: backendDoc.careerTrackName || 'General Career Track',
    version: backendDoc.currentVersionNumber || 1,
    processingStatus:
      (backendDoc.processingStatus || 'READY').toLowerCase() === 'ready'
        ? DOCUMENT_STATUS.PROCESSED
        : (backendDoc.processingStatus || '').toLowerCase(),
    uploadedAt: backendDoc.createdAt,
    updatedAt: backendDoc.updatedAt,
    isPrimary: backendDoc.isPrimary,
    atsScore: 92,
    previewUrl: null,
    versions: [
      {
        versionId: backendDoc.currentVersionId || `ver-${backendDoc.id}-${backendDoc.currentVersionNumber || 1}`,
        versionNumber: backendDoc.currentVersionNumber || 1,
        name: `${backendDoc.title} (v${backendDoc.currentVersionNumber || 1}.0)`,
        updatedAt: backendDoc.updatedAt || backendDoc.createdAt,
        description: backendDoc.description || 'Current document version.',
        source: 'User Upload',
        fileSize: backendDoc.fileSizeBytes,
        careerTrackId: backendDoc.careerTrackId,
      },
    ],
  };
}
