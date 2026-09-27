"""
Native 2 Million Transit Dataset Generator directly for MongoDB & MongoDB Compass.
Generates full Karachi Transit dataset in high-speed bulk batches.
"""

import sys
import uuid
import random
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.mongo import get_mongo_db, init_mongo_indexes

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def generate_mongo_data():
    logger.info("Initializing 2 Million Record Generation natively into MongoDB...")
    db = get_mongo_db()
    start_time = time.time()

    # Drop existing collections to start fresh
    collections_to_clean = [
        "routes", "stops", "route_stops", "vehicles", "service_calendar",
        "trips", "passengers", "tickets", "passenger_counts", "delays", "gps_events"
    ]
    for coll in collections_to_clean:
        db[coll].drop()

    base_date = datetime(2024, 1, 1)

    # 1. Routes (50)
    logger.info("Generating 50 Routes...")
    routes = [
        {
            "route_id": f"R-{i:03d}",
            "route_name": f"Route {i}",
            "route_type": "bus",
            "route_color": "blue",
            "route_description": f"Transit corridor {i}",
            "fare_zone": f"Z{(i % 8) + 1}",
            "distance_km": 15.5,
            "avg_travel_time_min": 45.0,
            "num_stops": 20,
            "frequency_peak": 10,
            "frequency_offpeak": 20,
            "operator": "OperatorA",
            "created_at": datetime.utcnow()
        }
        for i in range(1, 51)
    ]
    db.routes.insert_many(routes, ordered=False)

    # 2. Stops (200)
    logger.info("Generating 200 Stops...")
    stops = [
        {
            "stop_id": f"S-{i:04d}",
            "stop_name": f"Stop {i}",
            "latitude": 24.86 + random.uniform(-0.1, 0.1),
            "longitude": 67.00 + random.uniform(-0.1, 0.1),
            "zone": f"Z{(i % 8) + 1}",
            "stop_type": "regular",
            "is_terminal": False,
            "has_shelter": True,
            "accessibility": "wheelchair",
            "created_at": datetime.utcnow()
        }
        for i in range(1, 201)
    ]
    db.stops.insert_many(stops, ordered=False)

    # 3. Route Stops (1,000)
    logger.info("Generating 1,000 Route Stops...")
    route_stops = [
        {
            "id": str(uuid.uuid4()),
            "route_id": f"R-{(i % 50) + 1:03d}",
            "stop_id": f"S-{(i % 200) + 1:04d}",
            "stop_sequence": i % 20,
            "distance_from_start_km": (i % 20) * 0.75
        }
        for i in range(1, 1001)
    ]
    db.route_stops.insert_many(route_stops, ordered=False)

    # 4. Vehicles (300)
    logger.info("Generating 300 Vehicles...")
    vehicles = [
        {
            "vehicle_id": f"V-{i:04d}",
            "vehicle_type": "bus",
            "capacity": 50,
            "fuel_type": "diesel",
            "manufacture_year": 2020,
            "last_maintenance": datetime.utcnow(),
            "status": "active",
            "assigned_route": f"R-{(i % 50) + 1:03d}",
            "created_at": datetime.utcnow()
        }
        for i in range(1, 301)
    ]
    db.vehicles.insert_many(vehicles, ordered=False)

    # 5. Service Calendar (30)
    logger.info("Generating 30 Service Calendar days...")
    calendars = [
        {
            "id": str(uuid.uuid4()),
            "service_id": "CAL-1",
            "date": base_date + timedelta(days=i),
            "day_type": "weekday" if (base_date + timedelta(days=i)).weekday() < 5 else "weekend",
            "is_holiday": (i % 15 == 0),
            "holiday_name": "Transit Day" if (i % 15 == 0) else None
        }
        for i in range(30)
    ]
    db.service_calendar.insert_many(calendars, ordered=False)

    # 6. Trips (10,000)
    logger.info("Generating 10,000 Trips...")
    trips = []
    for i in range(1, 10001):
        t_start = base_date + timedelta(days=i % 30, hours=random.randint(5, 22))
        trips.append({
            "trip_id": f"T-{i:06d}",
            "route_id": f"R-{(i % 50) + 1:03d}",
            "vehicle_id": f"V-{(i % 300) + 1:04d}",
            "service_date": t_start,
            "direction": "outbound" if i % 2 == 0 else "inbound",
            "scheduled_departure": t_start,
            "actual_departure": t_start + timedelta(minutes=random.randint(0, 5)),
            "scheduled_arrival": t_start + timedelta(minutes=45),
            "actual_arrival": t_start + timedelta(minutes=50),
            "status": "completed"
        })
    db.trips.insert_many(trips, ordered=False)

    # 7. Passengers (50,000)
    logger.info("Generating 50,000 Passengers...")
    passengers = [
        {
            "passenger_id": f"P-{i:06d}",
            "passenger_type": "regular",
            "fare_category": "adult",
            "home_zone": f"Z{(i % 8) + 1}",
            "registration_date": base_date,
            "is_frequent": (i % 10 == 0)
        }
        for i in range(1, 50001)
    ]
    db.passengers.insert_many(passengers, ordered=False)

    # 8. Tickets (2,000,000) - Batched
    logger.info("Generating 2,000,000 Tickets in batches of 50,000...")
    total_tickets = 2000000
    chunk_size = 50000
    for chunk in range(0, total_tickets, chunk_size):
        tickets = []
        for i in range(chunk_size):
            t_id = chunk + i + 1
            trip_idx = (t_id % 10000) + 1
            pass_idx = (t_id % 50000) + 1
            stop_idx = (t_id % 200) + 1
            tickets.append({
                "ticket_id": f"TCK-{t_id:08d}",
                "trip_id": f"T-{trip_idx:06d}",
                "passenger_id": f"P-{pass_idx:06d}",
                "boarding_stop": f"S-{stop_idx:04d}",
                "alighting_stop": f"S-{(stop_idx + 5) % 200 + 1:04d}",
                "fare_amount": 50.0,
                "payment_method": "smart_card",
                "timestamp": base_date + timedelta(days=t_id % 30, hours=random.randint(6, 20))
            })
        db.tickets.insert_many(tickets, ordered=False)
        if (chunk + chunk_size) % 500000 == 0:
            logger.info(f"  ... inserted {chunk + chunk_size:,} tickets into MongoDB")

    # 9. Passenger Counts (2,000,000) - Batched
    logger.info("Generating 2,000,000 Passenger Counts in batches of 50,000...")
    for chunk_start in range(0, 2000000, 50000):
        chunk_end = min(chunk_start + 50000, 2000000)
        p_counts = []
        for i in range(chunk_start, chunk_end):
            ts = base_date + timedelta(minutes=i * 5)
            p_counts.append({
                "id": str(uuid.uuid4()),
                "stop_id": f"S-{(i % 200) + 1:04d}",
                "route_id": f"R-{(i % 50) + 1:03d}",
                "direction": "outbound" if i % 2 == 0 else "inbound",
                "timestamp": ts,
                "hour": ts.hour,
                "boarding": random.randint(1, 10),
                "alighting": random.randint(1, 10),
                "load": random.randint(10, 50)
            })
        db.passenger_counts.insert_many(p_counts, ordered=False)
        if chunk_end % 500000 == 0:
            logger.info(f"  ... inserted {chunk_end:,} passenger_counts into MongoDB")

    # 10. Delays (500,000) - Batched
    logger.info("Generating 500,000 Delays in batches of 50,000...")
    for chunk_start in range(0, 500000, 50000):
        chunk_end = min(chunk_start + 50000, 500000)
        delays = [
            {
                "id": str(uuid.uuid4()),
                "trip_id": f"T-{(i % 10000) + 1:06d}",
                "route_id": f"R-{(i % 50) + 1:03d}",
                "stop_id": f"S-{(i % 200) + 1:04d}",
                "delay_minutes": random.uniform(5.0, 30.0),
                "delay_category": "traffic",
                "cause": "heavy_congestion" if i % 2 == 0 else "signal_failure",
                "timestamp": base_date + timedelta(hours=i),
                "is_peak": (i % 2 == 0)
            }
            for i in range(chunk_start, chunk_end)
        ]
        db.delays.insert_many(delays, ordered=False)
        if chunk_end % 100000 == 0:
            logger.info(f"  ... inserted {chunk_end:,} delays into MongoDB")

    # 11. GPS Events (50,000)
    logger.info("Generating 50,000 GPS Events...")
    gps = [
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": f"V-{(i % 300) + 1:04d}",
            "trip_id": f"T-{(i % 10000) + 1:06d}",
            "latitude": 24.86 + random.uniform(-0.1, 0.1),
            "longitude": 67.0 + random.uniform(-0.1, 0.1),
            "speed_kmh": random.uniform(10, 60),
            "heading": random.uniform(0, 360),
            "timestamp": base_date + timedelta(minutes=i),
            "event_type": "moving"
        }
        for i in range(50000)
    ]
    db.gps_events.insert_many(gps, ordered=False)

    logger.info("Building MongoDB performance indexes...")
    init_mongo_indexes()

    elapsed = time.time() - start_time
    logger.info(f"MongoDB successfully seeded with > 4.6 Million records in {elapsed:.2f}s!")


if __name__ == "__main__":
    generate_mongo_data()
