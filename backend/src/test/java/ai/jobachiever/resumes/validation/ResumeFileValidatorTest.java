package ai.jobachiever.resumes.validation;

import ai.jobachiever.resumes.exception.FileValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Resume File Validator Tests")
class ResumeFileValidatorTest {

    private ResumeFileValidator validator;

    @BeforeEach
    void setUp() {
        // 10 MB limit
        validator = new ResumeFileValidator(10 * 1024 * 1024);
    }

    private byte[] createSamplePdf() {
        return "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n".getBytes(StandardCharsets.UTF_8);
    }

    private byte[] createSampleDocx() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry entry1 = new ZipEntry("[Content_Types].xml");
            zos.putNextEntry(entry1);
            zos.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types></Types>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry entry2 = new ZipEntry("word/document.xml");
            zos.putNextEntry(entry2);
            zos.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:document></w:document>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    @Test
    @DisplayName("1. Upload valid PDF passes validation and extracts correct attributes")
    void uploadValidPdf() {
        byte[] pdfBytes = createSamplePdf();
        MockMultipartFile file = new MockMultipartFile(
                "file", "John_Doe_Resume.pdf", "application/pdf", pdfBytes
        );

        FileValidationResult result = validator.validate(file);

        assertThat(result).isNotNull();
        assertThat(result.originalFilename()).isEqualTo("John_Doe_Resume.pdf");
        assertThat(result.extension()).isEqualTo("pdf");
        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.fileSizeBytes()).isEqualTo(pdfBytes.length);
        assertThat(result.sha256Checksum()).hasSize(64);
    }

    @Test
    @DisplayName("2. Upload valid DOCX passes validation with internal structure check")
    void uploadValidDocx() throws IOException {
        byte[] docxBytes = createSampleDocx();
        MockMultipartFile file = new MockMultipartFile(
                "file", "Jane_Smith_CV.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                docxBytes
        );

        FileValidationResult result = validator.validate(file);

        assertThat(result).isNotNull();
        assertThat(result.originalFilename()).isEqualTo("Jane_Smith_CV.docx");
        assertThat(result.extension()).isEqualTo("docx");
        assertThat(result.mimeType()).isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(result.fileSizeBytes()).isEqualTo(docxBytes.length);
    }

    @Test
    @DisplayName("3. Reject unsupported file extension (.exe, .sh, .txt)")
    void rejectUnsupportedExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious_script.sh", "text/plain", "#!/bin/bash\necho bad".getBytes(StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("Unsupported file extension '.sh'");
    }

    @Test
    @DisplayName("4. Reject invalid or mismatched declared MIME type")
    void rejectInvalidMimeType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "image/png", createSamplePdf()
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("does not match PDF document");
    }

    @Test
    @DisplayName("5. Reject mismatched file signature (e.g. text file disguised as .pdf)")
    void rejectMismatchedFileSignature() {
        byte[] fakePdfBytes = "This is not a real PDF file".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake_resume.pdf", "application/pdf", fakePdfBytes
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("File signature mismatch");
    }

    @Test
    @DisplayName("6. Reject empty file (0 bytes)")
    void rejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty_resume.pdf", "application/pdf", new byte[0]
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("missing or empty");
    }

    @Test
    @DisplayName("7. Reject oversized file (> 10 MB)")
    void rejectOversizedFile() {
        // Create validator with tiny limit (100 bytes) for testing
        ResumeFileValidator smallValidator = new ResumeFileValidator(100);
        byte[] largeBytes = new byte[150];
        System.arraycopy("%PDF-".getBytes(StandardCharsets.UTF_8), 0, largeBytes, 0, 5);

        MockMultipartFile file = new MockMultipartFile(
                "file", "oversized.pdf", "application/pdf", largeBytes
        );

        assertThatThrownBy(() -> smallValidator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("exceeds the maximum allowed limit");
    }

    @Test
    @DisplayName("8. Verify SHA-256 checksum calculation accuracy")
    void verifySha256Checksum() throws Exception {
        byte[] pdfBytes = createSamplePdf();
        MockMultipartFile file = new MockMultipartFile(
                "file", "verified.pdf", "application/pdf", pdfBytes
        );

        FileValidationResult result = validator.validate(file);

        MessageDigest md = MessageDigest.getInstance("SHA-256");
        String expectedChecksum = HexFormat.of().formatHex(md.digest(pdfBytes));

        assertThat(result.sha256Checksum()).isEqualTo(expectedChecksum);
    }

    @Test
    @DisplayName("Defend against Zip Slip in malformed DOCX archive")
    void defendAgainstZipSlipInDocx() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry maliciousEntry = new ZipEntry("../../etc/passwd");
            zos.putNextEntry(maliciousEntry);
            zos.write("root:x:0:0:root:/root:/bin/bash".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        MockMultipartFile file = new MockMultipartFile(
                "file", "exploit.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                baos.toByteArray()
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("invalid archive entry path");
    }

    @Test
    @DisplayName("Reject zip file without required DOCX structure")
    void rejectZipWithoutDocxStructure() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry entry = new ZipEntry("random_image.jpg");
            zos.putNextEntry(entry);
            zos.write(new byte[]{0x01, 0x02});
            zos.closeEntry();
        }

        MockMultipartFile file = new MockMultipartFile(
                "file", "not_a_resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                baos.toByteArray()
        );

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("does not contain standard Word processing structures");
    }
}
