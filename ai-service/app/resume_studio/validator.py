"""
Anti-Fabrication Engine & Factual Integrity Validator for Resume Studio.

Enforces zero-fabrication constraints:
- Detects unsupported metrics, percentages, revenue figures, and user counts.
- Detects newly introduced technologies, tools, and frameworks not in source or profile.
- Converts unverified quantifiable claims into safe bracketed placeholders.
- Adds actionable warnings and determines confidence ratings based on factual grounding.
"""

import re
from typing import List, Set, Tuple, Optional
from app.resume_studio.schemas import ConfidenceLevel, SuggestionItem, ResumeStudioContext

# Regex patterns for numerical metrics, percentages, and currencies
PERCENT_PATTERN = re.compile(r'\b\d+(?:\.\d+)?%\b')
METRIC_NUMBERS = re.compile(
    r'\b(?:\$\d+(?:,\d+)*(?:\.\d+)?|\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|m|b|thousand|million|billion|users|clients|rps|qps|ms|seconds|minutes|hours|days|weeks|months|years))\b',
    re.IGNORECASE
)
STANDALONE_NUMBER = re.compile(r'\b\d{2,}(?:,\d{3})*\b')

# Safe bracketed placeholders
PLACEHOLDER_REGEX = re.compile(r'\[[^\]]+\]')

# Common industry tech words to monitor for unevidenced additions
KNOWN_TECH_TOKENS = {
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "kafka", "redis",
    "postgresql", "postgres", "mysql", "mongodb", "graphql", "rust", "golang",
    "python", "java", "typescript", "react", "angular", "vue", "fastapi",
    "spring", "spring boot", "django", "flask", "microservices", "terraform",
    "elasticsearch", "solr", "spark", "hadoop", "flink", "airflow", "snowflake"
}


class AntiFabricationValidator:
    """
    Validates AI-generated suggestions against the candidate's original source text
    and verified profile context to prevent hallucinated achievements and credentials.
    """

    @classmethod
    def extract_metrics(cls, text: str) -> Set[str]:
        """Extracts percentages, numerical quantities, and currency metrics from text."""
        # Strip placeholders first so placeholders like [verified metric] aren't treated as raw numbers
        clean_text = PLACEHOLDER_REGEX.sub('', text)

        metrics = set()
        for match in PERCENT_PATTERN.findall(clean_text):
            metrics.add(match.strip().lower())
        for match in METRIC_NUMBERS.findall(clean_text):
            metrics.add(match.strip().lower())
        for match in STANDALONE_NUMBER.findall(clean_text):
            # Exclude standard 4-digit years like 2022, 2024, 2026
            val = match.replace(',', '')
            if not (val.isdigit() and 1970 <= int(val) <= 2050):
                metrics.add(match.strip().lower())
        return metrics

    @classmethod
    def extract_tech_tokens(cls, text: str) -> Set[str]:
        """Extracts known tech tokens mentioned in text."""
        lower = text.lower()
        found = set()
        for token in KNOWN_TECH_TOKENS:
            # Word boundary check
            if re.search(r'\b' + re.escape(token) + r'\b', lower):
                found.add(token)
        return found

    @classmethod
    def validate_and_sanitize(
        cls,
        original_text: str,
        suggested_text: str,
        reason: str,
        changes: List[str],
        context: Optional[ResumeStudioContext] = None
    ) -> SuggestionItem:
        """
        Validates the suggestion against original source text and context.
        Neutralizes unsupported metrics, flags newly added skills, and issues warnings.
        """
        context = context or ResumeStudioContext()
        unsupported_claims: List[str] = []
        warnings: List[str] = []
        preserved_facts: List[str] = []

        # 1. Source evidence extraction
        source_metrics = cls.extract_metrics(original_text)
        suggested_metrics = cls.extract_metrics(suggested_text)

        # Context evidence (from candidate profile or target role)
        verified_tech = set()
        if context.verified_skills:
            for s in context.verified_skills:
                verified_tech.update(cls.extract_tech_tokens(s))

        source_tech = cls.extract_tech_tokens(original_text) | verified_tech
        suggested_tech = cls.extract_tech_tokens(suggested_text)

        # 2. Inspect numerical metric additions
        sanitized_suggested = suggested_text
        unsupported_metrics = suggested_metrics - source_metrics

        for metric in unsupported_metrics:
            unsupported_claims.append(f"Unsupported metric: '{metric}' was not present in the original text.")
            warnings.append(
                f"Metric '{metric}' was added by AI. Confirm with verified data or use placeholder: [verified metric]."
            )
            # Convert raw unsupported percentage or user count into a safe bracketed placeholder
            if '%' in metric:
                sanitized_suggested = re.sub(
                    r'\b' + re.escape(metric) + r'\b',
                    '[verified percentage, if available]',
                    sanitized_suggested,
                    flags=re.IGNORECASE
                )
            elif any(u in metric.lower() for u in ['user', 'client', 'rps', 'qps']):
                sanitized_suggested = re.sub(
                    r'\b' + re.escape(metric) + r'\b',
                    '[verified scale/throughput, if available]',
                    sanitized_suggested,
                    flags=re.IGNORECASE
                )

        # 3. Inspect technology additions
        new_tech = suggested_tech - source_tech
        for tech in new_tech:
            # If the candidate didn't mention this technology, flag it
            unsupported_claims.append(f"Newly introduced technology '{tech}' not found in source text or verified skills.")
            warnings.append(
                f"Technology '{tech}' was introduced. Do not claim proficiencies you have not demonstrated."
            )

        # 4. Check preserved facts
        for tech in (suggested_tech & source_tech):
            preserved_facts.append(f"Retained core technology: {tech}")
        for metric in (suggested_metrics & source_metrics):
            preserved_facts.append(f"Preserved source metric: {metric}")

        if not preserved_facts:
            preserved_facts.append("Preserved source core objectives and deliverables.")

        # 5. Determine confidence level
        if not unsupported_claims:
            confidence = ConfidenceLevel.HIGH
        elif len(unsupported_claims) == 1 and not new_tech:
            confidence = ConfidenceLevel.MEDIUM
        else:
            confidence = ConfidenceLevel.LOW

        return SuggestionItem(
            original_text=original_text,
            suggested_text=sanitized_suggested,
            reason=reason,
            changes=changes,
            preserved_facts=preserved_facts,
            unsupported_claims=unsupported_claims,
            warnings=warnings,
            confidence=confidence
        )
