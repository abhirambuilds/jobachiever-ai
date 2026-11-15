import logging
import re
import sys
from typing import Optional


class SensitiveDataFilter(logging.Filter):
    """
    Defensive logging filter that masks potential sensitive personal data
    (emails, phone numbers, API keys) from diagnostic log statements.
    """
    EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    PHONE_REGEX = re.compile(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}")
    API_KEY_REGEX = re.compile(r"(key|secret|token|password|auth)=['\"]?([a-zA-Z0-9_\-]{8,})['\"]?", re.IGNORECASE)

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg = record.msg
            msg = self.EMAIL_REGEX.sub("[EMAIL_MASKED]", msg)
            msg = self.PHONE_REGEX.sub("[PHONE_MASKED]", msg)
            msg = self.API_KEY_REGEX.sub(r"\1=[REDACTED]", msg)
            record.msg = msg
        return True


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """
    Configures structured, sanitized logging for the AI microservice.
    """
    level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)
    console_handler.addFilter(SensitiveDataFilter())

    root_logger.addHandler(console_handler)

    # Suppress verbose third-party logging
    logging.getLogger("pdfminer").setLevel(logging.WARNING)
    logging.getLogger("pypdfium2").setLevel(logging.WARNING)
    logging.getLogger("PIL").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    logger = logging.getLogger("ai_service")
    logger.info("Structured logging initialized at level %s", log_level)
    return logger
