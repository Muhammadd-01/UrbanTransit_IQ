import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    routes = pd.read_csv('data/raw/routes.csv')
    calendar = pd.read_csv('data/raw/service_calendar.csv')
    vehicles = pd.read_csv('data/raw/vehicles.csv')
    
    schedules = []
    # simplified representation to not blow up file size immensely
    # we just generate a few schedules per route
    for _, route in routes.iterrows():
        for i in range(config['trips_per_route_per_day']):
            schedules.append({
                'schedule_id': f"SCH-{route['route_id']}-{i}",
                'route_id': route['route_id'],
                'vehicle_id': np.random.choice(vehicles['vehicle_id']),
                'departure_time': f"{np.random.randint(6, 22):02d}:{np.random.randint(0, 60):02d}",
                'arrival_time': f"{np.random.randint(7, 23):02d}:{np.random.randint(0, 60):02d}",
                'direction': route['direction'],
                'service_date': 'all', # simplifying, usually daily schedule
                'is_active': True
            })
            
    df = pd.DataFrame(schedules)
    df.to_csv('data/raw/schedules.csv', index=False)
