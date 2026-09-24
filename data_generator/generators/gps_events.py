import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    trips = pd.read_csv('data/raw/trips.csv')
    
    events = []
    for i, trip in trips.head(50).iterrows():
        events.append({
            'event_id': f"GPS-{i:06d}",
            'vehicle_id': trip['vehicle_id'],
            'trip_id': trip['trip_id'],
            'latitude': 24.8,
            'longitude': 67.0,
            'timestamp': '2023-01-01T08:00:00',
            'speed_kmh': 40,
            'heading_degrees': 90,
            'route_id': trip['route_id'],
            'stop_proximity_meters': 100
        })
        
    df = pd.DataFrame(events)
    df.to_csv('data/raw/gps_events.csv', index=False)
