import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate(config):
    np.random.seed(42)
    start_date = datetime.now() - timedelta(days=config['months'] * 30)
    
    dates = [start_date + timedelta(days=i) for i in range(config['months'] * 30)]
    calendar = []
    for d in dates:
        month = d.month
        season = 'winter' if month in [11,12,1,2] else 'summer' if month in [4,5,6,10] else 'monsoon' if month in [7,8,9] else 'spring'
        calendar.append({
            'date': d.strftime('%Y-%m-%d'),
            'day_of_week': d.weekday(),
            'day_name': d.strftime('%A'),
            'is_weekend': d.weekday() in [4, 5], # Fri, Sat
            'is_holiday': False,
            'holiday_name': None,
            'season': season,
            'special_event': None,
            'temperature_high_c': np.random.uniform(15, 25) if season == 'winter' else np.random.uniform(35, 45)
        })
        
    df = pd.DataFrame(calendar)
    df.to_csv('data/raw/service_calendar.csv', index=False)
