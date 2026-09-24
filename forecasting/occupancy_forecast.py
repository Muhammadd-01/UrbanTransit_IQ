import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class OccupancyForecastResult(BaseModel):
    predicted_occupancy: float
    capacity: int
    remaining_capacity: float
    overcrowding_risk: float

def forecast_occupancy(route_id: str, hour: int, horizon_days: int) -> OccupancyForecastResult:
    logger.info(f"Forecasting occupancy for route {route_id} at hour {hour}")
    return OccupancyForecastResult(
        predicted_occupancy=0.85,
        capacity=100,
        remaining_capacity=15.0,
        overcrowding_risk=0.7
    )
