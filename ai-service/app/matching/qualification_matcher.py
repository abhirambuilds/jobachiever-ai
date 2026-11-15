import re
from typing import List, Optional

from app.matching.normalizer import NormalizedJobData, NormalizedResumeData, clean_text
from app.matching.schemas import MatchClassification, MatchType, RequirementCategory, RequirementMatchItem

DEGREE_LEVELS = {
    "phd": 4, "doctorate": 4, "ph.d": 4,
    "masters": 3, "ms": 3, "m.s": 3, "mtech": 3, "m.tech": 3, "mba": 3,
    "bachelors": 2, "bs": 2, "b.s": 2, "btech": 2, "b.tech": 2, "ba": 2, "b.e": 2, "undergraduate": 2,
    "associate": 1, "diploma": 1, "bootcamp": 1
}

TECH_FIELDS = {
    "computer science", "software engineering", "computer engineering", "information technology",
    "data science", "electrical engineering", "mathematics", "statistics", "computational science"
}


def parse_degree_level(text: str) -> int:
    """Returns numerical hierarchy for degree level (1-4)."""
    t = text.lower()
    for key, lvl in DEGREE_LEVELS.items():
        if re.search(r"\b" + re.escape(key) + r"\b", t):
            return lvl
    return 2 if "degree" in t else 0


def match_education(
    job_edu: str,
    resume: NormalizedResumeData
) -> RequirementMatchItem:
    """Compares stated educational degree requirement against candidate's academic background."""
    cleaned_req = clean_text(job_edu)
    target_lvl = parse_degree_level(cleaned_req)
    allows_equivalent = bool(re.search(r"\b(equivalent|related field|practical experience)\b", cleaned_req.lower()))

    if not resume.education:
        return RequirementMatchItem(
            requirement=cleaned_req,
            category=RequirementCategory.EDUCATION,
            importance="HIGH",
            classification=MatchClassification.NOT_FOUND,
            match_type=MatchType.NONE,
            resume_evidence=None,
            job_evidence=f"Stated requirement: {cleaned_req}",
            explanation="Educational credentials are not demonstrated in the submitted resume.",
            confidence=0.95,
            recommended_action="If you hold an accredited degree or equivalent credentials, add an Education section to your resume."
        )

    best_match: Optional[RequirementMatchItem] = None
    for edu in resume.education:
        deg = edu.get("degree") or ""
        field = edu.get("field_of_study") or ""
        inst = edu.get("institution") or ""
        resume_lvl = parse_degree_level(deg)
        field_lower = field.lower()

        evidence_str = f"{deg} in {field} from {inst}".strip() if field else f"{deg} from {inst}".strip()

        # Check field alignment
        field_match = any(tf in field_lower for tf in TECH_FIELDS) or (field_lower in cleaned_req.lower())

        if resume_lvl >= target_lvl and field_match:
            return RequirementMatchItem(
                requirement=cleaned_req,
                category=RequirementCategory.EDUCATION,
                importance="HIGH",
                classification=MatchClassification.MATCHED,
                match_type=MatchType.EXACT,
                resume_evidence=evidence_str,
                job_evidence=f"Stated requirement: {cleaned_req}",
                explanation=f"Candidate's verified {deg} in {field} fully satisfies the requested degree level and field of study.",
                confidence=1.0,
                recommended_action=None
            )
        elif resume_lvl >= target_lvl and allows_equivalent:
            best_match = RequirementMatchItem(
                requirement=cleaned_req,
                category=RequirementCategory.EDUCATION,
                importance="HIGH",
                classification=MatchClassification.MATCHED,
                match_type=MatchType.ALIAS,
                resume_evidence=evidence_str,
                job_evidence=f"Stated requirement: {cleaned_req}",
                explanation=f"Candidate holds an accredited {deg} in {field}, satisfying the job's requirement for equivalent degree disciplines.",
                confidence=0.9,
                recommended_action=None
            )
        elif resume_lvl >= 1:
            best_match = RequirementMatchItem(
                requirement=cleaned_req,
                category=RequirementCategory.EDUCATION,
                importance="MEDIUM",
                classification=MatchClassification.PARTIALLY_MATCHED,
                match_type=MatchType.CLOSELY_RELATED,
                resume_evidence=evidence_str,
                job_evidence=f"Stated requirement: {cleaned_req}",
                explanation=f"Candidate documents a {deg} in {field}, demonstrating related educational foundations.",
                confidence=0.8,
                recommended_action="Highlight core coursework and quantitative problem-solving foundations relevant to the target role."
            )

    return best_match or RequirementMatchItem(
        requirement=cleaned_req,
        category=RequirementCategory.EDUCATION,
        importance="HIGH",
        classification=MatchClassification.NOT_FOUND,
        match_type=MatchType.NONE,
        resume_evidence=None,
        job_evidence=f"Stated requirement: {cleaned_req}",
        explanation=f"Resume does not demonstrate degree requirements matching '{cleaned_req}'.",
        confidence=0.9,
        recommended_action="Ensure your highest completed degree and major are clearly documented in the Education section."
    )


def match_certifications(
    job_certs: List[str],
    resume: NormalizedResumeData
) -> List[RequirementMatchItem]:
    """Compares requested industry certifications against resume certifications."""
    items: List[RequirementMatchItem] = []
    resume_cert_names = [clean_text(c.get("name") or "") for c in resume.certifications]
    resume_cert_lower = [c.lower() for c in resume_cert_names]

    for cert in job_certs:
        cleaned_cert = clean_text(cert)
        cert_lower = cleaned_cert.lower()
        matched = False

        for r_name, r_lower in zip(resume_cert_names, resume_cert_lower):
            if cert_lower in r_lower or r_lower in cert_lower:
                items.append(RequirementMatchItem(
                    requirement=cleaned_cert,
                    category=RequirementCategory.CERTIFICATION,
                    importance="MEDIUM",
                    classification=MatchClassification.MATCHED,
                    match_type=MatchType.EXACT,
                    resume_evidence=f"Verified certification: {r_name}",
                    job_evidence=f"Requested certification: {cleaned_cert}",
                    explanation=f"The resume demonstrates the requested credential: {r_name}.",
                    confidence=1.0,
                    recommended_action=None
                ))
                matched = True
                break

        if not matched:
            items.append(RequirementMatchItem(
                requirement=cleaned_cert,
                category=RequirementCategory.CERTIFICATION,
                importance="LOW",
                classification=MatchClassification.NOT_FOUND,
                match_type=MatchType.NONE,
                resume_evidence=None,
                job_evidence=f"Requested certification: {cleaned_cert}",
                explanation=f"Certification '{cleaned_cert}' is not demonstrated in the submitted resume.",
                confidence=1.0,
                recommended_action=f"If you hold or are currently studying for {cleaned_cert}, consider adding it to your certifications."
            ))

    return items
