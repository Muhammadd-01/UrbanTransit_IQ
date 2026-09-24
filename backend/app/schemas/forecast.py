from pydantic import BaseModel
from typing import List, Dict, Any

class ForecastRequest(BaseModel):
    entity_type: str
    entity_id: str
    horizon_days: int
    model_type: str

class ForecastResponse(BaseModel):
    forecasts: List[Dict[str, Any]]
    metrics: Dict[str, float]
    model_info: Dict[str, Any]
