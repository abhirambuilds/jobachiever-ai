from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvidenceStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    EVIDENCED = "EVIDENCED"
    UNVERIFIED = "UNVERIFIED"
    MISSING = "MISSING"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class GapClassification(str, Enum):
    STRONG = "STRONG"
    DEVELOPING = "DEVELOPING"
    MISSING_EVIDENCE = "MISSING_EVIDENCE"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class PriorityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class MilestoneStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"


class RecommendationCategory(str, Enum):
    SKILL_DEVELOPMENT = "SKILL_DEVELOPMENT"
    PRACTICAL_PROJECT = "PRACTICAL_PROJECT"
    PORTFOLIO_ENHANCEMENT = "PORTFOLIO_ENHANCEMENT"
    CERTIFICATION = "CERTIFICATION"
    CONCEPT_MASTERY = "CONCEPT_MASTERY"


class SkillGapItem(BaseModel):
    skill_name: str = Field(..., alias="skillName")
    skill_category: str = Field(default="TECHNICAL", alias="skillCategory")
    target_role: str = Field(..., alias="targetRole")
    importance: str = Field(default="REQUIRED")
    current_evidence_status: EvidenceStatus = Field(default=EvidenceStatus.MISSING, alias="currentEvidenceStatus")
    classification: GapClassification = Field(default=GapClassification.MISSING_EVIDENCE)
    evidence_source: Optional[str] = Field(default=None, alias="evidenceSource")
    gap_explanation: str = Field(..., alias="gapExplanation")
    recommended_next_step: str = Field(..., alias="recommendedNextStep")
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    confidence: str = Field(default="HIGH")
    score: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    class Config:
        populate_by_name = True


class SkillGapAnalysisRequest(BaseModel):
    career_track: Dict[str, Any] = Field(..., alias="careerTrack")
    profile_data: Dict[str, Any] = Field(..., alias="profileData")
    resume_evidence: Optional[Dict[str, Any]] = Field(default=None, alias="resumeEvidence")
    target_jobs: Optional[List[Dict[str, Any]]] = Field(default=None, alias="targetJobs")
    provider: Optional[str] = Field(default="GROQ")
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=2048, alias="maxTokens")
    user_consent: bool = Field(default=True, alias="userConsent")

    class Config:
        populate_by_name = True


class SkillGapAnalysisResponse(BaseModel):
    career_track_id: Optional[str] = Field(default=None, alias="careerTrackId")
    target_role: str = Field(..., alias="targetRole")
    summary: str
    demonstrated_skills: List[str] = Field(default_factory=list, alias="demonstratedSkills")
    developing_skills: List[str] = Field(default_factory=list, alias="developingSkills")
    missing_evidence_skills: List[str] = Field(default_factory=list, alias="missingEvidenceSkills")
    skills_needing_review: List[str] = Field(default_factory=list, alias="skillsNeedingReview")
    critical_priorities: List[str] = Field(default_factory=list, alias="criticalPriorities")
    skill_gaps: List[SkillGapItem] = Field(default_factory=list, alias="skillGaps")
    adjacent_skills: List[str] = Field(default_factory=list, alias="adjacentSkills")
    suggested_certifications: List[str] = Field(default_factory=list, alias="suggestedCertifications")
    disclaimer: str = Field(
        default="Skill gap scores and priorities are advisory planning aids based on current profile evidence and stated role requirements. They do not represent hiring guarantees or strict proficiency metrics.",
    )

    class Config:
        populate_by_name = True


class CareerRecommendationItem(BaseModel):
    id: str
    category: RecommendationCategory = Field(default=RecommendationCategory.SKILL_DEVELOPMENT)
    title: str
    description: str
    target_role: str = Field(..., alias="targetRole")
    related_skills: List[str] = Field(default_factory=list, alias="relatedSkills")
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    rationale: str
    actionable_steps: List[str] = Field(default_factory=list, alias="actionableSteps")
    estimated_effort: Optional[str] = Field(default=None, alias="estimatedEffort")

    class Config:
        populate_by_name = True


class CareerRecommendationsRequest(BaseModel):
    career_track: Dict[str, Any] = Field(..., alias="careerTrack")
    profile_data: Dict[str, Any] = Field(..., alias="profileData")
    skill_gaps: Optional[List[Dict[str, Any]]] = Field(default=None, alias="skillGaps")
    provider: Optional[str] = Field(default="GROQ")
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=2048, alias="maxTokens")
    user_consent: bool = Field(default=True, alias="userConsent")

    class Config:
        populate_by_name = True


