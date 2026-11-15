from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .common import ConfidenceLevel, VerificationStatus


class SchemaBase(BaseModel):
    """Base schema configuring camelCase alias serialization for seamless REST JSON interoperability."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True,
        from_attributes=True
    )


class PersonalInfo(SchemaBase):
    name: Optional[str] = Field(default=None, description="Candidate full name")
    email: Optional[str] = Field(default=None, description="Contact email address")
    phone: Optional[str] = Field(default=None, description="Normalized telephone contact")
    location: Optional[str] = Field(default=None, description="City, state, or country of residence")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL or vanity handle")
    github: Optional[str] = Field(default=None, description="GitHub profile URL or handle")
    portfolio: Optional[str] = Field(default=None, description="Personal website or portfolio URL")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class EducationItem(SchemaBase):
    institution: Optional[str] = Field(default=None, description="College, university, or institution name")
    degree: Optional[str] = Field(default=None, description="Degree or credential (e.g. B.S., M.S., Ph.D.)")
    field_of_study: Optional[str] = Field(default=None, description="Major, discipline, or academic focus")
    start_date: Optional[str] = Field(default=None, description="Start date (e.g. 2019-09 or 2019)")
    end_date: Optional[str] = Field(default=None, description="Graduation or end date (e.g. 2023-05 or 2023)")
    is_current: bool = Field(default=False, description="Whether currently enrolled")
    gpa: Optional[str] = Field(default=None, description="Grade point average if stated")
    honors: Optional[str] = Field(default=None, description="Academic distinctions or honors")
    original_text: Optional[str] = Field(default=None, description="Raw extracted block for human verification")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class SkillItem(SchemaBase):
    name: str = Field(description="Skill or technology name")
    category: Optional[str] = Field(default=None, description="Skill domain (e.g. Languages, Frameworks, Cloud, Databases)")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class ExperienceItem(SchemaBase):
    company: Optional[str] = Field(default=None, description="Employer or organization name")
    role: Optional[str] = Field(default=None, description="Job title or functional role")
    location: Optional[str] = Field(default=None, description="Job location (city/state or Remote)")
    start_date: Optional[str] = Field(default=None, description="Employment start date")
    end_date: Optional[str] = Field(default=None, description="Employment end date or Present")
    is_current: bool = Field(default=False, description="Whether this is the current active role")
    bullet_points: List[str] = Field(default_factory=list, description="Extracted bullet points and achievement statements")
    original_text: Optional[str] = Field(default=None, description="Raw source text fragment for human verification")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class ProjectItem(SchemaBase):
    title: Optional[str] = Field(default=None, description="Project title")
    description: Optional[str] = Field(default=None, description="Brief summary of project objectives and results")
    technologies: List[str] = Field(default_factory=list, description="Technologies and libraries utilized")
    link: Optional[str] = Field(default=None, description="Repository or live URL")
    original_text: Optional[str] = Field(default=None, description="Raw source text snippet for human verification")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class CertificationItem(SchemaBase):
    name: Optional[str] = Field(default=None, description="Certification title")
    issuer: Optional[str] = Field(default=None, description="Issuing authority or platform")
    issue_date: Optional[str] = Field(default=None, description="Issuance date")
    expiry_date: Optional[str] = Field(default=None, description="Expiration date if applicable")
    original_text: Optional[str] = Field(default=None, description="Raw source text snippet for human verification")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class AchievementItem(SchemaBase):
    title: Optional[str] = Field(default=None, description="Award or achievement headline")
    description: Optional[str] = Field(default=None, description="Context, ranking, or metric details")
    date: Optional[str] = Field(default=None, description="Date achieved")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class PublicationItem(SchemaBase):
    title: Optional[str] = Field(default=None, description="Publication or research title")
    publisher: Optional[str] = Field(default=None, description="Journal, conference, or publisher")
    date: Optional[str] = Field(default=None, description="Publication date")
    link: Optional[str] = Field(default=None, description="DOI or web reference")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence")
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED, description="Human verification status")


class OtherSectionItem(SchemaBase):
    heading: str = Field(description="Original section heading detected in resume")
    content: str = Field(description="Raw text content of the unclassified section")


class ResumeMetadata(SchemaBase):
    filename: str = Field(description="Sanitized original filename")
    file_type: str = Field(description="Document type (pdf or docx)")
    file_size_bytes: int = Field(description="File size in bytes")
    sha256_checksum: str = Field(description="Cryptographic SHA-256 fingerprint")
    page_count: int = Field(default=1, description="Detected page or section count")
    extraction_method: str = Field(description="Underlying parser engine (pdfplumber or python-docx)")
    warnings: List[str] = Field(default_factory=list, description="Parser warnings and potential ambiguities")
    extracted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC extraction timestamp")


class ParsedResumeResponse(SchemaBase):
    personal_information: PersonalInfo = Field(default_factory=PersonalInfo, description="Candidate contact and identity details")
    summary: Optional[str] = Field(default=None, description="Professional summary or objective statement")
    education: List[EducationItem] = Field(default_factory=list, description="Extracted academic background records")
    skills: List[SkillItem] = Field(default_factory=list, description="Extracted technical and domain skills")
    experience: List[ExperienceItem] = Field(default_factory=list, description="Extracted work history records")
    projects: List[ProjectItem] = Field(default_factory=list, description="Extracted project records")
    certifications: List[CertificationItem] = Field(default_factory=list, description="Extracted certifications")
    achievements: List[AchievementItem] = Field(default_factory=list, description="Extracted honors and achievements")
    publications: List[PublicationItem] = Field(default_factory=list, description="Extracted publications and research")
    other_sections: List[OtherSectionItem] = Field(default_factory=list, description="Unclassified sections preserved without loss")
    raw_text: str = Field(description="Complete raw extracted text for traceability")
    metadata: ResumeMetadata = Field(description="Extraction provenance and file metadata")
