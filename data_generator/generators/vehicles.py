import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    routes = pd.read_csv('data/raw/routes.csv')
    route_ids = routes['route_id'].tolist()
    
    vehicles = []
    for i in range(1, config['num_vehicles'] + 1):
        v_type = np.random.choice(['standard_bus', 'articulated_bus', 'brt_bus', 'metro_train', 'rail_coach'])
        vehicles.append({
            'vehicle_id': f"V-{i:04d}",
            'vehicle_type': v_type,
            'capacity': np.random.randint(40, 201),
            'year_manufactured': np.random.randint(2010, 2025),
            'maintenance_status': np.random.choice(['good', 'fair', 'needs_repair'], p=[0.7, 0.2, 0.1]),
            'fuel_type': np.random.choice(['diesel', 'cng', 'electric']),
            'assigned_route_id': np.random.choice(route_ids)
        })
        
    df = pd.DataFrame(vehicles)
    df.to_csv('data/raw/vehicles.csv', index=False)
