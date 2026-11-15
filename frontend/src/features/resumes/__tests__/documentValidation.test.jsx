import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { validateDocumentFile, mapBackendResumeToDocument } from '@/services/documentService';
import { Dropzone } from '../components/upload/Dropzone';

describe('Document Upload Validation & Dropzone', () => {
  describe('File Validation Constraints', () => {
    it('accepts valid PDF documents within size limits', () => {
      const file = {
        name: 'Jane_Doe_Resume_2026.pdf',
        size: 3 * 1024 * 1024,
        type: 'application/pdf',
      };
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.extension).toBe('.pdf');
    });

    it('accepts valid DOCX documents within size limits', () => {
      const file = {
        name: 'Jane_Doe_CV.docx',
        size: 1.5 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.extension).toBe('.docx');
    });

    it('rejects unsupported extensions and MIME types (.exe, .zip, .png)', () => {
      const dangerousFile = {
        name: 'payload.exe',
        size: 2048,
        type: 'application/x-msdownload',
      };
      const result = validateDocumentFile(dangerousFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('Unsupported format'))).toBe(true);
    });

    it('rejects files exceeding the strict 10MB limit', () => {
      const oversizedFile = {
        name: 'massive_portfolio.pdf',
        size: 11 * 1024 * 1024,
        type: 'application/pdf',
      };
      const result = validateDocumentFile(oversizedFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('10 MB'))).toBe(true);
    });

    it('rejects completely empty files (0 bytes)', () => {
      const emptyFile = {
        name: 'blank_document.pdf',
        size: 0,
        type: 'application/pdf',
      };
      const result = validateDocumentFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('0 bytes'))).toBe(true);
    });
  });

  describe('Backend DTO Mapping', () => {
    it('correctly maps backend ResumeResponse into frontend document model', () => {
      const backendDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '223e4567-e89b-12d3-a456-426614174000',
        careerTrackId: '323e4567-e89b-12d3-a456-426614174000',
        careerTrackName: 'Full-Stack Engineer',
        title: 'Master Architect Resume',
        description: 'Primary CV for distributed systems',
        documentType: 'UPLOADED',
        isPrimary: true,
        currentVersionNumber: 2,
        currentVersionId: '423e4567-e89b-12d3-a456-426614174000',
        originalFilename: 'Architect_Resume.pdf',
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        fileSizeBytes: 204800,
        sha256Checksum: 'abcdef1234567890',
        processingStatus: 'READY',
        createdAt: '2026-11-15T10:00:00Z',
        updatedAt: '2026-11-15T12:00:00Z',
      };

      const mapped = mapBackendResumeToDocument(backendDto);
      expect(mapped.id).toBe(backendDto.id);
      expect(mapped.name).toBe('Master Architect Resume');
      expect(mapped.isPrimary).toBe(true);
      expect(mapped.version).toBe(2);
      expect(mapped.fileExtension).toBe('pdf');
      expect(mapped.processingStatus).toBe('processed');
      expect(mapped.versions).toHaveLength(1);
      expect(mapped.versions[0].versionNumber).toBe(2);
    });
  });

  describe('Dropzone Component UI', () => {
    it('renders file constraints notice and upload trigger button', () => {
      const handleSelect = vi.fn();
      render(<Dropzone onFilesSelected={handleSelect} isUploading={false} />);

      expect(screen.getByText(/Maximum file size:/i)).toBeInTheDocument();
      expect(screen.getByText(/Drag and drop your resumes here/i)).toBeInTheDocument();
      expect(screen.getByText(/browse files/i)).toBeInTheDocument();
      expect(screen.getByText(/Adobe PDF/i)).toBeInTheDocument();
      expect(screen.getByText(/Microsoft Word/i)).toBeInTheDocument();
    });
  });
});
