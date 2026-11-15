from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase for consistent REST JSON responses."""
    components = string.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class MatchClassification(str, Enum):
    MATCHED = "MATCHED"
    PARTIALLY_MATCHED = "PARTIALLY_MATCHED"
    NOT_FOUND = "NOT_FOUND"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class MatchType(str, Enum):
    EXACT = "EXACT"
    ALIAS = "ALIAS"
    CLOSELY_RELATED = "CLOSELY_RELATED"
    SEMANTIC = "SEMANTIC"
    NONE = "NONE"


class AlignmentLevel(str, Enum):
    STRONG = "STRONG"
    MODERATE = "MODERATE"
    LIMITED = "LIMITED"
    NOT_DEMONSTRATED = "NOT_DEMONSTRATED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class RequirementCategory(str, Enum):
    REQUIRED_SKILL = "REQUIRED_SKILL"
    PREFERRED_SKILL = "PREFERRED_SKILL"
    EXPERIENCE = "EXPERIENCE"
    EDUCATION = "EDUCATION"
    CERTIFICATION = "CERTIFICATION"
    RESPONSIBILITY = "RESPONSIBILITY"
    DOMAIN = "DOMAIN"
    OTHER = "OTHER"


class RequirementMatchItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    requirement: str = Field(..., description="Stated requirement from job posting")
    category: RequirementCategory = Field(default=RequirementCategory.REQUIRED_SKILL, description="Evaluation category")
    importance: str = Field(default="HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    classification: MatchClassification = Field(..., description="MATCHED, PARTIALLY_MATCHED, NOT_FOUND, NEEDS_REVIEW, NOT_APPLICABLE")
    match_type: MatchType = Field(default=MatchType.NONE, description="EXACT, ALIAS, CLOSELY_RELATED, SEMANTIC, NONE")
    resume_evidence: Optional[str] = Field(default=None, description="Direct verified excerpt from resume supporting this requirement")
    job_evidence: Optional[str] = Field(default=None, description="Direct quote from job description")
    explanation: str = Field(..., description="Explainable rationale grounding the classification")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    recommended_action: Optional[str] = Field(default=None, description="Actionable next step for the candidate")


class DimensionScores(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall deterministic compatibility score")
    required_skills_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Required skills alignment score")
    preferred_skills_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Preferred skills alignment score")
    experience_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Experience duration and relevance score")
    qualifications_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Education and credentials score")
    responsibilities_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Role responsibilities alignment score")
    domain_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Domain and industry concepts score")


class ScoringBreakdown(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    weights: Dict[str, float] = Field(default_factory=dict, description="Active weights used for deterministic score calculation")
    evaluated_dimensions: List[str] = Field(default_factory=list, description="Dimensions present and scored")
    unevaluable_dimensions: List[str] = Field(default_factory=list, description="Dimensions absent from JD and re-normalized")
    evidence_coverage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of evaluated criteria where evidence was detected")
    confidence_score: float = Field(default=0.9, ge=0.0, le=1.0, description="Overall matching confidence level")
    limitations: List[str] = Field(default_factory=list, description="Notices regarding missing dates, unstated criteria, or partial evidence")
    disclaimer: str = Field(
        default="This compatibility score is an estimate of alignment between the submitted resume and job description. It is not an ATS score, hiring probability, interview probability, or guarantee of selection.",
        description="Mandatory transparency and legal disclaimer"
    )


class MatchingResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    match_id: Optional[str] = Field(default=None, description="Match identifier")
    resume_id: Optional[str] = Field(default=None, description="Resume identifier")
    resume_version_id: Optional[str] = Field(default=None, description="Resume version identifier")
    job_id: Optional[str] = Field(default=None, description="Job identifier")
    job_analysis_id: Optional[str] = Field(default=None, description="Job analysis identifier")
    provider: str = Field(..., description="AI provider used for semantic review")
    model: Optional[str] = Field(default=None, description="AI model used")
    scores: DimensionScores = Field(..., description="Multi-dimensional deterministic score ratings")
    breakdown: ScoringBreakdown = Field(..., description="Transparent scoring rubric and coverage breakdown")
    requirements_evaluation: List[RequirementMatchItem] = Field(default_factory=list, description="Comprehensive list of evaluated requirements")
    matched_requirements: List[RequirementMatchItem] = Field(default_factory=list, description="Fully matched requirements")
    partially_matched: List[RequirementMatchItem] = Field(default_factory=list, description="Partially matched requirements")
    missing_requirements: List[RequirementMatchItem] = Field(default_factory=list, description="Requirements not demonstrated in resume")
    needs_review: List[RequirementMatchItem] = Field(default_factory=list, description="Ambiguous requirements needing candidate review")
    strengths: List[str] = Field(default_factory=list, description="Key candidate alignments and verified strengths")
    skill_gaps: List[str] = Field(default_factory=list, description="Primary technical and qualification gaps")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations for application optimization")
    summary: str = Field(..., description="Explainable synthesis of resume-job compatibility")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")


class MatchingRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    resume_data: Dict[str, Any] = Field(..., description="Extracted resume data dictionary")
    job_data: Dict[str, Any] = Field(..., description="Structured job description analysis dictionary")
    resume_id: Optional[str] = Field(default=None, description="Resume UUID")
    resume_version_id: Optional[str] = Field(default=None, description="Resume version UUID")
    job_id: Optional[str] = Field(default=None, description="Job UUID")
    job_analysis_id: Optional[str] = Field(default=None, description="Job analysis UUID")
    provider: str = Field(default="GROQ", description="AI provider to use (GROQ or GEMINI)")
    model: Optional[str] = Field(default=None, description="Model identifier override")
    temperature: float = Field(default=0.2, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=3000, ge=128, le=8192, description="Maximum output tokens")
    user_consent: bool = Field(default=True, description="Explicit user confirmation for external AI processing")
