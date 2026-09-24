import os
import glob
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_csv_files(pattern):
    """Load and concatenate all CSV files matching pattern."""
    files = glob.glob(pattern)
    if not files:
        logger.warning(f"No files found matching {pattern}")
        return pd.DataFrame()
    
    dfs = []
    for file in files:
        logger.info(f"Loading {file}")
        dfs.append(pd.read_csv(file))
    
    df = pd.concat(dfs, ignore_index=True)
    logger.info(f"Loaded {len(df)} records from {pattern}")
    return df

def load_routes(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'routes*.csv'))

def load_stops(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'stops*.csv'))

def load_trips(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'trips*.csv'))

def load_tickets(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'tickets*.csv'))

def load_delays(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'delays*.csv'))

def load_passenger_counts(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'passenger_counts*.csv'))

def load_service_calendar(data_dir='data/raw'):
    return load_csv_files(os.path.join(data_dir, 'service_calendar*.csv'))

def load_all_data(data_dir='data/raw'):
    """Load all raw data into a dictionary of DataFrames."""
    return {
        'routes': load_routes(data_dir),
        'stops': load_stops(data_dir),
        'trips': load_trips(data_dir),
        'tickets': load_tickets(data_dir),
        'delays': load_delays(data_dir),
        'passenger_counts': load_passenger_counts(data_dir),
        'service_calendar': load_service_calendar(data_dir)
    }
