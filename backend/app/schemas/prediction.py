from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DelayPredictionRequest(BaseModel):
    route_id: str
    hour: int
    day_of_week: int
    historical_delay: float
    passenger_load: float
    num_stops: int
    distance: float
    is_peak: bool
    vehicle_id: str

class DelayPredictionResponse(BaseModel):
    predicted_delay: float
    severity: str
    confidence: float
    contributing_features: Dict[str, float]
    historical_context: Optional[Dict[str, Any]]
    model_used: str
