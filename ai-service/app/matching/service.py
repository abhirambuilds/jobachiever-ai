import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.matching.experience_matcher import evaluate_experience_alignment
from app.matching.normalizer import NormalizedJobData, NormalizedResumeData, clean_text
from app.matching.qualification_matcher import match_certifications, match_education
from app.matching.responsibility_matcher import match_all_responsibilities
from app.matching.schemas import (
    DimensionScores,
    MatchClassification,
    MatchingRequest,
    MatchingResponse,
    RequirementCategory,
    RequirementMatchItem,
    ScoringBreakdown,
)
from app.matching.scoring import calculate_match_scores
from app.matching.skill_matcher import match_all_technical_skills, match_single_skill
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType, TaskType
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


def match_domain_and_tools(
    job: NormalizedJobData,
    resume: NormalizedResumeData
) -> List[RequirementMatchItem]:
    """Matches tools, platforms, and domain keywords against candidate evidence."""
    items: List[RequirementMatchItem] = []

    for tool in job.tools_and_technologies:
        # Avoid duplicate evaluation if already evaluated under technical skills
        if tool.lower() not in [s.lower() for s in job.required_skills + job.preferred_skills]:
            items.append(match_single_skill(tool, resume, RequirementCategory.DOMAIN, importance="MEDIUM"))

    for domain in job.domain_keywords:
        items.append(match_single_skill(domain, resume, RequirementCategory.DOMAIN, importance="LOW"))

    return items


def extract_strengths_and_gaps(
    evaluated_items: List[RequirementMatchItem]
) -> Tuple[List[str], List[str], List[str]]:
    """Gathers actionable strengths, critical skill gaps, and evidence-grounded recommendations."""
    strengths: List[str] = []
    skill_gaps: List[str] = []
    recommendations: List[str] = []

    for it in evaluated_items:
        if it.classification == MatchClassification.MATCHED:
            if it.category in (RequirementCategory.REQUIRED_SKILL, RequirementCategory.EXPERIENCE, RequirementCategory.EDUCATION):
                strengths.append(f"Direct verified alignment with {it.requirement}: {it.explanation}")
        elif it.classification == MatchClassification.NOT_FOUND:
            if it.category == RequirementCategory.REQUIRED_SKILL:
                skill_gaps.append(f"Missing evidence for required skill: {it.requirement}")
                if it.recommended_action:
                    recommendations.append(it.recommended_action)
            elif it.category == RequirementCategory.EXPERIENCE:
                skill_gaps.append(f"Experience duration gap: {it.requirement}")
                if it.recommended_action:
                    recommendations.append(it.recommended_action)
        elif it.classification == MatchClassification.PARTIALLY_MATCHED:
            if it.recommended_action and it.recommended_action not in recommendations:
                recommendations.append(it.recommended_action)

    if not recommendations:
        recommendations.append("Your verified qualifications strongly align with this posting. Review section formatting before applying.")

    return (strengths[:5], skill_gaps[:5], recommendations[:6])


def generate_match_summary(
    scores: DimensionScores,
    strengths: List[str],
    gaps: List[str],
    job: NormalizedJobData
) -> str:
    """Produces an objective, transparent synthesis of candidate alignment."""
    score = scores.overall_score
    role = job.job_title or "Target Role"
    company = f" at {job.company_name}" if job.company_name else ""

    if score >= 85:
        fit = "exceptional structural alignment"
    elif score >= 70:
        fit = "strong foundational alignment"
    elif score >= 50:
        fit = "moderate alignment with identifiable qualification gaps"
    else:
        fit = "limited alignment with core role expectations"

    summary = f"The candidate resume demonstrates a {score}% compatibility score ({fit}) for {role}{company}. "

    if scores.required_skills_score >= 80:
        summary += f"Required technical skills demonstrate solid coverage ({scores.required_skills_score}%). "
    else:
        summary += f"Required technical skills indicate notable gaps ({scores.required_skills_score}%). "

    if gaps:
        summary += f"Primary areas for development or elaboration include: {', '.join(g[:40] for g in gaps[:2])}."
    else:
        summary += "Key mandatory requirements are verified through documented experience."

    return summary


async def execute_resume_job_match(
    request: MatchingRequest,
    ai_service: Optional[AIService] = None
) -> MatchingResponse:
    """
    Executes the complete explainable matching pipeline:
    1. Normalizes resume and job inputs into clean structures.
    2. Deterministically compares skills, experience, education, certifications, and responsibilities.
    3. Calculates transparent, weighted multi-dimensional scores.
    4. Gathers grounded strengths, gaps, and recommendations.
    5. Produces strict, explainable matching report.
    """
    resume = NormalizedResumeData(request.resume_data)
    job = NormalizedJobData(request.job_data)

    # 1. Evaluate all technical skills
    skill_items = match_all_technical_skills(job, resume)

    # 2. Evaluate experience alignment
    exp_item = evaluate_experience_alignment(job, resume)

    # 3. Evaluate qualifications and certifications
    edu_items: List[RequirementMatchItem] = []
    if job.education:
        for edu in job.education:
            edu_items.append(match_education(edu, resume))
    cert_items = match_certifications(job.certifications, resume)

    # 4. Evaluate responsibilities
    resp_items = match_all_responsibilities(job, resume)

    # 5. Evaluate domain & tools
    domain_items = match_domain_and_tools(job, resume)

    # Combine all evaluated criteria
    all_evaluated: List[RequirementMatchItem] = (
        skill_items + [exp_item] + edu_items + cert_items + resp_items + domain_items
    )

    # 6. Calculate deterministic scores
    scores, breakdown = calculate_match_scores(all_evaluated)

    # 7. Group items by classification
    matched = [it for it in all_evaluated if it.classification == MatchClassification.MATCHED]
    partial = [it for it in all_evaluated if it.classification == MatchClassification.PARTIALLY_MATCHED]
    missing = [it for it in all_evaluated if it.classification == MatchClassification.NOT_FOUND]
    review = [it for it in all_evaluated if it.classification == MatchClassification.NEEDS_REVIEW]

    # 8. Extract strengths, gaps, and recommendations
    strengths, skill_gaps, recommendations = extract_strengths_and_gaps(all_evaluated)

    # 9. Formulate summary
    summary = generate_match_summary(scores, strengths, skill_gaps, job)

    now_iso = datetime.now(timezone.utc).isoformat()

    return MatchingResponse(
        match_id=None,
        resume_id=request.resume_id,
        resume_version_id=request.resume_version_id,
        job_id=request.job_id,
        job_analysis_id=request.job_analysis_id,
        provider=request.provider,
        model=request.model,
        scores=scores,
        breakdown=breakdown,
        requirements_evaluation=all_evaluated,
        matched_requirements=matched,
        partially_matched=partial,
        missing_requirements=missing,
        needs_review=review,
        strengths=strengths,
        skill_gaps=skill_gaps,
        recommendations=recommendations,
        summary=summary,
        created_at=now_iso
    )
