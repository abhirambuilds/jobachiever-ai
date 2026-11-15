import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Pattern


class SectionType(str, Enum):
    PERSONAL_INFO = "PERSONAL_INFO"
    SUMMARY = "SUMMARY"
    EDUCATION = "EDUCATION"
    SKILLS = "SKILLS"
    EXPERIENCE = "EXPERIENCE"
    PROJECTS = "PROJECTS"
    CERTIFICATIONS = "CERTIFICATIONS"
    ACHIEVEMENTS = "ACHIEVEMENTS"
    PUBLICATIONS = "PUBLICATIONS"
    OTHER = "OTHER"


@dataclass
class ResumeSection:
    section_type: SectionType
    heading: str
    lines: List[str] = field(default_factory=list)

    @property
    def content(self) -> str:
        return "\n".join(self.lines).strip()


# Regex patterns matching common section heading variations
SECTION_PATTERNS: Dict[SectionType, Pattern] = {
    SectionType.SUMMARY: re.compile(
        r"^(professional\s+summary|executive\s+summary|career\s+summary|summary|profile|about\s+me|career\s+objective|objective|personal\s+statement)\b",
        re.IGNORECASE
    ),
    SectionType.EDUCATION: re.compile(
        r"^(education|academic\s+background|academic\s+history|academics|qualifications|academic\s+credentials|degrees|educational\s+background)\b",
        re.IGNORECASE
    ),
    SectionType.SKILLS: re.compile(
        r"^(technical\s+skills|skills\s*(?:&|and)\s*technologies|core\s+competencies|technologies|tech\s+stack|key\s+skills|proficiencies|areas\s+of\s+expertise|skills)\b",
        re.IGNORECASE
    ),
    SectionType.EXPERIENCE: re.compile(
        r"^(work\s+experience|professional\s+experience|employment\s+history|career\s+history|work\s+history|experience|relevant\s+experience|professional\s+background)\b",
        re.IGNORECASE
    ),
    SectionType.PROJECTS: re.compile(
        r"^(projects|personal\s+projects|key\s+projects|academic\s+projects|technical\s+projects|selected\s+projects|portfolio\s+projects)\b",
        re.IGNORECASE
    ),
    SectionType.CERTIFICATIONS: re.compile(
        r"^(certifications|licenses\s*(?:&|and)\s*certifications|credentials|certificates|accreditations|professional\s+certifications)\b",
        re.IGNORECASE
    ),
    SectionType.ACHIEVEMENTS: re.compile(
        r"^(achievements|honors\s*(?:&|and)\s*awards|awards|recognitions|key\s+accomplishments|accomplishments|honors)\b",
        re.IGNORECASE
    ),
    SectionType.PUBLICATIONS: re.compile(
        r"^(publications|research\s+papers|patents|conference\s+papers|presentations)\b",
        re.IGNORECASE
    ),
    SectionType.PERSONAL_INFO: re.compile(
        r"^(contact(?:\s+information)?|personal\s+details|personal\s+information)\b",
        re.IGNORECASE
    )
}


def is_heading_candidate(line: str) -> Optional[SectionType]:
    """
    Evaluates whether a text line qualifies as a section heading.
    Rules:
    - Stripped length between 2 and 60 characters.
    - Does not end with a sentence terminator (e.g. '.', ';') unless it's a short title with a colon.
    - Matches one of the configured section regex patterns.
    """
    cleaned = line.strip()
    if not cleaned or len(cleaned) > 60:
        return None

    # Strip formatting artifacts (leading/trailing markdown, colons, underscores, dashes)
    normalized = re.sub(r"^[#*\-_•\d\.\s]+", "", cleaned)
    normalized = re.sub(r"[:\-_*]+$", "", normalized).strip()

    if not normalized or len(normalized) > 50:
        return None

    for section_type, pattern in SECTION_PATTERNS.items():
        if pattern.search(normalized):
            return section_type

    return None


def detect_sections(raw_text: str) -> List[ResumeSection]:
    """
    Partitions raw resume text into classified semantic sections.
    Text preceding the first named heading is classified as PERSONAL_INFO.
    Unrecognized sections are captured under OTHER with their detected heading.
    """
    if not raw_text or not raw_text.strip():
        return []

    lines = [line.rstrip() for line in raw_text.splitlines()]
    sections: List[ResumeSection] = []

    # Default initial section holds top header and contact details
    current_section = ResumeSection(
        section_type=SectionType.PERSONAL_INFO,
        heading="Personal Information"
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        detected_type = is_heading_candidate(stripped)

        if detected_type is not None:
            # Commit the previous section if it contains lines
            if current_section.lines:
                sections.append(current_section)

            # Clean heading for presentation
            clean_heading = re.sub(r"^[#*\-_•\d\.\s]+", "", stripped)
            clean_heading = re.sub(r"[:\-_*]+$", "", clean_heading).strip()

            current_section = ResumeSection(
                section_type=detected_type,
                heading=clean_heading or detected_type.value
            )
        else:
            # Check if this might be an unclassified heading (all uppercase, short, standalone)
            if (
                stripped.isupper()
                and 3 <= len(stripped) <= 35
                and not any(char in stripped for char in "@()[],.;")
                and len(current_section.lines) > 0
            ):
                # Detected an unrecognized heading - capture as OTHER
                if current_section.lines:
                    sections.append(current_section)
                current_section = ResumeSection(
                    section_type=SectionType.OTHER,
                    heading=stripped
                )
            else:
                current_section.lines.append(stripped)

    if current_section.lines:
        sections.append(current_section)

    return sections
