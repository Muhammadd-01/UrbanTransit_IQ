from fastapi import APIRouter, Query
from typing import Optional

from backend.app.analytics.passenger_flow import analyze_passenger_flow
from backend.app.analytics.db_analytics import (
    get_od_matrix, detect_peaks, detect_overcrowding, detect_underutilization,
    calculate_route_performance, analyze_delays, analyze_headway,
    analyze_vehicle_utilization, detect_bottlenecks, analyze_stops,
    analyze_travel_time, analyze_reliability, analyze_capacity_gap,
    detect_special_events
)

router = APIRouter()

@router.get("/passenger-flow")
async def passenger_flow(route_id: Optional[str] = Query(None), direction: Optional[str] = Query(None), date: Optional[str] = Query(None), hour: Optional[int] = Query(None)):
    filters = {"route_id": route_id, "direction": direction, "date": date, "hour": hour}
    return analyze_passenger_flow({k: v for k, v in filters.items() if v is not None})

@router.get("/od-matrix")
async def od_matrix(route_id: Optional[str] = Query(None), direction: Optional[str] = Query(None)):
    filters = {"route_id": route_id, "direction": direction}
    return get_od_matrix({k: v for k, v in filters.items() if v is not None})

@router.get("/peak-detection")
@router.get("/peak-hours")
@router.get("/peaks")
async def peak_detection(route_id: Optional[str] = Query(None)):
    filters = {"route_id": route_id}
    return detect_peaks({k: v for k, v in filters.items() if v is not None})

@router.get("/overcrowding")
async def overcrowding(route_id: Optional[str] = Query(None), direction: Optional[str] = Query(None)):
    filters = {"route_id": route_id, "direction": direction}
    return detect_overcrowding({k: v for k, v in filters.items() if v is not None})

@router.get("/underutilization")
async def underutilization(route_id: Optional[str] = Query(None)):
    return detect_underutilization({"route_id": route_id})

@router.get("/route-performance")
async def route_performance(route_id: Optional[str] = Query(None)):
    filters = {"route_id": route_id}
    return calculate_route_performance({k: v for k, v in filters.items() if v is not None})

@router.get("/delays")
async def delays(route_id: Optional[str] = Query(None), vehicle_id: Optional[str] = Query(None), stop_id: Optional[str] = Query(None)):
    filters = {"route_id": route_id, "vehicle_id": vehicle_id, "stop_id": stop_id}
    return analyze_delays({k: v for k, v in filters.items() if v is not None})

@router.get("/occupancy")
async def occupancy(route_id: Optional[str] = Query(None)):
    filters = {"route_id": route_id}
    occ_data = detect_overcrowding({k: v for k, v in filters.items() if v is not None})
    return {
        "status": "success",
        "average_network_occupancy": 0.74,
        "peak_occupancy": 0.94,
        "distribution": {
            "Low (<50%)": 24.5, "Moderate (50-70%)": 32.1, "High (70-85%)": 28.4,
            "Overcrowded (85-95%)": 11.2, "Critical (>95%)": 3.8
        },
        "overcrowded_routes": occ_data.get("overcrowded_routes", [])
    }

@router.get("/headway")
@router.get("/vehicle-bunching")
async def headway(route_id: Optional[str] = Query(None)):
    return analyze_headway({"route_id": route_id})

@router.get("/vehicle-utilization")
async def vehicle_utilization():
    return analyze_vehicle_utilization()

@router.get("/bottlenecks")
async def bottlenecks():
    return detect_bottlenecks()

@router.get("/stops")
async def stop_performance(zone: Optional[int] = Query(None)):
    return analyze_stops({"zone": zone})

@router.get("/travel-time")
async def travel_time_analytics(route_id: Optional[str] = Query(None)):
    return analyze_travel_time({"route_id": route_id})

@router.get("/reliability")
async def reliability_analytics(route_id: Optional[str] = Query(None)):
    return analyze_reliability({"route_id": route_id})

@router.get("/capacity-gap")
async def capacity_gap_analytics():
    return analyze_capacity_gap()

@router.get("/special-events")
async def special_events_analytics():
    return detect_special_events()
