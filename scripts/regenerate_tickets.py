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

from backend.app.database.mongo import get_mongo_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def regenerate_tickets_and_passengers():
    logger.info("Regenerating Passengers and Tickets collections with randomized values...")
    db = get_mongo_db()
    
    db.passengers.drop()
    db.tickets.drop()
    
    base_date = datetime(2024, 1, 1)
    
    # 7. Passengers (50,000)
    logger.info("Generating 50,000 Passengers...")
    pass_types = ["regular", "student", "senior", "disabled"]
    pass_probs = [0.6, 0.25, 0.1, 0.05]
    fare_categories = {"regular": "adult", "student": "student_discount", "senior": "senior_discount", "disabled": "free_pass"}
    passengers = []
    for i in range(1, 50001):
        ptype = random.choices(pass_types, weights=pass_probs)[0]
        passengers.append({
            "passenger_id": f"P-{i:06d}",
            "passenger_type": ptype,
            "fare_category": fare_categories[ptype],
            "home_zone": f"Z{(i % 8) + 1}",
            "registration_date": base_date - timedelta(days=random.randint(0, 365)),
            "is_frequent": random.random() < 0.3
        })
    db.passengers.insert_many(passengers, ordered=False)

    # 8. Tickets (2,000,000) - Batched
    logger.info("Generating 2,000,000 Tickets in batches of 50,000...")
    total_tickets = 2000000
    chunk_size = 50000
    payment_methods = ["smart_card", "mobile_app", "cash", "credit_card"]
    payment_probs = [0.60, 0.25, 0.10, 0.05]
    fare_amounts = [30.0, 50.0, 80.0, 100.0]

    for chunk in range(0, total_tickets, chunk_size):
        tickets = []
        for i in range(chunk_size):
            t_id = chunk + i + 1
            trip_idx = (t_id % 10000) + 1
            pass_idx = (t_id % 50000) + 1
            stop_idx = (t_id % 200) + 1
            
            pay_method = random.choices(payment_methods, weights=payment_probs)[0]
            fare = random.choice(fare_amounts)
            if pay_method == "cash": 
                fare = 50.0  # cash usually flat fare
                
            tickets.append({
                "ticket_id": f"TCK-{t_id:08d}",
                "trip_id": f"T-{trip_idx:06d}",
                "passenger_id": f"P-{pass_idx:06d}",
                "boarding_stop": f"S-{stop_idx:04d}",
                "alighting_stop": f"S-{(stop_idx + random.randint(3, 15)) % 200 + 1:04d}",
                "fare_amount": fare,
                "payment_method": pay_method,
                "timestamp": base_date + timedelta(days=t_id % 30, hours=random.randint(6, 20), minutes=random.randint(0, 59))
            })
        db.tickets.insert_many(tickets, ordered=False)
        if (chunk + chunk_size) % 500000 == 0:
            logger.info(f"  ... inserted {chunk + chunk_size:,} tickets into MongoDB")
            
    logger.info("Done generating Tickets and Passengers!")

if __name__ == "__main__":
    regenerate_tickets_and_passengers()
