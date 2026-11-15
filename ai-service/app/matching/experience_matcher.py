import re
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from app.matching.normalizer import NormalizedJobData, NormalizedResumeData, clean_text
from app.matching.schemas import MatchClassification, MatchType, RequirementCategory, RequirementMatchItem

MONTH_NAMES = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10, "nov": 11, "november": 11, "dec": 12, "december": 12
}


def parse_date_to_month_index(date_str: Optional[str]) -> Optional[int]:
    """
    Parses fuzzy resume date string into an integer month index (year * 12 + month).
    Returns None if date cannot be deterministically inferred.
    """
    if not date_str:
        return None
    d = date_str.strip().lower()
    if d in ("present", "current", "now", "ongoing"):
        now = datetime.now(timezone.utc)
        return now.year * 12 + now.month

    # Check "YYYY-MM" or "YYYY/MM"
    m = re.search(r"(\d{4})[-/.](\d{1,2})", d)
    if m:
        year, month = int(m.group(1)), int(m.group(2))
        if 1 <= month <= 12:
            return year * 12 + month

    # Check "Month YYYY" e.g. "June 2021" or "Jun 2021"
    m = re.search(r"([a-z]+)\s*(\d{4})", d)
    if m:
        mon_str, year = m.group(1), int(m.group(2))
        if mon_str in MONTH_NAMES:
            return year * 12 + MONTH_NAMES[mon_str]

    # Check bare year e.g. "2021" -> assume mid-year (June)
    m = re.search(r"\b(19\d{2}|20\d{2})\b", d)
    if m:
        year = int(m.group(1))
        return year * 12 + 6

    return None


