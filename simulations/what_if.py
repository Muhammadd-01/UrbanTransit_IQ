import logging
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class SimulationScenario(BaseModel):
    route_id: str
    vehicle_count_modifier: int = 0
    capacity_modifier: float = 0.0
    frequency_modifier: float = 0.0
    headway_modifier: float = 0.0
    departure_time_shift: float = 0.0
    demand_modifier: float = 0.0

class SimulationResult(BaseModel):
    scenario_name: str
    parameters: dict
    baseline: dict
    simulated: dict
    changes: dict
    is_simulated: bool = True
    caveats: List[str]
    timestamp: str

def accept_scenario(scenario: SimulationScenario) -> SimulationResult:
    logger.info(f"Simulating scenario for route {scenario.route_id}")
    baseline_occ = 0.88 if scenario.route_id in ["PB-01", "GL-01"] else 0.72
    occ_change = -0.05 * (scenario.vehicle_count_modifier or 1) - 0.002 * scenario.frequency_modifier
    sim_occ = max(0.20, min(1.0, baseline_occ + occ_change))

    return SimulationResult(
        scenario_name=f"What-if Scenario for Route {scenario.route_id}",
        parameters=scenario.dict(),
        baseline={"current_avg_occupancy": baseline_occ, "current_wait_time_minutes": 8.5},
        simulated={"SIMULATED_avg_occupancy": round(sim_occ, 2), "SIMULATED_wait_time_minutes": max(3.0, round(8.5 - 0.5 * scenario.vehicle_count_modifier, 1))},
        changes={"occupancy_change": round(sim_occ - baseline_occ, 2), "wait_time_change_minutes": round(-0.5 * scenario.vehicle_count_modifier, 1)},
        is_simulated=True,
        caveats=["Assumes constant route layout", "Simulation values are estimations only"],
        timestamp=datetime.now().isoformat()
    )

run_simulation = accept_scenario
