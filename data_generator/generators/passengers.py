import pandas as pd
import numpy as np

def generate(config):
    np.random.seed(42)
    passengers = []
    for i in range(1, config['num_passengers'] + 1):
        passengers.append({
            'passenger_id': f"P-{i:06d}",
            'registration_date': '2023-01-01',
            'passenger_type': np.random.choice(['regular', 'student', 'senior', 'tourist', 'corporate'], p=[0.6, 0.2, 0.1, 0.05, 0.05]),
            'home_zone': np.random.randint(1, 11),
            'preferred_routes': 'PB-01-I,GL-01-O',
            'travel_frequency': np.random.choice(['daily', 'frequent', 'occasional', 'rare'])
        })
        
    df = pd.DataFrame(passengers)
    df.to_csv('data/raw/passengers.csv', index=False)
