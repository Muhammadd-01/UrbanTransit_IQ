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
    historical_context: Optional[Any] = None
    model_used: str

class DemandForecastItem(BaseModel):
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float
    confidence_interval: float

class DemandForecastResponse(BaseModel):
    model: str
    forecast_horizon_days: int
    projections: List[DemandForecastItem]
    metadata: Dict[str, Any]

class CrowdingRiskItem(BaseModel):
    route_id: str
    hour: int
    predicted_occupancy_rate: float
    crowding_level: str
    confidence: float
    risk_score: float

class CrowdingRiskResponse(BaseModel):
    timestamp: str
    predictions: List[CrowdingRiskItem]
    total_evaluated: int

