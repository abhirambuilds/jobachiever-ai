import pytest
from app.schemas.common import ConfidenceLevel, VerificationStatus
from app.services.parsing.field_normalizer import FieldNormalizer


def test_extract_personal_info():
    """Extracts candidate contact details with high confidence."""
    lines = [
        "Emily Watson",
        "emily.watson@domain.org | +1 (555) 345-6789 | Seattle, WA",
        "https://linkedin.com/in/emilywatson",
        "https://github.com/emilywatson",
        "https://emilywatson.dev"
    ]
    info = FieldNormalizer.extract_personal_info(lines)

    assert info.name == "Emily Watson"
    assert info.email == "emily.watson@domain.org"
    assert "555" in info.phone and "345" in info.phone
    assert info.location == "Seattle, WA"
    assert info.linkedin == "https://linkedin.com/in/emilywatson"
    assert info.github == "https://github.com/emilywatson"
    assert info.portfolio == "https://emilywatson.dev"
    assert info.confidence in (ConfidenceLevel.HIGH, ConfidenceLevel.MEDIUM)
    assert info.verification_status == VerificationStatus.UNVERIFIED


def test_missing_personal_fields_remain_null():
    """Unstated contact fields remain None without fabrication."""
    lines = [
        "Anonymous Developer",
        "dev@anonymous.io"
    ]
    info = FieldNormalizer.extract_personal_info(lines)

    assert info.name == "Anonymous Developer"
    assert info.email == "dev@anonymous.io"
    assert info.phone is None
    assert info.location is None
    assert info.linkedin is None
    assert info.github is None
    assert info.portfolio is None


def test_extract_education():
    """Extracts degree, institution, GPA, and graduation dates."""
    lines = [
        "Massachusetts Institute of Technology",
        "Bachelor of Science in Electrical Engineering and Computer Science",
        "Graduated: 2019 - 2023",
        "GPA: 3.92 / 4.0"
    ]
    items = FieldNormalizer.extract_education(lines)

    assert len(items) == 1
    edu = items[0]
    assert "Massachusetts Institute of Technology" in edu.institution
    assert "Bachelor of Science" in edu.degree
    assert "Computer Science" in edu.field_of_study or "Electrical Engineering" in edu.field_of_study
    assert edu.start_date == "2019"
    assert edu.end_date == "2023"
    assert not edu.is_current
    assert "3.92" in edu.gpa
    assert edu.confidence == ConfidenceLevel.HIGH
    assert edu.verification_status == VerificationStatus.UNVERIFIED


def test_extract_skills_with_categorization():
    """Extracts and automatically categorizes skills from taxonomy."""
    lines = [
        "Programming: Python, Java, TypeScript, Go",
        "Frameworks: React, Spring Boot, FastAPI",
        "Databases & Cloud: PostgreSQL, Docker, AWS, Kubernetes"
    ]
    skills = FieldNormalizer.extract_skills(lines)
    skill_names = [s.name for s in skills]

    assert "Python" in skill_names
    assert "Java" in skill_names
    assert "React" in skill_names
    assert "Docker" in skill_names

    # Check categorization
    py_skill = next(s for s in skills if s.name.lower() == "python")
    assert py_skill.category == "Programming Languages"

    react_skill = next(s for s in skills if s.name.lower() == "react")
    assert react_skill.category == "Frontend Frameworks"

    docker_skill = next(s for s in skills if s.name.lower() == "docker")
    assert docker_skill.category == "Cloud & DevOps"

    for s in skills:
        assert s.verification_status == VerificationStatus.UNVERIFIED


def test_extract_work_experience_and_bullet_points():
    """Extracts company, role, date range, current role flag, and bullet points."""
    lines = [
        "Lead Backend Engineer | Enterprise Systems",
        "May 2021 - Present",
        "• Architected distributed transaction engine handling 5,000 TPS.",
        "• Mentored 8 junior developers on code quality and microservice design.",
        "• Reduced cloud infrastructure costs by $120,000 annually."
    ]
    items = FieldNormalizer.extract_experience(lines)

    assert len(items) == 1
    exp = items[0]
    assert exp.role == "Lead Backend Engineer"
    assert exp.company == "Enterprise Systems"
    assert exp.start_date == "May 2021"
    assert exp.end_date == "Present"
    assert exp.is_current is True
    assert len(exp.bullet_points) == 3
    assert "5,000 TPS" in exp.bullet_points[0]
    assert exp.verification_status == VerificationStatus.UNVERIFIED


def test_extract_projects():
    """Extracts project title, description, technology list, and repository link."""
    lines = [
        "Autonomous Agent Orchestrator | Python, FastAPI, Docker",
        "https://github.com/developer/agent-orchestrator",
        "Built a multi-agent framework capable of concurrent workflow coordination and evaluation."
    ]
    items = FieldNormalizer.extract_projects(lines)

    assert len(items) == 1
    proj = items[0]
    assert proj.title == "Autonomous Agent Orchestrator"
    assert "Python" in proj.technologies
    assert "FastAPI" in proj.technologies
    assert proj.link == "https://github.com/developer/agent-orchestrator"
    assert "multi-agent framework" in proj.description
    assert proj.verification_status == VerificationStatus.UNVERIFIED


def test_extract_certifications():
    """Extracts certification name, issuer, and issuance date."""
    lines = [
        "Certified Kubernetes Administrator (CKA) - Cloud Native Computing Foundation, 2023",
        "AWS Certified Solutions Architect - Amazon Web Services, 2022"
    ]
    items = FieldNormalizer.extract_certifications(lines)

    assert len(items) == 2
    assert "Kubernetes" in items[0].name
    assert "Cloud Native Computing Foundation" in items[0].issuer
    assert items[0].issue_date == "2023"
    assert items[0].verification_status == VerificationStatus.UNVERIFIED