class CareerRecommendationsResponse(BaseModel):
    career_track_id: Optional[str] = Field(default=None, alias="careerTrackId")
    target_role: str = Field(..., alias="targetRole")
    recommendations: List[CareerRecommendationItem] = Field(default_factory=list)
    disclaimer: str = Field(
        default="Recommendations are prescriptive learning and portfolio suggestions based on your target career track and profile evidence.",
    )

    class Config:
        populate_by_name = True


class RoadmapTask(BaseModel):
    task_id: str = Field(..., alias="taskId")
    title: str
    description: str
    estimated_duration: Optional[str] = Field(default=None, alias="estimatedDuration")

    class Config:
        populate_by_name = True


class RoadmapMilestone(BaseModel):
    id: str
    title: str
    description: str
    phase_number: int = Field(default=1, alias="phaseNumber")
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    related_skills: List[str] = Field(default_factory=list, alias="relatedSkills")
    tasks: List[RoadmapTask] = Field(default_factory=list)
    completion_criteria: List[str] = Field(default_factory=list, alias="completionCriteria")
    estimated_duration: Optional[str] = Field(default=None, alias="estimatedDuration")
    status: MilestoneStatus = Field(default=MilestoneStatus.NOT_STARTED)
    start_date: Optional[str] = Field(default=None, alias="startDate")
    completed_at: Optional[str] = Field(default=None, alias="completedAt")
    personal_notes: Optional[str] = Field(default=None, alias="personalNotes")
    evidence_links: List[str] = Field(default_factory=list, alias="evidenceLinks")

    class Config:
        populate_by_name = True


class RoadmapPhase(BaseModel):
    phase: int
    title: str
    description: str
    milestones: List[RoadmapMilestone] = Field(default_factory=list)

    class Config:
        populate_by_name = True


class RoadmapGenerateRequest(BaseModel):
    career_track: Dict[str, Any] = Field(..., alias="careerTrack")
    profile_data: Dict[str, Any] = Field(..., alias="profileData")
    skill_gaps: Optional[List[Dict[str, Any]]] = Field(default=None, alias="skillGaps")
    target_role: Optional[str] = Field(default=None, alias="targetRole")
    provider: Optional[str] = Field(default="GROQ")
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=2048, alias="maxTokens")
    user_consent: bool = Field(default=True, alias="userConsent")

    class Config:
        populate_by_name = True


class RoadmapGenerateResponse(BaseModel):
    roadmap_id: str = Field(..., alias="roadmapId")
    career_track_id: Optional[str] = Field(default=None, alias="careerTrackId")
    target_role: str = Field(..., alias="targetRole")
    generated_at: str = Field(..., alias="generatedAt")
    estimated_duration: Optional[str] = Field(default=None, alias="estimatedDuration")
    phases: List[RoadmapPhase] = Field(default_factory=list)
    disclaimer: str = Field(
        default="Career roadmaps are planning frameworks designed around skill dependencies. Time-to-completion varies by individual pace and prior experience.",
    )

    class Config:
        populate_by_name = True


class ProjectRecommendationItem(BaseModel):
    id: str
    title: str
    target_skills: List[str] = Field(default_factory=list, alias="targetSkills")
    objective: str
    suggested_features: List[str] = Field(default_factory=list, alias="suggestedFeatures")
    technology_choices: List[str] = Field(default_factory=list, alias="technologyChoices")
    difficulty: str = Field(default="INTERMEDIATE")
    expected_deliverables: List[str] = Field(default_factory=list, alias="expectedDeliverables")
    resume_evidence_value: str = Field(..., alias="resumeEvidenceValue")

    class Config:
        populate_by_name = True


class ProjectRecommendationsRequest(BaseModel):
    career_track: Dict[str, Any] = Field(..., alias="careerTrack")
    profile_data: Dict[str, Any] = Field(..., alias="profileData")
    skill_gaps: Optional[List[Dict[str, Any]]] = Field(default=None, alias="skillGaps")
    provider: Optional[str] = Field(default="GROQ")
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=2048, alias="maxTokens")
    user_consent: bool = Field(default=True, alias="userConsent")

    class Config:
        populate_by_name = True


class ProjectRecommendationsResponse(BaseModel):
    career_track_id: Optional[str] = Field(default=None, alias="careerTrackId")
    target_role: str = Field(..., alias="targetRole")
    projects: List[ProjectRecommendationItem] = Field(default_factory=list)
    disclaimer: str = Field(
        default="Recommended projects provide practical implementation opportunities. Completed projects must be explicitly verified before inclusion on your profile.",
    )

    class Config:
        populate_by_name = True
