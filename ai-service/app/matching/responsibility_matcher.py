import re
from typing import Any, Dict, List, Optional, Tuple

from app.matching.normalizer import NormalizedJobData, NormalizedResumeData, clean_text
from app.matching.schemas import AlignmentLevel, MatchClassification, MatchType, RequirementCategory, RequirementMatchItem

STOPWORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "as",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
    "did", "will", "would", "shall", "should", "may", "might", "must", "can", "could", "our",
    "you", "your", "we", "they", "their", "team", "work", "help", "cross", "functional"
}


def extract_keywords(text: str) -> List[str]:
    """Tokenizes and cleans text, removing stopwords and single characters."""
    tokens = re.findall(r"[a-z0-9#+.]+", text.lower())
    return [t for t in tokens if len(t) > 2 and t not in STOPWORDS]


def evaluate_responsibility_overlap(
    job_resp: str,
    resume: NormalizedResumeData
) -> Tuple[AlignmentLevel, Optional[str], float]:
    """
    Evaluates candidate experience bullets and project descriptions against a specific job duty.
    Returns: (AlignmentLevel, BestSupportingResumeEvidence, OverlapScore)
    """
    job_tokens = set(extract_keywords(job_resp))
    if not job_tokens:
        return (AlignmentLevel.NOT_DEMONSTRATED, None, 0.0)

    best_score = 0.0
    best_evidence: Optional[str] = None

    # Check experience bullet points
    for exp in resume.experiences:
        role = exp.get("role") or "Role"
        company = exp.get("company") or "Company"
        for bullet in exp.get("bullet_points") or []:
            b_tokens = set(extract_keywords(bullet))
            if not b_tokens:
                continue
            common = job_tokens.intersection(b_tokens)
            # Jaccard-like overlap biased toward job duty coverage
            score = len(common) / max(len(job_tokens), 1)

            if score > best_score:
                best_score = score
                best_evidence = f"[{role} at {company}]: {bullet}"

    # Check project descriptions
    for proj in resume.projects:
        title = proj.get("title") or "Project"
        desc = proj.get("description") or ""
        p_tokens = set(extract_keywords(desc))
        if p_tokens:
            common = job_tokens.intersection(p_tokens)
            score = len(common) / max(len(job_tokens), 1)
            if score > best_score:
                best_score = score
                best_evidence = f"[Project: {title}]: {desc}"

    # Classify alignment level based on semantic token overlap and context
    if best_score >= 0.40:
        return (AlignmentLevel.STRONG, best_evidence, best_score)
    elif best_score >= 0.20:
        return (AlignmentLevel.MODERATE, best_evidence, best_score)
    elif best_score >= 0.10:
        return (AlignmentLevel.LIMITED, best_evidence, best_score)
    else:
        return (AlignmentLevel.NOT_DEMONSTRATED, None, 0.0)


def match_all_responsibilities(
    job: NormalizedJobData,
    resume: NormalizedResumeData
) -> List[RequirementMatchItem]:
    """Evaluates all stated job responsibilities against candidate work history and projects."""
    items: List[RequirementMatchItem] = []

    for resp in job.responsibilities:
        cleaned_resp = clean_text(resp)
        alignment, evidence, score = evaluate_responsibility_overlap(cleaned_resp, resume)

        if alignment == AlignmentLevel.STRONG:
            items.append(RequirementMatchItem(
                requirement=cleaned_resp,
                category=RequirementCategory.RESPONSIBILITY,
                importance="HIGH",
                classification=MatchClassification.MATCHED,
                match_type=MatchType.SEMANTIC,
                resume_evidence=evidence,
                job_evidence=f"Expected duty: {cleaned_resp}",
                explanation="Candidate demonstrates strong verifiable experience and delivery corresponding to this core responsibility.",
                confidence=0.92,
                recommended_action=None
            ))
        elif alignment == AlignmentLevel.MODERATE:
            items.append(RequirementMatchItem(
                requirement=cleaned_resp,
                category=RequirementCategory.RESPONSIBILITY,
                importance="MEDIUM",
                classification=MatchClassification.PARTIALLY_MATCHED,
                match_type=MatchType.CLOSELY_RELATED,
                resume_evidence=evidence,
                job_evidence=f"Expected duty: {cleaned_resp}",
                explanation="Candidate's background demonstrates related tasks and collaborative deliverables, though exact scope or scale may differ.",
                confidence=0.80,
                recommended_action="Detail the quantifiable business impact or scale metrics of your work in this area to demonstrate full alignment."
            ))
        elif alignment == AlignmentLevel.LIMITED:
            items.append(RequirementMatchItem(
                requirement=cleaned_resp,
                category=RequirementCategory.RESPONSIBILITY,
                importance="MEDIUM",
                classification=MatchClassification.PARTIALLY_MATCHED,
                match_type=MatchType.SEMANTIC,
                resume_evidence=evidence,
                job_evidence=f"Expected duty: {cleaned_resp}",
                explanation="Partial or tangential experience identified; direct ownership of this responsibility is not fully established.",
                confidence=0.70,
                recommended_action="Consider highlighting specific instances where you participated in or led similar initiatives."
            ))
        else:
            items.append(RequirementMatchItem(
                requirement=cleaned_resp,
                category=RequirementCategory.RESPONSIBILITY,
                importance="MEDIUM",
                classification=MatchClassification.NOT_FOUND,
                match_type=MatchType.NONE,
                resume_evidence=None,
                job_evidence=f"Expected duty: {cleaned_resp}",
                explanation="Direct experience corresponding to this responsibility is not demonstrated in the submitted resume.",
                confidence=0.88,
                recommended_action="If you have performed this role function, add an achievement bullet detailing the project context and outcomes."
            ))

    return items
