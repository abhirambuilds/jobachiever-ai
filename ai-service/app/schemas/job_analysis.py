from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class SeniorityLevel(str, Enum):
    INTERN = "INTERN"
    ENTRY_LEVEL = "ENTRY_LEVEL"
    JUNIOR = "JUNIOR"
    MID_LEVEL = "MID_LEVEL"
    SENIOR = "SENIOR"
    LEAD = "LEAD"
    MANAGER = "MANAGER"
    UNKNOWN = "UNKNOWN"


class EmploymentType(str, Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"
    UNKNOWN = "UNKNOWN"


class WorkArrangement(str, Enum):
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    ON_SITE = "ON_SITE"
    UNKNOWN = "UNKNOWN"


class ImportanceLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RequirementType(str, Enum):
    EXPLICIT = "EXPLICIT"
    INFERRED = "INFERRED"


class ExperienceRange(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    minimum_years: Optional[float] = Field(default=None, description="Minimum stated years of experience")
    maximum_years: Optional[float] = Field(default=None, description="Maximum stated years of experience")
    raw_requirement: Optional[str] = Field(default=None, description="Original verbatim experience phrase from JD")


class JobOverview(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    job_title: Optional[str] = Field(default=None, description="Target job title or role designation")
    company_name: Optional[str] = Field(default=None, description="Hiring organization name when present")
    role_category: Optional[str] = Field(default=None, description="Industry or engineering domain category")
    seniority: SeniorityLevel = Field(default=SeniorityLevel.UNKNOWN, description="Classified seniority level")
    employment_type: EmploymentType = Field(default=EmploymentType.UNKNOWN, description="Full-time, contract, etc.")
    work_arrangement: WorkArrangement = Field(default=WorkArrangement.UNKNOWN, description="Remote, hybrid, or on-site")
    location: Optional[str] = Field(default=None, description="Geographic location or stated work territory")
    experience_range: ExperienceRange = Field(default_factory=ExperienceRange, description="Experience expectations")


class TechnicalSkills(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    required: List[str] = Field(default_factory=list, description="Mandatory technical skills explicitly stated")
    preferred: List[str] = Field(default_factory=list, description="Desirable or bonus technical skills")
    mentioned: List[str] = Field(default_factory=list, description="Technologies mentioned without mandatory/preferred labeling")


class Qualifications(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    education: List[str] = Field(default_factory=list, description="Degree and educational criteria")
    certifications: List[str] = Field(default_factory=list, description="Professional or vendor credentials")
    other_requirements: List[str] = Field(default_factory=list, description="Eligibility, security clearance, or residency")


class JobKeywords(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    core_technical: List[str] = Field(default_factory=list, description="Core programming languages and architectures")
    frameworks_and_tools: List[str] = Field(default_factory=list, description="Specific frameworks, libraries, and utilities")
    domain: List[str] = Field(default_factory=list, description="Business and domain concepts (e.g. Fintech, Payments)")
    soft_skills: List[str] = Field(default_factory=list, description="Communication, teamwork, leadership keywords")
    role_and_responsibility: List[str] = Field(default_factory=list, description="Action-oriented duty keywords")


class ExtractedRequirement(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    name: str = Field(..., description="Name or description of the requirement")
    category: str = Field(default="SKILL", description="Requirement category: SKILL, EDUCATION, EXPERIENCE, RESPONSIBILITY, OTHER")
    importance: ImportanceLevel = Field(default=ImportanceLevel.HIGH, description="Requirement importance rating")
    requirement_type: RequirementType = Field(default=RequirementType.EXPLICIT, description="EXPLICIT or INFERRED (never classify inferred as explicit)")
    evidence_excerpt: Optional[str] = Field(default=None, description="Direct quote from the job description supporting this requirement")
    section: Optional[str] = Field(default=None, description="Section heading where evidence was located")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Extraction confidence score (0.0 to 1.0)")


class AmbiguityItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    issue: str = Field(..., description="Summary of the ambiguity or potential flag")
    category: str = Field(default="POTENTIAL_AMBIGUITY", description="Category: CLARIFICATION_NEEDED, POTENTIAL_AMBIGUITY, INCOMPLETE_INFORMATION")
    explanation: str = Field(..., description="Neutral explanation of why clarification may be needed")
    excerpt: Optional[str] = Field(default=None, description="Excerpt from the text that triggered the ambiguity")


class JobAnalysisResponse(BaseModel):
    """Structured and normalized AI Job Description Analysis Report."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    analysis_id: Optional[str] = Field(default=None, description="Analysis identifier")
    job_id: Optional[str] = Field(default=None, description="Associated job entity ID if known")
    provider: str = Field(..., description="AI provider used (e.g. GROQ, GEMINI)")
    model: Optional[str] = Field(default=None, description="Inference model identifier")
    job_overview: JobOverview = Field(..., description="Role title, company, seniority, and location overview")
    technical_skills: TechnicalSkills = Field(default_factory=TechnicalSkills, description="Categorized technical proficiencies")
    soft_skills: List[str] = Field(default_factory=list, description="Extracted interpersonal and soft skills")
    responsibilities: List[str] = Field(default_factory=list, description="Key duties and deliverables")
    qualifications: Qualifications = Field(default_factory=Qualifications, description="Educational and certification requirements")
    tools_and_technologies: List[str] = Field(default_factory=list, description="Platforms, databases, and developer tools")
    keywords: JobKeywords = Field(default_factory=JobKeywords, description="Grouped job keywords for ATS alignment")
    requirements: List[ExtractedRequirement] = Field(default_factory=list, description="Detailed requirements with evidence excerpts")
    ambiguities: List[AmbiguityItem] = Field(default_factory=list, description="Clarification items and ambiguities")
    red_flags: List[AmbiguityItem] = Field(default_factory=list, description="Potential inconsistencies or missing details")
    summary: str = Field(..., description="Objective structured overview of role expectations and candidate profile")
    warnings: List[str] = Field(default_factory=list, description="Extraction notices or input warnings")
    created_at: str = Field(..., description="ISO 8601 timestamp of analysis creation")


class JobAnalysisRequest(BaseModel):
    """Request payload for Job Description Analysis."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    description: str = Field(
        ...,
        min_length=50,
        max_length=50000,
        description="Full text of the job description (50 - 50,000 characters)"
    )
    job_id: Optional[str] = Field(default=None, description="Optional UUID of existing job record")
    title: Optional[str] = Field(default=None, description="Optional job title hint")
    company_name: Optional[str] = Field(default=None, description="Optional company name hint")
    provider: str = Field(default="GROQ", description="AI provider to use (GROQ or GEMINI)")
    model: Optional[str] = Field(default=None, description="Specific model override")
    temperature: float = Field(default=0.2, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=3000, ge=128, le=8192, description="Maximum completion tokens")
    user_consent: bool = Field(default=True, description="Explicit user confirmation for external AI processing")
