import io
from typing import List, Optional, Tuple
import pytest
from starlette.testclient import TestClient
import docx

from app.main import app
from app.core.config import get_settings


@pytest.fixture
def client() -> TestClient:
    """Synchronous test client fixture for FastAPI endpoints."""
    return TestClient(app)


@pytest.fixture
def auth_headers() -> dict:
    """Valid internal service authentication headers."""
    settings = get_settings()
    return {"X-Internal-Service-Key": settings.internal_service_key}


def build_pdf_stream(lines: List[str]) -> bytes:
    """Builds a PDF byte stream containing text lines positioned vertically."""
    stream_content = ["BT\n/F1 11 Tf\n50 750 Td\n14 TL\n"]
    for line in lines:
        # Sanitize unicode punctuation to ASCII equivalents for latin1 PDF stream
        sanitized = (
            line.replace("\u2022", "-")
            .replace("\u2013", "-")
            .replace("\u2014", "-")
            .replace("\u2018", "'")
            .replace("\u2019", "'")
            .replace("\u201c", '"')
            .replace("\u201d", '"')
        )
        # Escape parenthesis in PDF strings
        escaped = sanitized.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream_content.append(f"({escaped}) '\n")
    stream_content.append("ET\n")
    return "".join(stream_content).encode("latin1")


def create_synthetic_pdf(lines: List[str]) -> bytes:
    """Generates a valid single-page PDF containing the provided lines."""
    stream_bytes = build_pdf_stream(lines)
    stream_len = len(stream_bytes)

    objects = [
        b"%PDF-1.4\n",
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
        f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin1") + stream_bytes + b"\nendstream\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    ]

    offsets = []
    curr = 0
    body = b""
    for obj in objects:
        offsets.append(curr)
        body += obj
        curr += len(obj)

    xref = f"xref\n0 {len(objects)}\n0000000000 65535 f \n".encode("latin1")
    for off in offsets[1:]:
        xref += f"{off:010d} 00000 n \n".encode("latin1")

    trailer = f"trailer\n<< /Size {len(objects)} /Root 1 0 R >>\nstartxref\n{len(body)}\n%%EOF".encode("latin1")
    return body + xref + trailer


def create_multipage_pdf(pages: List[List[str]]) -> bytes:
    """Generates a valid multi-page PDF containing the provided page lines."""
    page_count = len(pages)
    kids = " ".join([f"{3 + i * 2} 0 R" for i in range(page_count)])

    objects = [
        b"%PDF-1.4\n",
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        f"2 0 obj\n<< /Type /Pages /Kids [{kids}] /Count {page_count} >>\nendobj\n".encode("latin1")
    ]

    for idx, page_lines in enumerate(pages):
        page_obj_num = 3 + idx * 2
        content_obj_num = page_obj_num + 1

        stream_bytes = build_pdf_stream(page_lines)
        page_obj = f"{page_obj_num} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {content_obj_num} 0 R /Resources << /Font << /F1 999 0 R >> >> >>\nendobj\n".encode("latin1")
        content_obj = f"{content_obj_num} 0 obj\n<< /Length {len(stream_bytes)} >>\nstream\n".encode("latin1") + stream_bytes + b"\nendstream\nendobj\n"

        objects.append(page_obj)
        objects.append(content_obj)

    font_obj = b"999 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    objects.append(font_obj)

    offsets = []
    curr = 0
    body = b""
    for obj in objects:
        offsets.append(curr)
        body += obj
        curr += len(obj)

    xref = f"xref\n0 {len(objects)}\n0000000000 65535 f \n".encode("latin1")
    for off in offsets[1:]:
        xref += f"{off:010d} 00000 n \n".encode("latin1")

    trailer = f"trailer\n<< /Size {len(objects)} /Root 1 0 R >>\nstartxref\n{len(body)}\n%%EOF".encode("latin1")
    return body + xref + trailer


def create_synthetic_docx(
    paragraphs: Optional[List[Tuple[str, str]]] = None,
    tables: Optional[List[List[List[str]]]] = None
) -> bytes:
    """
    Generates a valid DOCX document byte stream.
    paragraphs: list of (text, style) where style is e.g. "Normal" or "Heading 1"
    tables: list of tables, each table is a list of rows, each row is a list of cell texts
    """
    doc = docx.Document()

    if paragraphs:
        for text, style in paragraphs:
            if style and style != "Normal":
                try:
                    doc.add_heading(text, level=int(style.replace("Heading ", "")) if "Heading " in style else 1)
                except Exception:
                    doc.add_paragraph(text, style=style)
            else:
                doc.add_paragraph(text)

    if tables:
        for table_data in tables:
            if not table_data:
                continue
            rows = len(table_data)
            cols = len(table_data[0]) if rows > 0 else 1
            t = doc.add_table(rows=rows, cols=cols)
            for r_idx, row in enumerate(table_data):
                for c_idx, cell_text in enumerate(row):
                    if c_idx < cols:
                        t.cell(r_idx, c_idx).text = cell_text

    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()


SAMPLE_RESUME_LINES = [
    "Alex Mercer",
    "alex.mercer@example.com | (555) 234-5678 | San Francisco, CA",
    "https://linkedin.com/in/alexmercer | https://github.com/alexmercer",
    "",
    "Professional Summary",
    "Senior Full-Stack Engineer with 5+ years of experience building scalable microservices in Java and React.",
    "",
    "Education",
    "University of California, Berkeley",
    "Bachelor of Science in Computer Science, 2018 - 2022",
    "GPA: 3.85 / 4.0",
    "",
    "Skills",
    "Programming Languages: Python, Java, TypeScript, SQL",
    "Frameworks: React, Spring Boot, FastAPI, Node.js",
    "Cloud & Databases: AWS, Docker, Kubernetes, PostgreSQL",
    "",
    "Work Experience",
    "Senior Software Engineer | Acme Corporation",
    "San Francisco, CA | 2022 - Present",
    "• Architected distributed streaming pipeline processing 10M daily events using Kafka and Java.",
    "• Improved API response latency by 45% through Redis caching.",
    "",
    "Software Engineer | Beta Startup",
    "2020 - 2022",
    "• Developed RESTful services and modern responsive web dashboards.",
    "",
    "Projects",
    "JobAchiever Career Engine | React, Python, FastAPI",
    "https://github.com/alexmercer/career-engine",
    "Engineered an automated career planning platform with structured document extraction.",
    "",
    "Certifications",
    "AWS Certified Solutions Architect - Amazon Web Services, 2023",
    "",
    "Honors & Awards",
    "First Place Hackathon Winner, 2022",
    "",
    "Publications",
    "Scalable Document Processing in Distributed Cloud Environments, 2023"
]
