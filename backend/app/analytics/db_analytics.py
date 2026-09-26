from backend.app.analytics.db_filters import apply_global_filters
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, text
from backend.app.database.engine import SessionLocal
from backend.app.database.models import (
    PassengerCount, Stop, Route, Trip, Delay, Ticket, Vehicle, GpsEvent
)

logger = logging.getLogger(__name__)

def get_od_matrix(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        # Simplification: grouping by boarding and alighting stops from Tickets
        q = db.query(
            Ticket.boarding_stop, Ticket.alighting_stop, func.count(Ticket.ticket_id).label('vol')
        ).group_by(Ticket.boarding_stop, Ticket.alighting_stop).order_by(func.count(Ticket.ticket_id).desc()).limit(20)
        
        matrix = []
        for r in q.all():
            matrix.append({"origin": r.boarding_stop, "destination": r.alighting_stop, "volume": r.vol})
            
        return {"status": "success", "matrix": matrix}

def detect_peaks(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        q = db.query(
            extract('hour', PassengerCount.timestamp).label('hour'),
            func.sum(PassengerCount.boarding).label('vol')
        ).group_by('hour').order_by('hour')
        
        peaks = [{"hour": int(r.hour), "volume": int(r.vol or 0)} for r in q.all()]
        return {"status": "success", "peaks": peaks}

def detect_overcrowding(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        count = db.query(func.count(PassengerCount.id)).filter(PassengerCount.load > 40).scalar() or 0
        routes = db.query(PassengerCount.route_id).filter(PassengerCount.load > 40).distinct().all()
        route_list = [r[0] for r in routes]
        return {"status": "success", "overcrowded_incidents": count, "overcrowded_routes": route_list}

def detect_underutilization(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        count = db.query(func.count(PassengerCount.id)).filter(PassengerCount.load < 5).scalar()
        return {"status": "success", "underutilized_incidents": count}

def calculate_route_performance(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        q = db.query(
            Delay.route_id, func.avg(Delay.delay_minutes).label('avg_delay')
        ).group_by(Delay.route_id).limit(10)
        
        perf = [{"route": r.route_id, "avg_delay": float(r.avg_delay or 0)} for r in q.all()]
        return {"status": "success", "performance": perf}

def analyze_delays(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        q = db.query(
            Delay.cause, func.count(Delay.id).label('incidents')
        ).group_by(Delay.cause).order_by(func.count(Delay.id).desc())
        
        causes = [{"cause": r.cause, "incidents": r.incidents} for r in q.all()]
        avg = db.query(func.avg(Delay.delay_minutes)).scalar()
        return {"status": "success", "average_delay": float(avg or 0), "top_causes": causes}

def analyze_headway(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        query = text("""
            WITH trip_lags AS (
                SELECT 
                    route_id, 
                    actual_departure,
                    LAG(actual_departure) OVER (PARTITION BY route_id, direction ORDER BY actual_departure) as prev_dep
                FROM trips
                WHERE actual_departure IS NOT NULL
            ),
            headways AS (
                SELECT 
                    EXTRACT(EPOCH FROM (actual_departure - prev_dep))/60 as headway_min
                FROM trip_lags
                WHERE prev_dep IS NOT NULL
            )
            SELECT 
                AVG(headway_min) as avg_headway,
                SUM(CASE WHEN headway_min < 3 THEN 1 ELSE 0 END) as bunching_events
            FROM headways
        """)
        result = db.execute(query).fetchone()
        avg_headway = float(result.avg_headway or 0) if result and result.avg_headway is not None else 0.0
        bunching = int(result.bunching_events or 0) if result and result.bunching_events is not None else 0
        return {"status": "success", "average_headway_min": round(avg_headway, 2), "bunching_events": bunching}

def analyze_vehicle_utilization(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        active = db.query(func.count(Vehicle.vehicle_id)).filter(Vehicle.status == 'active').scalar() or 0
        total_vehicles = db.query(func.count(Vehicle.vehicle_id)).scalar() or 1
        total_trips = db.query(func.count(Trip.trip_id)).filter(func.date(Trip.scheduled_departure) == func.current_date()).scalar() or 0
        utilization_rate = active / total_vehicles if total_vehicles > 0 else 0.0
        return {"status": "success", "active_vehicles": active, "total_trips_today": total_trips, "utilization_rate": round(utilization_rate, 2)}

def detect_bottlenecks(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        q = db.query(
            Delay.stop_id, func.avg(Delay.delay_minutes).label('avg_delay')
        ).group_by(Delay.stop_id).order_by(func.avg(Delay.delay_minutes).desc()).limit(5)
        
        bottlenecks = [{"stop": r.stop_id, "delay": float(r.avg_delay or 0)} for r in q.all()]
        return {"status": "success", "bottlenecks": bottlenecks}

def analyze_stops(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        q = db.query(
            PassengerCount.stop_id,
            func.sum(PassengerCount.boarding).label('total_boarding'),
            func.sum(PassengerCount.alighting).label('total_alighting')
        ).group_by(PassengerCount.stop_id).all()
        
        stops_data = [
            {
                "stop_id": r.stop_id,
                "total_boarding": int(r.total_boarding or 0),
                "total_alighting": int(r.total_alighting or 0)
            } for r in q
        ]
        return {"status": "success", "stops": stops_data}

def analyze_travel_time(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        query = text("""
            SELECT AVG(EXTRACT(EPOCH FROM (actual_arrival - actual_departure))/60) as avg_time
            FROM trips
            WHERE actual_arrival IS NOT NULL AND actual_departure IS NOT NULL
        """)
        result = db.execute(query).scalar()
        avg_time = float(result) if result is not None else 0.0
        return {"status": "success", "avg_travel_time": round(avg_time, 2)}

def analyze_reliability(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        query = text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN actual_arrival <= scheduled_arrival + INTERVAL '5 minutes' THEN 1 ELSE 0 END) as on_time
            FROM trips
            WHERE actual_arrival IS NOT NULL AND scheduled_arrival IS NOT NULL
        """)
        result = db.execute(query).fetchone()
        total = result.total if result and result.total else 0
        on_time = result.on_time if result and result.on_time else 0
        otp = (on_time / total) if total > 0 else 0.0
        return {"status": "success", "on_time_performance": round(otp, 2)}

def analyze_capacity_gap(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        query = text("""
            SELECT 
                p.route_id,
                AVG(p.load) as avg_load,
                AVG(v.capacity) as avg_capacity
            FROM passenger_counts p
            JOIN vehicles v ON p.route_id = v.assigned_route
            GROUP BY p.route_id
        """)
        results = db.execute(query).fetchall()
        gap_detected = False
        extra_vehicles = 0
        for r in results:
            avg_load = float(r.avg_load or 0)
            avg_cap = float(r.avg_capacity or 0)
            if avg_cap > 0 and avg_load > avg_cap * 0.9:
                gap_detected = True
                extra_vehicles += max(1, int((avg_load - avg_cap) / avg_cap))
        
        return {"status": "success", "gap_detected": gap_detected, "recommended_extra_vehicles": extra_vehicles}

def detect_special_events(filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    from backend.app.database.models import ServiceCalendar
    with SessionLocal() as db:
        original_query = db.query
        db.query = lambda *args, **kwargs: apply_global_filters(original_query(*args, **kwargs), filters)
        events_q = db.query(ServiceCalendar).filter(ServiceCalendar.is_holiday == True).all()
        events = [e.holiday_name for e in events_q if e.holiday_name]
        return {"status": "success", "events": events}

