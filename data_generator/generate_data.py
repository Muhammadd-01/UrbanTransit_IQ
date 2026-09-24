import sys
import os
import time
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import click
from data_generator.config import SCALE_CONFIG
from data_generator.generators import routes, stops, route_stops, vehicles, service_calendar
from data_generator.generators import schedules, trips, passengers, tickets, passenger_counts
from data_generator.generators import delays, gps_events, noise, hidden_data_patterns, correlations

@click.command()
@click.option('--scale', type=click.Choice(['small', 'medium', 'competition']), default='small')
def main(scale):
    print(f"Starting data generation for scale: {scale}")
    start_time = time.time()
    os.makedirs('data/raw', exist_ok=True)
    config = SCALE_CONFIG[scale]
    
    print("Generating routes...")
    routes.generate(config)
    print("Generating stops...")
    stops.generate(config)
    print("Generating route_stops...")
    route_stops.generate(config)
    print("Generating vehicles...")
    vehicles.generate(config)
    print("Generating service_calendar...")
    service_calendar.generate(config)
    print("Generating schedules...")
    schedules.generate(config)
    print("Generating trips...")
    trips.generate(config)
    print("Generating passengers...")
    passengers.generate(config)
    print("Generating tickets...")
    tickets.generate(config)
    print("Generating passenger_counts...")
    passenger_counts.generate(config)
    print("Generating delays...")
    delays.generate(config)
    print("Generating gps_events...")
    gps_events.generate(config)
    
    print("Injecting noise...")
    noise.inject_noise('data/raw')
    print("Injecting hidden patterns...")
    hidden_data_patterns.inject_hidden_patterns('data/raw')
    print("Ensuring correlations...")
    correlations.ensure_correlations('data/raw')
    
    print(f"Data generation complete in {time.time() - start_time:.2f} seconds.")

if __name__ == '__main__':
    main()
