import re
from typing import Any, Dict, List, Optional, Set, Tuple

from app.career_intelligence.schemas import EvidenceStatus


CANONICAL_ALIASES: Dict[str, str] = {
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
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf2": "TensorFlow",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "pgvector": "pgvector",
    "vector database": "Vector Databases",
    "vectordb": "Vector Databases",
    "rag": "RAG (Retrieval-Augmented Generation)",
    "llm": "Large Language Models",
    "system design": "Distributed System Design",
    "microservices": "Microservices Architecture",
    "tdd": "Test-Driven Development (TDD)",
    "junit": "JUnit 5",
    "pytest": "pytest",
}

SKILL_CATEGORIES: Dict[str, str] = {
    # Languages
    "Java": "Languages",
    "JavaScript": "Languages",
    "TypeScript": "Languages",
    "Python": "Languages",
    "Go": "Languages",
    "C#": "Languages",
    "C++": "Languages",
    "SQL": "Languages",
    "Rust": "Languages",
    # Frameworks
    "Spring Boot": "Frameworks",
    "Spring Framework": "Frameworks",
    "React": "Frameworks",
    "Next.js": "Frameworks",
    "Vue.js": "Frameworks",
    "Angular": "Frameworks",
    "FastAPI": "Frameworks",
    "Django": "Frameworks",
    "Flask": "Frameworks",
    "Tailwind CSS": "Frameworks",
    # Databases & Storage
    "PostgreSQL": "Databases & Storage",
    "MySQL": "Databases & Storage",
    "MongoDB": "Databases & Storage",
    "Redis": "Databases & Storage",
    "NoSQL": "Databases & Storage",
    "pgvector": "Databases & Storage",
    "Vector Databases": "Databases & Storage",
    # Cloud & DevOps
    "Amazon Web Services": "Cloud & DevOps",
    "Google Cloud Platform": "Cloud & DevOps",
    "Microsoft Azure": "Cloud & DevOps",
    "Docker": "Cloud & DevOps",
    "Kubernetes": "Cloud & DevOps",
    "Terraform": "Cloud & DevOps",
    "CI/CD": "Cloud & DevOps",
    "Linux": "Cloud & DevOps",
    "Git": "Cloud & DevOps",
    # Architecture
    "Distributed System Design": "Architecture",
    "Microservices Architecture": "Architecture",
    "Apache Kafka": "Architecture",
    "REST APIs": "Architecture",
    "GraphQL": "Architecture",
    # Data & AI
    "PyTorch": "Data & AI",
    "TensorFlow": "Data & AI",
    "Scikit-Learn": "Data & AI",
    "Pandas": "Data & AI",
    "NumPy": "Data & AI",
    "Large Language Models": "Data & AI",
    "RAG (Retrieval-Augmented Generation)": "Data & AI",
    "Machine Learning": "Data & AI",
    "Deep Learning": "Data & AI",
    # Testing
    "JUnit 5": "Testing & Quality",
    "pytest": "Testing & Quality",
    "Test-Driven Development (TDD)": "Testing & Quality",
}

SKILL_DEPENDENCIES: Dict[str, List[str]] = {
    "Spring Boot": ["Java", "Spring Framework"],
    "Next.js": ["React", "JavaScript"],
    "React": ["JavaScript"],
    "TypeScript": ["JavaScript"],
    "FastAPI": ["Python"],
    "Django": ["Python"],
    "Kubernetes": ["Docker", "Linux"],
    "Docker": ["Linux"],
    "PyTorch": ["Python"],
    "TensorFlow": ["Python"],
    "Scikit-Learn": ["Python", "NumPy"],
    "Pandas": ["Python"],
    "PostgreSQL": ["SQL"],
    "MySQL": ["SQL"],
    "pgvector": ["PostgreSQL", "SQL"],
    "Vector Databases": ["Distributed System Design"],
    "RAG (Retrieval-Augmented Generation)": ["Large Language Models", "Python"],
    "Apache Kafka": ["Distributed System Design"],
    "GraphQL": ["REST APIs"],
}


