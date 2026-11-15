from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class OverallRating(str, Enum):
    POOR = "POOR"
    FAIR = "FAIR"
    GOOD = "GOOD"
    EXCELLENT = "EXCELLENT"


class SectionStatus(str, Enum):
    PRESENT = "PRESENT"
    UNDERDEVELOPED = "UNDERDEVELOPED"
    MISSING = "MISSING"


class ATSReadability(str, Enum):
    POOR = "POOR"
    FAIR = "FAIR"
    GOOD = "GOOD"
    EXCELLENT = "EXCELLENT"


class RecommendationPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    OPTIONAL = "OPTIONAL"


class OverallAssessment(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    score: int = Field(..., ge=0, le=100, description="Overall weighted score (0-100)")
    rating: OverallRating = Field(..., description="Qualitative rating")
    summary: str = Field(..., description="Evidence-based summary of resume quality")
    content_score: Optional[int] = Field(default=None, ge=0, le=100, description="Content completeness score (20%)")
    skills_score: Optional[int] = Field(default=None, ge=0, le=100, description="Skills relevance & presentation (20%)")
    experience_score: Optional[int] = Field(default=None, ge=0, le=100, description="Experience & project description quality (20%)")
    impact_score: Optional[int] = Field(default=None, ge=0, le=100, description="Measurable achievements & impact (15%)")
    structure_score: Optional[int] = Field(default=None, ge=0, le=100, description="Structure & readability (15%)")
    ats_score: Optional[int] = Field(default=None, ge=0, le=100, description="ATS-friendly presentation (10%)")
    disclaimer: str = Field(
        default="This score is an automated heuristic evaluation of resume quality and structure based on standard industry hiring practices. It does not simulate proprietary ATS algorithms and does not guarantee interview selection or job offers.",
        description="Standard legal and operational disclaimer"
    )


class SectionAnalysisItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    section: str = Field(..., description="Section identifier, e.g. EXPERIENCE, EDUCATION, SKILLS, PROJECTS, SUMMARY")
    status: SectionStatus = Field(default=SectionStatus.PRESENT, description="Status of the section in the resume")
    strengths: List[str] = Field(default_factory=list, description="Observed strengths in this section")
    issues: List[str] = Field(default_factory=list, description="Identified deficiencies or weaknesses")
    recommendations: List[str] = Field(default_factory=list, description="Actionable improvement suggestions")


class SkillsAnalysis(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    identified_skills: List[str] = Field(default_factory=list, description="Skills explicitly extracted from resume text")
    underrepresented_skills: List[str] = Field(default_factory=list, description="Valuable domain skills not evident in text")
    notes: List[str] = Field(default_factory=list, description="Analytical observations regarding skill presentation")


class ImpactExampleItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    quote: str = Field(..., description="Original quote from resume demonstrating strong impact")
    impact_explanation: str = Field(..., description="Why this statement effectively conveys engineering or business impact")
    section: Optional[str] = Field(default=None, description="Section where the quote appears")


class ImpactOpportunityItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    original_excerpt: str = Field(..., description="Original excerpt with passive, vague, or unquantified phrasing")
    issue: str = Field(..., description="Specific flaw (e.g. passive verb, missing metric, unclear ownership)")
    suggested_rewrite: str = Field(..., description="Fact-preserving rewrite with placeholders like [actual metric]")
    section: Optional[str] = Field(default=None, description="Section where the excerpt appears")


class ImpactAnalysis(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    strong_examples: List[ImpactExampleItem] = Field(default_factory=list, description="Examples of impactful statements")
    improvement_opportunities: List[ImpactOpportunityItem] = Field(
        default_factory=list,
        description="Statements that can be improved while preserving factual integrity"
    )


class ATSAnalysis(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    readability: ATSReadability = Field(default=ATSReadability.GOOD, description="Estimated ATS readability level")
    observations: List[str] = Field(default_factory=list, description="Positive structural & parsing observations")
    warnings: List[str] = Field(default_factory=list, description="Potential ATS parsing traps (tables, multi-column, missing headers)")
    disclaimer: str = Field(
        default="ATS behavior varies widely across different vendors, company configurations, and HR platforms.",
        description="ATS variation disclaimer"
    )


class RecommendationItem(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    id: str = Field(..., description="Unique recommendation identifier")
    section: str = Field(..., description="Target resume section")
    priority: RecommendationPriority = Field(default=RecommendationPriority.MEDIUM, description="Action priority")
    issue: str = Field(..., description="Identified problem")
    why: str = Field(..., description="Explanation of why this matters to recruiters and hiring managers")
    suggested_improvement: str = Field(..., description="Specific, fact-preserving recommendation with placeholders")
    original_excerpt: Optional[str] = Field(default=None, description="Direct quote from resume being referenced")


class ResumeAnalysisResponse(BaseModel):
    """Structured and normalized AI Resume Analysis Report."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, use_enum_values=True)

    analysis_id: Optional[str] = Field(default=None, description="Analysis identifier")
    resume_id: Optional[str] = Field(default=None, description="Associated resume document ID")
    provider: str = Field(..., description="AI provider used (e.g. GROQ, GEMINI)")
    model: Optional[str] = Field(default=None, description="Inference model identifier")
    overall_assessment: OverallAssessment = Field(..., description="High-level scoring and quality assessment")
    section_analysis: List[SectionAnalysisItem] = Field(default_factory=list, description="Section-by-section audit")
    strengths: List[str] = Field(default_factory=list, description="Top overall resume strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Top overall areas needing improvement")
    skills_analysis: SkillsAnalysis = Field(default_factory=SkillsAnalysis, description="Skills categorization and depth audit")
    impact_analysis: ImpactAnalysis = Field(default_factory=ImpactAnalysis, description="Measurable achievements and impact analysis")
    ats_analysis: ATSAnalysis = Field(default_factory=ATSAnalysis, description="ATS readability and structural findings")
    recommendations: List[RecommendationItem] = Field(default_factory=list, description="Prioritized actionable recommendations")
    extraction_warnings: List[str] = Field(default_factory=list, description="Document extraction quality notices")
    created_at: str = Field(..., description="ISO 8601 timestamp of analysis creation")
