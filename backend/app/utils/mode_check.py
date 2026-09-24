from config.settings import settings
import logging

logger = logging.getLogger(__name__)

def verify_competition_mode():
    logger.info("Verifying competition mode requirements...")
    # Placeholder for real checks
    if settings.EXECUTION_MODE != "COMPETITION":
        raise ValueError("Not in competition mode")

def get_execution_mode() -> str:
    return settings.EXECUTION_MODE
