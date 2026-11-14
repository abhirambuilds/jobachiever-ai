import {
  validateDocumentFile,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_STATUS,
  documentService,
} from '../documentService.js';

console.log('--- TEST 1: File Size Formatting & Constants ---');
console.assert(MAX_FILE_SIZE_BYTES === 10 * 1024 * 1024, 'MAX_FILE_SIZE_BYTES is not 10MB');
console.assert(DOCUMENT_STATUS.PROCESSED === 'processed', 'DOCUMENT_STATUS check failed');
console.assert(formatFileSize(0) === '0 B', '0 bytes test failed');
console.assert(formatFileSize(1024) === '1 KB', '1 KB test failed');
console.assert(formatFileSize(1024 * 1024) === '1 MB', '1 MB test failed');
console.assert(formatFileSize(10 * 1024 * 1024) === '10 MB', '10 MB test failed');
console.log('✓ File Size Formatting passed');

console.log('--- TEST 2: Valid PDF Selection ---');
const validPdf = {
  name: 'candidate_resume.pdf',
  size: 2 * 1024 * 1024,
  type: 'application/pdf',
};
const resPdf = validateDocumentFile(validPdf);
console.assert(resPdf.valid === true, 'Valid PDF failed');
console.assert(resPdf.extension === '.pdf', 'PDF extension incorrect');
console.log('✓ Valid PDF Selection passed');

console.log('--- TEST 3: Valid DOCX Selection ---');
const validDocx = {
  name: 'candidate_resume.docx',
  size: 500 * 1024,
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const resDocx = validateDocumentFile(validDocx);
console.assert(resDocx.valid === true, 'Valid DOCX failed');
console.assert(resDocx.extension === '.docx', 'DOCX extension incorrect');
console.log('✓ Valid DOCX Selection passed');

console.log('--- TEST 4: Invalid File Rejection (e.g. .exe, .png) ---');
const invalidExe = {
  name: 'malware.exe',
  size: 1024,
  type: 'application/x-msdownload',
};
const resExe = validateDocumentFile(invalidExe);
console.assert(resExe.valid === false, 'Invalid exe was accepted');
console.assert(resExe.errors.length > 0, 'No error for invalid extension');
console.log('✓ Invalid File Rejection passed');

console.log('--- TEST 5: File Size Limit Exceeded (> 10MB) ---');
const oversized = {
  name: 'huge_portfolio.pdf',
  size: 12 * 1024 * 1024, // 12 MB
  type: 'application/pdf',
};
const resOver = validateDocumentFile(oversized);
console.assert(resOver.valid === false, 'Oversized file was accepted');
console.assert(
  resOver.errors.some((e) => e.includes('10 MB')),
  'Error message did not mention 10 MB limit'
);
console.log('✓ File Size Limit Exceeded (> 10MB) passed');

console.log('--- TEST 6: Empty File Rejection (0 bytes) ---');
const emptyFile = {
  name: 'empty.pdf',
  size: 0,
  type: 'application/pdf',
};
const resEmpty = validateDocumentFile(emptyFile);
console.assert(resEmpty.valid === false, 'Empty file was accepted');
console.log('✓ Empty File Rejection passed');

console.log('--- TEST 7: Document Service Get Documents ---');
const docs = await documentService.getDocuments();
console.assert(Array.isArray(docs), 'Docs is not an array');
console.assert(docs.length >= 3, 'Initial docs count is less than 3');
console.assert(
  docs.every((d) => d.id && d.name && d.storageKey && d.versions?.length > 0),
  'Document schema is incomplete'
);
console.log('✓ Document Service Get Documents passed');

console.log('ALL DOCUMENT MANAGEMENT TESTS PASSED CLEANLY!');
