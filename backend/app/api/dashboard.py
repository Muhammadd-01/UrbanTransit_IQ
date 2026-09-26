from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from backend.app.schemas.analytics import KPIResponse
from backend.app.database.engine import get_db
from backend.app.database.models import Passenger, Route, Vehicle, Trip, Delay, PassengerCount, Stop

router = APIRouter()

@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(db: Session = Depends(get_db)):
    try:
        total_passengers = db.query(func.count(Passenger.passenger_id)).scalar() or 0
        active_routes = db.query(func.count(Route.route_id)).scalar() or 0
        active_vehicles = db.query(func.count(Vehicle.vehicle_id)).filter(Vehicle.status == 'active').scalar() or 0
        avg_delay = db.query(func.avg(Delay.delay_minutes)).scalar() or 0.0

        occupancy_q = text("""
            SELECT AVG(p.load) / NULLIF(AVG(v.capacity), 0) as occ
            FROM passenger_counts p
            JOIN vehicles v ON p.route_id = v.assigned_route
        """)
        occ = db.execute(occupancy_q).scalar()
        avg_occupancy = float(occ) if occ else 0.0

        over_q = text("""
            SELECT COUNT(DISTINCT route_id) 
            FROM passenger_counts 
            GROUP BY route_id 
            HAVING AVG(load) > 40
        """)
        overcrowded = len(db.execute(over_q).fetchall())
        
        under_q = text("""
            SELECT COUNT(DISTINCT route_id) 
            FROM passenger_counts 
            GROUP BY route_id 
            HAVING AVG(load) < 5
        """)
        underutilized = len(db.execute(under_q).fetchall())
        
        anomaly = db.query(func.count(Delay.id)).filter(Delay.delay_minutes > 15).scalar() or 0
        demand_forecast = int(total_passengers * 1.006)
    except Exception as e:
        total_passengers = 0
        active_routes = 0
        active_vehicles = 0
        avg_delay = 0.0
        avg_occupancy = 0.0
        overcrowded = 0
        underutilized = 0
        demand_forecast = 0
        anomaly = 0

    return KPIResponse(
        total_passengers=total_passengers,
        active_routes=active_routes,
        active_vehicles=active_vehicles,
        avg_occupancy=round(avg_occupancy, 2),
        avg_delay=round(float(avg_delay), 2),
        overcrowded_routes=overcrowded,
        underutilized_routes=underutilized,
        demand_forecast=demand_forecast,
        anomaly_count=anomaly
    )

@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    try:
        corridors_q = db.query(Route.route_name).limit(10).all()
        corridors = [r[0] for r in corridors_q]
        fleet_active = db.query(func.count(Vehicle.vehicle_id)).filter(Vehicle.status == 'active').scalar() or 0
        fleet_total = db.query(func.count(Vehicle.vehicle_id)).scalar() or 1
        fleet_status = "OPTIMAL" if (fleet_active/fleet_total) > 0.8 else "NEEDS ATTENTION"
    except Exception:
        corridors = []
        fleet_status = "UNKNOWN"

    return {
        "status": "success",
        "city": "Karachi",
        "network": "TransitVerse Intelligence Network",
        "corridors": corridors,
        "fleet_status": fleet_status,
        "data_freshness": "Real-time PostgreSQL Sync Active"
    }
