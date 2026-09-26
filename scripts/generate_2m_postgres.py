import sys
import uuid
import random
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import execute_values

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
from config.settings import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def generate_db_data():
    logger.info("Initializing 2 Million Record Generation natively into PostgreSQL...")

    result = urlparse(settings.DATABASE_URL)
    conn = psycopg2.connect(
        dbname=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )
    conn.autocommit = False
    cur = conn.cursor()

    # Clear old data safely
    tables = [
        "gps_events", "delays", "passenger_counts", "tickets", "passengers",
        "trips", "service_calendar", "vehicles", "route_stops", "stops", "routes"
    ]
    for table in tables:
        cur.execute(f"TRUNCATE TABLE {table} CASCADE")
    conn.commit()

    # 1. Routes (50)
    logger.info("Generating 50 Routes...")
    routes = [(f"R-{i:03d}", f"Route {i}", "bus", "blue", f"Desc {i}", "Z1", 15.5, 45.0, 20, 10, 20, "OperatorA", datetime.utcnow()) for i in range(1, 51)]
    execute_values(cur, "INSERT INTO routes (route_id, route_name, route_type, route_color, route_description, fare_zone, distance_km, avg_travel_time_min, num_stops, frequency_peak, frequency_offpeak, operator, created_at) VALUES %s", routes)
    
    # 2. Stops (200)
    logger.info("Generating 200 Stops...")
    stops = [(f"S-{i:04d}", f"Stop {i}", 24.86 + random.uniform(-0.1, 0.1), 67.00 + random.uniform(-0.1, 0.1), "Z1", "regular", False, True, "wheelchair", datetime.utcnow()) for i in range(1, 201)]
    execute_values(cur, "INSERT INTO stops (stop_id, stop_name, latitude, longitude, zone, stop_type, is_terminal, has_shelter, accessibility, created_at) VALUES %s", stops)

    # 3. Route Stops (1000)
    logger.info("Generating 1000 RouteStops...")
    route_stops = [(str(uuid.uuid4()), f"R-{(i%50)+1:03d}", f"S-{(i%200)+1:04d}", i%20, i*0.5) for i in range(1, 1001)]
    execute_values(cur, "INSERT INTO route_stops (id, route_id, stop_id, stop_sequence, distance_from_start_km) VALUES %s", route_stops)

    # 4. Vehicles (300)
    logger.info("Generating 300 Vehicles...")
    vehicles = [(f"V-{i:04d}", "bus", 50, "diesel", 2018, datetime.utcnow(), "active", f"R-{(i%50)+1:03d}", datetime.utcnow()) for i in range(1, 301)]
    execute_values(cur, "INSERT INTO vehicles (vehicle_id, vehicle_type, capacity, fuel_type, manufacture_year, last_maintenance, status, assigned_route, created_at) VALUES %s", vehicles)
    
    # 5. Service Calendar (30)
    logger.info("Generating 30 Service Calendar days...")
    base_date = datetime(2024, 1, 1)
    calendars = [(str(uuid.uuid4()), "CAL-1", base_date + timedelta(days=i), "weekday", False, None) for i in range(30)]
    execute_values(cur, "INSERT INTO service_calendar (id, service_id, date, day_type, is_holiday, holiday_name) VALUES %s", calendars)

    # 6. Trips (10,000)
    logger.info("Generating 10,000 Trips...")
    trips = []
    for i in range(1, 10001):
        t_start = base_date + timedelta(days=i%30, hours=random.randint(5, 22))
        trips.append((f"T-{i:06d}", f"R-{(i%50)+1:03d}", f"V-{(i%300)+1:04d}", t_start, "outbound", t_start, t_start + timedelta(minutes=random.randint(0,5)), t_start + timedelta(minutes=45), t_start + timedelta(minutes=50), "completed"))
    execute_values(cur, "INSERT INTO trips (trip_id, route_id, vehicle_id, service_date, direction, scheduled_departure, actual_departure, scheduled_arrival, actual_arrival, status) VALUES %s", trips)
    
    # 7. Passengers (50,000)
    logger.info("Generating 50,000 Passengers...")
    passengers = [(f"P-{i:06d}", "regular", "adult", "Z1", base_date, i%10==0) for i in range(1, 50001)]
    for i in range(0, 50000, 10000):
        execute_values(cur, "INSERT INTO passengers (passenger_id, passenger_type, fare_category, home_zone, registration_date, is_frequent) VALUES %s", passengers[i:i+10000])

    # 8. Tickets (2,000,000) - Chunked
    logger.info("Generating 2,000,000 Tickets in chunks of 50,000...")
    total_tickets = 2000000
    chunk_size = 50000
    for chunk in range(0, total_tickets, chunk_size):
        tickets = []
        for i in range(chunk_size):
            t_id = chunk + i + 1
            trip_idx = (t_id % 10000) + 1
            pass_idx = (t_id % 50000) + 1
            stop_idx = (t_id % 200) + 1
            tickets.append((
                f"TCK-{t_id:08d}", f"T-{trip_idx:06d}", f"P-{pass_idx:06d}",
                f"S-{stop_idx:04d}", f"S-{(stop_idx+5)%200+1:04d}", 50.0,
                "smart_card", base_date + timedelta(days=t_id%30, hours=random.randint(6, 20))
            ))
        execute_values(cur, "INSERT INTO tickets (ticket_id, trip_id, passenger_id, boarding_stop, alighting_stop, fare_amount, payment_method, timestamp) VALUES %s", tickets)
        conn.commit()  # commit each chunk to keep memory footprint low on postgres
        if (chunk + chunk_size) % 500000 == 0:
            logger.info(f"  ... inserted {chunk + chunk_size:,} tickets")

    # 9. Passenger Counts (2,000,000)
    logger.info("Generating 2,000,000 Passenger Counts...")
    for chunk_start in range(0, 2000000, 50000):
        chunk_end = min(chunk_start + 50000, 2000000)
        p_counts = [(str(uuid.uuid4()), f"S-{(i%200)+1:04d}", f"R-{(i%50)+1:03d}", "outbound", base_date + timedelta(minutes=i*5), random.randint(1,10), random.randint(1,10), random.randint(10,50)) for i in range(chunk_start, chunk_end)]
        execute_values(cur, "INSERT INTO passenger_counts (id, stop_id, route_id, direction, timestamp, boarding, alighting, load) VALUES %s", p_counts)
        conn.commit()
        if (chunk_end) % 500000 == 0:
            logger.info(f"  ... inserted {chunk_end:,} passenger_counts")

    # 10. Delays (500,000)
    logger.info("Generating 500,000 Delays...")
    for chunk_start in range(0, 500000, 50000):
        chunk_end = min(chunk_start + 50000, 500000)
        delays = [(str(uuid.uuid4()), f"T-{(i%10000)+1:06d}", f"R-{(i%50)+1:03d}", f"S-{(i%200)+1:04d}", random.uniform(5.0, 30.0), "traffic", "heavy_congestion", base_date + timedelta(hours=i), i%2==0) for i in range(chunk_start, chunk_end)]
        execute_values(cur, "INSERT INTO delays (id, trip_id, route_id, stop_id, delay_minutes, delay_category, cause, timestamp, is_peak) VALUES %s", delays)
        conn.commit()
        if (chunk_end) % 100000 == 0:
            logger.info(f"  ... inserted {chunk_end:,} delays")

    # 11. GPS Events (50,000)
    logger.info("Generating 50,000 GPS Events...")
    gps = [(str(uuid.uuid4()), f"V-{(i%300)+1:04d}", f"T-{(i%10000)+1:06d}", 24.86 + random.uniform(-0.1,0.1), 67.0 + random.uniform(-0.1,0.1), random.uniform(10,60), random.uniform(0,360), base_date + timedelta(minutes=i), "moving") for i in range(50000)]
    for i in range(0, 50000, 10000):
        execute_values(cur, "INSERT INTO gps_events (id, vehicle_id, trip_id, latitude, longitude, speed_kmh, heading, timestamp, event_type) VALUES %s", gps[i:i+10000])

    conn.commit()
    cur.close()
    conn.close()
    logger.info("Database successfully seeded with > 2 Million generated records!")

if __name__ == "__main__":
    start = time.time()
    generate_db_data()
    logger.info(f"Total Seeding Time: {time.time() - start:.2f} seconds")