def clean_skill_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def normalize_skill_token(text: str) -> str:
    if not text:
        return ""
    cleaned = text.strip().lower()
    cleaned = re.sub(r"[\(\)\[\]\{\},:;]", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def canonicalize_skill(skill_name: str) -> str:
    """Resolves arbitrary skill string or alias to canonical form without equating different technologies."""
    if not skill_name:
        return ""
    norm = normalize_skill_token(skill_name)
    return CANONICAL_ALIASES.get(norm, clean_skill_text(skill_name))


def categorize_skill(skill_name: str) -> str:
    """Returns canonical skill category for UI grouping and explorer filters."""
    canon = canonicalize_skill(skill_name)
    return SKILL_CATEGORIES.get(canon, "Technical Skills")


def get_skill_dependencies(skill_name: str) -> List[str]:
    """Retrieves foundational prerequisites and dependencies for ordering learning roadmaps."""
    canon = canonicalize_skill(skill_name)
    return SKILL_DEPENDENCIES.get(canon, [])


def evaluate_evidence_status(
    skill_name: str,
    profile_data: Dict[str, Any],
    resume_evidence: Optional[Dict[str, Any]] = None,
) -> Tuple[EvidenceStatus, Optional[str]]:
    """Evaluates evidence status strictly against candidate profile and verified resume records.

    Distinguishes:
    - CONFIRMED: explicitly marked verified=True by the candidate.
    - EVIDENCED: demonstrated in experience bullets, projects, or certifications.
    - UNVERIFIED: present in profile but unconfirmed.
    - NEEDS_REVIEW: ambiguous or indirect mention.
    - MISSING: not demonstrated in available profile.
    """
    canon = canonicalize_skill(skill_name)
    target_terms = {skill_name.lower(), normalize_skill_token(skill_name), canon.lower()}

    # Also include lowercase alias keys that point to this canonical name
    for alias_key, alias_val in CANONICAL_ALIASES.items():
        if alias_val.lower() == canon.lower():
            target_terms.add(alias_key.lower())

    # 1. Inspect Profile Skills
    profile_skills = profile_data.get("skills") or []
    for s in profile_skills:
        name = ""
        is_verified = False
        years = None
        if isinstance(s, dict):
            name = s.get("name") or s.get("skill") or ""
            is_verified = bool(s.get("verified") or s.get("isVerified"))
            years = s.get("yearsOfExperience") or s.get("years")
        elif isinstance(s, str):
            name = s

        if name:
            norm_name = normalize_skill_token(name)
            s_canon = canonicalize_skill(name)
            if norm_name in target_terms or s_canon.lower() == canon.lower():
                if is_verified:
                    src = f"Verified in Profile: {canon}"
                    if years:
                        src += f" ({years} years)"
                    return EvidenceStatus.CONFIRMED, src
                else:
                    return EvidenceStatus.UNVERIFIED, f"Listed in Profile (Awaiting confirmation): {name}"

    # 2. Inspect Profile Projects
    for proj in profile_data.get("projects") or []:
        if isinstance(proj, dict):
            p_name = proj.get("name") or proj.get("title") or "Project"
            techs = proj.get("technologies") or []
            for t in techs:
                if t and (normalize_skill_token(t) in target_terms or canonicalize_skill(t).lower() == canon.lower()):
                    return EvidenceStatus.EVIDENCED, f"Demonstrated in Project '{p_name}' ({t})"

            # Project description / bullets
            desc = (proj.get("description") or "") + " " + " ".join(proj.get("bullets") or [])
            for term in target_terms:
                if len(term) >= 3 and re.search(r"\b" + re.escape(term) + r"\b", desc.lower()):
                    return EvidenceStatus.EVIDENCED, f"Demonstrated in Project '{p_name}' deliverable"

    # 3. Inspect Profile Experience
    for exp in profile_data.get("experience") or []:
        if isinstance(exp, dict):
            role = exp.get("title") or exp.get("role") or "Role"
            company = exp.get("company") or "Company"
            bullets = exp.get("bullet_points") or exp.get("bulletPoints") or exp.get("bullets") or []
            desc = (exp.get("description") or "") + " " + " ".join(bullets)
            for term in target_terms:
                if len(term) >= 3 and re.search(r"\b" + re.escape(term) + r"\b", desc.lower()):
                    return EvidenceStatus.EVIDENCED, f"Demonstrated in Experience: {role} at {company}"

    # 4. Inspect Profile Certifications
    for cert in profile_data.get("certifications") or []:
        if isinstance(cert, dict):
            c_name = cert.get("name") or cert.get("title") or ""
            for term in target_terms:
                if len(term) >= 3 and re.search(r"\b" + re.escape(term) + r"\b", c_name.lower()):
                    return EvidenceStatus.CONFIRMED, f"Verified via Certification: {c_name}"

    # 5. Inspect Resume Evidence if supplied
    if resume_evidence and isinstance(resume_evidence, dict):
        raw_text = (resume_evidence.get("raw_text") or resume_evidence.get("rawText") or "").lower()
        for term in target_terms:
            if len(term) >= 3 and re.search(r"\b" + re.escape(term) + r"\b", raw_text):
                return EvidenceStatus.EVIDENCED, f"Demonstrated in Resume text: '{term}'"

    return EvidenceStatus.MISSING, "Not demonstrated in available career profile or resume evidence."
