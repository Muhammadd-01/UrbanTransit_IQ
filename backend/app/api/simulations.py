from fastapi import APIRouter
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse
from simulations.what_if import run_simulation, SimulationScenario

router = APIRouter()

@router.post("/run", response_model=SimulationResponse)
async def execute_simulation(request: SimulationRequest):
    # Dynamically extract all supported levers
    valid_fields = SimulationScenario.__fields__.keys()
    scenario_kwargs = {k: v for k, v in request.parameters.items() if k in valid_fields}
    if "route_id" not in scenario_kwargs:
        scenario_kwargs["route_id"] = "PB-01"
    scenario = SimulationScenario(**scenario_kwargs)
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
