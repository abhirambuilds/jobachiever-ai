from typing import Any, Dict, List, Optional, Set

from app.career_intelligence.prioritizer import calculate_skill_priority
from app.career_intelligence.schemas import (
    EvidenceStatus,
    GapClassification,
    SkillGapItem,
    SkillGapAnalysisResponse,
)
from app.career_intelligence.skill_normalizer import (
    canonicalize_skill,
    categorize_skill,
    clean_skill_text,
    evaluate_evidence_status,
)


ROLE_BENCHMARK_SKILLS: Dict[str, Dict[str, List[str]]] = {
    "backend": {
        "required": ["Java", "Spring Boot", "REST APIs", "SQL", "PostgreSQL", "Docker", "Git"],
        "preferred": ["Kubernetes", "Redis", "Apache Kafka", "Microservices Architecture", "Distributed System Design", "CI/CD", "JUnit 5"],
        "adjacent": ["GraphQL", "Go", "Amazon Web Services", "Linux"],
        "certifications": ["AWS Certified Solutions Architect", "Oracle Certified Professional: Java Developer"],
    },
    "full stack": {
        "required": ["JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS", "SQL", "REST APIs", "Git"],
        "preferred": ["Next.js", "PostgreSQL", "Tailwind CSS", "Docker", "GraphQL", "CI/CD"],
        "adjacent": ["Amazon Web Services", "Redis", "MongoDB", "Python"],
        "certifications": ["AWS Certified Developer", "Meta Front-End Developer Certificate"],
    },
    "ai/ml": {
        "required": ["Python", "Machine Learning", "PyTorch", "Data Processing", "NumPy", "Pandas", "Scikit-Learn", "Git"],
        "preferred": ["Deep Learning", "TensorFlow", "Large Language Models", "RAG (Retrieval-Augmented Generation)", "Vector Databases", "Docker"],
        "adjacent": ["FastAPI", "Apache Kafka", "Linux", "SQL"],
        "certifications": ["AWS Certified Machine Learning - Specialty", "TensorFlow Developer Certificate"],
    },
    "data scientist": {
        "required": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy", "Data Visualization"],
        "preferred": ["Scikit-Learn", "PyTorch", "R", "BigQuery", "Tableau", "Git"],
        "adjacent": ["Apache Spark", "Docker", "Cloud Data Warehouses"],
        "certifications": ["Google Professional Data Scientist", "AWS Certified Data Analytics"],
    },
    "cloud": {
        "required": ["Amazon Web Services", "Linux", "Docker", "Kubernetes", "Terraform", "CI/CD", "Networking & VPC"],
        "preferred": ["Google Cloud Platform", "Microsoft Azure", "Python", "Bash Scripting", "Prometheus", "Git"],
        "adjacent": ["Go", "Distributed System Design", "Security & IAM"],
        "certifications": ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)"],
    },
    "devops": {
        "required": ["CI/CD", "Docker", "Kubernetes", "Linux", "Git", "Terraform", "Bash Scripting"],
        "preferred": ["Amazon Web Services", "Ansible", "Prometheus", "Grafana", "Python", "Helm"],
        "adjacent": ["Golang", "Microservices Architecture", "Zero Downtime Deployments"],
        "certifications": ["Certified Kubernetes Administrator (CKA)", "AWS Certified DevOps Engineer"],
    },
}


def get_role_benchmark(target_role: str) -> Dict[str, List[str]]:
    """Resolves matching role benchmark or provides clean dynamic fallback."""
    r_lower = (target_role or "").lower()
    for key, data in ROLE_BENCHMARK_SKILLS.items():
        if key in r_lower:
            return data
    # Fallback generic benchmark
    return {
        "required": ["Git", "REST APIs", "SQL", "Unit Testing"],
        "preferred": ["Docker", "CI/CD", "Cloud Infrastructure"],
        "adjacent": ["System Architecture", "Security Best Practices"],
        "certifications": ["Industry Professional Accreditation"],
    }


