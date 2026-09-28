import pandas as pd
from pymongo import MongoClient
import sys

def load_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['urbantransit_iq']
    
    # Load routes
    print("Loading routes...")
    routes_df = pd.read_csv('data/raw/routes.csv').drop_duplicates(subset=['route_id'])
    db.routes.delete_many({})
    db.routes.insert_many(routes_df.to_dict('records'))
    
    # Load stops
    print("Loading stops...")
    stops_df = pd.read_csv('data/raw/stops.csv').drop_duplicates(subset=['stop_id'])
    db.stops.delete_many({})
    db.stops.insert_many(stops_df.to_dict('records'))
    
    # Load vehicles
    print("Loading vehicles...")
    vehicles_df = pd.read_csv('data/raw/vehicles.csv').drop_duplicates(subset=['vehicle_id'])
    db.vehicles.delete_many({})
    db.vehicles.insert_many(vehicles_df.to_dict('records'))
    
    # Load trips
    print("Loading trips...")
    trips_df = pd.read_csv('data/raw/trips.csv').drop_duplicates(subset=['trip_id'])
    db.trips.delete_many({})
    db.trips.insert_many(trips_df.to_dict('records'))
    
    # Load delays
    print("Loading delays...")
    delays_df = pd.read_csv('data/raw/delays.csv')
    db.delays.delete_many({})
    for i in range(0, len(delays_df), 50000):
        db.delays.insert_many(delays_df.iloc[i:i+50000].to_dict('records'))
    
    # Load passenger_counts
    print("Loading passenger_counts...")
    pc_df = pd.read_csv('data/raw/passenger_counts.csv')
    if 'hour' not in pc_df.columns and 'timestamp' in pc_df.columns:
        pc_df['hour'] = pd.to_datetime(pc_df['timestamp']).dt.hour
    db.passenger_counts.delete_many({})
    for i in range(0, len(pc_df), 50000):
        db.passenger_counts.insert_many(pc_df.iloc[i:i+50000].to_dict('records'), ordered=False)
        print(f"Loaded {i+50000} passenger_counts...")
        
    # Load tickets
    print("Loading tickets...")
    tickets_df = pd.read_csv('data/raw/tickets.csv')
    db.tickets.delete_many({})
    for i in range(0, len(tickets_df), 50000):
        db.tickets.insert_many(tickets_df.iloc[i:i+50000].to_dict('records'), ordered=False)
        print(f"Loaded {i+50000} tickets...")

    print("Data loaded to MongoDB successfully.")

if __name__ == '__main__':
    load_data()
