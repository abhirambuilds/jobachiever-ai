import pytest
from app.schemas.common import VerificationStatus
from app.services.parsing.resume_parser import parse_resume_document
from tests.conftest import (
    SAMPLE_RESUME_LINES,
    create_synthetic_pdf,
    create_synthetic_docx,
)


def test_parse_synthetic_pdf_resume():
    """End-to-end parser parses synthetic PDF into structured ParsedResumeResponse."""
    pdf_bytes = create_synthetic_pdf(SAMPLE_RESUME_LINES)

    res = parse_resume_document(
        file_bytes=pdf_bytes,
        filename="alex_mercer.pdf",
        file_type="pdf"
    )

    # Personal Information
    assert res.personal_information.name == "Alex Mercer"
    assert res.personal_information.email == "alex.mercer@example.com"
    assert "555" in res.personal_information.phone
    assert res.personal_information.linkedin == "https://linkedin.com/in/alexmercer"
    assert res.personal_information.github == "https://github.com/alexmercer"

    # Summary
    assert res.summary is not None
    assert "Full-Stack Engineer" in res.summary

    # Education
    assert len(res.education) >= 1
    assert "Berkeley" in res.education[0].institution

    # Skills
    assert len(res.skills) >= 4
    skill_names = [s.name.lower() for s in res.skills]
    assert "python" in skill_names
    assert "java" in skill_names

    # Experience
    assert len(res.experience) >= 1
    assert any("Acme" in (exp.company or "") for exp in res.experience)

    # Projects
    assert len(res.projects) >= 1

    # Certifications
    assert len(res.certifications) >= 1
    assert "AWS" in res.certifications[0].name

    # Metadata & Verification
    assert res.metadata.filename == "alex_mercer.pdf"
    assert res.metadata.file_type == "pdf"
    assert res.metadata.page_count >= 1
    assert len(res.raw_text) > 50

    # Ensure all items carry UNVERIFIED status
    assert res.personal_information.verification_status == VerificationStatus.UNVERIFIED
    for edu in res.education:
        assert edu.verification_status == VerificationStatus.UNVERIFIED
    for skill in res.skills:
        assert skill.verification_status == VerificationStatus.UNVERIFIED
    for exp in res.experience:
        assert exp.verification_status == VerificationStatus.UNVERIFIED


def test_parse_synthetic_docx_resume():
    """End-to-end parser parses synthetic DOCX with headings and tables."""
    paragraphs = [
        ("Taylor Morgan", "Heading 1"),
        ("taylor.morgan@example.org | (555) 765-4321 | Los Angeles, CA", "Normal"),
        ("Professional Summary", "Heading 2"),
        ("Systems Security Engineer with deep expertise in defensive operations.", "Normal"),
        ("Education", "Heading 2"),
        ("UCLA - B.S. in Cybersecurity, 2018 - 2022", "Normal"),
        ("Work Experience", "Heading 2"),
        ("Security Lead | Tech Defenders", "Normal"),
        ("2022 - Present", "Normal"),
        ("• Hardened enterprise endpoints and prevented data exfiltration.", "Normal"),
        ("Certifications", "Heading 2"),
        ("CISSP - (ISC)², 2023", "Normal"),
        ("Technical Skills", "Heading 2")
    ]
    tables = [
        [
            ["Category", "Skills"],
            ["Languages", "Python, Bash, C++"],
            ["Security", "Wireshark, SIEM, Splunk"]
        ]
    ]

    docx_bytes = create_synthetic_docx(paragraphs=paragraphs, tables=tables)

    res = parse_resume_document(
        file_bytes=docx_bytes,
        filename="taylor_morgan.docx",
        file_type="docx"
    )

    assert res.personal_information.name == "Taylor Morgan"
    assert res.personal_information.email == "taylor.morgan@example.org"
    assert "Cybersecurity" in (res.education[0].field_of_study or res.education[0].original_text or "")
    assert len(res.skills) >= 2
    assert res.metadata.file_type == "docx"
    assert res.metadata.extraction_method == "python-docx"


def test_parse_unsupported_file_type_raises_value_error():
    """Unsupported file type raises ValueError."""
    with pytest.raises(ValueError) as exc_info:
        parse_resume_document(
            file_bytes=b"dummy",
            filename="file.txt",
            file_type="txt"
        )
    assert "unsupported file type" in str(exc_info.value).lower()
