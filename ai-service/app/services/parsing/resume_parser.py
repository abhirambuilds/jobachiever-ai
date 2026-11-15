import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.schemas.common import ConfidenceLevel, VerificationStatus
from app.schemas.resume import (
    AchievementItem,
    CertificationItem,
    EducationItem,
    ExperienceItem,
    OtherSectionItem,
    ParsedResumeResponse,
    PersonalInfo,
    ProjectItem,
    PublicationItem,
    ResumeMetadata,
    SkillItem,
)
from app.services.extraction.docx_extractor import extract_text_from_docx
from app.services.extraction.pdf_extractor import extract_text_from_pdf, ExtractedDocument
from app.services.parsing.field_normalizer import FieldNormalizer
from app.services.parsing.section_detector import detect_sections, SectionType

logger = logging.getLogger(__name__)


def parse_resume_document(
    file_bytes: bytes,
    filename: str,
    file_type: str,
    sha256_checksum: Optional[str] = None
) -> ParsedResumeResponse:
    """
    End-to-end resume document parsing pipeline:
    1. Extracts raw textual content and document structure (PDF / DOCX).
    2. Segments text into semantic sections using heuristic boundary detection.
    3. Normalizes candidate contact, education, skills, work experience, projects, etc.
    4. Attaches extraction confidence, provenance records, and sets all verification states to UNVERIFIED.
    5. Preserves unclassified sections under other_sections without information loss.
    """
    clean_type = file_type.lower().lstrip(".")

    # 1. Extraction Phase
    if clean_type == "pdf":
        doc: ExtractedDocument = extract_text_from_pdf(file_bytes)
    elif clean_type == "docx":
        doc: ExtractedDocument = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type '{file_type}'. Supported: pdf, docx")

    # 2. Section Detection Phase
    sections = detect_sections(doc.raw_text)

    # 3. Field Extraction & Normalization Phase
    personal_info = PersonalInfo(verification_status=VerificationStatus.UNVERIFIED)
    summary: Optional[str] = None
    education: List[EducationItem] = []
    skills: List[SkillItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[AchievementItem] = []
    publications: List[PublicationItem] = []
    other_sections: List[OtherSectionItem] = []

    for section in sections:
        sec_type = section.section_type
        lines = section.lines

        if sec_type == SectionType.PERSONAL_INFO:
            extracted_contact = FieldNormalizer.extract_personal_info(lines)
            personal_info = extracted_contact

        elif sec_type == SectionType.SUMMARY:
            summary_content = section.content
            if summary_content:
                summary = summary_content

        elif sec_type == SectionType.EDUCATION:
            education.extend(FieldNormalizer.extract_education(lines))

        elif sec_type == SectionType.SKILLS:
            skills.extend(FieldNormalizer.extract_skills(lines))

        elif sec_type == SectionType.EXPERIENCE:
            experience.extend(FieldNormalizer.extract_experience(lines))

        elif sec_type == SectionType.PROJECTS:
            projects.extend(FieldNormalizer.extract_projects(lines))

        elif sec_type == SectionType.CERTIFICATIONS:
            certifications.extend(FieldNormalizer.extract_certifications(lines))

        elif sec_type == SectionType.ACHIEVEMENTS:
            achievements.extend(FieldNormalizer.extract_achievements(lines))

        elif sec_type == SectionType.PUBLICATIONS:
            publications.extend(FieldNormalizer.extract_publications(lines))

        elif sec_type == SectionType.OTHER:
            other_sections.append(OtherSectionItem(
                heading=section.heading,
                content=section.content
            ))

    # Fallback: If personal information was not captured in a distinct section, scan the top 10 lines
    if not personal_info.email and not personal_info.name:
        top_lines = doc.raw_text.splitlines()[:10]
        personal_info = FieldNormalizer.extract_personal_info(top_lines)

    # 4. Metadata Assembly
    computed_checksum = sha256_checksum or hashlib.sha256(file_bytes).hexdigest()

    metadata = ResumeMetadata(
        filename=filename,
        file_type=clean_type,
        file_size_bytes=len(file_bytes),
        sha256_checksum=computed_checksum,
        page_count=doc.page_count,
        extraction_method=doc.extraction_method,
        warnings=doc.warnings,
        extracted_at=datetime.now(timezone.utc)
    )

    logger.info(
        "Completed resume parsing for %s (%s, %d bytes, %d pages)",
        filename, clean_type, len(file_bytes), doc.page_count
    )

    return ParsedResumeResponse(
        personal_information=personal_info,
        summary=summary,
        education=education,
        skills=skills,
        experience=experience,
        projects=projects,
        certifications=certifications,
        achievements=achievements,
        publications=publications,
        other_sections=other_sections,
        raw_text=doc.raw_text,
        metadata=metadata
    )
