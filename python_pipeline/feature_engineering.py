import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def create_trip_features(trips_df, tickets_df, delays_df, passenger_counts_df, routes_df, stops_df, service_calendar_df):
    """Create comprehensive trip features."""
    
    # Start with trips
    if 'date' in trips_df.columns:
        trips_df['date'] = pd.to_datetime(trips_df['date'])
    
    # Extract time features from trip start time or date
    if 'start_time' in trips_df.columns:
        trips_df['start_time'] = pd.to_datetime(trips_df['start_time'])
        trips_df['hour'] = trips_df['start_time'].dt.hour
        trips_df['day_of_week'] = trips_df['start_time'].dt.dayofweek
        trips_df['month'] = trips_df['start_time'].dt.month
        # Re-extract date just in case
        if 'date' not in trips_df.columns:
            trips_df['date'] = trips_df['start_time'].dt.date
    elif 'date' in trips_df.columns:
        trips_df['hour'] = 12
        trips_df['day_of_week'] = trips_df['date'].dt.dayofweek
        trips_df['month'] = trips_df['date'].dt.month
        
    trips_df['weekend_indicator'] = trips_df['day_of_week'].isin([5, 6]).astype(int)
    trips_df['peak_indicator'] = trips_df['hour'].isin([7, 8, 9, 16, 17, 18, 19]).astype(int)
    
    # Merge delays
    if not delays_df.empty:
        delay_agg = delays_df.groupby('trip_id').agg(
            delay_minutes=('delay_minutes', 'mean'),
            is_delayed=('delay_minutes', lambda x: (x > 5).max())
        ).reset_index()
        trips_df = trips_df.merge(delay_agg, on='trip_id', how='left')
        trips_df['delay_minutes'] = trips_df['delay_minutes'].fillna(0)
        trips_df['is_delayed'] = trips_df['is_delayed'].fillna(False).astype(int)
        
        # Delay severity
        conditions = [
            (trips_df['delay_minutes'] <= 5),
            (trips_df['delay_minutes'] > 5) & (trips_df['delay_minutes'] <= 15),
            (trips_df['delay_minutes'] > 15) & (trips_df['delay_minutes'] <= 30),
            (trips_df['delay_minutes'] > 30) & (trips_df['delay_minutes'] <= 60),
            (trips_df['delay_minutes'] > 60)
        ]
        choices = ['OnTime', 'Minor', 'Moderate', 'Major', 'Severe']
        trips_df['delay_severity'] = np.select(conditions, choices, default='OnTime')
    else:
        trips_df['delay_minutes'] = 0
        trips_df['is_delayed'] = 0
        trips_df['delay_severity'] = 'OnTime'
        
    # Demand / passenger load
    if not passenger_counts_df.empty:
        pass_agg = passenger_counts_df.groupby('trip_id').agg(
            passenger_load=('onboard_count', 'max'),
            boarding_count=('boarding_count', 'sum')
        ).reset_index()
        trips_df = trips_df.merge(pass_agg, on='trip_id', how='left')
        trips_df['passenger_load'] = trips_df['passenger_load'].fillna(0)
        trips_df['boarding_count'] = trips_df['boarding_count'].fillna(0)
    else:
        trips_df['passenger_load'] = 0
        trips_df['boarding_count'] = 0
        
    # Occupancy percentage
    # Assuming capacity ~ 80 for a bus if not provided
    trips_df['occupancy_percentage'] = (trips_df['passenger_load'] / 80.0) * 100.0
    
    # Merge route info
    if not routes_df.empty:
        trips_df = trips_df.merge(routes_df[['route_id', 'distance_km']], on='route_id', how='left')
        trips_df.rename(columns={'distance_km': 'route_distance'}, inplace=True)
        trips_df['route_distance'] = trips_df['route_distance'].fillna(trips_df['route_distance'].median())
    else:
        trips_df['route_distance'] = 15.0
        
    # Sort and add historical rolling features
    trips_df = trips_df.sort_values(by=['route_id', 'date'])
    trips_df['historical_delay'] = trips_df.groupby('route_id')['delay_minutes'].transform(lambda x: x.rolling(30, min_periods=1).mean().shift(1).fillna(0))
    trips_df['historical_demand'] = trips_df.groupby('route_id')['passenger_load'].transform(lambda x: x.rolling(30, min_periods=1).mean().shift(1).fillna(0))
    
    return trips_df

def create_route_features(trip_features_df):
    """Aggregate trip features to route level."""
    return trip_features_df.groupby('route_id').agg(
        avg_demand=('passenger_load', 'mean'),
        avg_occupancy=('occupancy_percentage', 'mean'),
        avg_delay=('delay_minutes', 'mean'),
        reliability=('is_delayed', lambda x: 1 - x.mean()),
        trip_frequency=('trip_id', 'count'),
        peak_demand_ratio=('passenger_load', lambda x: x[trip_features_df.loc[x.index, 'peak_indicator'] == 1].sum() / (x.sum() + 1e-5)),
        route_distance=('route_distance', 'first')
    ).reset_index()

def create_stop_features(trip_features_df):
    """Placeholder for stop features if needed."""
    return pd.DataFrame()

def create_passenger_features(tickets_df, trips_df):
    """Create passenger behavior features."""
    if tickets_df.empty:
        return pd.DataFrame()
    
    # Assume tickets_df has passenger_id
    if 'passenger_id' not in tickets_df.columns:
        return pd.DataFrame()
        
    pass_features = tickets_df.groupby('passenger_id').agg(
        trip_frequency=('ticket_id', 'count')
    ).reset_index()
    
    return pass_features

def chronological_split(df, date_col='date', test_size=0.15, val_size=0.15):
    """Split dataframe chronologically without shuffling."""
    df = df.sort_values(by=date_col)
    n = len(df)
    train_end = int(n * (1 - test_size - val_size))
    val_end = int(n * (1 - test_size))
    
    train = df.iloc[:train_end].copy()
    val = df.iloc[train_end:val_end].copy()
    test = df.iloc[val_end:].copy()
    
    return train, val, test
