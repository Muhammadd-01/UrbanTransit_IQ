from fastapi import APIRouter
from backend.app.schemas.analytics import KPIResponse

router = APIRouter()

@router.get("/kpis", response_model=KPIResponse)
async def get_kpis():
    return KPIResponse(
        total_passengers=2148200,
        active_routes=110,
        active_vehicles=242,
        avg_occupancy=0.74,
        avg_delay=5.8,
        overcrowded_routes=3,
        underutilized_routes=2,
        demand_forecast=2210000,
        anomaly_count=18
    )

@router.get("/summary")
async def get_dashboard_summary():
    return {
        "status": "success",
        "city": "Karachi",
        "network": "TransitVerse Intelligence Network",
        "corridors": ["Green Line BRT", "Peoples Bus Service", "Orange Line Metro", "KCR"],
        "fleet_status": "OPTIMAL",
        "data_freshness": "Real-time sync active"
    }
