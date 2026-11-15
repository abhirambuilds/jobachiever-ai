from typing import Dict, List, Tuple

from app.matching.schemas import DimensionScores, MatchClassification, RequirementCategory, RequirementMatchItem, ScoringBreakdown

DEFAULT_WEIGHTS: Dict[str, float] = {
    "required_skills": 0.35,
    "preferred_skills": 0.10,
    "experience": 0.20,
    "responsibilities": 0.15,
    "qualifications": 0.10,
    "domain": 0.10,
}

ITEM_POINTS = {
    MatchClassification.MATCHED: 1.0,
    MatchClassification.PARTIALLY_MATCHED: 0.5,
    MatchClassification.NEEDS_REVIEW: 0.4,
    MatchClassification.NOT_FOUND: 0.0,
    MatchClassification.NOT_APPLICABLE: None,
}


def compute_dimension_score(items: List[RequirementMatchItem]) -> Tuple[float, bool]:
    """
    Computes a 0.0–100.0 score for a collection of evaluated requirement items.
    Returns: (score, is_evaluable)
    If no evaluable items exist, returns (0.0, False).
    """
    evaluable = [it for it in items if it.classification != MatchClassification.NOT_APPLICABLE]
    if not evaluable:
        return (0.0, False)

    total_points = sum(ITEM_POINTS.get(it.classification, 0.0) for it in evaluable)
    score = (total_points / len(evaluable)) * 100.0
    return (round(max(0.0, min(100.0, score)), 1), True)


def calculate_match_scores(
    evaluated_items: List[RequirementMatchItem],
    weights: Dict[str, float] = DEFAULT_WEIGHTS
) -> Tuple[DimensionScores, ScoringBreakdown]:
    """
    Computes transparent, deterministic dimension scores and overall score.
    Automatically re-normalizes denominators when specific job dimensions are absent.
    """
    # Group items by dimension
    req_skills_items = [it for it in evaluated_items if it.category == RequirementCategory.REQUIRED_SKILL]
    pref_skills_items = [it for it in evaluated_items if it.category == RequirementCategory.PREFERRED_SKILL]
    exp_items = [it for it in evaluated_items if it.category == RequirementCategory.EXPERIENCE]
    qual_items = [it for it in evaluated_items if it.category in (RequirementCategory.EDUCATION, RequirementCategory.CERTIFICATION)]
    resp_items = [it for it in evaluated_items if it.category == RequirementCategory.RESPONSIBILITY]
    domain_items = [it for it in evaluated_items if it.category in (RequirementCategory.DOMAIN, RequirementCategory.OTHER)]

    # Compute individual dimension scores
    req_score, req_eval = compute_dimension_score(req_skills_items)
    pref_score, pref_eval = compute_dimension_score(pref_skills_items)
    exp_score, exp_eval = compute_dimension_score(exp_items)
    qual_score, qual_eval = compute_dimension_score(qual_items)
    resp_score, resp_eval = compute_dimension_score(resp_items)
    domain_score, domain_eval = compute_dimension_score(domain_items)

    evaluated_dims: List[str] = []
    unevaluable_dims: List[str] = []
    numerator = 0.0
    denominator = 0.0

    dimension_map = [
        ("required_skills", req_score, req_eval, weights.get("required_skills", 0.35)),
        ("preferred_skills", pref_score, pref_eval, weights.get("preferred_skills", 0.10)),
        ("experience", exp_score, exp_eval, weights.get("experience", 0.20)),
        ("qualifications", qual_score, qual_eval, weights.get("qualifications", 0.10)),
        ("responsibilities", resp_score, resp_eval, weights.get("responsibilities", 0.15)),
        ("domain", domain_score, domain_eval, weights.get("domain", 0.10)),
    ]

    for name, score, is_eval, weight in dimension_map:
        if is_eval:
            evaluated_dims.append(name)
            numerator += score * weight
            denominator += weight
        else:
            unevaluable_dims.append(name)

    # Re-normalize over active weights
    if denominator > 0.0:
        overall_score = round(max(0.0, min(100.0, numerator / denominator)), 1)
    else:
        overall_score = 0.0

    scores = DimensionScores(
        overall_score=overall_score,
        required_skills_score=req_score if req_eval else 0.0,
        preferred_skills_score=pref_score if pref_eval else 0.0,
        experience_score=exp_score if exp_eval else 0.0,
        qualifications_score=qual_score if qual_eval else 0.0,
        responsibilities_score=resp_score if resp_eval else 0.0,
        domain_score=domain_score if domain_eval else 0.0,
    )

    # Calculate evidence coverage: percentage of non-NA items with MATCHED or PARTIAL evidence
    all_evaluable = [it for it in evaluated_items if it.classification != MatchClassification.NOT_APPLICABLE]
    evidence_positive = [it for it in all_evaluable if it.classification in (MatchClassification.MATCHED, MatchClassification.PARTIALLY_MATCHED)]
    coverage = round((len(evidence_positive) / max(len(all_evaluable), 1)) * 100.0, 1)

    limitations: List[str] = []
    if not req_eval:
        limitations.append("No explicit mandatory technical skills stated in job description.")
    if not exp_eval:
        limitations.append("No minimum experience tenure specified in job posting.")
    if not qual_eval:
        limitations.append("No specific degrees or certifications required by this employer.")
    if len(all_evaluable) < 3:
        limitations.append("Input job description contains minimal criteria; scores reflect baseline keyword coverage.")

    breakdown = ScoringBreakdown(
        weights=weights,
        evaluated_dimensions=evaluated_dims,
        unevaluable_dimensions=unevaluable_dims,
        evidence_coverage=coverage,
        confidence_score=0.95 if len(all_evaluable) >= 5 else 0.75,
        limitations=limitations,
        disclaimer="This compatibility score is an estimate of alignment between the submitted resume and job description. It is not an ATS score, hiring probability, interview probability, or guarantee of selection."
    )

    return (scores, breakdown)
