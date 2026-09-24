from pydantic import BaseModel
from typing import Dict, Any, Optional

class RecommendationResponse(BaseModel):
    recommendation: str
    reason: str
    supporting_metrics: Dict[str, Any]
    affected_route: Optional[str]
    affected_time: Optional[str]
    expected_impact: str
    confidence_level: str
