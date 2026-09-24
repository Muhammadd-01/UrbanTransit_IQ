import pandas as pd
import numpy as np
from tqdm import tqdm

def generate(config):
    np.random.seed(42)
    trips = pd.read_csv('data/raw/trips.csv')
    passengers = pd.read_csv('data/raw/passengers.csv')
    
    num_tickets = min(len(trips) * 10, 50000) # simplified count
    
    tickets = []
    trip_samples = trips.sample(n=num_tickets, replace=True)
    pass_samples = passengers.sample(n=num_tickets, replace=True)
    
    for i in tqdm(range(num_tickets), desc="Generating tickets"):
        tickets.append({
            'ticket_id': f"TK-{i:08d}",
            'passenger_id': pass_samples.iloc[i]['passenger_id'],
            'trip_id': trip_samples.iloc[i]['trip_id'],
            'boarding_stop_id': "S-0001",
            'alighting_stop_id': "S-0005",
            'boarding_time': "08:00",
            'alighting_time': "08:30",
            'fare': 50,
            'ticket_type': 'single',
            'payment_method': 'cash'
        })
        
    df = pd.DataFrame(tickets)
    df.to_csv('data/raw/tickets.csv', index=False)
