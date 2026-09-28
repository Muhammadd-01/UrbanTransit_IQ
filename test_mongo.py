import sys
from pathlib import Path
sys.path.insert(0, str(Path('/Users/muhammadaffan/Coding/UrbanTransit_IQ')))
from backend.app.database.mongo import get_mongo_db

db = get_mongo_db()
print(db.passenger_counts.find_one())
print(db.vehicles.find_one())
print(db.routes.find_one())
print(db.delays.find_one())
print(db.trips.find_one())
