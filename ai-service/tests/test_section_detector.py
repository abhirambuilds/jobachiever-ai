import pytest
from app.services.parsing.section_detector import detect_sections, SectionType


def test_detect_all_standard_sections():
    """Detects standard resume sections from structured raw text."""
    sample_text = """
John Doe
john.doe@example.com | (555) 987-6543
https://linkedin.com/in/johndoe

Professional Summary
Experienced Software Engineer specialized in Java and distributed architectures.

Education
University of Washington
B.S. in Computer Science, 2017 - 2021

Technical Skills
Java, Spring Boot, React, PostgreSQL, Docker, Kubernetes

Work Experience
Senior Engineer | TechCorp
2021 - Present
• Designed real-time event streaming systems.

Projects
Job Search Platform | React, FastAPI
https://github.com/johndoe/project
Automated job discovery and resume parsing system.

Certifications
AWS Solutions Architect Associate, 2022

Honors & Awards
Top Contributor Hackathon Award, 2021

Publications
High-Throughput Microservice Architectures, IEEE 2022
"""
    sections = detect_sections(sample_text)
    section_types = [s.section_type for s in sections]

    assert SectionType.PERSONAL_INFO in section_types
    assert SectionType.SUMMARY in section_types
    assert SectionType.EDUCATION in section_types
    assert SectionType.SKILLS in section_types
    assert SectionType.EXPERIENCE in section_types
    assert SectionType.PROJECTS in section_types
    assert SectionType.CERTIFICATIONS in section_types
    assert SectionType.ACHIEVEMENTS in section_types
    assert SectionType.PUBLICATIONS in section_types


def test_detect_heading_variations():
    """Supports alternative heading variations (e.g. Work History, Academic Background, Core Competencies)."""
    text = """
Jane Roe
jane@example.com

CAREER OBJECTIVE
Seeking senior roles.

ACADEMIC BACKGROUND
Stanford University

CORE COMPETENCIES
Python, Go, Cloud

EMPLOYMENT HISTORY
Engineer at MegaCorp

KEY PROJECTS
Open Source Framework
"""
    sections = detect_sections(text)
    mapping = {s.section_type: s.content for s in sections}

    assert SectionType.SUMMARY in mapping
    assert SectionType.EDUCATION in mapping
    assert SectionType.SKILLS in mapping
    assert SectionType.EXPERIENCE in mapping
    assert SectionType.PROJECTS in mapping


def test_preserve_unrecognized_sections_under_other():
    """Unrecognized section headings are preserved under OTHER rather than discarded."""
    text = """
Mark Evans
mark@example.com

VOLUNTEER EXPERIENCE
Organized local code workshops for high school students.

LANGUAGES
English (Native), Spanish (Fluent), French (Intermediate)
"""
    sections = detect_sections(text)
    other_sections = [s for s in sections if s.section_type == SectionType.OTHER]

    assert len(other_sections) >= 1
    headings = [s.heading for s in other_sections]
    assert any("VOLUNTEER" in h or "LANGUAGES" in h for h in headings)


def test_empty_text_returns_empty_list():
    """Empty or whitespace-only text returns empty section list."""
    assert detect_sections("") == []
    assert detect_sections("   \n\n  ") == []
