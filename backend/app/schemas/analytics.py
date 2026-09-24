from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FilterParams(BaseModel):
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    route_id: Optional[str] = None
    stop_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    direction: Optional[str] = None
    day_of_week: Optional[int] = None
    hour: Optional[int] = None
    is_peak: Optional[bool] = None

class KPIResponse(BaseModel):
    total_passengers: int
    active_routes: int
    active_vehicles: int
    avg_occupancy: float
    avg_delay: float
    overcrowded_routes: int
    underutilized_routes: int
    demand_forecast: float
    anomaly_count: int

class PassengerFlowResponse(BaseModel):
    flows: List[Dict[str, Any]]

class ODMatrixResponse(BaseModel):
    matrix: List[Dict[str, Any]]

class RoutePerformanceResponse(BaseModel):
    routes: List[Dict[str, Any]]

class DelayAnalysisResponse(BaseModel):
    delays: List[Dict[str, Any]]
