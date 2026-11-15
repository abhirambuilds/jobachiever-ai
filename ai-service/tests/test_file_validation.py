import io
import pytest
import zipfile
from fastapi import HTTPException

from app.utils.file_validation import (
    validate_uploaded_document,
    sanitize_filename,
    PDF_MAGIC_BYTES,
    ZIP_MAGIC_BYTES,
)
from tests.conftest import create_synthetic_pdf, create_synthetic_docx


def test_sanitize_filename():
    """Sanitize filename strips path traversal characters and dangerous elements."""
    assert sanitize_filename("../../etc/passwd/resume.pdf") == "resume.pdf"
    assert sanitize_filename("..\\..\\windows\\system32\\cv.docx") == "cv.docx"
    assert sanitize_filename("my?special:resume<1>.pdf") == "myspecialresume1.pdf"
    assert sanitize_filename("") == "document.pdf"


def test_validate_valid_pdf():
    """Valid PDF passes validation and returns structured result with checksum."""
    pdf_bytes = create_synthetic_pdf(["John Doe", "Software Engineer"])
    res = validate_uploaded_document(
        file_bytes=pdf_bytes,
        filename="john_resume.pdf",
        declared_content_type="application/pdf"
    )
    assert res.filename == "john_resume.pdf"
    assert res.extension == "pdf"
    assert res.mime_type == "application/pdf"
    assert res.file_size_bytes == len(pdf_bytes)
    assert len(res.sha256_checksum) == 64


def test_validate_valid_docx():
    """Valid DOCX passes validation with OpenXML structure verified."""
    docx_bytes = create_synthetic_docx(paragraphs=[("Jane Doe", "Heading 1"), ("Experience", "Normal")])
    res = validate_uploaded_document(
        file_bytes=docx_bytes,
        filename="jane_resume.docx",
        declared_content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert res.filename == "jane_resume.docx"
    assert res.extension == "docx"
    assert res.mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert res.file_size_bytes == len(docx_bytes)


def test_empty_document_rejected():
    """Empty 0-byte document is rejected with 400 Bad Request."""
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(b"", "empty.pdf")
    assert exc_info.value.status_code == 400
    assert "empty" in exc_info.value.detail.lower()


def test_oversized_document_rejected():
    """Document exceeding max size limit is rejected with 400 Bad Request."""
    dummy_bytes = b"%PDF-" + b"0" * 100
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(dummy_bytes, "large.pdf", max_size_bytes=50)
    assert exc_info.value.status_code == 400
    assert "exceeds maximum limit" in exc_info.value.detail.lower()


def test_unsupported_file_extension_rejected():
    """Unsupported extension (.txt, .exe, .png) is rejected with 400 Bad Request."""
    for bad_name in ["resume.txt", "payload.exe", "image.png", "archive.zip"]:
        with pytest.raises(HTTPException) as exc_info:
            validate_uploaded_document(b"dummy data", bad_name)
        assert exc_info.value.status_code == 400
        assert "unsupported file format" in exc_info.value.detail.lower()


def test_mime_mismatch_rejected():
    """Mismatched declared MIME type is rejected."""
    pdf_bytes = create_synthetic_pdf(["Line 1"])
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(
            file_bytes=pdf_bytes,
            filename="document.pdf",
            declared_content_type="image/jpeg"
        )
    assert exc_info.value.status_code == 400
    assert "mime type" in exc_info.value.detail.lower()


def test_pdf_magic_bytes_signature_mismatch_rejected():
    """File named .pdf without %PDF- magic bytes is rejected."""
    fake_pdf = b"NOT_A_PDF_CONTENT_HERE"
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(fake_pdf, "fake.pdf")
    assert exc_info.value.status_code == 400
    assert "file signature mismatch" in exc_info.value.detail.lower()


def test_docx_magic_bytes_signature_mismatch_rejected():
    """File named .docx without PK magic bytes is rejected."""
    fake_docx = b"NOT_A_ZIP_CONTENT_HERE"
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(fake_docx, "fake.docx")
    assert exc_info.value.status_code == 400
    assert "file signature mismatch" in exc_info.value.detail.lower()


def test_docx_zip_slip_rejected():
    """DOCX containing Zip Slip path traversal entries is rejected immediately."""
    bio = io.BytesIO()
    with zipfile.ZipFile(bio, "w") as zf:
        zf.writestr("../../evil.sh", "echo evil")
        zf.writestr("word/document.xml", "<document/>")
    corrupt_docx = bio.getvalue()

    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(corrupt_docx, "malicious.docx")
    assert exc_info.value.status_code == 400
    assert "path traversal" in exc_info.value.detail.lower()


def test_docx_missing_word_structure_rejected():
    """ZIP file renamed as .docx but missing Word XML parts is rejected."""
    bio = io.BytesIO()
    with zipfile.ZipFile(bio, "w") as zf:
        zf.writestr("random.txt", "hello world")
    bad_docx = bio.getvalue()

    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_document(bad_docx, "invalid.docx")
    assert exc_info.value.status_code == 400
    assert "required word processing xml parts" in exc_info.value.detail.lower()
