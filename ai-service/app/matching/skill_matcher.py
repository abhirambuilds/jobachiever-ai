import re
from typing import List, Optional, Tuple

from app.matching.normalizer import NormalizedJobData, NormalizedResumeData, clean_text, normalize_token
from app.matching.schemas import MatchClassification, MatchType, RequirementCategory, RequirementMatchItem

CANONICAL_ALIASES = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "golang": "Go",
    "go": "Go",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "aws": "Amazon Web Services",
    "amazon web services": "Amazon Web Services",
    "gcp": "Google Cloud Platform",
    "google cloud platform": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "kafka": "Apache Kafka",
    "apache kafka": "Apache Kafka",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "spring": "Spring Framework",
    "spring framework": "Spring Framework",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tf": "Terraform",
    "terraform": "Terraform",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "c#": "C#",
    "csharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "git": "Git",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "linux": "Linux",
    "sql": "SQL",
    "nosql": "NoSQL",
    "java 21": "Java 21",
    "java": "Java",
}

CLOSELY_RELATED_SKILLS = {
    "TypeScript": ["JavaScript"],
    "Next.js": ["React"],
    "Spring Boot": ["Spring Framework", "Java"],
    "Kubernetes": ["Docker"],
    "PostgreSQL": ["MySQL", "SQL"],
    "MySQL": ["PostgreSQL", "SQL"],
    "Google Cloud Platform": ["Amazon Web Services", "Microsoft Azure"],
    "Amazon Web Services": ["Google Cloud Platform", "Microsoft Azure"],
    "Microsoft Azure": ["Amazon Web Services", "Google Cloud Platform"],
    "FastAPI": ["Python", "Flask"],
    "Vue.js": ["JavaScript", "React"],
    "GraphQL": ["REST APIs"],
}


def canonicalize_skill(skill_str: str) -> str:
    """Resolves a skill string to its canonical form if known, else preserves clean title."""
    norm = normalize_token(skill_str)
    return CANONICAL_ALIASES.get(norm, clean_text(skill_str))


def find_resume_evidence_for_skill(skill_name: str, resume: NormalizedResumeData) -> Optional[str]:
    """Finds verbatim evidence excerpt in resume where skill or canonical alias appears."""
    target_terms = {skill_name.lower(), normalize_token(skill_name)}
    canon = canonicalize_skill(skill_name)
    target_terms.add(canon.lower())
    for k, v in CANONICAL_ALIASES.items():
        if v.lower() == canon.lower():
            target_terms.add(k)

    # 1. Search in experience bullet points
    for exp in resume.experiences:
        for b in exp.get("bullet_points") or []:
            b_lower = b.lower()
            for term in target_terms:
                if re.search(r"\b" + re.escape(term) + r"\b", b_lower):
                    role_info = f"[{exp.get('role', 'Role')} at {exp.get('company', 'Company')}]: "
                    return role_info + b

    # 2. Search in project descriptions and technologies
    for proj in resume.projects:
        for tech in proj.get("technologies") or []:
            if tech.lower() in target_terms:
                return f"[Project: {proj.get('title', 'Project')}]: Built using {tech}. {proj.get('description', '')}".strip()
        p_desc = (proj.get("description") or "").lower()
        for term in target_terms:
            if re.search(r"\b" + re.escape(term) + r"\b", p_desc):
                return f"[Project: {proj.get('title', 'Project')}]: {proj.get('description')}"

    # 3. Check resume skills list
    for s in resume.skills:
        if s.lower() in target_terms:
            return f"Listed under Technical Skills: {s}"

    # 4. Search raw text
    for line in resume.raw_text.splitlines():
        line_clean = clean_text(line)
        for term in target_terms:
            if re.search(r"\b" + re.escape(term) + r"\b", line_clean.lower()):
                return line_clean

    return None


