import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    schedules = pd.read_csv('data/raw/schedules.csv')
    calendar = pd.read_csv('data/raw/service_calendar.csv')
    
    trips = []
    trip_id = 1
    for d in calendar['date'].sample(n=min(len(calendar), 10)): # sample days for performance
        for _, sch in schedules.sample(frac=0.1).iterrows(): # sample schedules
            trips.append({
                'trip_id': f"T-{trip_id:06d}",
                'schedule_id': sch['schedule_id'],
                'route_id': sch['route_id'],
                'vehicle_id': sch['vehicle_id'],
                'actual_departure': sch['departure_time'],
                'actual_arrival': sch['arrival_time'],
                'direction': sch['direction'],
                'date': d,
                'status': np.random.choice(['completed', 'cancelled', 'delayed'], p=[0.9, 0.02, 0.08])
            })
            trip_id += 1
            
    df = pd.DataFrame(trips)
    df.to_csv('data/raw/trips.csv', index=False)
