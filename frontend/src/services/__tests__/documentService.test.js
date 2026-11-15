import { describe, it, expect } from 'vitest';
import {
  validateDocumentFile,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_STATUS,
  documentService,
} from '../documentService.js';

describe('Document Service Tests', () => {
  it('formats file sizes and verifies constants', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    expect(DOCUMENT_STATUS.PROCESSED).toBe('processed');
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10 MB');
  });

  it('validates a correct PDF file', () => {
    const validPdf = {
      name: 'candidate_resume.pdf',
      size: 2 * 1024 * 1024,
      type: 'application/pdf',
    };
    const resPdf = validateDocumentFile(validPdf);
    expect(resPdf.valid).toBe(true);
    expect(resPdf.extension).toBe('.pdf');
  });

  it('validates a correct DOCX file', () => {
    const validDocx = {
      name: 'candidate_resume.docx',
      size: 500 * 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const resDocx = validateDocumentFile(validDocx);
    expect(resDocx.valid).toBe(true);
    expect(resDocx.extension).toBe('.docx');
  });

  it('rejects invalid file types like .exe', () => {
    const invalidExe = {
      name: 'malware.exe',
      size: 1024,
      type: 'application/x-msdownload',
    };
    const resExe = validateDocumentFile(invalidExe);
    expect(resExe.valid).toBe(false);
    expect(resExe.errors.length).toBeGreaterThan(0);
  });

  it('rejects files exceeding 10MB limit', () => {
    const oversized = {
      name: 'huge_portfolio.pdf',
      size: 12 * 1024 * 1024,
      type: 'application/pdf',
    };
    const resOver = validateDocumentFile(oversized);
    expect(resOver.valid).toBe(false);
    expect(resOver.errors.some((e) => e.includes('10 MB'))).toBe(true);
  });

  it('rejects empty 0-byte files', () => {
    const emptyFile = {
      name: 'empty.pdf',
      size: 0,
      type: 'application/pdf',
    };
    const resEmpty = validateDocumentFile(emptyFile);
    expect(resEmpty.valid).toBe(false);
  });

  it('retrieves documents list with complete schema', async () => {
    const docs = await documentService.getDocuments();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThanOrEqual(3);
    expect(
      docs.every((d) => d.id && d.name && d.storageKey && d.versions?.length > 0)
    ).toBe(true);
  });
});
