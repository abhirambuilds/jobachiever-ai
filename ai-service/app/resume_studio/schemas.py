"""
Pydantic v2 schemas and enumerations for the AI-Powered Resume Studio Writing Assistant.
Defines strict structured requests, output suggestions, writing modes, and validation boundaries.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class StudioAction(str, Enum):
    IMPROVE_BULLET = "IMPROVE_BULLET"
    IMPROVE_SUMMARY = "IMPROVE_SUMMARY"
    IMPROVE_PROJECT = "IMPROVE_PROJECT"
    IMPROVE_EXPERIENCE = "IMPROVE_EXPERIENCE"
    FIX_GRAMMAR = "FIX_GRAMMAR"
    MAKE_CONCISE = "MAKE_CONCISE"
    TAILOR_TO_JOB = "TAILOR_TO_JOB"
    GENERATE_ALTERNATIVES = "GENERATE_ALTERNATIVES"


class WritingMode(str, Enum):
    PROFESSIONAL = "PROFESSIONAL"
    CONCISE = "CONCISE"
    TECHNICAL = "TECHNICAL"
    ACHIEVEMENT_FOCUSED = "ACHIEVEMENT_FOCUSED"
    ACTION_ORIENTED = "ACTION_ORIENTED"
    ATS_FRIENDLY = "ATS_FRIENDLY"


class ConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ResumeStudioContext(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    section: Optional[str] = Field(None, description="Resume section type (e.g. EXPERIENCE, PROJECTS, SUMMARY)")
    role: Optional[str] = Field(None, description="Job title or role context")
    company: Optional[str] = Field(None, description="Employer or organization name")
    job_title: Optional[str] = Field(None, alias="jobTitle", description="Alternative role title hint")
    target_job_description: Optional[str] = Field(None, alias="targetJobDescription", description="Target job posting text for tailoring")
    target_job_requirements: Optional[List[str]] = Field(default_factory=list, alias="targetJobRequirements", description="Extracted required skills or responsibilities")
    verified_skills: Optional[List[str]] = Field(default_factory=list, alias="verifiedSkills", description="Candidate verified skills list")
    candidate_profile_context: Optional[Dict[str, Any]] = Field(None, alias="candidateProfileContext", description="Additional candidate master profile details")


class ResumeStudioRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    action: StudioAction = Field(..., description="Target enhancement action")
    source_text: str = Field(..., min_length=1, max_length=5000, alias="sourceText", description="Raw resume text, bullet point, or section draft to improve")
    context: Optional[ResumeStudioContext] = Field(default_factory=ResumeStudioContext, description="Surrounding resume or target job context")
    writing_mode: WritingMode = Field(default=WritingMode.PROFESSIONAL, alias="writingMode", description="Desired style and tone mode")
    provider: Optional[str] = Field(None, description="Selected AI provider (GROQ or GEMINI)")
    model: Optional[str] = Field(None, description="Explicit LLM model name override")
    temperature: Optional[float] = Field(0.2, ge=0.0, le=1.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(2048, ge=64, le=8192, alias="maxTokens", description="Output token upper limit")
    num_alternatives: Optional[int] = Field(1, ge=1, le=5, alias="numAlternatives", description="Number of alternative suggestions to produce (1-5)")
    user_consent: bool = Field(True, alias="userConsent", description="Explicit candidate consent for external AI data processing")


class SuggestionItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique suggestion identifier")
    original_text: str = Field(..., alias="originalText", description="Original input text submitted by candidate")
    suggested_text: str = Field(..., alias="suggestedText", description="AI-enhanced rewrite preserving facts")
    reason: str = Field(..., description="Explainable justification of why this revision is stronger")
    changes: List[str] = Field(default_factory=list, description="Bulleted list of discrete improvements made")
    preserved_facts: List[str] = Field(default_factory=list, alias="preservedFacts", description="Source facts, tools, and outcomes retained in rewrite")
    unsupported_claims: List[str] = Field(default_factory=list, alias="unsupportedClaims", description="Detected unsupported claims flagged or bracketed by validator")
    warnings: List[str] = Field(default_factory=list, description="Actionable advisories or questions for missing quantifiable information")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.HIGH, description="Confidence in factual integrity and structural quality")
    writing_mode: Optional[WritingMode] = Field(None, alias="writingMode", description="Writing mode used for this suggestion")


class ResumeStudioResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    suggestions: List[SuggestionItem] = Field(default_factory=list, description="Generated suggestions list")
    action: StudioAction = Field(..., description="Action that produced these suggestions")
    writing_mode: WritingMode = Field(..., alias="writingMode", description="Applied writing mode")
    provider: str = Field(..., description="AI provider used (GROQ or GEMINI)")
    model: str = Field(..., description="Model identifier executed")
    disclaimer: str = Field(
        default="AI suggestions assist user editing and must be verified by the candidate before applying. The engine strictly avoids fabricating unevidenced metrics, tools, or employment history.",
        description="Mandatory factual integrity disclaimer"
    )
