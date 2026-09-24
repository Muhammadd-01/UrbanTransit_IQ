import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    routes = pd.read_csv('data/raw/routes.csv')
    stops = pd.read_csv('data/raw/stops.csv')
    stop_ids = stops['stop_id'].tolist()
    
    route_stops = []
    for _, route in routes.iterrows():
        num_stops = max(8, min(25, route['num_stops']))
        chosen_stops = np.random.choice(stop_ids, num_stops, replace=False)
        dist = 0
        time = 0
        for seq, sid in enumerate(chosen_stops, 1):
            route_stops.append({
                'route_id': route['route_id'],
                'stop_id': sid,
                'stop_sequence': seq,
                'distance_from_origin_km': dist,
                'estimated_travel_time_minutes': time
            })
            dist += np.random.uniform(0.5, 2.0)
            time += np.random.uniform(2.0, 5.0)
            
    df = pd.DataFrame(route_stops)
    df.to_csv('data/raw/route_stops.csv', index=False)