def analyze_career_track_skill_gaps(
    career_track: Dict[str, Any],
    profile_data: Dict[str, Any],
    resume_evidence: Optional[Dict[str, Any]] = None,
    target_jobs: Optional[List[Dict[str, Any]]] = None,
) -> SkillGapAnalysisResponse:
    """Executes deterministic skill gap analysis comparing profile evidence against role requirements."""
    target_role = clean_skill_text(career_track.get("target_role") or "Software Engineer")
    benchmark = get_role_benchmark(target_role)

    # 1. Aggregate target required and preferred skills
    track_required = [canonicalize_skill(s) for s in (career_track.get("required_skills") or []) if isinstance(s, str)]
    track_preferred = [canonicalize_skill(s) for s in (career_track.get("preferred_skills") or []) if isinstance(s, str)]

    # If career track has empty skills, merge benchmark
    target_required_set = set(track_required) if track_required else set(benchmark.get("required") or [])
    target_preferred_set = set(track_preferred) if track_preferred else set(benchmark.get("preferred") or [])

    # If target jobs are supplied, enrich with job requirements
    if target_jobs:
        for job in target_jobs:
            for s in job.get("required_skills") or job.get("skills") or []:
                if isinstance(s, str) and s.strip():
                    target_required_set.add(canonicalize_skill(s))
            for s in job.get("preferred_skills") or []:
                if isinstance(s, str) and s.strip():
                    target_preferred_set.add(canonicalize_skill(s))

    all_target_skills = list(target_required_set.union(target_preferred_set))

    demonstrated_skills: List[str] = []
    developing_skills: List[str] = []
    missing_evidence_skills: List[str] = []
    skills_needing_review: List[str] = []
    critical_priorities: List[str] = []
    skill_gap_items: List[SkillGapItem] = []

    for skill in all_target_skills:
        importance = "REQUIRED" if skill in target_required_set else "PREFERRED"
        evidence_status, evidence_source = evaluate_evidence_status(skill, profile_data, resume_evidence)

        # Classification logic:
        # STRONG: Confirmed or Evidenced with high backing
        # DEVELOPING: In profile unverified or partially evidenced
        # MISSING_EVIDENCE: Not demonstrated
        # NEEDS_REVIEW: Ambiguous
        if evidence_status == EvidenceStatus.CONFIRMED:
            classification = GapClassification.STRONG
            demonstrated_skills.append(skill)
            gap_explanation = f"Fully confirmed in verified profile: {skill} aligns with target {target_role} expectations."
            next_step = f"Highlight {skill} with quantified deliverables on tailored resumes."
        elif evidence_status == EvidenceStatus.EVIDENCED:
            classification = GapClassification.STRONG
            demonstrated_skills.append(skill)
            gap_explanation = f"Demonstrated in work experience or projects. Ready for formal confirmation."
            next_step = f"Explicitly verify {skill} in Master Career Profile to formalize evidence."
        elif evidence_status == EvidenceStatus.UNVERIFIED:
            classification = GapClassification.DEVELOPING
            developing_skills.append(skill)
            gap_explanation = f"Present in profile draft but unconfirmed. Review evidence depth."
            next_step = f"Verify {skill} in Master Career Profile or attach a project repository link."
        elif evidence_status == EvidenceStatus.NEEDS_REVIEW:
            classification = GapClassification.NEEDS_REVIEW
            skills_needing_review.append(skill)
            gap_explanation = f"Indirect or partial mention found; unclear if production-ready."
            next_step = f"Clarify depth of {skill} in your experience descriptions or add a sample deliverable."
        else:
            classification = GapClassification.MISSING_EVIDENCE
            missing_evidence_skills.append(skill)
            gap_explanation = f"No direct evidence for {skill} in available profile or resume records."
            next_step = f"Build a practical deliverable or complete an accredited milestone to evidence {skill}."

        # Deterministic Priority Calculation
        priority, score = calculate_skill_priority(
            skill_name=skill,
            importance=importance,
            evidence_status=evidence_status,
            career_track=career_track,
            all_target_skills=all_target_skills,
            target_jobs=target_jobs,
        )

        if priority.value == "CRITICAL":
            critical_priorities.append(skill)

        category = categorize_skill(skill)

        item = SkillGapItem(
            skillName=skill,
            skillCategory=category,
            targetRole=target_role,
            importance=importance,
            currentEvidenceStatus=evidence_status,
            classification=classification,
            evidenceSource=evidence_source,
            gapExplanation=gap_explanation,
            recommendedNextStep=next_step,
            priority=priority,
            confidence="HIGH",
            score=score,
        )
        skill_gap_items.append(item)

    # Sort skill gap items by priority score descending
    skill_gap_items.sort(key=lambda x: (x.score or 0.0), reverse=True)

    summary = (
        f"Skill Gap Analysis for {target_role}: Identified {len(demonstrated_skills)} demonstrated skills, "
        f"{len(developing_skills)} developing skills, and {len(missing_evidence_skills)} missing evidence areas. "
        f"{len(critical_priorities)} critical priorities warrant immediate focus."
    )

    adjacent = [s for s in benchmark.get("adjacent") or [] if s not in all_target_skills]
    certs = benchmark.get("certifications") or []

    return SkillGapAnalysisResponse(
        careerTrackId=career_track.get("id"),
        targetRole=target_role,
        summary=summary,
        demonstratedSkills=sorted(demonstrated_skills),
        developingSkills=sorted(developing_skills),
        missingEvidenceSkills=sorted(missing_evidence_skills),
        skillsNeedingReview=sorted(skills_needing_review),
        criticalPriorities=sorted(critical_priorities),
        skillGaps=skill_gap_items,
        adjacentSkills=adjacent,
        suggestedCertifications=certs,
    )
