import logging
from pydantic import BaseModel
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PassengerSegmentationResult(BaseModel):
    segments: List[Dict[str, Any]]

def segment_passengers() -> PassengerSegmentationResult:
    logger.info("Segmenting passengers")
    return PassengerSegmentationResult(segments=[{"segment": "Commuters", "size": 5000}])
