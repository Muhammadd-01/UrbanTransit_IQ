import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    trips = pd.read_csv('data/raw/trips.csv')
    delayed_trips = trips[trips['status'] == 'delayed']
    
    delays = []
    for i, trip in delayed_trips.iterrows():
        delays.append({
            'delay_id': f"D-{i:06d}",
            'trip_id': trip['trip_id'],
            'stop_id': 'S-0002',
            'route_id': trip['route_id'],
            'vehicle_id': trip['vehicle_id'],
            'scheduled_time': trip['actual_departure'],
            'actual_time': trip['actual_departure'], # Simplified
            'delay_minutes': np.random.randint(5, 30),
            'delay_cause': np.random.choice(['traffic', 'mechanical', 'passenger_load', 'weather', 'accident', 'signal', 'other']),
            'weather_condition': 'clear',
            'is_peak': True,
            'day_of_week': 0
        })
        
    df = pd.DataFrame(delays)
    df.to_csv('data/raw/delays.csv', index=False)