def merge_intervals(intervals: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """Merges overlapping date intervals to guarantee zero double-counting."""
    if not intervals:
        return []
    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    merged = [sorted_intervals[0]]
    for current in sorted_intervals[1:]:
        prev_start, prev_end = merged[-1]
        cur_start, cur_end = current
        if cur_start <= prev_end:
            merged[-1] = (prev_start, max(prev_end, cur_end))
        else:
            merged.append(current)
    return merged


def calculate_experience_duration(resume: NormalizedResumeData) -> Tuple[float, float, List[str]]:
    """
    Computes total non-overlapping years of professional experience and internship experience separately.
    Returns: (professional_years, internship_years, evidence_descriptions)
    """
    pro_intervals: List[Tuple[int, int]] = []
    intern_intervals: List[Tuple[int, int]] = []
    excerpts: List[str] = []

    for exp in resume.experiences:
        role = exp.get("role") or ""
        company = exp.get("company") or ""
        start_raw = exp.get("start_date")
        end_raw = exp.get("end_date")
        is_current = exp.get("is_current")

        start_idx = parse_date_to_month_index(start_raw)
        end_idx = parse_date_to_month_index(end_raw)

        if is_current and not end_idx:
            now = datetime.now(timezone.utc)
            end_idx = now.year * 12 + now.month

        if start_idx and end_idx and end_idx >= start_idx:
            is_intern = bool(re.search(r"\b(intern|internship|fellow|co-?op|apprentice)\b", role.lower()))
            interval = (start_idx, end_idx)
            if is_intern:
                intern_intervals.append(interval)
            else:
                pro_intervals.append(interval)

            duration_months = end_idx - start_idx
            excerpts.append(f"{role} at {company} ({start_raw or ''} - {end_raw or 'Present'}, ~{duration_months} mos)")

    merged_pro = merge_intervals(pro_intervals)
    merged_intern = merge_intervals(intern_intervals)

    pro_months = sum((end - start) for start, end in merged_pro)
    intern_months = sum((end - start) for start, end in merged_intern)

    return (round(pro_months / 12.0, 1), round(intern_months / 12.0, 1), excerpts)


def evaluate_experience_alignment(
    job: NormalizedJobData,
    resume: NormalizedResumeData
) -> RequirementMatchItem:
    """Evaluates candidate experience duration and seniority against stated job expectations."""
    min_years = job.min_years
    raw_req = job.raw_experience_req or (f"{min_years}+ years" if min_years else None)

    # If the job description does not specify an experience requirement
    if min_years is None:
        pro_years, _, excerpts = calculate_experience_duration(resume)
        return RequirementMatchItem(
            requirement="Relevant Professional Experience",
            category=RequirementCategory.EXPERIENCE,
            importance="HIGH",
            classification=MatchClassification.MATCHED,
            match_type=MatchType.EXACT,
            resume_evidence="; ".join(excerpts) if excerpts else f"Documented background shows {len(resume.experiences)} roles.",
            job_evidence="No strict minimum years requirement explicitly stated in job description.",
            explanation="The job description does not specify a mandatory minimum experience duration; candidate possesses relevant background.",
            confidence=0.9,
            recommended_action=None
        )

    pro_years, intern_years, excerpts = calculate_experience_duration(resume)
    job_quote = f"Stated requirement: {raw_req}"
    resume_quote = f"Established professional experience: {pro_years} years across documented positions ({'; '.join(excerpts[:2])})."

    if intern_years > 0:
        resume_quote += f" Additional internship experience: {intern_years} years."

    if pro_years >= min_years:
        return RequirementMatchItem(
            requirement=f"Experience Duration: {raw_req}",
            category=RequirementCategory.EXPERIENCE,
            importance="CRITICAL",
            classification=MatchClassification.MATCHED,
            match_type=MatchType.EXACT,
            resume_evidence=resume_quote,
            job_evidence=job_quote,
            explanation=f"Candidate's non-overlapping professional tenure of ~{pro_years} years fully satisfies the stated requirement of {min_years} years.",
            confidence=0.95,
            recommended_action=None
        )
    elif pro_years + intern_years >= min_years:
        return RequirementMatchItem(
            requirement=f"Experience Duration: {raw_req}",
            category=RequirementCategory.EXPERIENCE,
            importance="CRITICAL",
            classification=MatchClassification.PARTIALLY_MATCHED,
            match_type=MatchType.CLOSELY_RELATED,
            resume_evidence=resume_quote,
            job_evidence=job_quote,
            explanation=f"Candidate documents {pro_years} years of professional roles and {intern_years} years of internships (~{pro_years + intern_years} total), partially satisfying the {min_years}-year target.",
            confidence=0.85,
            recommended_action="Highlight scope of impact and production responsibilities undertaken during your internships to demonstrate full equivalence."
        )
    elif pro_years > 0:
        gap = round(min_years - pro_years, 1)
        return RequirementMatchItem(
            requirement=f"Experience Duration: {raw_req}",
            category=RequirementCategory.EXPERIENCE,
            importance="CRITICAL",
            classification=MatchClassification.PARTIALLY_MATCHED,
            match_type=MatchType.CLOSELY_RELATED,
            resume_evidence=resume_quote,
            job_evidence=job_quote,
            explanation=f"Resume establishes approximately {pro_years} years of documented professional experience, which is {gap} years below the stated requirement of {min_years} years.",
            confidence=0.9,
            recommended_action="Emphasize rapid delivery, architectural ownership, and high-impact deliverables to compensate for the stated tenure gap."
        )
    else:
        # Dates missing or no employment records found
        if resume.experiences:
            return RequirementMatchItem(
                requirement=f"Experience Duration: {raw_req}",
                category=RequirementCategory.EXPERIENCE,
                importance="CRITICAL",
                classification=MatchClassification.NEEDS_REVIEW,
                match_type=MatchType.NONE,
                resume_evidence="Roles documented but dates are missing or partial.",
                job_evidence=job_quote,
                explanation="Employment history is present in the resume, but start and end dates could not be verified to compute non-overlapping duration.",
                confidence=0.7,
                recommended_action="Ensure clear month and year dates (e.g. 'Jan 2022 – Present') are included for every employment entry."
            )
        else:
            return RequirementMatchItem(
                requirement=f"Experience Duration: {raw_req}",
                category=RequirementCategory.EXPERIENCE,
                importance="CRITICAL",
                classification=MatchClassification.NOT_FOUND,
                match_type=MatchType.NONE,
                resume_evidence=None,
                job_evidence=job_quote,
                explanation=f"No professional employment history matching the {min_years}-year requirement was identified in the submitted resume.",
                confidence=0.95,
                recommended_action="Consider highlighting extensive personal, capstone, or open-source software project contributions."
            )
