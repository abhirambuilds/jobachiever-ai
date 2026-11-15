import logging
from fastapi import APIRouter, Depends, status

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
from app.career_intelligence.service import (
    execute_career_recommendations,
    execute_project_recommendations,
    execute_roadmap_generation,
    execute_skill_gap_analysis,
)
from app.core.security import verify_internal_service_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/career", tags=["AI Career Intelligence & Skill Gap Advisory"])


@router.post(
    "/skill-gaps",
    response_model=SkillGapAnalysisResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Execute deterministic skill gap analysis and prioritization for target career track",
)
async def analyze_skill_gaps(request: SkillGapAnalysisRequest) -> SkillGapAnalysisResponse:
    return execute_skill_gap_analysis(request)


@router.post(
    "/recommendations",
    response_model=CareerRecommendationsResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Generate targeted career recommendations grounded in skill gap evidence",
)
async def generate_recommendations(request: CareerRecommendationsRequest) -> CareerRecommendationsResponse:
    return execute_career_recommendations(request)


@router.post(
    "/roadmaps/generate",
    response_model=RoadmapGenerateResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Generate a phased learning roadmap structured around prerequisite dependencies",
)
async def generate_roadmap(request: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    return execute_roadmap_generation(request)


@router.post(
    "/projects/recommend",
    response_model=ProjectRecommendationsResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_service_key)],
    summary="Generate portfolio project suggestions that demonstrate missing target skills",
)
async def recommend_projects(request: ProjectRecommendationsRequest) -> ProjectRecommendationsResponse:
    return execute_project_recommendations(request)
