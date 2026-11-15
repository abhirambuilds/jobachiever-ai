import re
from typing import Dict, List, Optional, Tuple
from app.schemas.common import ConfidenceLevel, VerificationStatus
from app.schemas.resume import (
    AchievementItem,
    CertificationItem,
    EducationItem,
    ExperienceItem,
    PersonalInfo,
    ProjectItem,
    PublicationItem,
    SkillItem,
)


class FieldNormalizer:
    """
    Heuristic and regex field normalizer for resume extraction.
    Parses unstructured text blocks into normalized, typed schema items
    with confidence scores and provenance records.
    Never hallucinates or fabricates missing information.
    """

    # RFC-compliant email regex
    EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")

    # International and domestic phone formats
    PHONE_REGEX = re.compile(
        r"(?:(?:\+?\d{1,3}[-.\s*]?)?(?:\(?\d{2,4}\)?[-.\s*]?)?\d{3,4}[-.\s*]?\d{3,4}(?:[-.\s*]?\d{1,4})?)"
    )

    # Social and web profiles
    LINKEDIN_REGEX = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9_\-\.]+)/?", re.IGNORECASE)
    GITHUB_REGEX = re.compile(r"(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_\-\.]+)/?", re.IGNORECASE)
    URL_REGEX = re.compile(r"https?://(?:www\.)?[A-Za-z0-9\-\._~:/?#\[\]@!$&'()*+,;=]+", re.IGNORECASE)

    # Common degree patterns
    DEGREE_REGEX = re.compile(
        r"\b(Bachelor(?:'s)?(?:\s+of\s+(?:Science|Arts|Engineering|Technology|Business Administration|Applied Science))?|Master(?:'s)?(?:\s+of\s+(?:Science|Arts|Engineering|Technology|Business Administration))?|Ph\.?D\.?|Doctor\s+of\s+Philosophy|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?|M\.?S\.?|M\.?A\.?|M\.?Tech|M\.?B\.?A\.?|Associate(?:'s)?|Diploma)\b",
        re.IGNORECASE
    )

    # Common GPA patterns
    GPA_REGEX = re.compile(r"\b(?:GPA[:\s]*)?([0-4]\.\d{1,2}|[5-9]\.\d{1,2}|\d{1,2}\.?\d?)\s*(?:/|\s+out\s+of\s+)?(4(?:\.0)?|10(?:\.0)?|100)?\b", re.IGNORECASE)

    # Date range patterns (e.g. "May 2020 - Present", "2018 - 2022", "06/2019 - 08/2021")
    DATE_RANGE_REGEX = re.compile(
        r"\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{2,4}|\d{4})\s*[\s\d,]*)\s*(?:-|–|—|to)\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{2,4}|\d{4}|Present|Current))\b",
        re.IGNORECASE
    )

    # Known skill taxonomy for automated categorization
    SKILL_TAXONOMY: Dict[str, str] = {
        # Programming Languages
        "python": "Programming Languages",
        "java": "Programming Languages",
        "javascript": "Programming Languages",
        "typescript": "Programming Languages",
        "c++": "Programming Languages",
        "c#": "Programming Languages",
        "go": "Programming Languages",
        "golang": "Programming Languages",
        "rust": "Programming Languages",
        "ruby": "Programming Languages",
        "php": "Programming Languages",
        "swift": "Programming Languages",
        "kotlin": "Programming Languages",
        "scala": "Programming Languages",
        "sql": "Programming Languages",
        # Frameworks & Libraries
        "react": "Frontend Frameworks",
        "react.js": "Frontend Frameworks",
        "angular": "Frontend Frameworks",
        "vue": "Frontend Frameworks",
        "vue.js": "Frontend Frameworks",
        "next.js": "Frontend Frameworks",
        "node.js": "Backend Frameworks",
        "spring": "Backend Frameworks",
        "spring boot": "Backend Frameworks",
        "django": "Backend Frameworks",
        "flask": "Backend Frameworks",
        "fastapi": "Backend Frameworks",
        "express": "Backend Frameworks",
        "express.js": "Backend Frameworks",
        "asp.net": "Backend Frameworks",
        "ruby on rails": "Backend Frameworks",
        # Cloud & DevOps
        "aws": "Cloud & DevOps",
        "azure": "Cloud & DevOps",
        "gcp": "Cloud & DevOps",
        "google cloud": "Cloud & DevOps",
        "docker": "Cloud & DevOps",
        "kubernetes": "Cloud & DevOps",
        "k8s": "Cloud & DevOps",
        "terraform": "Cloud & DevOps",
        "ansible": "Cloud & DevOps",
        "ci/cd": "Cloud & DevOps",
        "jenkins": "Cloud & DevOps",
        "github actions": "Cloud & DevOps",
        # Databases & Storage
        "postgresql": "Databases",
        "postgres": "Databases",
        "mysql": "Databases",
        "mongodb": "Databases",
        "redis": "Databases",
        "elasticsearch": "Databases",
        "sqlite": "Databases",
        "oracle": "Databases",
        "cassandra": "Databases",
        "dynamodb": "Databases",
        "pgvector": "Databases",
        # Architecture & AI/ML
        "rest": "Architecture & APIs",
        "restful": "Architecture & APIs",
        "graphql": "Architecture & APIs",
        "grpc": "Architecture & APIs",
        "microservices": "Architecture & APIs",
        "kafka": "Architecture & APIs",
        "rabbitmq": "Architecture & APIs",
        "machine learning": "AI & Data Science",
        "deep learning": "AI & Data Science",
        "pytorch": "AI & Data Science",
        "tensorflow": "AI & Data Science",
        "nlp": "AI & Data Science",
        "pandas": "AI & Data Science",
        "numpy": "AI & Data Science",
    }

    @classmethod
    def extract_personal_info(cls, lines: List[str]) -> PersonalInfo:
        """
        Extracts contact and identity details from the personal information section.
        """
        full_text = " ".join(lines)
        name: Optional[str] = None
        email: Optional[str] = None
        phone: Optional[str] = None
        location: Optional[str] = None
        linkedin: Optional[str] = None
        github: Optional[str] = None
        portfolio: Optional[str] = None

        # 1. Email extraction
        email_match = cls.EMAIL_REGEX.search(full_text)
        if email_match:
            email = email_match.group(0).lower().strip()

        # 2. LinkedIn extraction
        li_match = cls.LINKEDIN_REGEX.search(full_text)
        if li_match:
            linkedin = f"https://linkedin.com/in/{li_match.group(1)}"

        # 3. GitHub extraction
        gh_match = cls.GITHUB_REGEX.search(full_text)
        if gh_match:
            github = f"https://github.com/{gh_match.group(1)}"

        # 4. Portfolio / Website extraction
        for url in cls.URL_REGEX.findall(full_text):
            if "linkedin.com" not in url.lower() and "github.com" not in url.lower():
                portfolio = url.strip()
                break

        # 5. Phone extraction
        phone_match = cls.PHONE_REGEX.search(full_text)
        if phone_match:
            candidate_phone = phone_match.group(0).strip()
            # Verify digits count between 7 and 15
            digits = re.sub(r"\D", "", candidate_phone)
            if 7 <= len(digits) <= 15:
                phone = candidate_phone

        # 6. Name extraction (evaluate top candidate lines)
        for line in lines[:5]:
            clean_line = line.strip()
            # Ignore headers, labels, emails, phones, or URLs
            if (
                clean_line
                and len(clean_line) <= 45
                and not cls.EMAIL_REGEX.search(clean_line)
                and not cls.URL_REGEX.search(clean_line)
                and not cls.PHONE_REGEX.search(clean_line)
                and not any(keyword in clean_line.lower() for keyword in ("resume", "curriculum vitae", "cv", "page ", "contact"))
            ):
                # Ensure contains letters and typical name structure
                words = clean_line.split()
                if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z\.\-']+$", w) for w in words):
                    name = clean_line
                    break

        # 7. Location extraction
        loc_patterns = [
            re.compile(r"\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)\b"), # City, State (US)
            re.compile(r"\b([A-Z][a-zA-Z\s]+,\s*(?:United States|USA|India|Canada|United Kingdom|Germany|Australia|Singapore))\b", re.IGNORECASE)
        ]
        for pat in loc_patterns:
            loc_match = pat.search(full_text)
            if loc_match:
                candidate_loc = loc_match.group(1).strip()
                if name and candidate_loc != name:
                    location = candidate_loc
                    break

        # Confidence assessment
        identified_fields = sum(1 for f in [name, email, phone, location, linkedin, github] if f is not None)
        if identified_fields >= 3 and name and email:
            confidence = ConfidenceLevel.HIGH
        elif identified_fields >= 2:
            confidence = ConfidenceLevel.MEDIUM
        elif identified_fields >= 1:
            confidence = ConfidenceLevel.LOW
        else:
            confidence = ConfidenceLevel.UNDETERMINED

        return PersonalInfo(
            name=name,
            email=email,
            phone=phone,
            location=location,
            linkedin=linkedin,
            github=github,
            portfolio=portfolio,
            confidence=confidence,
            verification_status=VerificationStatus.UNVERIFIED
        )

    @classmethod
    def extract_education(cls, lines: List[str]) -> List[EducationItem]:
        """
        Parses education section lines into structured EducationItem records.
        """
        items: List[EducationItem] = []
        full_text = "\n".join(lines).strip()
        if not full_text:
            return items

        # Split into blocks by date ranges or degree occurrences
        blocks = cls._split_into_entry_blocks(lines)

        for block in blocks:
            block_text = "\n".join(block)
            institution = None
            degree = None
            field_of_study = None
            start_date = None
            end_date = None
            is_current = False
            gpa = None
            honors = None

            # Degree search
            degree_match = cls.DEGREE_REGEX.search(block_text)
            if degree_match:
                degree = degree_match.group(0).strip()

            # Field of study search: look for "in <field>" or "of <field>"
            major_match = re.search(r"\b(?:in|major(?:\s+in)?|field(?:\s+of)?)\s+([A-Za-z\s&]{3,50})", block_text, re.IGNORECASE)
            if major_match:
                field_of_study = major_match.group(1).split("\n")[0].split(",")[0].strip()
            elif degree and " in " in degree.lower():
                parts = re.split(r"\s+in\s+", degree, maxsplit=1, flags=re.IGNORECASE)
                degree = parts[0].strip()
                field_of_study = parts[1].split("\n")[0].split(",")[0].strip()

            # Date range search
            date_match = cls.DATE_RANGE_REGEX.search(block_text)
            if date_match:
                start_date = date_match.group(1).strip()
                end_date = date_match.group(2).strip()
                is_current = "present" in end_date.lower() or "current" in end_date.lower()

            # GPA search
            gpa_match = cls.GPA_REGEX.search(block_text)
            if gpa_match:
                val = gpa_match.group(1).strip()
                scale = gpa_match.group(2)
                gpa = f"{val} / {scale}" if scale else val

            # Institution heuristic: look for words containing University, College, Institute, School
            inst_regex = re.compile(r"\b([A-Za-z\s&]+(?:University|College|Institute|School|Academy)[A-Za-z\s&]*)\b", re.IGNORECASE)
            inst_match = inst_regex.search(block_text)
            if inst_match:
                institution = inst_match.group(1).split("\n")[0].strip()
            elif block:
                # Fallback to the first non-degree line
                first_line = block[0].strip()
                if not cls.DEGREE_REGEX.search(first_line):
                    institution = first_line

            confidence = ConfidenceLevel.HIGH if (institution and degree) else (ConfidenceLevel.MEDIUM if (institution or degree) else ConfidenceLevel.LOW)

            items.append(EducationItem(
                institution=institution,
                degree=degree,
                field_of_study=field_of_study,
                start_date=start_date,
                end_date=end_date,
                is_current=is_current,
                gpa=gpa,
                honors=honors,
                original_text=block_text,
                confidence=confidence,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def extract_skills(cls, lines: List[str]) -> List[SkillItem]:
        """
        Parses skills lines into categorized SkillItem records.
        """
        skills: List[SkillItem] = []
        seen = set()

        # Tokenize by commas, pipes, bullets, and line breaks
        for line in lines:
            # Check if line has a category prefix, e.g. "Languages: Python, Java"
            category_prefix = None
            if ":" in line and len(line.split(":")[0]) < 30:
                parts = line.split(":", 1)
                category_prefix = parts[0].strip()
                tokens_line = parts[1]
            else:
                tokens_line = line

            raw_tokens = re.split(r"[,|•·;▪\*\t/]", tokens_line)
            for token in raw_tokens:
                name = token.strip()
                # Clean enclosing parentheses or bullets
                name = re.sub(r"^[\(\[\{'\"]+|[\)\]\}'\"]+$", "", name).strip()

                if not name or len(name) > 40 or len(name) < 2:
                    continue

                norm_key = name.lower()
                if norm_key in seen:
                    continue
                seen.add(norm_key)

                # Determine category from taxonomy or prefix
                category = cls.SKILL_TAXONOMY.get(norm_key) or category_prefix or "General Skills"
                confidence = ConfidenceLevel.HIGH if norm_key in cls.SKILL_TAXONOMY else ConfidenceLevel.MEDIUM

                skills.append(SkillItem(
                    name=name,
                    category=category,
                    confidence=confidence,
                    verification_status=VerificationStatus.UNVERIFIED
                ))

        return skills

    @classmethod
    def extract_experience(cls, lines: List[str]) -> List[ExperienceItem]:
        """
        Parses work experience lines into ExperienceItem records.
        """
        items: List[ExperienceItem] = []
        blocks = cls._split_into_entry_blocks(lines)

        for block in blocks:
            block_text = "\n".join(block)
            company = None
            role = None
            location = None
            start_date = None
            end_date = None
            is_current = False
            bullet_points = []

            # Date range search
            date_match = cls.DATE_RANGE_REGEX.search(block_text)
            if date_match:
                start_date = date_match.group(1).strip()
                end_date = date_match.group(2).strip()
                is_current = "present" in end_date.lower() or "current" in end_date.lower()

            # Separate bullets from header lines
            header_lines = []
            for line in block:
                stripped = line.strip()
                if not stripped:
                    continue
                if stripped.startswith(("•", "-", "*", "▪", "–", "—", ">")):
                    cleaned_bullet = re.sub(r"^[\s•\-*▪–—>]+\s*", "", stripped)
                    if cleaned_bullet:
                        bullet_points.append(cleaned_bullet)
                elif re.match(r"^\d+\.\s+", stripped):
                    bullet_points.append(re.sub(r"^\d+\.\s+", "", stripped))
                else:
                    if not bullet_points:
                        header_lines.append(stripped)
                    else:
                        bullet_points.append(stripped)

            # Heuristics on header lines for company and role
            if header_lines:
                first_line = header_lines[0]
                # Common pattern: "Senior Software Engineer | Acme Corp" or "Acme Corp - Software Engineer"
                delimiter_match = re.search(r"\s+[|\-–—]\s+", first_line)
                if delimiter_match:
                    parts = re.split(r"\s+[|\-–—]\s+", first_line, maxsplit=1)
                    role = parts[0].strip()
                    company = parts[1].strip()
                else:
                    role = first_line
                    if len(header_lines) > 1:
                        company = header_lines[1]

            confidence = ConfidenceLevel.HIGH if (company and role) else (ConfidenceLevel.MEDIUM if (company or role) else ConfidenceLevel.LOW)

            items.append(ExperienceItem(
                company=company,
                role=role,
                location=location,
                start_date=start_date,
                end_date=end_date,
                is_current=is_current,
                bullet_points=bullet_points,
                original_text=block_text,
                confidence=confidence,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def extract_projects(cls, lines: List[str]) -> List[ProjectItem]:
        """
        Parses project section lines into ProjectItem records.
        """
        items: List[ProjectItem] = []
        blocks = cls._split_into_entry_blocks(lines)

        for block in blocks:
            block_text = "\n".join(block)
            title = None
            description = None
            technologies = []
            link = None

            # Look for project URL
            url_match = cls.URL_REGEX.search(block_text)
            if url_match:
                link = url_match.group(0).strip()

            # First line is usually title
            if block:
                first_line = block[0].strip()
                # Check for tech stack notation e.g. "Project X | React, Node.js, PostgreSQL"
                if "|" in first_line:
                    parts = first_line.split("|", 1)
                    title = parts[0].strip()
                    tech_tokens = [t.strip() for t in parts[1].split(",") if t.strip()]
                    technologies.extend(tech_tokens)
                else:
                    title = first_line

            # Remainder constitutes description / bullet points
            body_lines = [b.strip() for b in block[1:] if b.strip()]
            if body_lines:
                description = " ".join(body_lines)

            confidence = ConfidenceLevel.HIGH if (title and (technologies or description)) else (ConfidenceLevel.MEDIUM if title else ConfidenceLevel.LOW)

            items.append(ProjectItem(
                title=title,
                description=description,
                technologies=technologies,
                link=link,
                original_text=block_text,
                confidence=confidence,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def extract_certifications(cls, lines: List[str]) -> List[CertificationItem]:
        """
        Parses certification lines into CertificationItem records.
        """
        items: List[CertificationItem] = []
        for line in lines:
            stripped = re.sub(r"^[\s•\-*▪–—>]+\s*", "", line).strip()
            if not stripped:
                continue

            name = stripped
            issuer = None
            issue_date = None

            # Pattern: "AWS Certified Solutions Architect - Amazon Web Services, 2023"
            parts = re.split(r"[-–—|,]\s*", stripped)
            if len(parts) >= 2:
                name = parts[0].strip()
                issuer = parts[1].strip()
                if len(parts) >= 3 and re.search(r"\b\d{4}\b", parts[2]):
                    issue_date = parts[2].strip()

            items.append(CertificationItem(
                name=name,
                issuer=issuer,
                issue_date=issue_date,
                original_text=stripped,
                confidence=ConfidenceLevel.HIGH if issuer else ConfidenceLevel.MEDIUM,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def extract_achievements(cls, lines: List[str]) -> List[AchievementItem]:
        """
        Parses honors, awards, and achievements lines.
        """
        items: List[AchievementItem] = []
        for line in lines:
            stripped = re.sub(r"^[\s•\-*▪–—>]+\s*", "", line).strip()
            if not stripped:
                continue

            title = stripped
            date = None
            date_match = re.search(r"\b(20\d{2}|19\d{2})\b", stripped)
            if date_match:
                date = date_match.group(1)

            items.append(AchievementItem(
                title=title,
                description=stripped,
                date=date,
                confidence=ConfidenceLevel.MEDIUM,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def extract_publications(cls, lines: List[str]) -> List[PublicationItem]:
        """
        Parses publications and research papers.
        """
        items: List[PublicationItem] = []
        for line in lines:
            stripped = re.sub(r"^[\s•\-*▪–—>]+\s*", "", line).strip()
            if not stripped:
                continue

            title = stripped
            link = None
            url_match = cls.URL_REGEX.search(stripped)
            if url_match:
                link = url_match.group(0).strip()

            items.append(PublicationItem(
                title=title,
                publisher=None,
                date=None,
                link=link,
                confidence=ConfidenceLevel.MEDIUM,
                verification_status=VerificationStatus.UNVERIFIED
            ))

        return items

    @classmethod
    def _split_into_entry_blocks(cls, lines: List[str]) -> List[List[str]]:
        """
        Heuristic chunker that groups related lines belonging to the same entry
        (e.g., job position, degree, or project).
        Splits when encountering empty lines, or when an entry already has date/bullets
        and a new header/date line is encountered.
        """
        blocks: List[List[str]] = []
        current: List[str] = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                if current:
                    blocks.append(current)
                    current = []
                continue

            has_date_in_current = any(cls.DATE_RANGE_REGEX.search(l) for l in current)
            has_bullets_in_current = any(l.strip().startswith(("•", "-", "*", "▪", "–", "—", ">")) for l in current)
            is_bullet = stripped.startswith(("•", "-", "*", "▪", "–", "—", ">"))
            is_date_line = bool(cls.DATE_RANGE_REGEX.search(stripped))

            # Split only if current already has bullets/date and we encounter a new header or second date range
            if current and not is_bullet and ((has_bullets_in_current and not is_date_line) or (has_date_in_current and is_date_line)):
                blocks.append(current)
                current = [stripped]
            else:
                current.append(stripped)

        if current:
            blocks.append(current)

        return blocks or ([lines] if lines else [])
