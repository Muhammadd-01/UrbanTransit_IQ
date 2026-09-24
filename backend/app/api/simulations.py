from fastapi import APIRouter
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse
from simulations.what_if import run_simulation, SimulationScenario

router = APIRouter()

@router.post("/run", response_model=SimulationResponse)
async def execute_simulation(request: SimulationRequest):
    scenario = SimulationScenario(
        route_id=request.parameters.get("route_id", "PB-01"),
        vehicle_count_modifier=request.parameters.get("vehicle_count_modifier", 2),
        capacity_modifier=request.parameters.get("capacity_modifier", 0.0),
        frequency_modifier=request.parameters.get("frequency_modifier", 20.0),
        demand_modifier=request.parameters.get("demand_modifier", 0.0)
    )
    res = run_simulation(scenario)
    return SimulationResponse(
        scenario_name=request.scenario_name,
        parameters=request.parameters,
        results=res.dict(),
        comparison_with_historical=res.changes,
        is_simulated=True
    )

@router.get("")
async def list_scenarios():
    return []
