from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ConfidenceLevel(str, Enum):
    """
    Transparent confidence classifications for heuristic and model extractions.
    Indicates parser certainty, NOT factual verification of candidate claims.
    """
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNDETERMINED = "UNDETERMINED"


class VerificationStatus(str, Enum):
    """
    Verification state of extracted resume data.
    Per AGENTS.md Section 2, all AI-extracted information must strictly remain
    UNVERIFIED until explicit human inspection and confirmation.
    """
    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class ProvenanceRecord(BaseModel):
    """Traceability metadata linking an extracted field back to its raw source snippet."""
    source_section: Optional[str] = Field(default=None, description="Section from which this field was detected")
    original_snippet: Optional[str] = Field(default=None, description="Exact text fragment extracted from the source document")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.UNDETERMINED, description="Extraction confidence category")
    extraction_method: str = Field(default="heuristic", description="Method utilized for extraction (e.g. regex, heuristic, layout)")
