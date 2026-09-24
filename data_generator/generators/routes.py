import pandas as pd
import numpy as np
import random
from data_generator.config import SCALE_CONFIG

def generate(config):
    np.random.seed(42)
    num_routes = config['num_routes']
    
    route_types = ['bus', 'brt', 'metro', 'circular']
    probs = [0.85, 0.05, 0.05, 0.05]
    
    routes = []
    for i in range(1, (num_routes // 2) + 1):
        r_type = np.random.choice(route_types, p=probs)
        if r_type == 'bus':
            prefix = np.random.choice(['PB', 'LB'])
            name = f"{prefix}-{i:02d}"
        elif r_type == 'brt':
            name = f"GL-{i:02d}"
        elif r_type == 'metro':
            name = f"OL-{i:02d}"
        else:
            name = f"KCR-{i:02d}"
            
        dist = np.random.uniform(5, 45)
        time = dist * np.random.uniform(2, 3)
        cap = 40 if r_type == 'bus' else 120 if r_type == 'brt' else 200
        
        # Inbound
        routes.append({
            'route_id': f"{name}-I", 'route_name': name, 'route_type': r_type, 'direction': 'inbound',
            'total_distance_km': dist, 'num_stops': int(dist * 1.5), 'avg_travel_time_minutes': time,
            'vehicle_capacity': cap, 'frequency_peak_minutes': np.random.choice([5, 10, 15]),
            'frequency_offpeak_minutes': np.random.choice([15, 20, 30]), 'operating_hours_start': '06:00',
            'operating_hours_end': '23:00', 'base_fare': np.random.choice([50, 100])
        })
        # Outbound
        routes.append({
            'route_id': f"{name}-O", 'route_name': name, 'route_type': r_type, 'direction': 'outbound',
            'total_distance_km': dist, 'num_stops': int(dist * 1.5), 'avg_travel_time_minutes': time,
            'vehicle_capacity': cap, 'frequency_peak_minutes': np.random.choice([5, 10, 15]),
            'frequency_offpeak_minutes': np.random.choice([15, 20, 30]), 'operating_hours_start': '06:00',
            'operating_hours_end': '23:00', 'base_fare': np.random.choice([50, 100])
        })
        
    df = pd.DataFrame(routes[:num_routes])
    df.to_csv('data/raw/routes.csv', index=False)
