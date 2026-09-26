from fastapi import APIRouter, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.engine import get_db

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
async def occupancy(route_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    filters = {"route_id": route_id}
    occ_data = detect_overcrowding({k: v for k, v in filters.items() if v is not None})
    try:
        where_clause = ""
        params = {}
        if route_id:
            where_clause = "WHERE p.route_id = :route_id"
            params["route_id"] = route_id

        q = text(f"""
            WITH occ AS (
                SELECT (p.load::float / NULLIF(v.capacity, 0)) as occupancy
                FROM passenger_counts p
                JOIN vehicles v ON p.route_id = v.assigned_route
                {where_clause}
                WHERE v.capacity > 0
            )
            SELECT 
                AVG(occupancy) as avg_occ,
                MAX(occupancy) as max_occ,
                COUNT(*) as total,
                SUM(CASE WHEN occupancy < 0.5 THEN 1 ELSE 0 END) as low_occ,
                SUM(CASE WHEN occupancy >= 0.5 AND occupancy < 0.7 THEN 1 ELSE 0 END) as mod_occ,
                SUM(CASE WHEN occupancy >= 0.7 AND occupancy < 0.85 THEN 1 ELSE 0 END) as high_occ,
                SUM(CASE WHEN occupancy >= 0.85 AND occupancy < 0.95 THEN 1 ELSE 0 END) as over_occ,
                SUM(CASE WHEN occupancy >= 0.95 THEN 1 ELSE 0 END) as crit_occ
            FROM occ
        """)
        row = db.execute(q, params).fetchone()
        
        if row and row.total and row.total > 0:
            avg_network_occ = float(row.avg_occ or 0)
            peak_occ = float(row.max_occ or 0)
            total = float(row.total)
            distribution = {
                "Low (<50%)": round((row.low_occ or 0) / total * 100, 1),
                "Moderate (50-70%)": round((row.mod_occ or 0) / total * 100, 1),
                "High (70-85%)": round((row.high_occ or 0) / total * 100, 1),
                "Overcrowded (85-95%)": round((row.over_occ or 0) / total * 100, 1),
                "Critical (>95%)": round((row.crit_occ or 0) / total * 100, 1)
            }
        else:
            avg_network_occ = 0.0
            peak_occ = 0.0
            distribution = {
                "Low (<50%)": 0.0, "Moderate (50-70%)": 0.0, "High (70-85%)": 0.0,
                "Overcrowded (85-95%)": 0.0, "Critical (>95%)": 0.0
            }
    except Exception:
        avg_network_occ = 0.0
        peak_occ = 0.0
        distribution = {
            "Low (<50%)": 0.0, "Moderate (50-70%)": 0.0, "High (70-85%)": 0.0,
            "Overcrowded (85-95%)": 0.0, "Critical (>95%)": 0.0
        }

    return {
        "status": "success",
        "average_network_occupancy": round(avg_network_occ, 2),
        "peak_occupancy": round(peak_occ, 2),
        "distribution": distribution,
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