def match_single_skill(
    skill_req: str,
    resume: NormalizedResumeData,
    category: RequirementCategory,
    importance: str = "HIGH",
    job_evidence: Optional[str] = None
) -> RequirementMatchItem:
    """
    Evaluates one job technical skill requirement against normalized resume evidence.
    Enforces deterministic multi-tier matching:
    Tier 1: Exact match (case-insensitive) -> MATCHED (EXACT)
    Tier 2: Canonical Alias match -> MATCHED (ALIAS)
    Tier 3: Closely Related skill match -> PARTIALLY_MATCHED (CLOSELY_RELATED)
    Tier 4: Missing -> NOT_FOUND (NONE) with respectful wording.
    """
    cleaned_req = clean_text(skill_req)
    canon_req = canonicalize_skill(cleaned_req)
    req_token = normalize_token(cleaned_req)
    evidence = find_resume_evidence_for_skill(cleaned_req, resume)

    # Tier 1: Exact match
    for resume_skill in resume.skills:
        if normalize_token(resume_skill) == req_token or resume_skill.strip().lower() == cleaned_req.lower():
            return RequirementMatchItem(
                requirement=cleaned_req,
                category=category,
                importance=importance,
                classification=MatchClassification.MATCHED,
                match_type=MatchType.EXACT,
                resume_evidence=evidence or f"Documented under technical skills: {resume_skill}",
                job_evidence=job_evidence or f"Required in job specifications: {cleaned_req}",
                explanation=f"The resume explicitly demonstrates the requested proficiency in {cleaned_req}.",
                confidence=1.0,
                recommended_action=None
            )

    # Tier 2: Canonical Alias match
    for resume_skill in resume.skills:
        if canonicalize_skill(resume_skill).lower() == canon_req.lower():
            return RequirementMatchItem(
                requirement=cleaned_req,
                category=category,
                importance=importance,
                classification=MatchClassification.MATCHED,
                match_type=MatchType.ALIAS,
                resume_evidence=evidence or f"Demonstrated as alias '{resume_skill}' in resume",
                job_evidence=job_evidence or f"Required in job specifications: {cleaned_req}",
                explanation=f"The resume documents '{resume_skill}', which is a verified industry standard alias for {canon_req}.",
                confidence=0.98,
                recommended_action=None
            )

    # Check if evidence was found in bullet points even if not in skills list
    if evidence:
        return RequirementMatchItem(
            requirement=cleaned_req,
            category=category,
            importance=importance,
            classification=MatchClassification.MATCHED,
            match_type=MatchType.EXACT,
            resume_evidence=evidence,
            job_evidence=job_evidence or f"Required in job specifications: {cleaned_req}",
            explanation=f"Verified real-world application of {cleaned_req} identified in candidate experience or projects.",
            confidence=0.95,
            recommended_action=None
        )

    # Tier 3: Closely related skills (Partial Match)
    related_candidates = CLOSELY_RELATED_SKILLS.get(canon_req, [])
    for related in related_candidates:
        related_evidence = find_resume_evidence_for_skill(related, resume)
        if related_evidence or normalize_token(related) in resume.skill_set_normalized:
            return RequirementMatchItem(
                requirement=cleaned_req,
                category=category,
                importance=importance,
                classification=MatchClassification.PARTIALLY_MATCHED,
                match_type=MatchType.CLOSELY_RELATED,
                resume_evidence=related_evidence or f"Documents related technology: {related}",
                job_evidence=job_evidence or f"Required in job specifications: {cleaned_req}",
                explanation=f"The resume demonstrates {related}, which is closely related to {cleaned_req}, providing strong transferable foundations.",
                confidence=0.75,
                recommended_action=f"Highlight hands-on exposure to {cleaned_req} alongside your proven {related} experience if applicable."
            )

    # Tier 4: Not demonstrated in resume (NOT_FOUND)
    is_required = category == RequirementCategory.REQUIRED_SKILL
    action = (
        f"If you possess verified hands-on experience with {cleaned_req}, consider adding a project or role bullet detailing its use."
        if is_required
        else f"Consider gaining exposure to {cleaned_req} as a valuable bonus capability for this role."
    )

    return RequirementMatchItem(
        requirement=cleaned_req,
        category=category,
        importance=importance,
        classification=MatchClassification.NOT_FOUND,
        match_type=MatchType.NONE,
        resume_evidence=None,
        job_evidence=job_evidence or f"Stated in job posting: {cleaned_req}",
        explanation=f"Experience with {cleaned_req} is not demonstrated in the submitted resume.",
        confidence=1.0,
        recommended_action=action
    )


def match_all_technical_skills(
    job: NormalizedJobData,
    resume: NormalizedResumeData
) -> List[RequirementMatchItem]:
    """Matches all required, preferred, and mentioned skills deterministically."""
    results: List[RequirementMatchItem] = []

    for req in job.required_skills:
        results.append(match_single_skill(req, resume, RequirementCategory.REQUIRED_SKILL, importance="CRITICAL"))

    for pref in job.preferred_skills:
        results.append(match_single_skill(pref, resume, RequirementCategory.PREFERRED_SKILL, importance="MEDIUM"))

    return results
