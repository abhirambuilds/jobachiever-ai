import hashlib
import io
import os
import re
import zipfile
from dataclasses import dataclass
from typing import Set
from fastapi import HTTPException, UploadFile, status

# Magic Bytes Signatures
PDF_MAGIC_BYTES = b"%PDF-"
ZIP_MAGIC_BYTES = b"PK\x03\x04"

# Allowed Extensions
ALLOWED_EXTENSIONS: Set[str] = {".pdf", ".docx"}

# Whitelisted MIME Types
ALLOWED_PDF_MIMES: Set[str] = {
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "text/pdf",
    "application/octet-stream",  # Some clients incorrectly flag PDF as binary
}

ALLOWED_DOCX_MIMES: Set[str] = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
    "application/msword",
}


@dataclass
class FileValidationResult:
    """Holds sanitized attributes and raw bytes of a verified document upload."""
    filename: str
    extension: str
    mime_type: str
    file_size_bytes: int
    sha256_checksum: str
    raw_bytes: bytes


def sanitize_filename(filename: str) -> str:
    """Strip path traversal elements and hazardous characters from filename."""
    base = os.path.basename(filename)
    # Remove control characters and non-printable elements
    cleaned = re.sub(r'[\\/*?:"<>|]', "", base).strip()
    return cleaned or "document.pdf"


def validate_uploaded_document(
    file_bytes: bytes,
    filename: str,
    declared_content_type: str = "",
    max_size_bytes: int = 10 * 1024 * 1024
) -> FileValidationResult:
    """
    Validates uploaded resume bytes against defense-in-depth security criteria:
    - Empty content check
    - Maximum upload size
    - Allowed extension (.pdf, .docx)
    - Declared MIME type validation
    - Magic bytes signature matching
    - DOCX Zip Slip and archive structure integrity
    - SHA-256 fingerprinting
    """
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    file_size = len(file_bytes)
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({file_size} bytes) exceeds maximum limit of {max_size_bytes} bytes (10 MB)."
        )

    clean_filename = sanitize_filename(filename)
    _, ext = os.path.splitext(clean_filename)
    extension = ext.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{extension}'. Only PDF (.pdf) and Microsoft Word (.docx) files are supported."
        )

    # Validate MIME type if declared
    if declared_content_type:
        clean_mime = declared_content_type.split(";")[0].strip().lower()
        if extension == ".pdf" and clean_mime not in ALLOWED_PDF_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"MIME type '{declared_content_type}' does not match Adobe PDF document standard."
            )
        elif extension == ".docx" and clean_mime not in ALLOWED_DOCX_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"MIME type '{declared_content_type}' does not match Microsoft Word DOCX standard."
            )

    # Magic Bytes Signature Verification
    if extension == ".pdf":
        if len(file_bytes) < len(PDF_MAGIC_BYTES) or not file_bytes.startswith(PDF_MAGIC_BYTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File signature mismatch: File content does not match Adobe PDF format (%PDF-)."
            )
        canonical_mime = "application/pdf"

    elif extension == ".docx":
        if len(file_bytes) < len(ZIP_MAGIC_BYTES) or not file_bytes.startswith(ZIP_MAGIC_BYTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File signature mismatch: File content is not a valid Microsoft Word OpenXML archive (missing PK signature)."
            )

        # Inspect internal OpenXML structure and guard against Zip Slip
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
                namelist = zf.namelist()

                # Guard against Zip Slip traversal paths
                for entry_name in namelist:
                    if ".." in entry_name or entry_name.startswith("/") or entry_name.startswith("\\"):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Corrupt or malicious archive: Archive contains illegal path traversal references."
                        )

                # Ensure valid OpenXML structure
                has_doc_xml = any(name.lower() == "word/document.xml" for name in namelist)
                has_content_types = any(name.lower() == "[content_types].xml" for name in namelist)

                if not (has_doc_xml or has_content_types):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Malformed DOCX document: Archive does not contain required Word processing XML parts."
                    )
        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed DOCX document: File is corrupted or not a valid ZIP archive."
            )

        canonical_mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    # Compute SHA-256
    sha256 = hashlib.sha256(file_bytes).hexdigest()

    return FileValidationResult(
        filename=clean_filename,
        extension=extension.lstrip("."),
        mime_type=canonical_mime,
        file_size_bytes=file_size,
        sha256_checksum=sha256,
        raw_bytes=file_bytes
    )
