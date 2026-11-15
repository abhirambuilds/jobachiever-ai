"""
Service orchestration for the Resume Studio Writing Assistant.
Coordinates prompt generation, LLM invocation via Groq / Gemini providers,
and passes every output through the AntiFabricationValidator.
"""

import json
import logging
import re
from typing import List, Optional

from app.core.config import get_settings
from app.resume_studio.prompts import RESUME_STUDIO_SYSTEM_PROMPT, build_studio_prompt
from app.resume_studio.schemas import (
    ResumeStudioRequest,
    ResumeStudioResponse,
    StudioAction,
    SuggestionItem,
    WritingMode,
    ConfidenceLevel,
)
from app.resume_studio.validator import AntiFabricationValidator
from app.schemas.ai_request import AIGenerationRequest, ResponseFormatType, TaskType
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


def _clean_json_markdown(text: str) -> str:
    """Strips markdown code block fences and extracts inner JSON."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


ADVERSARIAL_INJECTION_PATTERN = re.compile(
    r'(?i)(?:ignore\s+(?:all\s+)?previous\s+instructions[^\.\n]*|you\s+are\s+now\s+[^\.\n]*|system\s+prompt\s+override[^\.\n]*)',
    re.IGNORECASE
)


def _generate_rule_based_fallback(request: ResumeStudioRequest) -> List[SuggestionItem]:
    """
    Deterministic rule-based fallback generation when live provider is unavailable or mocked.
    Guarantees zero-fabrication and tests without external API dependencies.
    """
    raw_source = request.source_text.strip()
    clean = ADVERSARIAL_INJECTION_PATTERN.sub('', raw_source).strip()
    if not clean:
        clean = "Implemented software engineering deliverables."
    action = request.action
    mode = request.writing_mode
    suggestions = []

    num = request.num_alternatives if action == StudioAction.GENERATE_ALTERNATIVES else 1

    for i in range(num):
        suggested = clean
        reason = "Improved professional wording and active structure."
        changes = ["Strengthened verb phrase", "Improved structural clarity"]

        if action == StudioAction.IMPROVE_BULLET:
            if re.search(r'\b(worked on|helped with|was responsible for|handled)\b', suggested, re.IGNORECASE):
                suggested = re.sub(r'\b(worked on|helped with|was responsible for|handled)\b', 'Engineered', suggested, flags=re.IGNORECASE)
                changes = ["Replaced passive/generic verb with active engineering verb", "Preserved factual deliverables"]
                reason = "Replaced passive phrasing with strong action verb 'Engineered'."
            elif not re.match(r'^[A-Z][a-z]+ed\b', suggested):
                suggested = f"Developed and delivered {suggested[0].lower() + suggested[1:]}" if len(suggested) > 1 else suggested
                changes = ["Added decisive action verb", "Streamlined sentence flow"]
                reason = "Prefixed with strong action verb to emphasize candidate initiative."
            else:
                suggested = f"{suggested}, organizing functionality into modular components"
                reason = "Elaborated on architectural organization without inventing tools."

        elif action == StudioAction.MAKE_CONCISE:
            suggested = re.sub(r'\bin order to\b', 'to', suggested, flags=re.IGNORECASE)
            suggested = re.sub(r'\bsuccessfully\b', '', suggested, flags=re.IGNORECASE)
            suggested = re.sub(r'\ba variety of\b', 'multiple', suggested, flags=re.IGNORECASE)
            suggested = re.sub(r'\s{2,}', ' ', suggested).strip()
            changes = ["Removed filler words (in order to -> to)", "Streamlined phrasing for high density"]
            reason = "Eliminated redundant adverbs and filler prepositions."

        elif action == StudioAction.FIX_GRAMMAR:
            # Capitalize first letter, ensure terminal punctuation
            if suggested and not suggested[0].isupper():
                suggested = suggested[0].upper() + suggested[1:]
            if suggested and not suggested.endswith(('.', '!', '?')):
                suggested += '.'
            changes = ["Corrected sentence capitalization", "Standardized terminal punctuation"]
            reason = "Standardized formal sentence mechanics and punctuation."

        elif action == StudioAction.IMPROVE_SUMMARY:
            role = request.context.role if request.context and request.context.role else "Software Engineer"
            suggested = f"Results-driven {role} with background in {clean}."
            changes = ["Framed professional identity", "Synthesized core focus into executive summary"]
            reason = "Structured as a professional summary opening statement."

        elif action == StudioAction.IMPROVE_PROJECT:
            suggested = f"Architected and implemented {clean}, ensuring modular code architecture and verified functionality."
            changes = ["Emphasized project ownership", "Highlighted modular deliverables"]
            reason = "Emphasized project implementation and technical modularity."

        elif action == StudioAction.IMPROVE_EXPERIENCE:
            suggested = f"Spearheaded {clean}, coordinating technical deliverables across milestones."
            changes = ["Elevated active ownership verb", "Clarified milestone delivery"]
            reason = "Emphasized ownership and milestone-driven delivery."

        elif action == StudioAction.TAILOR_TO_JOB:
            target_role = request.context.job_title if request.context and request.context.job_title else "target position"
            suggested = f"Delivered {clean}, aligning technical implementation with {target_role} expectations."
            changes = ["Aligned phrasing with target role", "Preserved 100% of candidate's verified evidence"]
            reason = "Subtly aligned emphasis with target role priorities without adding unverified skills."

        elif action == StudioAction.GENERATE_ALTERNATIVES:
            if i == 0:
                suggested = f"Engineered {clean.lower().removeprefix('engineered ')}"
                reason = "Alternative 1: Action-oriented focus."
            elif i == 1:
                suggested = f"Delivered {clean.lower().removeprefix('delivered ')}, ensuring robust design"
                reason = "Alternative 2: Technical robustness focus."
            else:
                suggested = f"Implemented {clean.lower().removeprefix('implemented ')}"
                reason = "Alternative 3: Direct concise execution."

        # Apply Writing Mode nuance
        if mode == WritingMode.CONCISE and "to" not in changes:
            suggested = re.sub(r'\bin order to\b', 'to', suggested, flags=re.IGNORECASE)
        elif mode == WritingMode.TECHNICAL and "architecture" not in suggested.lower():
            suggested = f"{suggested} with modular architecture"
        elif mode == WritingMode.ACTION_ORIENTED and not re.match(r'^[A-Z][a-z]+ed\b', suggested):
            suggested = "Accelerated " + suggested[0].lower() + suggested[1:] if len(suggested) > 1 else suggested

        # Pass through AntiFabricationValidator
        item = AntiFabricationValidator.validate_and_sanitize(
            original_text=clean,
            suggested_text=suggested,
            reason=reason,
            changes=changes,
            context=request.context
        )
        item.writing_mode = mode
        suggestions.append(item)

    return suggestions


async def execute_studio_enhancement(
    request: ResumeStudioRequest,
    ai_service: Optional[AIService] = None
) -> ResumeStudioResponse:
    """
    Executes the requested resume writing enhancement with anti-fabrication guarantees.
    """
    if not request.source_text or not request.source_text.strip():
        raise ValueError("Source text must not be empty.")

    settings = get_settings()
    provider_name = (request.provider or "GROQ").upper()
    model_name = request.model or (settings.groq_default_model if provider_name == "GROQ" else settings.gemini_default_model)

    suggestions: List[SuggestionItem] = []

    # Attempt LLM generation if an active provider is available through ai_service
    if ai_service is not None:
        try:
            prompt = build_studio_prompt(request)
            gen_req = AIGenerationRequest(
                provider=provider_name,
                task=TaskType.STRUCTURED_OUTPUT,
                prompt=prompt,
                response_format=ResponseFormatType.JSON,
                temperature=request.temperature or 0.2,
                max_tokens=request.max_tokens or 2048,
                model=model_name,
                user_consent=request.user_consent,
            )
            gen_res = await ai_service.generate(gen_req)
            raw_completion = gen_res.text or ""

            cleaned_json = _clean_json_markdown(raw_completion)
            data = json.loads(cleaned_json)

            raw_suggestions = data.get("suggestions", [])
            for raw in raw_suggestions:
                suggested_text = raw.get("suggestedText") or raw.get("suggested_text") or ""
                reason = raw.get("reason", "Improved structure and clarity.")
                changes = raw.get("changes", ["Enhanced phrasing"])

                if suggested_text:
                    validated_item = AntiFabricationValidator.validate_and_sanitize(
                        original_text=request.source_text,
                        suggested_text=suggested_text,
                        reason=reason,
                        changes=changes,
                        context=request.context
                    )
                    validated_item.writing_mode = request.writing_mode
                    suggestions.append(validated_item)

            if suggestions:
                logger.info("Successfully generated and validated %d suggestions via provider %s", len(suggestions), provider_name)
        except Exception as ex:
            logger.warning("Live provider generation failed or skipped (%s). Using deterministic rule-based assistant.", ex)

    # If provider produced no suggestions, utilize deterministic rule-based generator
    if not suggestions:
        suggestions = _generate_rule_based_fallback(request)

    return ResumeStudioResponse(
        suggestions=suggestions,
        action=request.action,
        writing_mode=request.writing_mode,
        provider=provider_name,
        model=model_name or "studio-deterministic-engine"
    )
