import pandas as pd
import numpy as np
from data_generator.config import BOUNDS

def generate(config):
    np.random.seed(42)
    areas = ['Saddar', 'Clifton', 'Defence', 'Korangi', 'Landhi', 'Malir', 'Gulshan-e-Iqbal', 'North Nazimabad',
             'Nazimabad', 'Liaquatabad', 'SITE', 'Orangi', 'New Karachi', 'Surjani', 'Gulistan-e-Jauhar',
             'Shah Faisal', 'Model Colony', 'Bahria Town', 'Scheme 33', 'Quaidabad']
    
    stops = []
    for i in range(1, config['num_stops'] + 1):
        stops.append({
            'stop_id': f"S-{i:04d}",
            'stop_name': f"{np.random.choice(areas)} Stop {i}",
            'latitude': np.random.uniform(BOUNDS['lat_min'], BOUNDS['lat_max']),
            'longitude': np.random.uniform(BOUNDS['lon_min'], BOUNDS['lon_max']),
            'zone': np.random.randint(1, 11),
            'is_terminal': np.random.random() < 0.1,
            'is_interchange': np.random.random() < 0.15,
            'shelter_type': np.random.choice(['covered', 'uncovered', 'none']),
            'accessibility': np.random.choice(['full', 'partial', 'none'])
        })
        
    df = pd.DataFrame(stops)
    df.to_csv('data/raw/stops.csv', index=False)
