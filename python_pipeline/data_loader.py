import os
import glob
import pandas as pd
import logging
from typing import Dict, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_csv_files(pattern: str, nrows: Optional[int] = None) -> pd.DataFrame:
    """Load and concatenate all CSV files matching pattern."""
    files = glob.glob(pattern)
    if not files:
        logger.warning(f"No files found matching {pattern}")
        return pd.DataFrame()
    
    dfs = []
    for file in sorted(files):
        logger.info(f"Loading {file}")
        dfs.append(pd.read_csv(file, nrows=nrows))
    
    df = pd.concat(dfs, ignore_index=True)
    logger.info(f"Loaded {len(df)} records from {pattern}")
    return df

def load_routes(data_dir='data/raw', nrows=None):
    return load_csv_files(os.path.join(data_dir, 'routes*.csv'), nrows=nrows)

def load_stops(data_dir='data/raw', nrows=None):
    return load_csv_files(os.path.join(data_dir, 'stops*.csv'), nrows=nrows)

def load_trips(data_dir='data/raw', nrows=None):
    return load_csv_files(os.path.join(data_dir, 'trips*.csv'), nrows=nrows)

def load_tickets(data_dir='data/raw', nrows=50000):
    return load_csv_files(os.path.join(data_dir, 'tickets*.csv'), nrows=nrows)

def load_delays(data_dir='data/raw', nrows=50000):
    return load_csv_files(os.path.join(data_dir, 'delays*.csv'), nrows=nrows)

def load_passenger_counts(data_dir='data/raw', nrows=50000):
    return load_csv_files(os.path.join(data_dir, 'passenger_counts*.csv'), nrows=nrows)

def load_service_calendar(data_dir='data/raw', nrows=None):
    return load_csv_files(os.path.join(data_dir, 'service_calendar*.csv'), nrows=nrows)

def load_all_data(data_dir='data/raw', nrows_tickets=20000, nrows_trips=25000) -> Dict[str, pd.DataFrame]:
    """Load all raw data into a dictionary of DataFrames with memory-safe defaults."""
    return {
        'routes': load_routes(data_dir),
        'stops': load_stops(data_dir),
        'trips': load_trips(data_dir, nrows=nrows_trips),
        'tickets': load_tickets(data_dir, nrows=nrows_tickets),
        'delays': load_delays(data_dir, nrows=nrows_trips * 2),
        'passenger_counts': load_passenger_counts(data_dir, nrows=nrows_trips * 2),
        'service_calendar': load_service_calendar(data_dir)
    }
