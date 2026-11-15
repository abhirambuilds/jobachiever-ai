import re
from typing import Any, Dict, List, Optional, Set


def clean_text(text: Optional[str]) -> str:
    """Removes excess whitespace, newlines, and normalizes casing for comparison."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def normalize_token(text: str) -> str:
    """Canonical token normalization: lowercases and removes non-alphanumeric punctuation except plus and sharp."""
    if not text:
        return ""
    cleaned = text.strip().lower()
    # Normalize c++ -> cpp, c# -> csharp for string matching safety
    cleaned = re.sub(r"[\(\)\[\]\{\},:;]", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


class NormalizedResumeData:
    """Normalized structured resume data for deterministic and semantic comparison."""

    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        self.skills: List[str] = self._extract_skills(raw)
        self.skill_set_normalized: Set[str] = {normalize_token(s) for s in self.skills if s}
        self.experiences: List[Dict[str, Any]] = self._extract_experiences(raw)
        self.projects: List[Dict[str, Any]] = self._extract_projects(raw)
        self.education: List[Dict[str, Any]] = self._extract_education(raw)
        self.certifications: List[Dict[str, Any]] = self._extract_certifications(raw)
        self.summary: str = clean_text(raw.get("summary") or "")
        self.raw_text: str = clean_text(raw.get("raw_text") or raw.get("rawText") or "")

    def _extract_skills(self, raw: Dict[str, Any]) -> List[str]:
        skills = []
        raw_skills = raw.get("skills") or []
        for s in raw_skills:
            if isinstance(s, dict):
                name = s.get("name") or s.get("skill")
                if name:
                    skills.append(clean_text(name))
            elif isinstance(s, str):
                skills.append(clean_text(s))

        # Also aggregate project technologies
        for proj in raw.get("projects") or []:
            if isinstance(proj, dict):
                for tech in proj.get("technologies") or []:
                    if tech and clean_text(tech) not in skills:
                        skills.append(clean_text(tech))

        return skills

    def _extract_experiences(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        exp_list = []
        for e in raw.get("experience") or []:
            if isinstance(e, dict):
                bullets = e.get("bullet_points") or e.get("bulletPoints") or []
                exp_list.append({
                    "company": clean_text(e.get("company")),
                    "role": clean_text(e.get("role") or e.get("title")),
                    "start_date": clean_text(e.get("start_date") or e.get("startDate")),
                    "end_date": clean_text(e.get("end_date") or e.get("endDate")),
                    "is_current": bool(e.get("is_current") or e.get("isCurrent", False)),
                    "bullet_points": [clean_text(b) for b in bullets if b],
                    "original_text": clean_text(e.get("original_text") or e.get("originalText") or ""),
                })
        return exp_list

    def _extract_projects(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        proj_list = []
        for p in raw.get("projects") or []:
            if isinstance(p, dict):
                proj_list.append({
                    "title": clean_text(p.get("title")),
                    "description": clean_text(p.get("description")),
                    "technologies": [clean_text(t) for t in p.get("technologies") or [] if t],
                    "original_text": clean_text(p.get("original_text") or p.get("originalText") or ""),
                })
        return proj_list

    def _extract_education(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        edu_list = []
        for edu in raw.get("education") or []:
            if isinstance(edu, dict):
                edu_list.append({
                    "degree": clean_text(edu.get("degree")),
                    "field_of_study": clean_text(edu.get("field_of_study") or edu.get("fieldOfStudy")),
                    "institution": clean_text(edu.get("institution")),
                    "start_date": clean_text(edu.get("start_date") or edu.get("startDate")),
                    "end_date": clean_text(edu.get("end_date") or edu.get("endDate")),
                    "is_current": bool(edu.get("is_current") or edu.get("isCurrent", False)),
                    "original_text": clean_text(edu.get("original_text") or edu.get("originalText") or ""),
                })
        return edu_list

    def _extract_certifications(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        cert_list = []
        for c in raw.get("certifications") or []:
            if isinstance(c, dict):
                cert_list.append({
                    "name": clean_text(c.get("name")),
                    "issuer": clean_text(c.get("issuer")),
                    "issue_date": clean_text(c.get("issue_date") or c.get("issueDate")),
                    "original_text": clean_text(c.get("original_text") or c.get("originalText") or ""),
                })
            elif isinstance(c, str):
                cert_list.append({"name": clean_text(c), "issuer": "", "original_text": c})
        return cert_list


class NormalizedJobData:
    """Normalized structured job requirements for deterministic and semantic comparison."""

    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        overview = raw.get("job_overview") or raw.get("jobOverview") or {}
        skills = raw.get("technical_skills") or raw.get("technicalSkills") or {}
        quals = raw.get("qualifications") or {}
        exp_range = overview.get("experience_range") or overview.get("experienceRange") or {}

        self.job_title: str = clean_text(overview.get("job_title") or overview.get("jobTitle") or raw.get("title") or "")
        self.company_name: str = clean_text(overview.get("company_name") or overview.get("companyName") or raw.get("companyName") or "")
        self.seniority: str = clean_text(overview.get("seniority") or "UNKNOWN")
        self.min_years: Optional[float] = exp_range.get("minimum_years") or exp_range.get("minimumYears")
        self.max_years: Optional[float] = exp_range.get("maximum_years") or exp_range.get("maximumYears")
        self.raw_experience_req: str = clean_text(exp_range.get("raw_requirement") or exp_range.get("rawRequirement") or "")

        self.required_skills: List[str] = [clean_text(s) for s in skills.get("required") or [] if s]
        self.preferred_skills: List[str] = [clean_text(s) for s in skills.get("preferred") or [] if s]
        self.mentioned_skills: List[str] = [clean_text(s) for s in skills.get("mentioned") or [] if s]

        self.education: List[str] = [clean_text(e) for e in quals.get("education") or [] if e]
        self.certifications: List[str] = [clean_text(c) for c in quals.get("certifications") or [] if c]
        self.other_requirements: List[str] = [clean_text(o) for o in quals.get("other_requirements") or quals.get("otherRequirements") or [] if o]

        self.responsibilities: List[str] = [clean_text(r) for r in raw.get("responsibilities") or [] if r]
        self.tools_and_technologies: List[str] = [clean_text(t) for t in raw.get("tools_and_technologies") or raw.get("toolsAndTechnologies") or [] if t]

        keywords = raw.get("keywords") or {}
        self.domain_keywords: List[str] = [clean_text(d) for d in keywords.get("domain") or [] if d]
        self.raw_text: str = clean_text(raw.get("raw_text") or raw.get("rawText") or raw.get("description") or "")
