import logging
from typing import Any, Dict

from fastapi import HTTPException, status

from app.career_intelligence.gap_analyzer import analyze_career_track_skill_gaps
from app.career_intelligence.project_recommender import recommend_projects_for_gaps
from app.career_intelligence.recommendation_engine import generate_career_recommendations
from app.career_intelligence.roadmap_generator import generate_structured_roadmap
from app.career_intelligence.schemas import (
    CareerRecommendationsRequest,
    CareerRecommendationsResponse,
    ProjectRecommendationsRequest,
    ProjectRecommendationsResponse,
    RoadmapGenerateRequest,
    RoadmapGenerateResponse,
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
)

logger = logging.getLogger(__name__)


def execute_skill_gap_analysis(request: SkillGapAnalysisRequest) -> SkillGapAnalysisResponse:
    """Executes deterministic skill gap analysis and prioritization with strict user consent verification."""
    if not request.user_consent:
        logger.warning("Skill gap analysis rejected: Missing explicit user consent")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to analyze career skill gaps.",
        )

    if not request.career_track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career track definition is required for skill gap analysis.",
        )

    logger.info(
        "Analyzing skill gaps for role='%s', provider='%s'",
        request.career_track.get("target_role"),
        request.provider,
    )

    return analyze_career_track_skill_gaps(
        career_track=request.career_track,
        profile_data=request.profile_data or {},
        resume_evidence=request.resume_evidence,
        target_jobs=request.target_jobs,
    )


def execute_career_recommendations(request: CareerRecommendationsRequest) -> CareerRecommendationsResponse:
    """Generates actionable career recommendations grounded in identified skill gaps."""
    if not request.user_consent:
        logger.warning("Career recommendations rejected: Missing explicit user consent")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to generate career recommendations.",
        )

    if not request.career_track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career track definition is required for career recommendations.",
        )

    logger.info(
        "Generating career recommendations for role='%s'",
        request.career_track.get("target_role"),
    )

    return generate_career_recommendations(
        career_track=request.career_track,
        skill_gaps=request.skill_gaps,
        profile_data=request.profile_data or {},
    )


def execute_roadmap_generation(request: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    """Generates a phased learning roadmap respecting skill dependency hierarchies."""
    if not request.user_consent:
        logger.warning("Roadmap generation rejected: Missing explicit user consent")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to generate learning roadmaps.",
        )

    if not request.career_track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career track definition is required for roadmap generation.",
        )

    logger.info(
        "Generating learning roadmap for role='%s'",
        request.target_role or request.career_track.get("target_role"),
    )

    return generate_structured_roadmap(
        career_track=request.career_track,
        skill_gaps=request.skill_gaps,
        profile_data=request.profile_data or {},
        target_role_override=request.target_role,
    )


def execute_project_recommendations(request: ProjectRecommendationsRequest) -> ProjectRecommendationsResponse:
    """Generates concrete practical project suggestions demonstrating multiple missing skills."""
    if not request.user_consent:
        logger.warning("Project recommendations rejected: Missing explicit user consent")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="External AI processing consent is required to generate project recommendations.",
        )

    if not request.career_track:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career track definition is required for project recommendations.",
        )

    logger.info(
        "Generating project recommendations for role='%s'",
        request.career_track.get("target_role"),
    )

    return recommend_projects_for_gaps(
        career_track=request.career_track,
        skill_gaps=request.skill_gaps,
        profile_data=request.profile_data or {},
    )
