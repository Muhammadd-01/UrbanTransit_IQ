from pymongo import MongoClient
import random
import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['urbantransit_iq']

current = db.passenger_counts.count_documents({})
print(f"Current passenger_counts: {current}")

target = 2000000
if current < target:
    needed = target - current
    print(f"Need to generate {needed} more records...")
    
    # Get existing route_ids and stop_ids
    routes = db.passenger_counts.distinct("route_id")
    if not routes:
        routes = [f"R-{str(i).zfill(3)}" for i in range(1, 51)]
    
    batch_size = 50000
    inserted = 0
    
    while inserted < needed:
        batch = []
        chunk = min(batch_size, needed - inserted)
        for _ in range(chunk):
            hour = random.randint(0, 23)
            boarding = random.randint(0, 45)
            alighting = random.randint(0, 40)
            load = random.randint(0, 80)
            is_delayed = 1 if random.random() < 0.35 else 0
            route = random.choice(routes)
            
            ts = datetime.datetime(2025, random.randint(1,12), random.randint(1,28), hour, random.randint(0,59))
            
            batch.append({
                "route_id": route,
                "boarding": boarding,
                "alighting": alighting,
                "load": load,
                "hour": hour,
                "is_delayed": is_delayed,
                "timestamp": ts,
            })
        
        db.passenger_counts.insert_many(batch)
        inserted += chunk
        print(f"Inserted {inserted}/{needed}")

final = db.passenger_counts.count_documents({})
print(f"Final passenger_counts: {final}")
