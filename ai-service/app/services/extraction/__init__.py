"""Document extraction services for PDF and DOCX files."""
from .pdf_extractor import extract_text_from_pdf, ExtractedDocument
from .docx_extractor import extract_text_from_docx

__all__ = ["extract_text_from_pdf", "extract_text_from_docx", "ExtractedDocument"]
