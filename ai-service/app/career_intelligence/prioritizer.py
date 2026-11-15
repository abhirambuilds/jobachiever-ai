from typing import Any, Dict, List, Optional, Tuple

from app.career_intelligence.schemas import EvidenceStatus, PriorityLevel
from app.career_intelligence.skill_normalizer import (
    canonicalize_skill,
    get_skill_dependencies,
    normalize_skill_token,
)


DEFAULT_PRIORITY_WEIGHTS = {
    "target_role_importance": 0.35,
    "job_frequency": 0.20,
    "career_track_relevance": 0.20,
    "skill_dependency_importance": 0.15,
    "user_goal_alignment": 0.10,
}


def calculate_skill_priority(
    skill_name: str,
    importance: str,
    evidence_status: EvidenceStatus,
    career_track: Dict[str, Any],
    all_target_skills: List[str],
    target_jobs: Optional[List[Dict[str, Any]]] = None,
    custom_weights: Optional[Dict[str, float]] = None,
) -> Tuple[PriorityLevel, float]:
    """Calculates deterministic skill priority score (0.0 to 1.0) and PriorityLevel.

    Priority weights:
    - Target role importance: 35%
    - Frequency across relevant jobs: 20%
    - Career-track relevance: 20%
    - Skill dependency importance: 15%
    - User goal alignment: 10%
    """
    weights = custom_weights or DEFAULT_PRIORITY_WEIGHTS
    canon = canonicalize_skill(skill_name)
    canon_lower = canon.lower()

    # 1. Target Role Importance (0.0 - 1.0)
    imp_upper = importance.upper()
    if imp_upper in ("REQUIRED", "CRITICAL", "MANDATORY"):
        imp_score = 1.0
    elif imp_upper in ("PREFERRED", "HIGH"):
        imp_score = 0.65
    elif imp_upper in ("BENEFICIAL", "NICE_TO_HAVE"):
        imp_score = 0.40
    else:
        imp_score = 0.50

    # 2. Frequency across relevant jobs (0.0 - 1.0)
    if target_jobs and len(target_jobs) > 0:
        mention_count = 0
        for job in target_jobs:
            job_text = (
                (job.get("description") or "") + " " +
                (job.get("title") or "") + " " +
                " ".join(job.get("required_skills") or job.get("skills") or [])
            ).lower()
            if canon_lower in job_text or normalize_skill_token(skill_name) in job_text:
                mention_count += 1
        job_freq_score = mention_count / len(target_jobs)
    else:
        # Default baseline if candidate has not linked specific job postings
        job_freq_score = 0.60 if imp_upper == "REQUIRED" else 0.40

    # 3. Career-Track Relevance (0.0 - 1.0)
    req_skills = [s.lower() for s in (career_track.get("required_skills") or []) if isinstance(s, str)]
    pref_skills = [s.lower() for s in (career_track.get("preferred_skills") or []) if isinstance(s, str)]

    if canon_lower in req_skills or normalize_skill_token(skill_name) in req_skills:
        track_rel_score = 1.0
    elif canon_lower in pref_skills or normalize_skill_token(skill_name) in pref_skills:
        track_rel_score = 0.75
    else:
        track_rel_score = 0.45

    # 4. Skill Dependency Importance (0.0 - 1.0)
    # Does another missing target skill depend on this foundational skill?
    is_prerequisite_for_other = False
    for other_skill in all_target_skills:
        if other_skill.lower() != canon_lower:
            deps = [d.lower() for d in get_skill_dependencies(other_skill)]
            if canon_lower in deps:
                is_prerequisite_for_other = True
                break

    dep_score = 1.0 if is_prerequisite_for_other else 0.35

    # 5. User Goal Alignment (0.0 - 1.0)
    career_goals = (career_track.get("career_goals") or "").lower()
    target_role = (career_track.get("target_role") or "").lower()
    if canon_lower in career_goals or canon_lower in target_role:
        goal_score = 1.0
    else:
        goal_score = 0.50

    # Weighted calculation
    score = (
        weights["target_role_importance"] * imp_score +
        weights["job_frequency"] * job_freq_score +
        weights["career_track_relevance"] * track_rel_score +
        weights["skill_dependency_importance"] * dep_score +
        weights["user_goal_alignment"] * goal_score
    )

    # If the skill is already explicitly confirmed, prioritize actions for missing skills higher
    if evidence_status == EvidenceStatus.CONFIRMED:
        score *= 0.4  # Lower priority for skill development since candidate already possesses it

    score = round(max(0.0, min(1.0, score)), 3)

    if score >= 0.72:
        priority = PriorityLevel.CRITICAL
    elif score >= 0.52:
        priority = PriorityLevel.HIGH
    elif score >= 0.32:
        priority = PriorityLevel.MEDIUM
    else:
        priority = PriorityLevel.LOW

    return priority, score
