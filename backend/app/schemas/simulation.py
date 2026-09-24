from pydantic import BaseModel
from typing import Dict, Any

class SimulationRequest(BaseModel):
    scenario_name: str
    parameters: Dict[str, Any]

class SimulationResponse(BaseModel):
    scenario_name: str
    parameters: Dict[str, Any]
    results: Dict[str, Any]
    comparison_with_historical: Dict[str, Any]
    is_simulated: bool = True
