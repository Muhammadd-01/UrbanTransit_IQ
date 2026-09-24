import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    trips = pd.read_csv('data/raw/trips.csv')
    
    counts = []
    for i, trip in trips.head(100).iterrows():
        counts.append({
            'count_id': f"C-{i:06d}",
            'trip_id': trip['trip_id'],
            'stop_id': "S-0001",
            'stop_sequence': 1,
            'boarding_count': 10,
            'alighting_count': 2,
            'current_load': 8,
            'timestamp': "2023-01-01T08:00:00",
            'vehicle_capacity': 50
        })
        
    df = pd.DataFrame(counts)
    df.to_csv('data/raw/passenger_counts.csv', index=False)
